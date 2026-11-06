import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Flame,
  Award,
  ChevronRight,
  PlusCircle,
  Truck,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart,
  PieChart,
} from 'lucide-react';
import { Ingredient, Order, Product, Transaction } from '../../types';
import { formatBRL, ORDER_STATUS_CONFIG } from '../../utils/formatters';
import { dataService } from '../../services/dataService';

interface DashboardViewProps {
  orders: Order[];
  products: Product[];
  ingredients: Ingredient[];
  transactions: Transaction[];
  onOpenNewOrder: () => void;
  onOpenOrderDetails: (order: Order) => void;
  onNavigateToStock: () => void;
  onNavigateToOrders: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  products,
  ingredients,
  transactions,
  onOpenNewOrder,
  onOpenOrderDetails,
  onNavigateToStock,
  onNavigateToOrders,
}) => {
  const stats = dataService.getDashboardStats();

  const activeOrders = orders
    .filter((o) => o.status !== 'entregue' && o.status !== 'cancelado')
    .slice(0, 5);

  // Categorias breakdown
  const categoryStats: Record<string, { label: string; count: number; total: number; color: string }> = {
    hamburgueres: { label: 'Hambúrgueres Artesanais', count: 0, total: 0, color: 'bg-red-500' },
    combos: { label: 'Combos & Promoções', count: 0, total: 0, color: 'bg-amber-500' },
    porcoes: { label: 'Batatas & Porções', count: 0, total: 0, color: 'bg-yellow-400' },
    bebidas: { label: 'Bebidas Geladas', count: 0, total: 0, color: 'bg-blue-500' },
    sobremesas: { label: 'Sobremesas', count: 0, total: 0, color: 'bg-pink-500' },
  };

  orders
    .filter((o) => o.status !== 'cancelado')
    .forEach((order) => {
      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const cat = prod?.category || 'hamburgueres';
        if (categoryStats[cat]) {
          categoryStats[cat].count += item.quantity;
          categoryStats[cat].total += item.totalPrice;
        }
      });
    });

  const totalCatRevenue = Object.values(categoryStats).reduce((acc, c) => acc + c.total, 0) || 1;

  // Formas de pagamento
  const paymentBreakdown: Record<string, number> = {
    pix: 0,
    credito: 0,
    debito: 0,
    dinheiro: 0,
  };
  orders
    .filter((o) => o.status !== 'cancelado')
    .forEach((o) => {
      paymentBreakdown[o.paymentMethod] = (paymentBreakdown[o.paymentMethod] || 0) + o.total;
    });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-zinc-900 to-zinc-950 border border-red-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Painel Geral em Tempo Real</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Bem-vindo ao <span className="text-amber-400">Se Liga Lanche</span>
            </h1>
            <p className="text-sm text-zinc-300 max-w-xl">
              Monitore a esteira de pedidos, controle a baixa automática de ingredientes e acompanhe a saúde financeira da sua operação.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToOrders}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Ver Pedidos</span>
            </button>
            <button
              onClick={onOpenNewOrder}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Pedido</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Vendas Hoje */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Vendas de Hoje
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatBRL(stats.todayRevenue)}
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">{stats.todayOrdersCount} pedidos</span> hoje
            </p>
          </div>
        </div>

        {/* Card 2: Pedidos em Aberto */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg relative overflow-hidden group hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Pedidos na Cozinha
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {stats.receivedCount + stats.preparingCount}
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
              <span className="text-amber-400 font-bold">{stats.receivedCount} recebidos</span>
              <span>&bull;</span>
              <span className="text-orange-400 font-bold">{stats.preparingCount} em preparo</span>
            </p>
          </div>
        </div>

        {/* Card 3: Lucro Estimado */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Lucro Estimado
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {formatBRL(stats.estimatedNetProfit)}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Faturamento líquido após CMV e despesas
            </p>
          </div>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Ticket Médio
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatBRL(stats.avgTicket)}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Média gasta por cliente em pedidos válidos
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Pedidos em Andamento & Alertas de Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2 cols - Fila de Pedidos Ativos */}
        <div className="lg:col-span-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600/15 border border-red-500/20 text-red-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Fila de Produção & Entrega</h3>
                <p className="text-xs text-zinc-400">Últimos pedidos que demandam atenção na cozinha</p>
              </div>
            </div>

            <button
              onClick={onNavigateToOrders}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
            >
              Ver todos ({orders.length}) <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {activeOrders.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                Nenhum pedido em aberto no momento. Todos foram entregues ou finalizados!
              </div>
            ) : (
              activeOrders.map((order) => {
                const statusCfg = ORDER_STATUS_CONFIG[order.status];
                return (
                  <div
                    key={order.id}
                    onClick={() => onOpenOrderDetails(order)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/40 px-3 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/80 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] text-zinc-400 uppercase font-mono">Ped</span>
                        <span className="text-sm font-black text-amber-400 leading-none">
                          #{order.orderNumber}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors">
                            {order.customerName}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {order.type === 'delivery' ? 'Delivery' : order.type === 'mesa' ? order.tableNumber || 'Mesa' : 'Retirada'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' • ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-black text-white">{formatBRL(order.total)}</div>
                        <span className="text-[10px] text-zinc-400">
                          {order.paymentMethod.toUpperCase()} &bull; {order.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: 1 col - Alertas de Estoque Baixo */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Alerta de Estoque</h3>
                <p className="text-xs text-zinc-400">Insumos abaixo do nível seguro</p>
              </div>
            </div>

            <button
              onClick={onNavigateToStock}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              Gerenciar
            </button>
          </div>

          <div className="space-y-3">
            {stats.lowStockIngredients.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                Estoque 100% equilibrado! Nenhum insumo abaixo do limite.
              </div>
            ) : (
              stats.lowStockIngredients.map((ing) => (
                <div
                  key={ing.id}
                  className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2 hover:bg-red-950/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-200">{ing.name}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                      Crítico
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>
                      Disponível: <strong className="text-red-400">{ing.quantity} {ing.unit}</strong>
                    </span>
                    <span>Mínimo: {ing.minQuantity} {ing.unit}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (ing.quantity / (ing.minQuantity * 1.5)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={onNavigateToStock}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
          >
            <span>Dar Entrada de Mercadorias</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Second Row: Produtos Mais Vendidos & Gráficos por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campeões de Venda */}
        <div className="lg:col-span-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Produtos Campeões de Venda</h3>
                <p className="text-xs text-zinc-400">Os lanches mais pedidos e lucrativos da casa</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {stats.topProducts.map(({ product, count, totalRev }, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
              >
                <div className="relative shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-700 shadow-sm"
                  />
                  <span
                    className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${
                      index === 0
                        ? 'bg-amber-400 text-zinc-950 ring-2 ring-amber-300'
                        : index === 1
                        ? 'bg-zinc-300 text-zinc-950'
                        : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    #{index + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-zinc-100 truncate">{product.name}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    <strong className="text-amber-400">{count} vendidos</strong> &bull; Total: {formatBRL(totalRev)}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                    Preço: {formatBRL(product.price)} (Custo: {formatBRL(product.cost)})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição por Categoria */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Mix de Vendas</h3>
                <p className="text-xs text-zinc-400">Participação por categoria</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(categoryStats).map(([key, data]) => {
              const pct = Math.round((data.total / totalCatRevenue) * 100);
              return (
                <div key={key} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-zinc-300">{data.label}</span>
                    <span className="text-zinc-400">
                      {formatBRL(data.total)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${data.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Faturamento Total do Mix:</span>
            <span className="font-black text-white">{formatBRL(totalCatRevenue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
