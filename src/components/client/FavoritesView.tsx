import React from 'react';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';

export const FavoritesView: React.FC = () => {
  const { products, favorites, toggleFavorite, setSelectedProductForModal, setClientTab, theme } = useStore();
  const isDark = theme === 'dark';

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="space-y-6 pb-28">
      <div>
        <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Meus Favoritos</h2>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          Seus hambúrgueres e acompanhamentos preferidos salvos em um só lugar
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className={`rounded-3xl p-10 text-center shadow-lg border ${
          isDark ? 'bg-[#151518] border-white/5' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner ${
            isDark ? 'bg-[#0A0A0B] border border-white/5' : 'bg-gray-100 border border-gray-200'
          }`}>
            ❤️
          </div>
          <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Nenhum favorito ainda</h3>
          <p className={`text-xs mb-5 max-w-xs mx-auto leading-relaxed ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            Clique no coração nos itens do cardápio para salvar suas escolhas preferidas!
          </p>
          <button
            onClick={() => setClientTab('home')}
            className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md active:scale-95 transition-transform"
          >
            Explorar Cardápio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {favoriteProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProductForModal(product)}
              className={`rounded-3xl p-3.5 flex flex-col justify-between cursor-pointer group transition-all shadow-md relative border ${
                isDark
                  ? 'bg-[#151518] border-white/5 hover:border-amber-500/40'
                  : 'bg-white border-gray-200 hover:border-amber-500 hover:shadow-lg'
              }`}
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
                <div className={`relative w-full h-36 rounded-2xl overflow-hidden mb-3 border ${
                  isDark ? 'bg-[#202024] border-white/5' : 'bg-gray-100 border-gray-200'
                }`}>
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

                <h4 className={`text-sm font-black truncate group-hover:text-amber-500 transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {product.name}
                </h4>

                <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                  isDark ? 'text-white/50' : 'text-gray-500'
                }`}>
                  {product.description}
                </p>
              </div>

              <div className={`flex items-center justify-between mt-3.5 pt-2.5 border-t ${
                isDark ? 'border-white/5' : 'border-gray-100'
              }`}>
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
