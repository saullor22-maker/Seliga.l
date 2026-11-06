export type ProductCategory = 
  | 'hamburgueres' 
  | 'combos' 
  | 'porcoes' 
  | 'bebidas' 
  | 'sobremesas';

export type OrderStatus = 
  | 'recebido' 
  | 'em_preparo' 
  | 'pronto' 
  | 'saiu_entrega' 
  | 'entregue' 
  | 'cancelado';

export type OrderType = 'delivery' | 'retirada' | 'mesa';

export type PaymentMethod = 'pix' | 'credito' | 'debito' | 'dinheiro';

export type PaymentStatus = 'pago' | 'pendente';

export type UnitOfMeasure = 'kg' | 'g' | 'un' | 'l' | 'ml' | 'pct';

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: UnitOfMeasure;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  cost: number;
  imageUrl: string;
  available: boolean;
  recipe: RecipeItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  neighborhood?: string;
  tableNumber?: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  changeFor?: number; // Troco para quanto (dinheiro)
  stockDeducted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: UnitOfMeasure;
  costPerUnit: number;
  supplierId?: string;
  supplierName?: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: 'entrada_compra' | 'saida_venda' | 'ajuste_perda';
  quantity: number;
  unit: UnitOfMeasure;
  date: string;
  orderId?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  description: string;
  type: 'receita' | 'despesa';
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  orderId?: string;
  status: 'pago' | 'pendente';
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  neighborhood?: string;
  notes?: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email?: string;
  cnpj?: string;
  category: string;
  deliveryLeadDays: number;
  notes?: string;
}

export interface CompanySettings {
  businessName: string;
  fantasyName: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  deliveryFee: number;
  avgPrepTimeMinutes: number;
  isOpen: boolean;
  openingHours: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'caixa' | 'cozinha';
  avatar?: string;
}
