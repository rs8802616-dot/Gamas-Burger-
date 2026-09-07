import React, { useState } from 'react';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Tag,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    cartTotals,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponInput.trim()) return;

    const result = applyCoupon(couponInput.trim());
    if (result.success) {
      setCouponSuccess(result.message);
      setCouponInput('');
    } else {
      setCouponError(result.message);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-md bg-[#0e0e11] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-200">
        {/* Header matching Screen 3 */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-base font-black text-white">Meu Carrinho</h2>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              title="Limpar Carrinho"
              className="p-2 text-neutral-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cart Body */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#151518] flex items-center justify-center text-3xl mb-3 shadow-inner">
              🛒
            </div>
            <h3 className="text-base font-black text-white">Seu carrinho está vazio</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs">
              Adicione hambúrgueres saborosos ou combos artesanais para continuar!
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider"
            >
              Ver Cardápio
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Cart Items List */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-[#151518] border border-white/5 rounded-2xl p-3 flex gap-3 shadow-md"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.photo}
                    alt={item.product.name}
                    className="w-18 h-18 rounded-xl object-cover bg-[#202024] shrink-0 border border-white/5"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-neutral-500 hover:text-red-400 p-0.5 shrink-0"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-amber-500">
                        {formatCurrency(item.product.promoPrice ?? item.product.price)}
                      </span>

                      {/* Addons List */}
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="text-[10px] text-neutral-400 mt-0.5 space-y-0.5">
                          {item.selectedAddons.map((sa, i) => (
                            <div key={i}>
                              {sa.addon.name} + {formatCurrency(sa.addon.price)}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.observation && (
                        <p className="text-[10px] text-amber-400/80 italic mt-0.5">
                          Obs: {item.observation}
                        </p>
                      )}
                    </div>

                    {/* Stepper & Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                      <div className="flex items-center bg-[#101013] border border-white/10 rounded-xl p-0.5">
                        <button
                          onClick={() => updateCartItemQuantity(item.cartItemId, -1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(item.cartItemId, 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-amber-500 hover:text-amber-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-black text-white">
                        {formatCurrency(item.itemTotalPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cupom de desconto Box */}
            <div className="bg-[#151518] border border-white/5 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-white">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Cupom de desconto</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-500">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.value}% OFF` : `R$ ${appliedCoupon.value.toFixed(2)} OFF`})
                    </span>
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
                    placeholder="Digite o código do cupom"
                    className="flex-1 bg-[#0e0e11] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 uppercase focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-4 py-2 rounded-xl text-xs transition-transform active:scale-95"
                  >
                    Aplicar
                  </button>
                </form>
              )}

              {couponError && <p className="text-[10px] text-red-400 mt-1.5">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-amber-400 mt-1.5">{couponSuccess}</p>}
            </div>

            {/* Price Breakdown */}
            <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">
                  {formatCurrency(cartTotals.subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-neutral-400">
                <span>Desconto</span>
                <span className="font-semibold text-white">
                  - {formatCurrency(cartTotals.discount)}
                </span>
              </div>

              <div className="flex justify-between text-neutral-400">
                <span>Taxa de entrega</span>
                <span className="font-semibold text-white">
                  {formatCurrency(cartTotals.deliveryFee)}
                </span>
              </div>

              <div className="border-t border-white/10 pt-2.5 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-xl font-black text-amber-500">
                  {formatCurrency(cartTotals.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions matching Screen 3 (Continuar comprando & Finalizar pedido >) */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-[#0e0e11] flex gap-2.5">
            <button
              onClick={() => setIsCartOpen(false)}
              className="flex-1 py-3 px-3 bg-[#151518] hover:bg-[#1c1c21] border border-white/10 text-white font-bold text-xs rounded-2xl text-center transition-colors"
            >
              Continuar comprando
            </button>

            <button
              id="cart-checkout-btn"
              onClick={handleProceedToCheckout}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1 shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-transform active:scale-95"
            >
              <span>Finalizar pedido</span>
              <span>&gt;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
