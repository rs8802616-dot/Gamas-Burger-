import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Plus,
  Minus,
  Check,
  Flame,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';
import { AddonOption, SelectedAddon } from '../../types';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    addons,
    addToCart,
    isFavorite,
    toggleFavorite,
  } = useStore();

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

  // Toggle or increment addon
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-lg bg-[#0A0A0B] border-t sm:border border-white/5 rounded-t-[2.5rem] sm:rounded-[2.5rem] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom duration-200">
        {/* Floating Top Controls (Back, Share, Heart) */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <button
            id="modal-back-btn"
            onClick={() => setSelectedProductForModal(null)}
            className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 pointer-events-auto transition-transform active:scale-95 border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleShare}
              title="Compartilhar"
              className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-transform active:scale-95 border border-white/10 relative"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-[#1A1A1D] border border-white/10 px-2 py-0.5 rounded text-amber-400 whitespace-nowrap">
                  Link copiado!
                </span>
              )}
            </button>

            <button
              onClick={() => toggleFavorite(product.id)}
              title="Favoritar"
              className={`w-10 h-10 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95 border border-white/10 ${
                isFavorite(product.id) ? 'text-red-500' : 'text-white hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pb-24">
          {/* Big Hero Image */}
          <div className="relative w-full h-64 sm:h-72 bg-[#151518] overflow-hidden">
            <img
              src={product.photo}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-black/50" />

            {/* Badges on image */}
            <div className="absolute bottom-4 left-5 flex flex-wrap gap-2">
              {product.isDailyOffer && (
                <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Flame className="w-3.5 h-3.5 fill-black" /> Destaque do Dia
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  ⭐ Mais Pedido
                </span>
              )}
              {product.isNew && (
                <span className="bg-amber-400/20 text-amber-400 border border-amber-400/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Novo
                </span>
              )}
            </div>
          </div>

          {/* Details Body */}
          <div className="px-6 pt-2 space-y-6">
            {/* Title, Rating & Price */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {product.name}
                </h2>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-500">
                  {formatCurrency(basePrice)}
                </span>
                {product.promoPrice && product.price > product.promoPrice && (
                  <span className="text-sm text-white/40 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{product.rating || 4.9}</span>
                </div>
                <span>•</span>
                <span>({product.reviewsCount || 850} avaliações da galera)</span>
              </div>

              {/* Description */}
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Ingredientes tags */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2.5">
                  Ingredientes Selecionados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#151518] text-white/70 px-3.5 py-1 rounded-full border border-white/5"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionais Section */}
            {product.addons && product.addons.length > 0 && (
              <div className="border-t border-white/5 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <span>Adicionais Extras</span>
                    <span className="text-[11px] font-normal text-white/40 lowercase">
                      (opcional)
                    </span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {product.addons.map((addon) => {
                    const selected = isAddonSelected(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                          selected
                            ? 'bg-amber-500/10 border-amber-500/50 text-white'
                            : 'bg-[#151518] border-white/5 text-white/80 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                              selected
                                ? 'bg-amber-500 border-amber-500 text-black'
                                : 'border-white/20 bg-[#202024]'
                            }`}
                          >
                            {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-medium">{addon.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-500">
                            + {formatCurrency(addon.price)}
                          </span>
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                              selected ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40'
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
            )}

            {/* Observação do Pedido */}
            <div className="border-t border-white/5 pt-5">
              <label
                htmlFor="order-observation-input"
                className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2"
              >
                Observações para a cozinha
              </label>
              <textarea
                id="order-observation-input"
                rows={2}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: Ponto da carne, sem cebola, maionese à parte..."
                className="w-full bg-[#151518] border border-white/5 rounded-2xl p-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Fixed Sticky Footer with Quantity Stepper & Add to Cart button */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#0A0A0B]/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex items-center gap-3 shadow-2xl">
          {/* Stepper */}
          <div className="flex items-center bg-[#151518] border border-white/5 rounded-2xl p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-black text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-amber-500 hover:text-amber-400 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            id="modal-add-to-cart-btn"
            onClick={handleAddToCart}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-4 px-5 rounded-2xl shadow-[0_8px_25px_rgba(245,158,11,0.3)] flex items-center justify-between text-sm transition-transform active:scale-[0.98]"
          >
            <span>ADICIONAR AO CARRINHO</span>
            <span>{formatCurrency(currentItemTotalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
