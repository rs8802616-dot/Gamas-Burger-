import React from 'react';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';

export const FavoritesView: React.FC = () => {
  const { products, favorites, toggleFavorite, setSelectedProductForModal, setClientTab } = useStore();

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="space-y-6 pb-28">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Meus Favoritos</h2>
        <p className="text-xs text-white/40 mt-0.5">
          Seus hambúrgueres e acompanhamentos preferidos salvos em um só lugar
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-[#151518] border border-white/5 rounded-3xl p-10 text-center shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-[#0A0A0B] border border-white/5 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
            ❤️
          </div>
          <h3 className="text-base font-bold text-white mb-1">Nenhum favorito ainda</h3>
          <p className="text-xs text-white/40 mb-5 max-w-xs mx-auto leading-relaxed">
            Clique no coração nos itens do cardápio para salvar suas escolhas preferidas!
          </p>
          <button
            onClick={() => setClientTab('home')}
            className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md"
          >
            Explorar Cardápio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {favoriteProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProductForModal(product)}
              className="bg-[#151518] border border-white/5 hover:border-amber-500/40 rounded-3xl p-3.5 flex flex-col justify-between cursor-pointer group transition-all shadow-lg relative"
            >
              {/* Heart toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-red-500 transition-transform active:scale-90 shadow-md"
              >
                <Heart className="w-4 h-4 fill-red-500" />
              </button>

              <div>
                <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-[#202024] mb-3 border border-white/5">
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isDailyOffer && (
                    <span className="absolute bottom-2 left-2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                      Oferta
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-black text-white truncate group-hover:text-amber-400 transition-colors">
                  {product.name}
                </h4>

                <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-white/5">
                <span className="text-sm font-black text-amber-500">
                  {formatCurrency(product.promoPrice ?? product.price)}
                </span>
                <div className="w-7 h-7 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-black flex items-center justify-center font-black text-xs transition-colors shadow-sm">
                  +
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
