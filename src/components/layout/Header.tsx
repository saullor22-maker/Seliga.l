import React, { useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  Bell,
  Power,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { AuthUser, Ingredient, Order } from '../../types';
import { dataService } from '../../services/dataService';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenNewOrder: () => void;
  orders: Order[];
  ingredients: Ingredient[];
  isStoreOpen: boolean;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenOrderDetails?: (order: Order) => void;
  onNavigateToStock?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenNewOrder,
  orders,
  ingredients,
  isStoreOpen,
  currentUser,
  onLogout,
  onOpenOrderDetails,
  onNavigateToStock,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      };
      setCurrentDateTime(new Intl.DateTimeFormat('pt-BR', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const lowStock = ingredients.filter((ing) => ing.quantity <= ing.minQuantity);
  const pendingOrders = orders.filter((o) => o.status === 'recebido');
  const notificationCount = lowStock.length + pendingOrders.length;

  return (
    <header className="sticky top-0 z-30 h-20 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Store status switch */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 lg:hidden transition-colors"
          title="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Open/Close Store Toggle */}
        <button
          onClick={() => dataService.toggleStoreOpen()}
          className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
            isStoreOpen
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
          }`}
          title="Clique para alternar o status da loja"
        >
          <Power className={`w-3.5 h-3.5 ${isStoreOpen ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className="hidden sm:inline">
            {isStoreOpen ? 'Aberta para Pedidos' : 'Fechada Temporariamente'}
          </span>
          <span className="text-[10px] uppercase tracking-wider opacity-75 font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
            {isStoreOpen ? 'Online' : 'Offline'}
          </span>
        </button>

        {/* Current Date & Time (Brasília) */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="capitalize font-medium">{currentDateTime}</span>
          <span className="text-[10px] text-zinc-500 font-mono">(Brasília)</span>
        </div>
      </div>

      {/* Right: Notifications, Quick New Order, Profile */}
      <div className="flex items-center gap-3">
        {/* Notification bell with popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors"
            title="Notificações e Alertas"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
                {notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">Central de Alertas</h4>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60 py-2 space-y-2">
                {notificationCount === 0 ? (
                  <div className="text-center py-6 text-zinc-400 text-xs">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    Tudo certo! Sem alertas críticos ou pedidos pendentes.
                  </div>
                ) : (
                  <>
                    {pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="py-2.5 px-2 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer"
                        onClick={() => {
                          setShowNotifications(false);
                          if (onOpenOrderDetails) onOpenOrderDetails(order);
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-semibold text-zinc-200">
                              Pedido #{order.orderNumber} aguardando preparo
                            </p>
                            <p className="text-zinc-400 text-[11px]">
                              {order.customerName} &bull; {order.type.toUpperCase()} &bull; Total: R${' '}
                              {order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {lowStock.map((ing) => (
                      <div
                        key={ing.id}
                        className="py-2.5 px-2 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer"
                        onClick={() => {
                          setShowNotifications(false);
                          if (onNavigateToStock) onNavigateToStock();
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-semibold text-red-300">
                              Estoque baixo: {ing.name}
                            </p>
                            <p className="text-zinc-400 text-[11px]">
                              Atual: {ing.quantity} {ing.unit} (Mínimo: {ing.minQuantity} {ing.unit})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA: Novo Pedido */}
        <button
          onClick={onOpenNewOrder}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-sm shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline uppercase tracking-wide">Novo Pedido</span>
          <span className="sm:hidden">Pedido</span>
        </button>

        {/* User profile avatar badge with logout dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 border-l border-zinc-800 text-left hover:opacity-90 transition-opacity cursor-pointer p-1 rounded-xl"
            title="Menu do Operador"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600/20 via-zinc-800 to-amber-500/20 border border-zinc-700/80 flex items-center justify-center text-amber-400 font-black text-xs shadow-inner">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'SL'}
            </div>
            <div className="hidden md:block leading-tight">
              <p className="font-bold text-xs text-zinc-200 truncate max-w-[140px]">
                {currentUser?.name || 'Saullo Rodrigues'}
              </p>
              <p className="text-[10px] text-amber-400 capitalize font-medium flex items-center gap-1">
                <span>{currentUser?.role === 'admin' ? 'Administrador' : currentUser?.role === 'caixa' ? 'Operador Caixa' : 'Cozinha'}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
              <div className="p-2 border-b border-zinc-800">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'Saullo Rodrigues'}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {currentUser?.email || 'saullor22@gmail.com'}
                </p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  {currentUser?.role === 'admin' ? 'Gerência & Admin' : currentUser?.role === 'caixa' ? 'Operador Caixa' : 'Cozinha'}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

