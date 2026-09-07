import React from 'react';
import { Home, UtensilsCrossed, FileText, Heart, User, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';

export const BottomNav: React.FC = () => {
  const { clientTab, setClientTab, currentView, cart, cartTotals, setIsCartOpen, orders } = useStore();

  if (currentView !== 'client') return null;

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Check if any order is currently in active progression
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready' || o.status === 'out_for_delivery'
  ).length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="max-w-lg mx-auto px-3 pb-2 sm:pb-3 pointer-events-auto">
        {/* Floating Cart Bar if cart has items */}
        {cart.length > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="mb-2 w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black px-4 py-2.5 rounded-2xl shadow-[0_8px_25px_rgba(245,158,11,0.35)] flex items-center justify-between transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-neutral-950 text-amber-500 flex items-center justify-center font-black text-xs">
                {totalCartCount}
              </div>
              <span className="text-xs sm:text-sm font-black tracking-tight">Ver Meu Carrinho</span>
            </div>
            <div className="flex items-center gap-1 font-black text-xs sm:text-sm">
              <span>{formatCurrency(cartTotals.total)}</span>
              <span>→</span>
            </div>
          </button>
        )}

        {/* Bottom Navigation Dock (Matching Reference Screenshots 1, 6, 7) */}
        <nav className="bg-[#101013]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex items-center justify-around">
          {/* 1. Início */}
          <button
            id="nav-home-btn"
            onClick={() => setClientTab('home')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              clientTab === 'home'
                ? 'text-amber-500 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">Início</span>
          </button>

          {/* 2. Cardápio */}
          <button
            id="nav-menu-btn"
            onClick={() => setClientTab('menu')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              clientTab === 'menu'
                ? 'text-amber-500 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">Cardápio</span>
          </button>

          {/* 3. Pedidos */}
          <button
            id="nav-orders-btn"
            onClick={() => setClientTab('orders')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
              clientTab === 'orders'
                ? 'text-amber-500 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            {activeOrdersCount > 0 && (
              <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
            <span className="text-[10px] font-bold">Pedidos</span>
          </button>

          {/* 4. Favoritos */}
          <button
            id="nav-favorites-btn"
            onClick={() => setClientTab('favorites')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              clientTab === 'favorites'
                ? 'text-amber-500 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">Favoritos</span>
          </button>

          {/* 5. Perfil */}
          <button
            id="nav-profile-btn"
            onClick={() => setClientTab('profile')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              clientTab === 'profile'
                ? 'text-amber-500 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">Perfil</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

