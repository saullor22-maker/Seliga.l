import React from 'react';
import { X, Printer, Flame } from 'lucide-react';
import { Order, CompanySettings } from '../../types';
import { formatBRL, formatDateTime, formatPhone } from '../../utils/formatters';

interface PrintReceiptModalProps {
  order: Order | null;
  settings: CompanySettings;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  order,
  settings,
  onClose,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Visualização de Impressão</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Paper Receipt Container */}
        <div className="p-6 overflow-y-auto flex justify-center bg-zinc-900/40">
          <div
            id="receipt-print-area"
            className="w-full max-w-[320px] bg-white text-zinc-950 p-6 rounded-lg font-mono text-xs shadow-2xl space-y-4 print:p-0 print:shadow-none print:w-full"
          >
            {/* Header */}
            <div className="text-center space-y-1 border-b border-dashed border-zinc-400 pb-3">
              <h1 className="font-black text-base tracking-tight uppercase">
                {settings.fantasyName || 'SE LIGA LANCHE'}
              </h1>
              <p className="text-[10px] text-zinc-600">{settings.businessName}</p>
              <p className="text-[10px] text-zinc-600">CNPJ: {settings.cnpj}</p>
              <p className="text-[10px] text-zinc-600">
                {settings.address} - {settings.neighborhood}
              </p>
              <p className="text-[10px] text-zinc-600">Tel: {settings.phone}</p>
              <div className="pt-1">
                <span className="text-[10px] border border-zinc-800 px-2 py-0.5 font-bold uppercase">
                  *** CUPOM NÃO FISCAL ***
                </span>
              </div>
            </div>

            {/* Order Meta */}
            <div className="space-y-1 border-b border-dashed border-zinc-400 pb-2 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>PEDIDO: #{order.orderNumber}</span>
                <span className="uppercase">{order.type}</span>
              </div>
              <div className="text-[10px] text-zinc-600">
                Data: {formatDateTime(order.createdAt)}
              </div>
              <div className="pt-1">
                <p className="font-bold">Cliente: {order.customerName}</p>
                <p className="text-[10px]">Tel: {formatPhone(order.customerPhone)}</p>
                {order.type === 'delivery' && order.customerAddress && (
                  <p className="text-[10px] font-semibold mt-0.5">
                    Endereço: {order.neighborhood ? `${order.neighborhood}, ` : ''}
                    {order.customerAddress}
                  </p>
                )}
                {order.type === 'mesa' && order.tableNumber && (
                  <p className="text-[10px] font-bold">Mesa / Posição: {order.tableNumber}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 border-b border-dashed border-zinc-400 pb-3">
              <div className="flex justify-between font-bold text-[10px] uppercase border-b border-zinc-300 pb-1">
                <span>Item / Qtd</span>
                <span>Total</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-bold">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold">{formatBRL(item.totalPrice)}</span>
                  </div>
                  {item.notes && (
                    <p className="text-[9px] text-zinc-700 italic pl-3">
                      * Obs: {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="space-y-1 border-b border-dashed border-zinc-400 pb-3 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatBRL(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Taxa de Entrega:</span>
                  <span>{formatBRL(order.deliveryFee)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span>- {formatBRL(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1 border-t border-zinc-400">
                <span>TOTAL A PAGAR:</span>
                <span>{formatBRL(order.total)}</span>
              </div>

              <div className="pt-2 text-[10px]">
                <p>
                  Forma de Pagto: <strong className="uppercase">{order.paymentMethod}</strong> (
                  {order.paymentStatus === 'pago' ? 'PAGO' : 'A RECEBER NA ENTREGA'})
                </p>
                {order.changeFor && (
                  <p>
                    Troco p/: {formatBRL(order.changeFor)} (Devolver:{' '}
                    {formatBRL(order.changeFor - order.total)})
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] space-y-1 pt-1 text-zinc-600">
              <p className="font-bold uppercase">Se Liga no Sabor, Se Liga no Lanche!</p>
              <p>Agradecemos a sua preferência!</p>
              <p className="text-[9px]">WhatsApp: {settings.whatsapp}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
