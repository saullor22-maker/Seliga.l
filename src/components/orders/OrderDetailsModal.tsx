import React from 'react';
import {
  X,
  Printer,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  User,
  ShoppingBag,
  CreditCard,
  Flame,
  XCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import {
  formatBRL,
  formatDateTime,
  formatPhone,
  ORDER_STATUS_CONFIG,
} from '../../utils/formatters';
import { dataService } from '../../services/dataService';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onPrintReceipt: (order: Order) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onPrintReceipt,
}) => {
  if (!order) return null;

  const statusCfg = ORDER_STATUS_CONFIG[order.status];

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    dataService.updateOrderStatus(order.id, newStatus);
  };

  const handleSendWhatsApp = () => {
    const rawPhone = order.customerPhone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;

    const statusMessages: Record<OrderStatus, string> = {
      recebido: `Olá *${order.customerName}*! Seu pedido *#${order.orderNumber}* no *Se Liga Lanche* foi recebido com sucesso e logo entrará na chapa! 🍔 Total: ${formatBRL(order.total)}.`,
      em_preparo: `Olá *${order.customerName}*! Seu pedido *#${order.orderNumber}* já está na chapa sendo preparado com todo carinho no *Se Liga Lanche*! 🔥`,
      pronto: `Olá *${order.customerName}*! Seu pedido *#${order.orderNumber}* está PRONTINHO esperando por você! 🍟`,
      saiu_entrega: `Olá *${order.customerName}*! Seu pedido *#${order.orderNumber}* do *Se Liga Lanche* ACABOU DE SAIR PARA ENTREGA com nosso motoboy! 🛵 Logo chega quentinho aí!`,
      entregue: `Olá *${order.customerName}*! Seu pedido *#${order.orderNumber}* foi finalizado. Esperamos que tenha uma excelente experiência gastronômica com o *Se Liga Lanche*! Bom apetite! 😋`,
      cancelado: `Olá *${order.customerName}*, informamos que seu pedido *#${order.orderNumber}* no *Se Liga Lanche* foi cancelado.`,
    };

    const text = encodeURIComponent(statusMessages[order.status] || 'Olá!');
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
              #{order.orderNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Detalhes do Pedido</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                >
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Registrado em {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Progression Workflow */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Avançar Etapa da Cozinha
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { status: 'recebido', label: 'Recebido' },
                { status: 'em_preparo', label: 'Em Preparo' },
                { status: 'pronto', label: 'Pronto' },
                { status: 'saiu_entrega', label: 'A Caminho' },
                { status: 'entregue', label: 'Concluído' },
              ].map((step) => {
                const isActive = order.status === step.status;
                return (
                  <button
                    key={step.status}
                    type="button"
                    onClick={() => handleUpdateStatus(step.status as OrderStatus)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      isActive
                        ? 'bg-amber-500 border-amber-400 text-zinc-950 shadow-md font-black'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {step.label}
                  </button>
                );
              })}
            </div>

            {/* Stock Auto-Deduction Badge */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/80">
              <span className="text-zinc-400">Baixa automática de estoque:</span>
              {order.stockDeducted ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ingredientes baixados
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Baixa na finalização do preparo
                </span>
              )}
            </div>
          </div>

          {/* Customer & Delivery Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2 text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Dados do Cliente
              </span>
              <p className="font-bold text-sm text-white">{order.customerName}</p>
              <p className="text-zinc-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-zinc-500" />
                {formatPhone(order.customerPhone)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2 text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                Atendimento
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold">
                  {order.type === 'delivery'
                    ? 'Delivery em Domicílio'
                    : order.type === 'mesa'
                    ? order.tableNumber || 'Consumo no Local'
                    : 'Retirada no Balcão'}
                </span>
              </div>
              {order.type === 'delivery' && order.customerAddress && (
                <p className="text-zinc-300">
                  {order.neighborhood ? `Bairro ${order.neighborhood} — ` : ''}
                  {order.customerAddress}
                </p>
              )}
            </div>
          </div>

          {/* Order Items Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
              Itens do Pedido ({order.items.length})
            </h4>

            <div className="divide-y divide-zinc-800 rounded-2xl bg-zinc-900/70 border border-zinc-800 overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-zinc-100">
                      <span className="text-amber-400 font-black mr-1.5">{item.quantity}x</span>
                      {item.name}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-amber-300/90 italic bg-amber-500/10 px-2 py-0.5 rounded inline-block">
                        Obs: {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-white">
                      {formatBRL(item.totalPrice)}
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {item.quantity} x {formatBRL(item.unitPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                <strong className="text-amber-400">Observações gerais do pedido:</strong> {order.notes}
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal dos itens:</span>
              <span className="font-mono">{formatBRL(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-zinc-400">
                <span>Taxa de Entrega:</span>
                <span className="font-mono">{formatBRL(order.deliveryFee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Desconto aplicado:</span>
                <span className="font-mono">- {formatBRL(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
              <span>Total a Pagar:</span>
              <span className="text-amber-400 font-mono">{formatBRL(order.total)}</span>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Forma de Pagamento:</span>
              <span className="font-bold text-zinc-200">
                {order.paymentMethod.toUpperCase()} (
                <span className={order.paymentStatus === 'pago' ? 'text-emerald-400' : 'text-amber-400'}>
                  {order.paymentStatus === 'pago' ? 'Confirmado' : 'A receber'}
                </span>
                )
              </span>
            </div>
            {order.changeFor && (
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Troco para:</span>
                <span className="font-bold text-white">{formatBRL(order.changeFor)} (Troco: {formatBRL(order.changeFor - order.total)})</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintReceipt(order)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir Comprovante</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Avisar no WhatsApp</span>
            </button>
          </div>

          {order.status !== 'cancelado' && (
            <button
              onClick={() => {
                if (confirm('Deseja cancelar o pedido? O estoque será estornado.')) {
                  dataService.updateOrderStatus(order.id, 'cancelado');
                  onClose();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar Pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
