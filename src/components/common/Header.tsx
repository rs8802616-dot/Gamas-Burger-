import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  ChefHat,
  LayoutDashboard,
  Store,
  Volume2,
  VolumeX,
  Bell,
  LogOut,
  X,
  Phone,
  MapPin,
  Clock,
  Heart,
  FileText,
  Sparkles,
  Sun,
  Moon,
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
    theme,
    toggleTheme,
  } = useStore();

  const isDark = theme === 'dark';
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      const all = NotificationService.getNotifications();
      setUnreadNotifCount(all.filter((n) => !n.read).length);
    };
    updateCount();
    const unsub = NotificationService.subscribe(() => {
      updateCount();
    });
    const unsubChanges = NotificationService.subscribeChanges(() => {
      updateCount();
    });
    return () => {
      unsub();
      unsubChanges();
    };
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Active orders in kitchen
  const kitchenPendingCount = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing'
  ).length;

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md transition-colors duration-200 border-b ${
        isDark
          ? 'bg-[#0c0c0e]/95 border-white/5 text-white'
          : 'bg-white/95 border-gray-200 text-gray-900 shadow-sm'
      }`}
    >
      {/* Staff / Admin Management Bar - ONLY visible when in kitchen or admin view */}
      {currentView !== 'client' && (
        <div
          className={`px-3 sm:px-6 py-2 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
            isDark ? 'bg-[#101012] border-white/5' : 'bg-gray-100 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="view-client-btn"
              onClick={() => setCurrentView('client')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 transition-all text-xs"
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
                  : isDark
                  ? 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
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
                  ? isDark
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'bg-neutral-900 text-white shadow-sm'
                  : isDark
                  ? 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </button>

            {isAdminAuthenticated && (
              <button
                id="view-logout-btn"
                onClick={adminLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold border border-red-500/20 transition-all text-xs"
                title="Encerrar sessão de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair (Logout)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
              rs8802616@gmail.com
            </span>
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Silenciar alertas' : 'Ativar alertas sonoros'}
              className={`p-1 rounded-lg transition-colors ${
                isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-500" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistema Online
            </span>
          </div>
        </div>
      )}

      {/* Main Header (Expansive for PC & Tablet) */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Menu & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              id="header-menu-btn"
              onClick={() => setIsDrawerOpen(true)}
              className={`p-1.5 rounded-xl transition-colors active:scale-95 ${
                isDark
                  ? 'text-neutral-200 hover:text-white hover:bg-white/5'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Menu"
            >
              <Menu className="w-6 h-6 stroke-[2.2]" />
            </button>

            {/* Logo */}
            <div
              onClick={() => {
                setCurrentView('client');
                setClientTab('home');
              }}
              className="flex flex-col items-start cursor-pointer select-none group"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xl">🍔</span>
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  BURGER<span className="text-amber-500">10</span>
                </h1>
              </div>
              <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.25em] -mt-0.5 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                HAMBURGUERIA
              </span>
            </div>

            {/* Desktop Navigation Links for PC Hamburgueria usage */}
            {currentView === 'client' && (
              <nav className="hidden md:flex items-center gap-1.5 ml-4">
                <button
                  onClick={() => {
                    setCurrentView('client');
                    setClientTab('home');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                    clientTab === 'home'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : isDark
                      ? 'text-neutral-300 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Início
                </button>
                <button
                  onClick={() => {
                    setCurrentView('client');
                    setClientTab('menu');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                    clientTab === 'menu'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : isDark
                      ? 'text-neutral-300 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Cardápio
                </button>
                <button
                  onClick={() => {
                    setCurrentView('client');
                    setClientTab('orders');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                    clientTab === 'orders'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : isDark
                      ? 'text-neutral-300 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Meus Pedidos
                </button>
                <button
                  onClick={() => {
                    setCurrentView('client');
                    setClientTab('favorites');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                    clientTab === 'favorites'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : isDark
                      ? 'text-neutral-300 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Favoritos
                </button>
              </nav>
            )}
          </div>

          {/* Right: Theme Toggle (Claro/Escuro), Notifications Bell, Profile Icon & Cart Icon */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle Button */}
            <button
              id="header-theme-btn"
              onClick={toggleTheme}
              title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              className={`p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center ${
                isDark
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-white/10'
                  : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              {isDark ? (
                <Sun className="w-5 h-5 stroke-[2.3]" />
              ) : (
                <Moon className="w-5 h-5 stroke-[2.3]" />
              )}
            </button>

            {/* Notifications Bell */}
            <button
              id="header-notif-btn"
              onClick={() => setIsNotifOpen(true)}
              title="Notificações e Novidades"
              className={`p-1.5 rounded-xl transition-colors active:scale-95 relative ${
                isDark
                  ? 'text-neutral-200 hover:text-white hover:bg-white/5'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
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
              className={`p-1.5 rounded-xl transition-colors active:scale-95 ${
                isDark
                  ? 'text-neutral-200 hover:text-white hover:bg-white/5'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <User className="w-5 h-5 stroke-[2]" />
            </button>

            <button
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              title="Meu Carrinho"
              className={`p-1.5 rounded-xl transition-colors active:scale-95 relative ${
                isDark
                  ? 'text-neutral-200 hover:text-white hover:bg-white/5'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="w-5 h-5 stroke-[2]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {currentView === 'client' && (
          <div className="mt-3 relative">
            <div className="relative flex items-center">
              <Search className={`w-4 h-4 absolute left-3.5 pointer-events-none ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
              <input
                id="search-input-client"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquise por hambúrguer, combo, bebida..."
                className={`w-full rounded-xl pl-10 pr-9 py-2.5 text-xs transition-all shadow-inner focus:outline-none focus:ring-1 focus:ring-amber-500/50 ${
                  isDark
                    ? 'bg-[#16161a] border border-white/10 text-white placeholder-neutral-500 focus:border-amber-500/60'
                    : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-amber-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 text-xs px-1.5 py-0.5 rounded-full ${
                    isDark ? 'bg-white/10 hover:bg-white/20 text-neutral-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hamburger Side Drawer rendered at document.body level via createPortal */}
      {isDrawerOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Sidebar */}
            <aside
              className={`relative z-[100000] w-72 sm:w-80 h-full p-5 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-200 transition-colors ${
                isDark
                  ? 'bg-[#111114] border-r border-white/10 text-white'
                  : 'bg-white border-r border-gray-200 text-gray-900'
              }`}
            >
              <div className="space-y-6">
                <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍔</span>
                    <div>
                      <h3 className={`font-black text-base leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        BURGER10
                      </h3>
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                        Hamburgueria Artesanal
                      </p>
                    </div>
                  </div>
                  <button
                    id="drawer-close-btn"
                    onClick={() => setIsDrawerOpen(false)}
                    className={`p-1.5 rounded-xl transition-colors ${
                      isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Theme Selector inside Drawer */}
                <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-[#18181c] border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
                    <span className="text-xs font-bold">
                      {isDark ? 'Modo Escuro' : 'Modo Claro'}
                    </span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors"
                  >
                    Alternar
                  </button>
                </div>

                <div className="space-y-1.5 text-sm font-semibold">
                  <button
                    onClick={() => {
                      setCurrentView('client');
                      setClientTab('home');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                      clientTab === 'home'
                        ? 'bg-amber-500/15 text-amber-500 font-bold'
                        : isDark
                        ? 'hover:bg-white/10 text-white'
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Cardápio & Ofertas</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('client');
                      setClientTab('orders');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                      clientTab === 'orders'
                        ? 'bg-amber-500/15 text-amber-500 font-bold'
                        : isDark
                        ? 'hover:bg-white/10 text-white'
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Meus Pedidos</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('client');
                      setClientTab('favorites');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                      clientTab === 'favorites'
                        ? 'bg-amber-500/15 text-amber-500 font-bold'
                        : isDark
                        ? 'hover:bg-white/10 text-white'
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-amber-500" />
                    <span>Meus Favoritos</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('client');
                      setClientTab('profile');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                      clientTab === 'profile'
                        ? 'bg-amber-500/15 text-amber-500 font-bold'
                        : isDark
                        ? 'hover:bg-white/10 text-white'
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <User className="w-4 h-4 text-amber-500" />
                    <span>Meu Perfil</span>
                  </button>
                </div>

                {/* Operations shortcut */}
                <div className={`pt-3 border-t space-y-1 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <p className={`px-3 text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                    Atalhos da Loja
                  </p>
                  <button
                    onClick={() => {
                      setCurrentView('kitchen');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 rounded-xl flex items-center gap-3 text-xs font-medium transition-colors ${
                      isDark ? 'text-neutral-300 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <ChefHat className="w-4 h-4 text-orange-400" />
                    <span>Cozinha (KDS)</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('admin');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 rounded-xl flex items-center gap-3 text-xs font-medium transition-colors ${
                      isDark ? 'text-neutral-300 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                    <span>Painel Administrativo</span>
                  </button>
                </div>

                <div className={`pt-4 border-t space-y-2.5 text-xs ${isDark ? 'border-white/10 text-neutral-400' : 'border-gray-200 text-gray-600'}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{storeSettings.operatingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{storeSettings.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{storeSettings.phone}</span>
                  </div>
                </div>
              </div>

              <div className={`pt-4 border-t text-center ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <p className={`text-[11px] font-medium ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Burger10 Hamburgueria © 2026</p>
                <p className="text-[10px] text-amber-500 mt-0.5 font-semibold">Feito com muito sabor 🔥</p>
              </div>
            </aside>
          </div>,
          document.body
        )}

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
