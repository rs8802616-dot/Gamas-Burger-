import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  ChevronRight,
  ChevronLeft,
  Heart,
  RotateCcw,
  Sparkles,
  X,
  Plus,
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
    theme,
  } = useStore();

  const isDark = theme === 'dark';
  const [dismissLastOrderBanner, setDismissLastOrderBanner] = useState(false);

  // 5 Top Offers for the Rotating/Passing Carousel ("Passando as Ofertas")
  const promoOffers = useMemo(
    () => [
      {
        id: 'offer-xbacon',
        productId: 'prod-combo-xbacon-diario',
        fallbackProductId: 'prod-xbacon-especial',
        tag: 'OFERTA DO DIA',
        title: 'X-BACON',
        subtitle: '+ BATATA + REFRI',
        price: 29.9,
        oldPrice: 39.9,
        photo:
          'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
        gradient: 'from-[#730f0f] via-[#941111] to-[#3a0606]',
        tagBg: 'bg-[#ff3b30]',
        glowColor: 'bg-red-500/25',
      },
      {
        id: 'offer-familia',
        productId: 'prod-combo-familia',
        fallbackProductId: 'prod-combo-familia',
        tag: 'SUPER COMBO',
        title: 'COMBO FAMÍLIA',
        subtitle: '2 BURGERS + BATATA G + REFRI',
        price: 69.9,
        oldPrice: 89.9,
        photo:
          'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
        gradient: 'from-[#7c2d12] via-[#9a3412] to-[#431407]',
        tagBg: 'bg-[#ea580c]',
        glowColor: 'bg-orange-500/25',
      },
      {
        id: 'offer-cheddar',
        productId: 'prod-double-cheddar',
        fallbackProductId: 'prod-double-cheddar',
        tag: 'BURGER ARTESANAL',
        title: 'DOUBLE CHEDDAR',
        subtitle: '2 CARNES + CHEDDAR MELT',
        price: 31.9,
        oldPrice: 34.9,
        photo:
          'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
        gradient: 'from-[#701a75] via-[#86198f] to-[#4a044e]',
        tagBg: 'bg-[#c026d3]',
        glowColor: 'bg-fuchsia-500/25',
      },
      {
        id: 'offer-batata',
        productId: 'prod-batata-especial-cheddar-bacon',
        fallbackProductId: 'prod-batata-especial-cheddar-bacon',
        tag: 'DESTAQUE DA SEMANA',
        title: 'BATATA SUPREMA',
        subtitle: 'CHEDDAR QUENTE + BACON',
        price: 19.9,
        oldPrice: 22.9,
        photo:
          'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
        gradient: 'from-[#78350f] via-[#92400e] to-[#422006]',
        tagBg: 'bg-[#d97706]',
        glowColor: 'bg-amber-500/25',
      },
      {
        id: 'offer-xsalada',
        productId: 'prod-xsalada',
        fallbackProductId: 'prod-xsalada',
        tag: 'COMBO DO CHEF',
        title: 'X-SALADA GOURMET',
        subtitle: '+ BATATA FRITA CROCANTE',
        price: 24.9,
        oldPrice: 28.9,
        photo:
          'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80',
        gradient: 'from-[#14532d] via-[#166534] to-[#052e16]',
        tagBg: 'bg-[#16a34a]',
        glowColor: 'bg-emerald-500/25',
      },
    ],
    []
  );

  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isOfferPaused, setIsOfferPaused] = useState(false);

  // Auto rotate offers every 4 seconds ("deve ficar passando as ofertas")
  useEffect(() => {
    if (isOfferPaused || searchQuery) return;
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % promoOffers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOfferPaused, searchQuery, promoOffers.length]);

  const activeOffer = promoOffers[currentOfferIndex];

  // Best sellers for "Mais pedidos" section (specifically X-Bacon, Combo Família, X-Salada)
  const maisPedidos = [
    products.find((p) => p.id === 'prod-xbacon-especial') || products[0],
    products.find((p) => p.id === 'prod-combo-familia') || products[1],
    products.find((p) => p.id === 'prod-xsalada') || products[2],
  ].filter(Boolean) as Product[];

  // Last order for the bottom yellow banner
  const lastOrder = orders[0];

  // Filtered products list
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

  const handleOpenActiveOffer = () => {
    const matched =
      products.find((p) => p.id === activeOffer.productId) ||
      products.find((p) => p.id === activeOffer.fallbackProductId) ||
      products[0];
    if (matched) handleOpenProduct(matched);
  };

  // 7 Categories matching the exact icon grid in Screen 1
  const categoryGrid = [
    { id: 'hamburgueres', name: 'Hambúrgueres', icon: '🍔' },
    { id: 'combos', name: 'Combos', icon: '🍟' },
    { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
    { id: 'porcoes', name: 'Porções', icon: '🍗' },
    { id: 'lanches', name: 'Lanches', icon: '🌭' },
    { id: 'sobremesas', name: 'Sobremesas', icon: '🍰' },
    { id: 'promocoes', name: 'Promoções', icon: '🔥' },
  ];

  return (
    <div className="space-y-4 pb-32">
      {/* 1. Ofertas em Carrossel Rotativo ("Passando as Ofertas") */}
      {!searchQuery && (
        <div
          onMouseEnter={() => setIsOfferPaused(true)}
          onMouseLeave={() => setIsOfferPaused(false)}
          onTouchStart={() => setIsOfferPaused(true)}
          onTouchEnd={() => setIsOfferPaused(false)}
          className="relative group select-none"
        >
          <div
            onClick={handleOpenActiveOffer}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${activeOffer.gradient} p-4 sm:p-5 shadow-2xl cursor-pointer transition-all duration-500 border border-white/10 active:scale-[0.99]`}
          >
            {/* Ambient Lighting */}
            <div
              className={`absolute top-0 right-0 w-64 h-64 ${activeOffer.glowColor} blur-3xl pointer-events-none rounded-full`}
            />

            <div className="relative z-10 flex items-center justify-between gap-3">
              {/* Left Texts */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block ${activeOffer.tagBg} text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md`}
                  >
                    {activeOffer.tag}
                  </span>
                  <span className="text-[10px] text-white/70 font-bold tracking-wider">
                    {currentOfferIndex + 1}/{promoOffers.length}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none uppercase">
                  {activeOffer.title}
                </h2>

                <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wide uppercase">
                  {activeOffer.subtitle}
                </p>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    {formatCurrency(activeOffer.price)}
                  </span>
                  <span className="text-xs sm:text-sm text-white/50 line-through">
                    {formatCurrency(activeOffer.oldPrice)}
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-md transition-all uppercase tracking-wider"
                  >
                    VER MAIS
                  </button>
                </div>
              </div>

              {/* Right Food Image */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                <img
                  src={activeOffer.photo}
                  alt={activeOffer.title}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/10"
                />
              </div>
            </div>

            {/* Left Chevron Control */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentOfferIndex((prev) => (prev - 1 + promoOffers.length) % promoOffers.length);
              }}
              aria-label="Oferta anterior"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white border border-white/10 transition-all opacity-80 hover:opacity-100 active:scale-90 z-20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Right Chevron Control */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentOfferIndex((prev) => (prev + 1) % promoOffers.length);
              }}
              aria-label="Próxima oferta"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white border border-white/10 transition-all opacity-80 hover:opacity-100 active:scale-90 z-20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicator Dots at bottom of card */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {promoOffers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentOfferIndex(idx);
                  }}
                  className={`transition-all rounded-full ${
                    idx === currentOfferIndex
                      ? 'w-5 h-1.5 bg-amber-400'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Ir para oferta ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Categorias Compactas */}
      <div className="pt-1">
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-y-2.5 gap-x-1.5 sm:gap-3 text-center">
          {categoryGrid.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'todos' : cat.id)}
                className="flex flex-col items-center group cursor-pointer transition-transform active:scale-95"
              >
                {/* Round Compact Circle */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl shadow-md transition-all ${
                    isSelected
                      ? `bg-gradient-to-b from-amber-400 to-amber-600 ring-2 ring-amber-500 ring-offset-2 ${
                          isDark ? 'ring-offset-[#0A0A0B]' : 'ring-offset-white'
                        } shadow-amber-500/40 scale-105`
                      : 'bg-gradient-to-b from-[#ff8c2b] to-[#f95700] hover:brightness-110 shadow-orange-500/20'
                  }`}
                >
                  <span className="leading-none">{cat.icon}</span>
                </div>
                {/* Compact Label */}
                <span
                  className={`mt-1 text-[10.5px] sm:text-xs font-bold tracking-tight text-center leading-tight max-w-[76px] ${
                    isSelected
                      ? 'text-amber-500'
                      : isDark
                      ? 'text-neutral-300'
                      : 'text-gray-700'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Seção "Mais pedidos" */}
      {!searchQuery && selectedCategory === 'todos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Mais pedidos
            </h3>
            <button
              onClick={() => setSelectedCategory('mais_vendidos')}
              className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-0.5"
            >
              <span>Ver todos</span>
              <span>&gt;</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {maisPedidos.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className={`border rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer group transition-all shadow-md ${
                  isDark
                    ? 'bg-[#151518] border-white/5 hover:border-amber-500/30'
                    : 'bg-white border-gray-200 hover:border-amber-500 shadow-sm'
                }`}
              >
                <div className={`relative w-full aspect-square rounded-xl overflow-hidden mb-2 border ${
                  isDark ? 'bg-[#202024] border-white/5' : 'bg-gray-100 border-gray-200'
                }`}>
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div>
                  <h4 className={`text-xs sm:text-sm font-bold truncate group-hover:text-amber-500 transition-colors ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {product.name.replace(' Especial', '').replace(' Burger10', '').replace(" Gama's", '').replace(' Gourmet', '')}
                  </h4>
                  <span className="text-xs sm:text-sm font-black text-amber-500 mt-0.5 block">
                    {formatCurrency(product.promoPrice ?? product.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Banner Amarelo "Seu último pedido" */}
      {lastOrder && !dismissLastOrderBanner && (
        <div className="bg-[#f59e0b] text-neutral-950 rounded-2xl p-3.5 sm:p-4 shadow-xl flex items-center justify-between gap-3 relative animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setDismissLastOrderBanner(true)}
            className="absolute top-2 right-2 text-neutral-800 hover:text-black p-1 rounded-full text-xs font-bold"
            title="Fechar"
          >
            ✕
          </button>

          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-xl bg-black/15 flex items-center justify-center text-xl shrink-0">
              🍔
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                Seu último pedido
              </span>
              <h5 className="text-xs sm:text-sm font-black truncate leading-tight">
                {lastOrder.items[0]?.product?.name || 'Combo X-Bacon'}
              </h5>
              <span className="text-xs font-bold">
                {formatCurrency(lastOrder.total)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => reorder(lastOrder)}
            className="bg-black text-white hover:bg-neutral-800 text-xs font-bold px-3 py-2 rounded-full whitespace-nowrap shrink-0 shadow transition-transform active:scale-95"
          >
            Pedir novamente &gt;
          </button>
        </div>
      )}

      {/* 5. Lista Geral de Produtos do Cardápio - Expansiva para PC (1 -> 2 -> 3 -> 4 colunas) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {searchQuery
              ? `Resultados para "${searchQuery}"`
              : selectedCategory === 'todos'
              ? 'Todos os Lanches'
              : categories.find((c) => c.id === selectedCategory)?.name || 'Cardápio'}
          </h3>
          <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>
            {filteredProducts.length} itens
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className={`text-center py-10 rounded-2xl border p-6 ${
            isDark ? 'bg-[#151518] border-white/5 text-neutral-400' : 'bg-white border-gray-200 text-gray-600 shadow-sm'
          }`}>
            <p className="text-sm mb-2">Nenhum produto encontrado</p>
            <button
              onClick={() => setSelectedCategory('todos')}
              className="text-xs text-amber-500 font-bold hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className={`border p-3.5 rounded-2xl flex gap-3 cursor-pointer group transition-all shadow-sm ${
                  isDark
                    ? 'bg-[#151518] border-white/5 hover:border-amber-500/30'
                    : 'bg-white border-gray-200 hover:border-amber-500 hover:shadow-md'
                }`}
              >
                <div className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border ${
                  isDark ? 'bg-[#202024] border-white/5' : 'bg-gray-100 border-gray-200'
                }`}>
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className={`text-sm font-bold truncate group-hover:text-amber-500 transition-colors ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className="text-neutral-400 hover:text-red-500 p-0.5"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                    <p className={`text-[11px] line-clamp-2 mt-0.5 ${
                      isDark ? 'text-neutral-400' : 'text-gray-500'
                    }`}>
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-black text-amber-500">
                      {formatCurrency(product.promoPrice ?? product.price)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProduct(product);
                      }}
                      className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center font-black text-xs transition-transform active:scale-95 shadow-sm"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Bottom Polish Feature Strip */}
      <div className={`border rounded-2xl p-4 text-xs space-y-2 ${
        isDark ? 'bg-[#121215] border-white/5 text-neutral-400' : 'bg-white border-gray-200 text-gray-600 shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          <span>⭐</span>
          <span>Cardápio completo com fotos e descrições</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🔍</span>
          <span>Pesquisa rápida por nome, ingrediente ou categoria</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🛒</span>
          <span>Carrinho fácil e intuitivo com adicionais e cupons</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🕒</span>
          <span>Acompanhamento ao vivo e histórico de pedidos</span>
        </div>
      </div>
    </div>
  );
};
