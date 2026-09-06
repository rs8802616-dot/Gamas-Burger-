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
import { KitchenPanel } from './components/kitchen/KitchenPanel';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { InAppNotificationBanner } from './components/notifications/InAppNotificationBanner';
import { PWAInstallModal } from './components/pwa/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';

const MainLayout: React.FC = () => {
  const {
    currentView,
    clientTab,
    setClientTab,
    setTrackingOrderId,
    products,
    setSelectedProductForModal,
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

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-neutral-100 flex flex-col antialiased selection:bg-amber-500 selection:text-neutral-950">
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

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-4 pb-12">
        {/* CLIENT VIEWS */}
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

        {/* KITCHEN KDS VIEW */}
        {currentView === 'kitchen' && <KitchenPanel />}

        {/* ADMIN DASHBOARD VIEW */}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Mobile Bottom Navigation (Client only) */}
      <BottomNav />

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
