import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Check,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';
import { AddonOption, SelectedAddon } from '../../types';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    addToCart,
    isFavorite,
    toggleFavorite,
    theme,
  } = useStore();

  const isDark = theme === 'dark';
  const product = selectedProductForModal;

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [observation, setObservation] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setSelectedAddons([]);
    setObservation('');
  }, [product]);

  if (!product) return null;

  const basePrice = product.promoPrice ?? product.price;

  // Default addons matching the reference Screen 2:
  // Bacon (+ R$ 5,00), Queijo (+ R$ 3,00), Hambúrguer adicional (+ R$ 8,00), Molho extra (+ R$ 1,00)
  const availableAddons: AddonOption[] = product.addons && product.addons.length > 0
    ? product.addons
    : [
        { id: 'ad-bacon', name: 'Bacon', price: 5.0, isAvailable: true },
        { id: 'ad-queijo', name: 'Queijo', price: 3.0, isAvailable: true },
        { id: 'ad-carne', name: 'Hambúrguer adicional', price: 8.0, isAvailable: true },
        { id: 'ad-molho', name: 'Molho extra', price: 1.0, isAvailable: true },
      ];

  const handleToggleAddon = (addon: AddonOption) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((item) => item.addon.id === addon.id);
      if (exists) {
        return prev.filter((item) => item.addon.id !== addon.id);
      } else {
        return [...prev, { addon, quantity: 1 }];
      }
    });
  };

  const isAddonSelected = (addonId: string) => {
    return selectedAddons.some((item) => item.addon.id === addonId);
  };

  const addonsTotal = selectedAddons.reduce(
    (acc, curr) => acc + curr.addon.price * curr.quantity,
    0
  );
  const currentItemTotalPrice = (basePrice + addonsTotal) * quantity;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Olha esse ${product.name} na Burger10! 🍔`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedAddons, observation);
    setSelectedProductForModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className={`w-full sm:max-w-md border-t sm:border rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom duration-200 ${
        isDark ? 'bg-[#0e0e11] border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Floating Top Nav (Back, Share, Heart) */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <button
            id="modal-back-btn"
            onClick={() => setSelectedProductForModal(null)}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 pointer-events-auto transition-transform active:scale-95 border border-white/10 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleShare}
              title="Compartilhar"
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-transform active:scale-95 border border-white/10 shadow-lg relative"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && (
                <span className="absolute -bottom-8 right-0 text-[10px] bg-neutral-900 border border-white/10 px-2 py-0.5 rounded text-amber-400 whitespace-nowrap">
                  Link copiado!
                </span>
              )}
            </button>

            <button
              onClick={() => toggleFavorite(product.id)}
              title="Favoritar"
              className={`w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95 border border-white/10 shadow-lg ${
                isFavorite(product.id) ? 'text-red-500' : 'text-white hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 pb-24">
          {/* Big Hero Image */}
          <div className="relative w-full h-64 sm:h-72 bg-neutral-900">
            <img
              src={product.photo}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-black/30 ${
              isDark ? 'from-[#0e0e11]' : 'from-white'
            }`} />
          </div>

          {/* Details Body */}
          <div className="px-5 pt-3 space-y-5">
            {/* Title, Price, Rating */}
            <div>
              <h2 className={`text-2xl font-black tracking-tight flex items-center gap-1.5 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {product.name}
              </h2>

              <div className="mt-1">
                <span className="text-2xl font-black text-amber-500">
                  {formatCurrency(basePrice)}
                </span>
              </div>

              {/* Rating */}
              <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${
                isDark ? 'text-neutral-400' : 'text-gray-500'
              }`}>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.rating || 4.8}</span>
                <span>({product.reviewsCount || '1.230'} avaliações)</span>
              </div>

              {/* Description */}
              <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-neutral-300' : 'text-gray-600'
              }`}>
                {product.description}
              </p>
            </div>

            {/* Ingredientes Pills */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <h3 className={`text-xs font-black uppercase tracking-wider mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Ingredientes
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className={`text-xs px-3 py-1 rounded-full border font-medium ${
                        isDark
                          ? 'bg-[#18181c] text-neutral-300 border-white/10'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionais Checklist */}
            <div className={`border-t pt-4 ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Adicionais
              </h3>

              <div className="space-y-2">
                {availableAddons.map((addon) => {
                  const selected = isAddonSelected(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                        selected
                          ? isDark
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-amber-50 border-amber-500 text-gray-900'
                          : isDark
                          ? 'bg-[#151518] border-white/5 text-neutral-300 hover:border-white/10'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                            selected
                              ? 'bg-amber-500 border-amber-500 text-black'
                              : isDark
                              ? 'border-white/20 bg-black/40'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold">{addon.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-500">
                          + {formatCurrency(addon.price)}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            selected
                              ? 'bg-amber-500 text-black'
                              : isDark
                              ? 'bg-white/5 text-neutral-400'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          +
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Observação do Pedido */}
            <div className={`border-t pt-4 ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Observação do pedido
              </h3>
              <input
                type="text"
                id="order-observation-input"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: Sem cebola, molho separado..."
                className={`w-full rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all border ${
                  isDark
                    ? 'bg-[#151518] border-white/10 text-white placeholder-neutral-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar (Stepper + Adicionar ao carrinho) */}
        <div className={`absolute bottom-0 left-0 right-0 backdrop-blur-xl border-t p-4 flex items-center gap-3 shadow-2xl ${
          isDark ? 'bg-[#0e0e11]/95 border-white/10' : 'bg-white/95 border-gray-200'
        }`}>
          {/* Stepper [- 1 +] */}
          <div className={`flex items-center border rounded-2xl p-1 shrink-0 ${
            isDark ? 'bg-[#18181c] border-white/10' : 'bg-gray-100 border-gray-200'
          }`}>
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className={`w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-20 transition-colors ${
                isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className={`w-8 text-center text-xs font-black ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-amber-500 hover:text-amber-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Adicionar ao carrinho Button */}
          <button
            id="modal-add-to-cart-btn"
            onClick={handleAddToCart}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3.5 px-4 rounded-2xl shadow-[0_4px_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 text-xs transition-transform active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar ao carrinho ({formatCurrency(currentItemTotalPrice)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
