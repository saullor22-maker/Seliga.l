import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  Boxes,
  DollarSign,
  Users,
  Truck,
  BarChart3,
  Settings,
  Flame,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Order, Ingredient } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'orders'
  | 'menu'
  | 'stock'
  | 'finance'
  | 'customers'
  | 'suppliers'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  orders: Order[];
  ingredients: Ingredient[];
  isStoreOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  setIsOpen,
  orders,
  ingredients,
  isStoreOpen,
}) => {
  // Badges
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'recebido' || o.status === 'em_preparo'
  ).length;

  const lowStockCount = ingredients.filter(
    (ing) => ing.quantity <= ing.minQuantity
  ).length;

  const menuItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: UtensilsCrossed,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-zinc-950',
    },
    { id: 'menu', label: 'Cardápio', icon: BookOpen },
    {
      id: 'stock',
      label: 'Estoque',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 ring-2 ring-amber-400/30">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  SE LIGA
                </span>
                <span className="bg-amber-400 text-zinc-950 px-1.5 py-0.5 rounded-sm text-xs font-black tracking-wider uppercase">
                  LANCHE
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">Gestão de Hamburgueria</p>
            </div>
          </div>
        </div>

        {/* Store status pill */}
        <div className="px-5 pt-4 pb-2">
          <div
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-xs font-medium ${
              isStoreOpen
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isStoreOpen && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isStoreOpen ? 'bg-emerald-500' : 'bg-zinc-600'
                  }`}
                ></span>
              </span>
              <span>{isStoreOpen ? 'Lanchonete Aberta' : 'Lanchonete Fechada'}</span>
            </div>
            <span className="text-[11px] opacity-75 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 18h - 23h45
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-amber-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-xs ${
                        isActive ? 'bg-white text-red-600' : item.badgeColor || 'bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info & Mode indicator */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" /> Modo Demonstração
              </span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-mono font-bold">
                Ativo
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">
              Dados salvos localmente com consistência entre pedidos, estoque e financeiro.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pronto p/ Firebase Firestore</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
