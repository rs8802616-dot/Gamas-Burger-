import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  User,
  Clock,
  Flame,
  ChefHat,
  LayoutDashboard,
  Store,
  Volume2,
  VolumeX,
  Bell,
  LogOut,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { NotificationCenterModal } from '../notifications/NotificationCenterModal';
import { NotificationService } from '../../services/notificationService';

export const Header: React.FC = () => {
  const {
    storeSettings,
    cart,
    setIsCartOpen,
    currentView,
    setCurrentView,
    clientTab,
    setClientTab,
    searchQuery,
    setSearchQuery,
    orders,
    soundEnabled,
    toggleSound,
    setTrackingOrderId,
    isAdminAuthenticated,
    adminLogout,
  } = useStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const all = NotificationService.getNotifications();
      setUnreadNotifCount(all.filter((n) => !n.read).length);
    };
    updateCount();
    const unsub = NotificationService.subscribe(() => {
      updateCount();
    });
    return unsub;
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Active orders in kitchen
  const kitchenPendingCount = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing'
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-[#121214] to-[#0A0A0B]/95 backdrop-blur-md border-b border-white/5 transition-all">
      {/* Staff / Admin Management Bar - ONLY visible when in kitchen or admin view */}
      {currentView !== 'client' && (
        <div className="bg-[#101012] px-3 sm:px-6 py-2 border-b border-white/5 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="view-client-btn"
              onClick={() => setCurrentView('client')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 transition-all text-xs"
            >
              <Store className="w-3.5 h-3.5" />
              <span>← Cardápio do Cliente</span>
            </button>

            <button
              id="view-kitchen-btn"
              onClick={() => setCurrentView('kitchen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all relative text-xs ${
                currentView === 'kitchen'
                  ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Cozinha (KDS)</span>
              {kitchenPendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {kitchenPendingCount}
                </span>
              )}
            </button>

            <button
              id="view-admin-btn"
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                currentView === 'admin'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </button>

            {isAdminAuthenticated && (
              <button
                id="view-logout-btn"
                onClick={adminLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-all text-xs"
                title="Encerrar sessão de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair (Logout)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
              rs8802616@gmail.com
            </span>
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Silenciar alertas' : 'Ativar alertas sonoros'}
              className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-500" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistema Online
            </span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          {/* Brand Logo & Name */}
          <div
            onClick={() => {
              setCurrentView('client');
              setClientTab('home');
            }}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group select-none min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-amber-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0 group-hover:scale-105 transition-transform font-black text-black text-lg sm:text-xl">
              B
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                  BURGER <span className="text-amber-500">PREMIUM</span>
                </h1>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold truncate">
                  Aberto agora • 25-35 min
                </span>
              </div>
            </div>
          </div>

          {/* Search bar on desktop */}
          {currentView === 'client' && (
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-white/30 absolute left-4 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquise por hambúrguer, combo ou ingredientes..."
                  className="w-full bg-[#1A1A1D] border border-white/5 rounded-full py-2.5 px-11 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-white/20 text-white transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-2.5 text-xs bg-white/10 hover:bg-white/20 text-white/70 px-2 py-0.5 rounded-full"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Action Icons: Notifications, Profile & Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              id="header-notif-btn"
              onClick={() => {
                setIsNotifOpen(true);
                setUnreadNotifCount(0);
              }}
              title="Avisos e Novidades"
              className="p-2 sm:p-2.5 rounded-xl border bg-[#1A1A1D] border-white/5 text-white/70 hover:text-white hover:border-amber-500/30 relative transition-transform active:scale-95"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Profile & Cart shown on desktop; on mobile, accessed via bottom navigation */}
            <button
              id="header-profile-btn"
              onClick={() => {
                setCurrentView('client');
                setClientTab('profile');
              }}
              title="Meu Perfil"
              className={`hidden sm:flex p-2.5 rounded-xl border transition-all ${
                currentView === 'client' && clientTab === 'profile'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-500'
                  : 'bg-[#1A1A1D] border-white/5 text-white/70 hover:text-white hover:border-amber-500/30'
              }`}
            >
              <User className="w-5 h-5" />
            </button>

            <button
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              title="Meu Carrinho"
              className="hidden sm:flex bg-[#1A1A1D] p-2.5 rounded-xl border border-white/5 hover:border-amber-500/30 text-white relative transition-transform active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.15)] items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 text-white" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar on mobile - only show if on client view */}
        {currentView === 'client' && (
          <div className="md:hidden mt-2 relative">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-white/30 absolute left-3.5 pointer-events-none" />
              <input
                id="search-input-mobile"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar hambúrguer, combos..."
                className="w-full bg-[#1A1A1D] border border-white/5 rounded-full pl-9 pr-8 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-xs bg-white/10 hover:bg-white/20 text-white/70 px-1.5 py-0.5 rounded-full"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <NotificationCenterModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onOpenOrder={(id) => {
          setTrackingOrderId(id);
          setIsNotifOpen(false);
        }}
      />
    </header>
  );
};
