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
    <div className="space-y-6 pb-28">
      {/* 1. Oferta do Dia Hero Banner (Only if not searching) */}
      {!searchQuery && dailyOffer && (
        <div
          onClick={() => handleOpenProduct(dailyOffer)}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#151518] border border-white/5 p-6 sm:p-8 shadow-2xl cursor-pointer group transition-all duration-300 hover:border-amber-500/40"
        >
          {/* Background Ambient Glow & Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
          <div className="w-80 h-80 rounded-full bg-amber-500/10 blur-3xl absolute -right-10 -bottom-10 pointer-events-none" />
          <div className="w-64 h-64 rounded-full bg-amber-500/5 blur-3xl absolute -left-10 -top-10 pointer-events-none" />

          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="bg-amber-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md inline-flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-black animate-bounce" />
                  Destaque do Dia
                </span>
                {dailyOffer.discountPercentage && (
                  <span className="bg-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">
                    {dailyOffer.discountPercentage}% OFF
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none group-hover:text-amber-400 transition-colors">
                {dailyOffer.name}
              </h2>

              <p className="text-sm text-white/60 line-clamp-2 max-w-md">
                {dailyOffer.description}
              </p>

              <div className="flex items-baseline justify-center sm:justify-start gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-amber-500">
                  {formatCurrency(dailyOffer.promoPrice ?? dailyOffer.price)}
                </span>
                {dailyOffer.promoPrice && (
                  <span className="text-sm text-white/40 line-through">
                    {formatCurrency(dailyOffer.price)}
                  </span>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="bg-white hover:bg-amber-500 text-black font-black text-xs sm:text-sm px-7 py-3 rounded-2xl shadow-xl transition-colors active:scale-95 flex items-center gap-2 mx-auto sm:mx-0"
                >
                  <span>PEGAR OFERTA</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Banner Food Image */}
            <div className="w-48 sm:w-64 h-40 sm:h-52 rounded-3xl overflow-hidden shadow-2xl relative shrink-0 border border-white/10 bg-[#202024] group-hover:scale-105 transition-transform duration-300">
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
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">
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

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 px-1">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all select-none shrink-0 flex items-center gap-2 ${
              selectedCategory === 'todos'
                ? 'bg-amber-500 text-black shadow-[0_8px_20px_rgba(245,158,11,0.2)]'
                : 'bg-[#1A1A1D] text-white/60 border border-white/5 hover:border-amber-500/30 hover:text-white'
            }`}
          >
            <span>🔥</span>
            <span>Ofertas & Todos</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all select-none shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-[0_8px_20px_rgba(245,158,11,0.2)]'
                    : 'bg-[#1A1A1D] text-white/60 border border-white/5 hover:border-amber-500/30 hover:text-white'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Seção "Mais Pedidos" (Horizontal Carousel) - Only show if not searching and category is 'todos' */}
      {!searchQuery && selectedCategory === 'todos' && bestSellers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold tracking-tight text-white">🍔 Mais Pedidos</h3>
            </div>
            <button
              onClick={() => setSelectedCategory('mais_vendidos')}
              className="text-amber-500 text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-0.5"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 px-1">
            {bestSellers.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="w-48 sm:w-56 bg-[#151518] border border-white/5 hover:bg-[#1C1C20] hover:border-amber-500/30 rounded-3xl p-4 flex flex-col justify-between shrink-0 cursor-pointer group transition-all shadow-lg relative"
              >
                {/* Heart Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className={`absolute top-6 right-6 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 ${
                    isFavorite(product.id) ? 'text-red-500' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite(product.id) ? 'fill-red-500' : ''}`} />
                </button>

                <div>
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-[#202024] mb-3">
                    <img
                      src={product.photo}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.isDailyOffer && (
                      <span className="absolute bottom-2 left-2 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                        Destaque
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-white leading-tight mb-1 truncate group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-white/40 line-clamp-2 mb-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-amber-500 font-black text-base">
                    {formatCurrency(product.promoPrice ?? product.price)}
                  </span>
                  <div className="w-8 h-8 bg-amber-500 group-hover:bg-amber-400 rounded-xl flex items-center justify-center text-black font-bold transition-colors">
                    +
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. "⚡ Pedido Rápido / Repetir Pedido" Quick Bar (Matches screenshot & Immersive design) */}
      {lastOrder && (
        <div className="bg-[#1A1A1D] border border-white/5 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Flame className="w-6 h-6 fill-amber-500/20 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">
                Pedido Rápido • #{lastOrder.orderNumber}
              </p>
              <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-md">
                Repetir: {lastOrder.items.map((it) => `${it.quantity}x ${it.product.name}`).join(' + ')}
              </p>
              <span className="text-xs font-bold text-amber-500">
                {formatCurrency(lastOrder.total)}
              </span>
            </div>
          </div>

          <button
            onClick={() => reorder(lastOrder)}
            className="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black font-black text-xs px-5 sm:px-6 py-2.5 rounded-xl transition-all shrink-0"
          >
            REPETIR AGORA
          </button>
        </div>
      )}

      {/* 5. Lista de Produtos (Cards com foto grande e detalhes) */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : selectedCategory === 'todos'
                ? 'Todos os Hambúrgueres & Combos'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="bg-[#151518] p-4 sm:p-5 rounded-3xl border border-white/5 hover:bg-[#1C1C20] hover:border-white/10 transition-all cursor-pointer group flex gap-4 sm:gap-5 shadow-lg relative"
              >
                {/* Product Thumbnail */}
                <div className="relative w-24 sm:w-28 h-24 sm:h-28 bg-[#202024] rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isDailyOffer && (
                    <span className="absolute top-1.5 left-1.5 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase">
                      Promo
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-base text-white leading-tight mb-1 group-hover:text-amber-400 transition-colors truncate">
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
                            : 'text-white/30 hover:text-white'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-red-500' : ''}`}
                        />
                      </button>
                    </div>

                    <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-amber-500 font-black text-base">
                        {formatCurrency(product.promoPrice ?? product.price)}
                      </span>
                      {product.promoPrice && product.price > product.promoPrice && (
                        <span className="text-[11px] text-white/30 line-through">
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
                      className="w-8 h-8 bg-amber-500 hover:bg-amber-400 rounded-xl flex items-center justify-center text-black font-bold transition-colors shrink-0"
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
    </div>
  );
};
