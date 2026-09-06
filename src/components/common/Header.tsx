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
      {/* Top View Switcher bar (Allows switching between Cliente, Cozinha KDS, and Painel Admin) */}
      <div className="bg-[#101012] px-3 sm:px-6 py-1.5 border-b border-white/5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            id="view-client-btn"
            onClick={() => setCurrentView('client')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
              currentView === 'client'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Cardápio Cliente</span>
          </button>

          <button
            id="view-kitchen-btn"
            onClick={() => setCurrentView('kitchen')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all relative ${
              currentView === 'kitchen'
                ? 'bg-orange-500 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)]'
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
              currentView === 'admin'
                ? 'bg-white text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Painel Admin</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar alertas' : 'Ativar alertas sonoros'}
            className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-500" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-green-500 font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Sistema Online
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo & Name */}
          <div
            onClick={() => {
              setCurrentView('client');
              setClientTab('home');
            }}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black text-black">B</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  BURGER <span className="text-amber-500">PREMIUM</span>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-widest text-green-500 font-bold">
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
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="header-notif-btn"
              onClick={() => {
                setIsNotifOpen(true);
                setUnreadNotifCount(0);
              }}
              title="Avisos e Novidades"
              className="p-2.5 sm:p-3 rounded-2xl border bg-[#1A1A1D] border-white/5 text-white/70 hover:text-white hover:border-amber-500/30 relative transition-transform active:scale-95"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <button
              id="header-profile-btn"
              onClick={() => {
                setCurrentView('client');
                setClientTab('profile');
              }}
              title="Meu Perfil"
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
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
              className="bg-[#1A1A1D] p-2.5 sm:p-3 rounded-2xl border border-white/5 hover:border-amber-500/30 text-white relative transition-transform active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-center"
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
          <div className="md:hidden mt-3 relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-white/30 absolute left-4 pointer-events-none" />
              <input
                id="search-input-mobile"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquise por hambúrguer, combo ou ingredientes..."
                className="w-full bg-[#1A1A1D] border border-white/5 rounded-full pl-11 pr-10 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-xs bg-white/10 hover:bg-white/20 text-white/70 px-2 py-0.5 rounded-full"
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
