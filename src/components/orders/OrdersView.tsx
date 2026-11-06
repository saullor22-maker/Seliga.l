import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Eye,
  Printer,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { Order, OrderStatus, OrderType } from '../../types';
import { formatBRL, formatDateTime, formatPhone, ORDER_STATUS_CONFIG } from '../../utils/formatters';
import { dataService } from '../../services/dataService';

interface OrdersViewProps {
  orders: Order[];
  onOpenNewOrder: () => void;
  onOpenOrderDetails: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
}

const KANBAN_COLUMNS: { status: OrderStatus; title: string; subtitle: string; color: string; border: string; bg: string }[] = [
  {
    status: 'recebido',
    title: 'Recebidos',
    subtitle: 'Aguardando Início',
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
  },
  {
    status: 'em_preparo',
    title: 'Na Chapa / Preparo',
    subtitle: 'Produção na Cozinha',
    color: 'text-orange-400',
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/10',
  },
  {
    status: 'pronto',
    title: 'Pronto / Balcão',
    subtitle: 'Aguardando Retirada/Motoboy',
    color: 'text-blue-400',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
  },
  {
    status: 'saiu_entrega',
    title: 'Saiu para Entrega',
    subtitle: 'Com o Entregador',
    color: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
  },
  {
    status: 'entregue',
    title: 'Concluídos',
    subtitle: 'Finalizados com Sucesso',
    color: 'text-emerald-400',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
  },
];

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOpenNewOrder,
  onOpenOrderDetails,
  onPrintReceipt,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [typeFilter, setTypeFilter] = useState<string>('todos');

  // Filtragem
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      order.customerName.toLowerCase().includes(term) ||
      order.orderNumber.toString().includes(term) ||
      order.customerPhone.includes(term) ||
      (order.customerAddress && order.customerAddress.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;
    const matchesType = typeFilter === 'todos' || order.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const advanceStatus = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    const transitions: Record<OrderStatus, OrderStatus> = {
      recebido: 'em_preparo',
      em_preparo: 'pronto',
      pronto: order.type === 'delivery' ? 'saiu_entrega' : 'entregue',
      saiu_entrega: 'entregue',
      entregue: 'entregue',
      cancelado: 'recebido',
    };
    const next = transitions[order.status];
    if (next && next !== order.status) {
      dataService.updateOrderStatus(order.id, next);
    }
  };

  const cancelOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja cancelar este pedido? O estoque será estornado caso já tenha sido baixado.')) {
      dataService.updateOrderStatus(orderId, 'cancelado');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Gerenciamento de Pedidos</h1>
            <span className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Controle a produção na esteira da cozinha, emita comprovantes e avance o status dos pedidos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Quadro Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Quadro</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Tabela</span>
            </button>
          </div>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Pedido</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por cliente, nº do pedido, telefone ou endereço..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-hidden focus:border-amber-400"
          >
            <option value="todos">Todos os Status</option>
            <option value="recebido">Recebido</option>
            <option value="em_preparo">Em Preparo</option>
            <option value="pronto">Pronto</option>
            <option value="saiu_entrega">Saiu para Entrega</option>
            <option value="entregue">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-hidden focus:border-amber-400"
          >
            <option value="todos">Todos os Atendimentos</option>
            <option value="delivery">Delivery</option>
            <option value="retirada">Retirada no Balcão</option>
            <option value="mesa">Consumo no Local / Mesa</option>
          </select>
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const columnOrders = filteredOrders.filter((o) => o.status === col.status);
            return (
              <div
                key={col.status}
                className="flex flex-col bg-zinc-950/70 border border-zinc-800/80 rounded-2xl min-w-[280px]"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b border-zinc-800 rounded-t-2xl ${col.bg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-bold text-xs uppercase tracking-wider ${col.color}`}>
                        {col.title}
                      </h3>
                      <p className="text-[10px] text-zinc-400">{col.subtitle}</p>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-bold flex items-center justify-center text-zinc-200">
                      {columnOrders.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
                  {columnOrders.length === 0 ? (
                    <div className="py-10 text-center text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-xl">
                      Nenhum pedido
                    </div>
                  ) : (
                    columnOrders.map((order) => {
                      const totalItemsCount = order.items.reduce((s, i) => s + i.quantity, 0);
                      return (
                        <div
                          key={order.id}
                          onClick={() => onOpenOrderDetails(order)}
                          className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 shadow-md transition-all cursor-pointer group space-y-3"
                        >
                          {/* Order Card Header */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              #{order.orderNumber}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {order.type === 'delivery'
                                  ? 'Delivery'
                                  : order.type === 'mesa'
                                  ? order.tableNumber || 'Mesa'
                                  : 'Retirada'}
                              </span>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div>
                            <h4 className="font-bold text-xs text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                              {order.customerName}
                            </h4>
                            <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-zinc-500" />
                              {formatPhone(order.customerPhone)}
                            </p>
                            {order.type === 'delivery' && order.customerAddress && (
                              <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 line-clamp-1">
                                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                {order.neighborhood ? `${order.neighborhood} - ` : ''}
                                {order.customerAddress}
                              </p>
                            )}
                          </div>

                          {/* Items Summary */}
                          <div className="p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-[11px] space-y-1">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-zinc-300">
                                <span className="truncate">
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="font-mono shrink-0 ml-1 text-zinc-400">
                                  {formatBRL(item.totalPrice)}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-[10px] text-zinc-500 italic">
                                + {order.items.length - 2} outro(s) item(ns)...
                              </p>
                            )}
                          </div>

                          {/* Total & Payment */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800">
                            <div>
                              <span className="text-[10px] text-zinc-400 uppercase">Total:</span>
                              <p className="font-black text-white">{formatBRL(order.total)}</p>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                order.paymentStatus === 'pago'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {order.paymentMethod.toUpperCase()} ({order.paymentStatus === 'pago' ? 'Pago' : 'Pendente'})
                            </span>
                          </div>

                          {/* Card Quick Actions */}
                          <div className="flex items-center justify-between gap-1 pt-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPrintReceipt(order);
                                }}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                                title="Imprimir Cupom da Cozinha"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => cancelOrder(e, order.id)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/40 text-zinc-400 hover:text-red-400 transition-colors"
                                title="Cancelar Pedido"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {order.status !== 'entregue' && (
                              <button
                                onClick={(e) => advanceStatus(e, order)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Avançar para o próximo status"
                              >
                                <span>Avançar</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4"># Pedido</th>
                  <th className="py-3 px-4">Data/Hora</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Itens</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                      Nenhum pedido encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusCfg = ORDER_STATUS_CONFIG[order.status];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => onOpenOrderDetails(order)}
                        className="hover:bg-zinc-800/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          #{order.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-zinc-400">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-zinc-100">{order.customerName}</div>
                          <div className="text-[11px] text-zinc-400">{formatPhone(order.customerPhone)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {order.type === 'delivery' ? 'Delivery' : order.type === 'mesa' ? order.tableNumber || 'Mesa' : 'Retirada'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 max-w-xs truncate">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="py-3 px-4 font-black text-white">
                          {formatBRL(order.total)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-zinc-300">
                            {order.paymentMethod.toUpperCase()}
                          </span>
                          <span className="block text-[10px] text-zinc-400">
                            {order.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold inline-block ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onPrintReceipt(order)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                              title="Imprimir Comprovante"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenOrderDetails(order)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400"
                              title="Ver Detalhes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
