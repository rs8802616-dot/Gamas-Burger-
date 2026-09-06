import React from 'react';
import { Home, UtensilsCrossed, Clock3, Heart, User, ShoppingBag } from 'lucide-react';
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
      <div className="max-w-lg mx-auto px-4 pb-3 pointer-events-auto">
        {/* Floating Cart Bar if cart has items and not on cart tab */}
        {cart.length > 0 && clientTab !== 'cart' && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="mb-2 w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black px-4 py-3 rounded-2xl shadow-[0_8px_25px_rgba(245,158,11,0.35)] flex items-center justify-between transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-neutral-950 text-amber-500 flex items-center justify-center font-black text-xs">
                {totalCartCount}
              </div>
              <span className="text-sm font-black tracking-tight">Ver Meu Carrinho</span>
            </div>
            <div className="flex items-center gap-1 font-black text-sm">
              <span>{formatCurrency(cartTotals.total)}</span>
              <span>→</span>
            </div>
          </button>
        )}

        {/* Bottom Navigation Dock with Immersive UI Styling */}
        <nav className="bg-[#121214]/95 backdrop-blur-xl border border-white/5 rounded-3xl px-2 py-2 shadow-[0_15px_35px_rgba(0,0,0,0.8)] flex items-center justify-around">
          <button
            id="nav-home-btn"
            onClick={() => setClientTab('home')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              clientTab === 'home'
                ? 'text-amber-500 font-bold'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Início</span>
          </button>

          <button
            id="nav-menu-btn"
            onClick={() => setClientTab('menu')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              clientTab === 'menu'
                ? 'text-amber-500 font-bold'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Cardápio</span>
          </button>

          {/* Elevated Center Cart Button */}
          <div className="-mt-8">
            <button
              id="nav-cart-btn"
              onClick={() => setIsCartOpen(true)}
              title="Carrinho"
              className="w-14 h-14 bg-amber-500 rounded-full border-[5px] border-[#0A0A0B] flex items-center justify-center text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] transform active:scale-95 transition-transform relative"
            >
              <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-amber-500 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-amber-500">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

          <button
            id="nav-orders-btn"
            onClick={() => setClientTab('orders')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all relative ${
              clientTab === 'orders'
                ? 'text-amber-500 font-bold'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Clock3 className="w-5 h-5 mb-0.5" />
            {activeOrdersCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider">Pedidos</span>
          </button>

          <button
            id="nav-profile-btn"
            onClick={() => setClientTab('profile')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              clientTab === 'profile'
                ? 'text-amber-500 font-bold'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Perfil</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
