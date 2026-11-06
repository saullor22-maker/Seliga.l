import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { OrdersView } from './components/orders/OrdersView';
import { NewOrderModal } from './components/orders/NewOrderModal';
import { OrderDetailsModal } from './components/orders/OrderDetailsModal';
import { PrintReceiptModal } from './components/orders/PrintReceiptModal';
import { MenuView } from './components/menu/MenuView';
import { StockView } from './components/stock/StockView';
import { FinanceView } from './components/finance/FinanceView';
import { CustomersView } from './components/customers/CustomersView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView } from './components/auth/LoginView';
import { AppState, dataService } from './services/dataService';
import { AuthUser, Order } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('se_liga_lanche_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [state, setState] = useState<AppState>(() => dataService.getState());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modais globais de Pedidos
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  useEffect(() => {
    const unsubscribe = dataService.subscribe((newState) => {
      setState(newState);
      // Se houver pedido aberto em detalhes, atualiza ele também
      if (selectedOrderForDetails) {
        const updated = newState.orders.find((o) => o.id === selectedOrderForDetails.id);
        if (updated) setSelectedOrderForDetails(updated);
      }
    });
    return () => unsubscribe();
  }, [selectedOrderForDetails]);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrderForDetails(order);
  };

  const handlePrintReceipt = (order: Order) => {
    setSelectedOrderForReceipt(order);
  };

  const handleLogout = () => {
    localStorage.removeItem('se_liga_lanche_auth_user');
    setCurrentUser(null);
  };

  // Se não estiver autenticado, exibe a Tela de Login
  if (!currentUser) {
    return <LoginView onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        orders={state.orders}
        ingredients={state.ingredients}
        isStoreOpen={state.settings.isOpen}
      />

      {/* Main Layout Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          orders={state.orders}
          ingredients={state.ingredients}
          isStoreOpen={state.settings.isOpen}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenOrderDetails={handleOpenDetails}
          onNavigateToStock={() => setCurrentTab('stock')}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {currentTab === 'dashboard' && (
            <DashboardView
              orders={state.orders}
              products={state.products}
              ingredients={state.ingredients}
              transactions={state.transactions}
              onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
              onOpenOrderDetails={handleOpenDetails}
              onNavigateToStock={() => setCurrentTab('stock')}
              onNavigateToOrders={() => setCurrentTab('orders')}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersView
              orders={state.orders}
              onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
              onOpenOrderDetails={handleOpenDetails}
              onPrintReceipt={handlePrintReceipt}
            />
          )}

          {currentTab === 'menu' && (
            <MenuView
              products={state.products}
              ingredients={state.ingredients}
            />
          )}

          {currentTab === 'stock' && (
            <StockView
              ingredients={state.ingredients}
              stockMovements={state.stockMovements}
              suppliers={state.suppliers}
            />
          )}

          {currentTab === 'finance' && (
            <FinanceView
              transactions={state.transactions}
              orders={state.orders}
              products={state.products}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView customers={state.customers} />
          )}

          {currentTab === 'suppliers' && (
            <SuppliersView suppliers={state.suppliers} />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              orders={state.orders}
              products={state.products}
              ingredients={state.ingredients}
              transactions={state.transactions}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView settings={state.settings} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {isNewOrderModalOpen && (
        <NewOrderModal
          isOpen={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          products={state.products}
          customers={state.customers}
          defaultDeliveryFee={state.settings.deliveryFee}
        />
      )}

      {selectedOrderForDetails && (
        <OrderDetailsModal
          order={selectedOrderForDetails}
          onClose={() => setSelectedOrderForDetails(null)}
          onPrintReceipt={handlePrintReceipt}
        />
      )}

      {selectedOrderForReceipt && (
        <PrintReceiptModal
          order={selectedOrderForReceipt}
          settings={state.settings}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
}
