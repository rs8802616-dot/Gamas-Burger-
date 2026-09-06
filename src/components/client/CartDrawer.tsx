import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartTotals,
    setIsCheckoutOpen,
    setClientTab,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponSuccess('');

    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0A0A0B] h-full flex flex-col shadow-2xl border-l border-white/5 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-white tracking-tight">Meu Carrinho</h2>
            <span className="bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} itens
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              title="Limpar carrinho"
              className="text-xs text-white/40 hover:text-red-400 flex items-center gap-1.5 transition-colors px-2 py-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Content */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#151518] border border-white/5 flex items-center justify-center text-4xl mb-4 text-white/40 shadow-lg">
              🍔
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Seu carrinho está vazio</h3>
            <p className="text-xs text-white/40 max-w-xs mb-6 leading-relaxed">
              Que tal experimentar nossos artesanais preparados no fogo com ingredientes selecionados?
            </p>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setClientTab('home');
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
            >
              Explorar Cardápio
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Items List */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-[#151518] border border-white/5 rounded-3xl p-4 relative flex gap-3.5 shadow-lg"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.photo}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-2xl object-cover bg-[#202024] shrink-0 border border-white/5"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-sm font-bold text-white truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-white/30 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs font-black text-amber-500 mt-0.5">
                      {formatCurrency(item.product.promoPrice ?? item.product.price)}
                    </div>

                    {/* Addons breakdown */}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="mt-1.5 space-y-0.5 text-[11px] text-white/50">
                        {item.selectedAddons.map((sa, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="text-amber-500 font-bold">+</span>
                            <span>{sa.addon.name}</span>
                            <span className="text-white/30">
                              ({formatCurrency(sa.addon.price)})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Observation */}
                    {item.observation && (
                      <div className="mt-1.5 text-[11px] bg-[#0A0A0B] px-2.5 py-1 rounded-xl text-white/60 italic border border-white/5">
                        Obs: "{item.observation}"
                      </div>
                    )}

                    {/* Stepper and item total */}
                    <div className="mt-3 flex items-center justify-between pt-1 border-t border-white/5">
                      <div className="flex items-center bg-[#0A0A0B] border border-white/5 rounded-xl p-0.5">
                        <button
                          onClick={() => updateCartItemQuantity(item.cartItemId, -1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(item.cartItemId, 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-500 hover:text-amber-400 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-black text-white">
                        {formatCurrency(item.itemTotalPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cupom Section */}
            <div className="bg-[#151518] border border-white/5 rounded-3xl p-4">
              <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-white uppercase tracking-wider">
                <Tag className="w-4 h-4 text-amber-500" />
                <span>Cupom de desconto</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-500">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[11px] text-white/50 ml-1.5">
                        ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.value}% OFF` : `R$ ${appliedCoupon.value.toFixed(2)} OFF`})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-400 hover:text-red-300 font-bold"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Ex: HAMBURGUER10"
                    className="flex-1 bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white uppercase placeholder-white/30 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black px-4 py-2.5 rounded-2xl text-xs transition-transform active:scale-95"
                  >
                    Aplicar
                  </button>
                </form>
              )}

              {couponError && <p className="text-[11px] text-red-400 mt-2 font-medium">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-amber-400 mt-2 font-medium">{couponSuccess}</p>}
            </div>

            {/* Price Breakdown */}
            <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 space-y-3 text-xs">
              <div className="flex justify-between text-white/50">
                <span>Subtotal</span>
                <span className="font-semibold text-white">
                  {formatCurrency(cartTotals.subtotal)}
                </span>
              </div>

              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>Desconto {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                  <span>- {formatCurrency(cartTotals.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-white/50">
                <span>Taxa de entrega (estimada)</span>
                <span className="font-semibold text-white">
                  {formatCurrency(cartTotals.deliveryFee)}
                </span>
              </div>

              <div className="border-t border-white/5 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-2xl font-black text-amber-500">
                  {formatCurrency(cartTotals.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-white/5 bg-[#0A0A0B] space-y-2.5">
            <button
              id="cart-checkout-btn"
              onClick={handleProceedToCheckout}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 px-5 rounded-2xl shadow-[0_8px_25px_rgba(245,158,11,0.3)] flex items-center justify-between text-sm transition-transform active:scale-[0.98]"
            >
              <span>FINALIZAR PEDIDO</span>
              <div className="flex items-center gap-1.5">
                <span>{formatCurrency(cartTotals.total)}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </div>
            </button>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full py-2 text-xs font-bold text-white/40 hover:text-white text-center transition-colors uppercase tracking-wider"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
