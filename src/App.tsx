import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { HomeView } from './components/client/HomeView';
import { OrdersHistoryView } from './components/client/OrdersHistoryView';
import { FavoritesView } from './components/client/FavoritesView';
import { ProfileView } from './components/client/ProfileView';
import { ProductDetailModal } from './components/client/ProductDetailModal';
import { CartDrawer } from './components/client/CartDrawer';
import { CheckoutModal } from './components/client/CheckoutModal';
import { OrderTrackingModal } from './components/client/OrderTrackingModal';
import { ThermalReceiptModal } from './components/thermal/ThermalReceiptModal';
import { BalcaoPanel } from './components/balcao/BalcaoPanel';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { InAppNotificationBanner } from './components/notifications/InAppNotificationBanner';
import { PWAInstallModal } from './components/pwa/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';

const MainLayout: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isAdminAuthenticated,
    adminRole,
    clientTab,
    setClientTab,
    setTrackingOrderId,
    products,
    setSelectedProductForModal,
    theme,
  } = useStore();
  const {
    isIOS,
    showSmartBanner,
    smartPromptContext,
    showIOSGuide,
    setShowIOSGuide,
    dismissSmartPrompt,
    install,
  } = usePWAInstall();

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-neutral-950 transition-colors duration-200 ${
        isDark ? 'bg-[#0A0A0B] text-neutral-100' : 'bg-[#f4f5f7] text-gray-900'
      }`}
    >
      {/* Real-time In-App Notification Banner */}
      <InAppNotificationBanner
        onOpenOrder={(id) => setTrackingOrderId(id)}
        onOpenPromo={(action) => {
          if (action === 'menu') {
            setClientTab('menu');
          } else if (action && action.startsWith('prod-')) {
            const found = products.find((p) => p.id === action);
            if (found) {
              setSelectedProductForModal(found);
            } else {
              setClientTab('menu');
            }
          }
        }}
      />

      {/* Header */}
      <Header />

      {/* Main Container - Expansive Responsive Width for Hamburgueria PC */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24">
        {/* CLIENT VIEWS - Completely isolated from Admin */}
        {currentView === 'client' && (
          <>
            {(clientTab === 'home' || clientTab === 'menu' || clientTab === 'cart') && (
              <HomeView />
            )}
            {clientTab === 'orders' && <OrdersHistoryView />}
            {clientTab === 'favorites' && <FavoritesView />}
            {clientTab === 'profile' && <ProfileView />}
          </>
        )}

        {/* BALCAO & KITCHEN OPERATIONAL VIEW - Protected by Authentication */}
        {(currentView === 'balcao' || currentView === 'kitchen') && (
          isAdminAuthenticated ? (
            <BalcaoPanel />
          ) : (
            <AdminLoginView
              onSuccess={() => setCurrentView('balcao')}
              onBackToClient={() => setCurrentView('client')}
            />
          )
        )}

        {/* ADMIN DASHBOARD VIEW - Protected by Authentication & admin role */}
        {currentView === 'admin' && (
          isAdminAuthenticated ? (
            adminRole === 'balcao' ? (
              <BalcaoPanel />
            ) : (
              <AdminDashboard />
            )
          ) : (
            <AdminLoginView
              onSuccess={() => setCurrentView('admin')}
              onBackToClient={() => setCurrentView('client')}
            />
          )
        )}
      </main>

      {/* Mobile Bottom Navigation (Client only - hidden in Admin & Balcão) */}
      {currentView === 'client' && <BottomNav />}

      {/* Global Interactive Modals */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <ThermalReceiptModal />

      {/* PWA Install Modal / iOS Step-by-Step Guide */}
      <PWAInstallModal
        isOpen={showSmartBanner}
        onClose={dismissSmartPrompt}
        onInstall={install}
        context={smartPromptContext}
        isIOS={isIOS}
        showIOSGuide={showIOSGuide}
        onCloseIOSGuide={() => setShowIOSGuide(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
