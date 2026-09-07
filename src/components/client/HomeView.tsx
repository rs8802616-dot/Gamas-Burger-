import React from 'react';
import {
  Flame,
  Star,
  Plus,
  Heart,
  RotateCcw,
  Sparkles,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';
import { Product } from '../../types';

export const HomeView: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSelectedProductForModal,
    orders,
    reorder,
    isFavorite,
    toggleFavorite,
    setClientTab,
    setCurrentView,
  } = useStore();

  // Find daily offer product
  const dailyOffer =
    products.find((p) => p.isDailyOffer) ||
    products.find((p) => p.id === 'prod-combo-xbacon-diario') ||
    products[0];

  // Best sellers
  const bestSellers = products.filter((p) => p.isBestSeller);

  // Latest completed order for quick reorder
  const lastOrder = orders[0];

  // Filter products based on search or category
  const filteredProducts = products.filter((product) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchIng = product.ingredients?.some((ing) => ing.toLowerCase().includes(q));
      return matchName || matchDesc || matchIng;
    }

    if (selectedCategory && selectedCategory !== 'todos') {
      if (selectedCategory === 'promocoes') {
        return product.isDailyOffer || (product.promoPrice && product.promoPrice < product.price);
      }
      if (selectedCategory === 'mais_vendidos') {
        return product.isBestSeller;
      }
      return product.categoryId === selectedCategory;
    }

    return true;
  });

  const handleOpenProduct = (product: Product) => {
    setSelectedProductForModal(product);
  };

  return (
    <div className="space-y-5 pb-28">
      {/* 1. Oferta do Dia Hero Banner (Only if not searching) */}
      {!searchQuery && dailyOffer && (
        <div
          onClick={() => handleOpenProduct(dailyOffer)}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1c1408] via-[#151518] to-[#101012] border border-amber-500/20 p-3.5 sm:p-6 shadow-xl cursor-pointer group transition-all duration-300 hover:border-amber-500/40"
        >
          {/* Background Ambient Glow & Gradient */}
          <div className="w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-amber-500/10 blur-3xl absolute -right-10 -bottom-10 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-6">
            <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-amber-500 text-black px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-md inline-flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-black shrink-0" />
                  Destaque do Dia
                </span>
                {dailyOffer.discountPercentage && (
                  <span className="bg-white/10 text-amber-400 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                    {dailyOffer.discountPercentage}% OFF
                  </span>
                )}
              </div>

              <h2 className="text-sm sm:text-2xl font-black text-white tracking-tight leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                {dailyOffer.name}
              </h2>

              <p className="text-[11px] sm:text-xs text-white/50 line-clamp-1 sm:line-clamp-2 hidden xs:block">
                {dailyOffer.description}
              </p>

              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-base sm:text-2xl font-black text-amber-500">
                  {formatCurrency(dailyOffer.promoPrice ?? dailyOffer.price)}
                </span>
                {dailyOffer.promoPrice && (
                  <span className="text-[10px] sm:text-xs text-white/40 line-through">
                    {formatCurrency(dailyOffer.price)}
                  </span>
                )}
              </div>

              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 bg-white hover:bg-amber-500 text-black font-black text-[10px] sm:text-xs px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl shadow transition-colors active:scale-95">
                  <span>PEGAR OFERTA</span>
                  <ChevronRight className="w-3 h-3 stroke-[3]" />
                </span>
              </div>
            </div>

            {/* Banner Food Image */}
            <div className="w-24 h-24 sm:w-44 sm:h-36 rounded-2xl overflow-hidden shadow-xl relative shrink-0 border border-white/10 bg-[#202024] group-hover:scale-105 transition-transform duration-300">
              <img
                src={dailyOffer.photo}
                alt={dailyOffer.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Categorias Horizontais com Ícones / Emojis */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
            Categorias
          </h3>
          {selectedCategory !== 'todos' && (
            <button
              onClick={() => setSelectedCategory('todos')}
              className="text-xs text-amber-500 hover:underline font-bold uppercase tracking-wider"
            >
              Ver todas
            </button>
          )}
        </div>

        <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5 px-0.5">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all select-none shrink-0 flex items-center gap-1.5 ${
              selectedCategory === 'todos'
                ? 'bg-amber-500 text-black shadow-[0_4px_15px_rgba(245,158,11,0.25)]'
                : 'bg-[#1A1A1D] text-white/60 border border-white/5 hover:border-amber-500/30 hover:text-white'
            }`}
          >
            <span>🔥</span>
            <span>Todos</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all select-none shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-[0_4px_15px_rgba(245,158,11,0.25)]'
                    : 'bg-[#1A1A1D] text-white/60 border border-white/5 hover:border-amber-500/30 hover:text-white'
                }`}
              >
                <span className="text-sm sm:text-base">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Seção "Mais Pedidos" (Horizontal Carousel) - Only show if not searching and category is 'todos' */}
      {!searchQuery && selectedCategory === 'todos' && bestSellers.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">🍔 Mais Pedidos</h3>
            </div>
            <button
              onClick={() => setSelectedCategory('mais_vendidos')}
              className="text-amber-500 text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-0.5"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 px-0.5">
            {bestSellers.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="w-38 sm:w-52 bg-[#151518] border border-white/5 hover:bg-[#1C1C20] hover:border-amber-500/30 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col justify-between shrink-0 cursor-pointer group transition-all shadow-lg relative"
              >
                {/* Heart Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className={`absolute top-4 right-4 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 ${
                    isFavorite(product.id) ? 'text-red-500' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFavorite(product.id) ? 'fill-red-500' : ''}`} />
                </button>

                <div>
                  <div className="relative w-full h-24 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden bg-[#202024] mb-2.5">
                    <img
                      src={product.photo}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.isDailyOffer && (
                      <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                        Destaque
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-white leading-tight mb-1 truncate group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-white/40 line-clamp-1 sm:line-clamp-2 mb-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-amber-500 font-black text-sm sm:text-base">
                    {formatCurrency(product.promoPrice ?? product.price)}
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 group-hover:bg-amber-400 rounded-lg sm:rounded-xl flex items-center justify-center text-black font-bold transition-colors text-xs sm:text-sm">
                    +
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. "⚡ Pedido Rápido / Repetir Pedido" Quick Bar */}
      {lastOrder && (
        <div className="bg-[#1A1A1D] border border-white/5 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Flame className="w-5 h-5 fill-amber-500/20 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                Pedido Rápido • #{lastOrder.orderNumber}
              </p>
              <p className="text-xs sm:text-sm font-medium text-white truncate">
                Repetir: {lastOrder.items.map((it) => `${it.quantity}x ${it.product.name}`).join(' + ')}
              </p>
              <span className="text-xs font-bold text-amber-500">
                {formatCurrency(lastOrder.total)}
              </span>
            </div>
          </div>

          <button
            onClick={() => reorder(lastOrder)}
            className="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black font-black text-[11px] sm:text-xs px-3 sm:px-5 py-2 rounded-xl transition-all shrink-0"
          >
            REPETIR
          </button>
        </div>
      )}

      {/* 5. Lista de Produtos (Cards com foto grande e detalhes) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
            <span>
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : selectedCategory === 'todos'
                ? 'Cardápio Completo'
                : categories.find((c) => c.id === selectedCategory)?.name || 'Produtos'}
            </span>
            <span className="text-xs font-normal text-white/40">
              ({filteredProducts.length})
            </span>
          </h3>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-[#151518] border border-white/5 rounded-3xl p-8">
            <div className="text-4xl mb-3">🔍</div>
            <h4 className="text-base font-bold text-white mb-1">Nenhum produto encontrado</h4>
            <p className="text-xs text-white/40 max-w-xs mx-auto mb-4">
              Tente pesquisar por outro termo ou escolha uma das categorias acima.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todos');
              }}
              className="bg-amber-500 text-black font-black px-6 py-2.5 rounded-xl text-xs"
            >
              Ver todo o cardápio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="bg-[#151518] p-3 sm:p-4 rounded-2xl border border-white/5 hover:bg-[#1C1C20] hover:border-white/10 transition-all cursor-pointer group flex gap-3 sm:gap-4 shadow-lg relative"
              >
                {/* Product Thumbnail */}
                <div className="relative w-20 sm:w-24 h-20 sm:h-24 bg-[#202024] rounded-xl sm:rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isDailyOffer && (
                    <span className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                      Promo
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="font-bold text-sm sm:text-base text-white leading-tight mb-1 group-hover:text-amber-400 transition-colors truncate">
                        {product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className={`p-1 rounded-full transition-colors shrink-0 ${
                          isFavorite(product.id)
                            ? 'text-red-500'
                            : 'text-white/20 hover:text-white'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isFavorite(product.id) ? 'fill-red-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[11px] sm:text-xs text-white/40 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-amber-500 font-black text-sm sm:text-base">
                        {formatCurrency(product.promoPrice ?? product.price)}
                      </span>
                      {product.promoPrice && product.price > product.promoPrice && (
                        <span className="text-[10px] sm:text-[11px] text-white/30 line-through">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProduct(product);
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 hover:bg-amber-400 rounded-lg sm:rounded-xl flex items-center justify-center text-black font-bold transition-colors shrink-0 text-xs sm:text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client footer */}
      <div className="pt-8 pb-4 text-center text-xs text-white/30 border-t border-white/5">
        <p className="font-medium text-[11px]">Burger10 Hamburgueria Artesanal • Feito na chapa com ingredientes selecionados</p>
      </div>
    </div>
  );
};
