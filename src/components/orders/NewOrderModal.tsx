import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  DollarSign,
  CheckCircle2,
  Search,
  Sparkles,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Customer, OrderItem, OrderType, PaymentMethod, PaymentStatus, Product } from '../../types';
import { formatBRL } from '../../utils/formatters';
import { dataService } from '../../services/dataService';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  defaultDeliveryFee: number;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  defaultDeliveryFee,
}) => {
  if (!isOpen) return null;

  // Cliente
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  // Atendimento & Pagamento
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pago');
  const [orderNotes, setOrderNotes] = useState('');
  const [changeFor, setChangeFor] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);

  // Itens selecionados no carrinho
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Filtro de produtos
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [productSearch, setProductSearch] = useState('');

  // Auto-complete de cliente
  const handleSelectCustomer = (c: Customer) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    if (c.address) setCustomerAddress(c.address);
    if (c.neighborhood) setNeighborhood(c.neighborhood);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const updateItemNote = (productId: string, note: string) => {
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, notes: note } : item))
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Cálculos
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const deliveryFee = orderType === 'delivery' ? defaultDeliveryFee : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Por favor, informe o telefone/WhatsApp do cliente.');
      return;
    }
    if (cart.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }

    try {
      dataService.createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: orderType === 'delivery' ? customerAddress.trim() : undefined,
        neighborhood: orderType === 'delivery' ? neighborhood.trim() : undefined,
        tableNumber: orderType === 'mesa' ? tableNumber.trim() : undefined,
        type: orderType,
        status: 'recebido',
        items: cart,
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod,
        paymentStatus,
        notes: orderNotes.trim(),
        changeFor: paymentMethod === 'dinheiro' && changeFor ? Number(changeFor) : undefined,
      });

      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar o pedido.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'todos' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-zinc-950 shadow-md">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Cadastrar Novo Pedido</h2>
              <p className="text-xs text-zinc-400">Monte o pedido e lance diretamente na fila da cozinha</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Product Catalog + Right Order Cart */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          {/* Left: Product Selector (7 cols) */}
          <div className="lg:col-span-7 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar hambúrguer, combo, batata..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'hamburgueres', label: 'Burgers' },
                  { id: 'combos', label: 'Combos' },
                  { id: 'porcoes', label: 'Batatas' },
                  { id: 'bebidas', label: 'Bebidas' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-amber-500 text-zinc-950 shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 transition-all cursor-pointer group flex items-center gap-3 relative overflow-hidden"
                >
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-800 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{prod.description}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-black text-xs text-amber-400">
                        {formatBRL(prod.price)}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Customer & Order Form (5 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
              {/* Type selector */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Tipo de Atendimento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'delivery', label: 'Delivery' },
                    { id: 'retirada', label: 'Retirada' },
                    { id: 'mesa', label: 'Mesa' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setOrderType(t.id as OrderType)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        orderType === t.id
                          ? 'bg-red-600 border-red-500 text-white shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer details */}
              <div className="space-y-2.5 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Dados do Cliente
                  </span>
                  {/* Quick autofill suggestion */}
                  {customers.length > 0 && (
                    <select
                      onChange={(e) => {
                        const found = customers.find((c) => c.id === e.target.value);
                        if (found) handleSelectCustomer(found);
                      }}
                      className="bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 rounded px-1.5 py-0.5"
                    >
                      <option value="">Buscar cadastrado...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nome completo *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Telefone / WhatsApp *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                {orderType === 'delivery' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                    />
                    <input
                      type="text"
                      placeholder="Endereço, nº e complemento"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="sm:col-span-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                )}

                {orderType === 'mesa' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Identificação da Mesa (ex: Mesa 04)"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <span>Itens Selecionados ({cart.length})</span>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="text-red-400 hover:text-red-300 font-semibold text-[11px]"
                    >
                      Limpar itens
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                    Nenhum produto adicionado. Clique nos produtos ao lado para incluir no pedido.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-200">{item.name}</span>
                          <span className="font-black text-amber-400">
                            {formatBRL(item.totalPrice)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Obs: Sem picles, carne ao ponto..."
                            value={item.notes || ''}
                            onChange={(e) => updateItemNote(item.productId, e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300 w-full focus:outline-hidden focus:border-amber-400"
                          />

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-white text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="p-1 rounded text-zinc-500 hover:text-red-400 ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method & Status */}
              <div className="space-y-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-xs font-bold text-zinc-300 block">Forma de Pagamento</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['pix', 'credito', 'debito', 'dinheiro'] as PaymentMethod[]).map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                        paymentMethod === pm
                          ? 'bg-amber-500 text-zinc-950 shadow-xs'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'dinheiro' && (
                  <div className="pt-1">
                    <input
                      type="number"
                      step="any"
                      placeholder="Troco para quanto? (Ex: 100)"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-400">Status do Pagamento:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentStatus('pago')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        paymentStatus === 'pago'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'text-zinc-500'
                      }`}
                    >
                      Já Pago
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStatus('pendente')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        paymentStatus === 'pendente'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'text-zinc-500'
                      }`}
                    >
                      Pagar na Entrega
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Totals & Submit button */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal dos itens:</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxa de Entrega:</span>
                    <span>{formatBRL(deliveryFee)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto aplicado:</span>
                    <span>- {formatBRL(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white pt-1 border-t border-zinc-800">
                  <span>Valor Total:</span>
                  <span className="text-amber-400">{formatBRL(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirmar e Enviar para Cozinha
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
