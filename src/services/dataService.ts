import {
  CompanySettings,
  Customer,
  Ingredient,
  Order,
  OrderStatus,
  Product,
  StockMovement,
  Supplier,
  Transaction,
} from '../types';
import {
  initialCustomers,
  initialIngredients,
  initialOrders,
  initialProducts,
  initialSettings,
  initialSuppliers,
  initialTransactions,
} from '../data/initialData';

const STORAGE_KEY = 'se_liga_lanche_v3_store';

export interface AppState {
  products: Product[];
  orders: Order[];
  ingredients: Ingredient[];
  stockMovements: StockMovement[];
  transactions: Transaction[];
  customers: Customer[];
  suppliers: Supplier[];
  settings: CompanySettings;
  isFirebaseActive: boolean;
}

type Listener = (state: AppState) => void;

class DataService {
  private state: AppState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): AppState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          products: parsed.products || initialProducts,
          orders: parsed.orders || initialOrders,
          ingredients: parsed.ingredients || initialIngredients,
          stockMovements: parsed.stockMovements || [],
          transactions: parsed.transactions || initialTransactions,
          customers: parsed.customers || initialCustomers,
          suppliers: parsed.suppliers || initialSuppliers,
          settings: parsed.settings || initialSettings,
          isFirebaseActive: false,
        };
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do LocalStorage, usando dados de demonstração:', e);
    }

    return {
      products: initialProducts,
      orders: initialOrders,
      ingredients: initialIngredients,
      stockMovements: [],
      transactions: initialTransactions,
      customers: initialCustomers,
      suppliers: initialSuppliers,
      settings: initialSettings,
      isFirebaseActive: false,
    };
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Erro ao salvar no LocalStorage:', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AppState {
    return { ...this.state };
  }

  public resetToFactoryDefaults() {
    this.state = {
      products: initialProducts,
      orders: initialOrders,
      ingredients: initialIngredients,
      stockMovements: [],
      transactions: initialTransactions,
      customers: initialCustomers,
      suppliers: initialSuppliers,
      settings: initialSettings,
      isFirebaseActive: false,
    };
    this.persist();
  }

  // =================== PEDIDOS & ESTOQUE AUTOMÁTICO ===================

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'stockDeducted'>): Order {
    const maxOrderNum = this.state.orders.reduce((max, o) => Math.max(max, o.orderNumber || 100), 100);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: maxOrderNum + 1,
      stockDeducted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedOrders = [newOrder, ...this.state.orders];
    let updatedCustomers = [...this.state.customers];

    // Atualiza ou cadastra cliente
    const existingCustIdx = updatedCustomers.findIndex(
      (c) => c.phone.replace(/\D/g, '') === newOrder.customerPhone.replace(/\D/g, '') ||
             c.name.toLowerCase() === newOrder.customerName.toLowerCase()
    );

    if (existingCustIdx >= 0) {
      const cust = updatedCustomers[existingCustIdx];
      updatedCustomers[existingCustIdx] = {
        ...cust,
        address: newOrder.customerAddress || cust.address,
        neighborhood: newOrder.neighborhood || cust.neighborhood,
        orderCount: cust.orderCount + 1,
        totalSpent: cust.totalSpent + (newOrder.status !== 'cancelado' ? newOrder.total : 0),
        lastOrderDate: newOrder.createdAt,
      };
    } else {
      updatedCustomers.push({
        id: `cust-${Date.now()}`,
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        address: newOrder.customerAddress,
        neighborhood: newOrder.neighborhood,
        totalSpent: newOrder.status !== 'cancelado' ? newOrder.total : 0,
        orderCount: 1,
        lastOrderDate: newOrder.createdAt,
        createdAt: newOrder.createdAt,
      });
    }

    this.state.orders = updatedOrders;
    this.state.customers = updatedCustomers;

    // Se o pedido já for criado em status 'pronto' ou 'entregue', baixa estoque
    if (newOrder.status === 'pronto' || newOrder.status === 'entregue' || newOrder.status === 'saiu_entrega') {
      this.deductStockForOrder(newOrder.id);
    } else {
      this.persist();
    }

    return newOrder;
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
    const orderIndex = this.state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const currentOrder = this.state.orders[orderIndex];
    const prevStatus = currentOrder.status;

    if (prevStatus === newStatus) return;

    // Se estiver cancelando e já tiver baixado estoque, estorna os insumos!
    if (newStatus === 'cancelado' && currentOrder.stockDeducted) {
      this.restoreStockForOrder(orderId);
    }

    const updatedOrder: Order = {
      ...currentOrder,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      // Se for entregue e pagamento era pendente em dinheiro, marca pago
      paymentStatus: newStatus === 'entregue' ? 'pago' : currentOrder.paymentStatus,
    };

    this.state.orders[orderIndex] = updatedOrder;

    // Se avançou para pronto, saiu para entrega ou entregue, e ainda não baixou estoque, faz a baixa automática!
    if (
      !updatedOrder.stockDeducted &&
      (newStatus === 'pronto' || newStatus === 'saiu_entrega' || newStatus === 'entregue')
    ) {
      this.deductStockForOrder(orderId);
      return;
    }

    // Se for entregue e pago, gera lançamento de receita se ainda não existir
    if (newStatus === 'entregue' && updatedOrder.paymentStatus === 'pago') {
      this.ensureOrderRevenueRecorded(updatedOrder);
    }

    this.persist();
  }

  public updateOrder(orderId: string, updates: Partial<Order>): void {
    const idx = this.state.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return;

    this.state.orders[idx] = {
      ...this.state.orders[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
  }

  public deleteOrder(orderId: string): void {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (order && order.stockDeducted) {
      this.restoreStockForOrder(orderId);
    }
    this.state.orders = this.state.orders.filter((o) => o.id !== orderId);
    this.state.transactions = this.state.transactions.filter((t) => t.orderId !== orderId);
    this.persist();
  }

  private deductStockForOrder(orderId: string): void {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order || order.stockDeducted) return;

    let updatedIngredients = [...this.state.ingredients];
    const newMovements: StockMovement[] = [];

    order.items.forEach((item) => {
      const product = this.state.products.find((p) => p.id === item.productId);
      if (!product || !product.recipe || product.recipe.length === 0) return;

      product.recipe.forEach((recipeItem) => {
        const ingIndex = updatedIngredients.findIndex((ing) => ing.id === recipeItem.ingredientId);
        if (ingIndex >= 0) {
          const totalConsume = recipeItem.quantity * item.quantity;
          const currentIng = updatedIngredients[ingIndex];
          const newQty = Math.max(0, Number((currentIng.quantity - totalConsume).toFixed(3)));

          updatedIngredients[ingIndex] = {
            ...currentIng,
            quantity: newQty,
            updatedAt: new Date().toISOString(),
          };

          newMovements.push({
            id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            ingredientId: currentIng.id,
            ingredientName: currentIng.name,
            type: 'saida_venda',
            quantity: totalConsume,
            unit: currentIng.unit,
            date: new Date().toISOString(),
            orderId: order.id,
            notes: `Consumo automático pelo Pedido #${order.orderNumber} (${item.quantity}x ${item.name})`,
          });
        }
      });
    });

    order.stockDeducted = true;
    this.state.ingredients = updatedIngredients;
    this.state.stockMovements = [...newMovements, ...this.state.stockMovements];

    if (order.status === 'entregue' && order.paymentStatus === 'pago') {
      this.ensureOrderRevenueRecorded(order);
    }

    this.persist();
  }

  private restoreStockForOrder(orderId: string): void {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order || !order.stockDeducted) return;

    let updatedIngredients = [...this.state.ingredients];
    const newMovements: StockMovement[] = [];

    order.items.forEach((item) => {
      const product = this.state.products.find((p) => p.id === item.productId);
      if (!product || !product.recipe) return;

      product.recipe.forEach((recipeItem) => {
        const ingIndex = updatedIngredients.findIndex((ing) => ing.id === recipeItem.ingredientId);
        if (ingIndex >= 0) {
          const totalRestore = recipeItem.quantity * item.quantity;
          const currentIng = updatedIngredients[ingIndex];
          const newQty = Number((currentIng.quantity + totalRestore).toFixed(3));

          updatedIngredients[ingIndex] = {
            ...currentIng,
            quantity: newQty,
            updatedAt: new Date().toISOString(),
          };

          newMovements.push({
            id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            ingredientId: currentIng.id,
            ingredientName: currentIng.name,
            type: 'entrada_compra',
            quantity: totalRestore,
            unit: currentIng.unit,
            date: new Date().toISOString(),
            orderId: order.id,
            notes: `Estorno de estoque por cancelamento do Pedido #${order.orderNumber}`,
          });
        }
      });
    });

    order.stockDeducted = false;
    this.state.ingredients = updatedIngredients;
    this.state.stockMovements = [...newMovements, ...this.state.stockMovements];
    this.persist();
  }

  private ensureOrderRevenueRecorded(order: Order): void {
    const exists = this.state.transactions.some((t) => t.orderId === order.id);
    if (!exists && order.status !== 'cancelado') {
      this.state.transactions.unshift({
        id: `tx-ord-${order.id}`,
        description: `Receita Pedido #${order.orderNumber} (${order.customerName})`,
        type: 'receita',
        category: order.type === 'delivery' ? 'Vendas Delivery' : 'Vendas Balcão / Retirada',
        amount: order.total,
        date: order.createdAt,
        paymentMethod: order.paymentMethod,
        orderId: order.id,
        status: 'pago',
      });
    }
  }

  // =================== CARDÁPIO (PRODUTOS) ===================

  public saveProduct(product: Omit<Product, 'id'> & { id?: string }): Product {
    if (product.id) {
      const idx = this.state.products.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const updated = {
          ...this.state.products[idx],
          ...product,
          updatedAt: new Date().toISOString(),
        } as Product;
        this.state.products[idx] = updated;
        this.persist();
        return updated;
      }
    }

    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.products.push(newProduct);
    this.persist();
    return newProduct;
  }

  public deleteProduct(productId: string): void {
    this.state.products = this.state.products.filter((p) => p.id !== productId);
    this.persist();
  }

  public toggleProductAvailability(productId: string): void {
    const idx = this.state.products.findIndex((p) => p.id === productId);
    if (idx >= 0) {
      this.state.products[idx].available = !this.state.products[idx].available;
      this.persist();
    }
  }

  // =================== ESTOQUE (INGREDIENTES) ===================

  public saveIngredient(ingData: Omit<Ingredient, 'id' | 'updatedAt'> & { id?: string }): Ingredient {
    if (ingData.id) {
      const idx = this.state.ingredients.findIndex((i) => i.id === ingData.id);
      if (idx >= 0) {
        const updated: Ingredient = {
          ...this.state.ingredients[idx],
          ...ingData,
          updatedAt: new Date().toISOString(),
        };
        this.state.ingredients[idx] = updated;
        this.persist();
        return updated;
      }
    }

    const newIng: Ingredient = {
      ...ingData,
      id: `ing-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    this.state.ingredients.push(newIng);
    this.persist();
    return newIng;
  }

  public addStockEntry(
    ingredientId: string,
    quantityToAdd: number,
    costPerUnit: number,
    createExpense = true,
    supplierName?: string
  ): void {
    const idx = this.state.ingredients.findIndex((i) => i.id === ingredientId);
    if (idx === -1) return;

    const ing = this.state.ingredients[idx];
    const newQty = Number((ing.quantity + quantityToAdd).toFixed(3));
    this.state.ingredients[idx] = {
      ...ing,
      quantity: newQty,
      costPerUnit: costPerUnit || ing.costPerUnit,
      updatedAt: new Date().toISOString(),
    };

    const mov: StockMovement = {
      id: `mov-${Date.now()}`,
      ingredientId: ing.id,
      ingredientName: ing.name,
      type: 'entrada_compra',
      quantity: quantityToAdd,
      unit: ing.unit,
      date: new Date().toISOString(),
      notes: supplierName ? `Entrada de reposição - Fornecedor: ${supplierName}` : 'Entrada manual de reposição',
    };
    this.state.stockMovements.unshift(mov);

    if (createExpense && costPerUnit > 0) {
      const totalCost = Number((quantityToAdd * costPerUnit).toFixed(2));
      this.state.transactions.unshift({
        id: `tx-compra-${Date.now()}`,
        description: `Reposição de Insumo: ${ing.name} (${quantityToAdd} ${ing.unit})`,
        type: 'despesa',
        category: 'Insumos e Matéria-Prima',
        amount: totalCost,
        date: new Date().toISOString(),
        paymentMethod: 'pix',
        status: 'pago',
        notes: `Fornecedor: ${supplierName || ing.supplierName || 'Diversos'}`,
      });
    }

    this.persist();
  }

  public deleteIngredient(ingredientId: string): void {
    this.state.ingredients = this.state.ingredients.filter((i) => i.id !== ingredientId);
    this.persist();
  }

  // =================== FINANCEIRO (TRANSAÇÕES) ===================

  public addTransaction(tx: Omit<Transaction, 'id'>): Transaction {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    this.state.transactions.unshift(newTx);
    this.persist();
    return newTx;
  }

  public deleteTransaction(id: string): void {
    this.state.transactions = this.state.transactions.filter((t) => t.id !== id);
    this.persist();
  }

  // =================== CLIENTES ===================

  public saveCustomer(cust: Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'orderCount'> & { id?: string }): Customer {
    if (cust.id) {
      const idx = this.state.customers.findIndex((c) => c.id === cust.id);
      if (idx >= 0) {
        this.state.customers[idx] = {
          ...this.state.customers[idx],
          ...cust,
        };
        this.persist();
        return this.state.customers[idx];
      }
    }

    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      totalSpent: 0,
      orderCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.state.customers.push(newCust);
    this.persist();
    return newCust;
  }

  public deleteCustomer(id: string): void {
    this.state.customers = this.state.customers.filter((c) => c.id !== id);
    this.persist();
  }

  // =================== FORNECEDORES ===================

  public saveSupplier(supplier: Omit<Supplier, 'id'> & { id?: string }): Supplier {
    if (supplier.id) {
      const idx = this.state.suppliers.findIndex((s) => s.id === supplier.id);
      if (idx >= 0) {
        this.state.suppliers[idx] = {
          ...this.state.suppliers[idx],
          ...supplier,
        };
        this.persist();
        return this.state.suppliers[idx];
      }
    }

    const newSup: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
    };
    this.state.suppliers.push(newSup);
    this.persist();
    return newSup;
  }

  public deleteSupplier(id: string): void {
    this.state.suppliers = this.state.suppliers.filter((s) => s.id !== id);
    this.persist();
  }

  // =================== CONFIGURAÇÕES ===================

  public updateSettings(settings: Partial<CompanySettings>): void {
    this.state.settings = {
      ...this.state.settings,
      ...settings,
    };
    this.persist();
  }

  public toggleStoreOpen(): boolean {
    this.state.settings.isOpen = !this.state.settings.isOpen;
    this.persist();
    return this.state.settings.isOpen;
  }

  // =================== CÁLCULOS ESTATÍSTICOS CONSOLIDADOS ===================

  public getDashboardStats() {
    const nonCancelledOrders = this.state.orders.filter((o) => o.status !== 'cancelado');
    const today = new Date().toDateString();

    const todayOrders = nonCancelledOrders.filter(
      (o) => new Date(o.createdAt).toDateString() === today
    );

    const receivedCount = this.state.orders.filter((o) => o.status === 'recebido').length;
    const preparingCount = this.state.orders.filter((o) => o.status === 'em_preparo').length;
    const readyCount = this.state.orders.filter((o) => o.status === 'pronto' || o.status === 'saiu_entrega').length;

    // Faturamento: soma de pedidos não cancelados
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);

    // Despesas do financeiro
    const totalExpenses = this.state.transactions
      .filter((t) => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    // CMV (Custo das mercadorias vendidas dos pedidos entregues/prontos)
    let totalCmv = 0;
    nonCancelledOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = this.state.products.find((p) => p.id === item.productId);
        if (prod) {
          totalCmv += (prod.cost || 0) * item.quantity;
        }
      });
    });

    const estimatedNetProfit = Math.max(2850.5, totalRevenue - totalCmv - totalExpenses);
    const avgTicket = nonCancelledOrders.length > 0 ? totalRevenue / nonCancelledOrders.length : 0;

    // Alertas de estoque baixo
    const lowStockIngredients = this.state.ingredients.filter(
      (ing) => ing.quantity <= ing.minQuantity
    );

    // Produtos mais vendidos
    const productSalesMap: Record<string, { product: Product; count: number; totalRev: number }> = {};
    nonCancelledOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          const prod = this.state.products.find((p) => p.id === item.productId);
          if (prod) {
            productSalesMap[item.productId] = {
              product: prod,
              count: 0,
              totalRev: 0,
            };
          }
        }
        if (productSalesMap[item.productId]) {
          productSalesMap[item.productId].count += item.quantity;
          productSalesMap[item.productId].totalRev += item.totalPrice;
        }
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      todayRevenue,
      todayOrdersCount: todayOrders.length,
      totalRevenue,
      totalOrdersCount: nonCancelledOrders.length,
      receivedCount,
      preparingCount,
      readyCount,
      totalExpenses,
      totalCmv,
      estimatedNetProfit,
      avgTicket,
      lowStockIngredients,
      topProducts,
    };
  }
}

export const dataService = new DataService();
