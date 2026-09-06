import React, { useState } from 'react';
import {
  X,
  Bike,
  Store,
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Bell,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';
import { CustomerAddress } from '../../types';
import { NotificationService } from '../../services/notificationService';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    customer,
    addAddress,
    deliveryZones,
    selectedDeliveryZone,
    setSelectedDeliveryZone,
    cartTotals,
    placeOrder,
    storeSettings,
  } = useStore();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    customer.addresses[0]?.id || ''
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState(deliveryZones[0]?.neighborhood || 'Centro');
  const [newComplement, setNewComplement] = useState('');
  const [newLabel, setNewLabel] = useState<'Casa' | 'Trabalho' | 'Outro'>('Casa');

  const [paymentMethod, setPaymentMethod] = useState<
    'pix' | 'credit_card' | 'debit_card' | 'cash' | 'on_delivery'
  >('pix');
  const [needChange, setNeedChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  // Explicit Notification Opt-In (Requirements 29 & 31)
  const [notifyOrderStatus, setNotifyOrderStatus] = useState(true);
  const [notifyPromotions, setNotifyPromotions] = useState(
    NotificationService.isMarketingConsentGranted()
  );

  if (!isCheckoutOpen) return null;

  const currentAddress =
    customer.addresses.find((a) => a.id === selectedAddressId) || customer.addresses[0];

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newNumber) return;

    addAddress({
      label: newLabel,
      street: newStreet,
      number: newNumber,
      complement: newComplement,
      neighborhood: newNeighborhood,
      city: 'São Paulo/SP',
      zipCode: '01000-000',
    });

    setIsAddingNewAddress(false);
    setNewStreet('');
    setNewNumber('');
    setNewComplement('');
  };

  const handleConfirmOrder = () => {
    if (notifyOrderStatus) {
      NotificationService.requestPermission();
    }
    NotificationService.setMarketingConsent(notifyPromotions);

    placeOrder({
      deliveryType,
      address: deliveryType === 'delivery' ? currentAddress : undefined,
      paymentMethod,
      cashChangeFor: needChange ? Number(changeFor) : undefined,
      notes: orderNotes,
    });
  };

  const pixKeyMock = '00020126580014BR.GOV.BCB.PIX0136b92a6c1e-3f8d-4a57-89df-1045burger10520400005303986540564.705802BR5925BURGER10 HAMBURGUERIA6009SAO PAULO62070503***6304E8A2';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKeyMock);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-lg bg-[#0A0A0B] border-t sm:border border-white/5 rounded-t-[2.5rem] sm:rounded-[2.5rem] max-h-[95vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Finalizar Pedido</h2>
            <p className="text-xs text-white/40">Revise os dados para confirmar seu lanche</p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Forma de recebimento */}
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2.5">
              1. Forma de recebimento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-4 rounded-3xl border flex flex-col items-start gap-1 text-left transition-all ${
                  deliveryType === 'delivery'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                    : 'bg-[#151518] border-white/5 text-white/50 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Bike className={`w-4 h-4 ${deliveryType === 'delivery' ? 'text-amber-500' : ''}`} />
                    <span>Entrega</span>
                  </div>
                  {deliveryType === 'delivery' && (
                    <div className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black">
                      ✓
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-white/40">
                  Receba quente no seu endereço
                </span>
                <span className="text-[11px] font-bold text-amber-500 mt-1">
                  Taxa: {formatCurrency(selectedDeliveryZone?.fee || 5.00)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-4 rounded-3xl border flex flex-col items-start gap-1 text-left transition-all ${
                  deliveryType === 'pickup'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                    : 'bg-[#151518] border-white/5 text-white/50 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Store className={`w-4 h-4 ${deliveryType === 'pickup' ? 'text-amber-500' : ''}`} />
                    <span>Retirada</span>
                  </div>
                  {deliveryType === 'pickup' && (
                    <div className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black">
                      ✓
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-white/40">
                  Retire no balcão da loja
                </span>
                <span className="text-[11px] font-bold text-emerald-400 mt-1">
                  Sem taxa de entrega
                </span>
              </button>
            </div>
          </div>

          {/* 2. Endereço ou Local de Retirada */}
          {deliveryType === 'delivery' ? (
            <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Endereço de entrega</span>
                </label>
                {!isAddingNewAddress && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo</span>
                  </button>
                )}
              </div>

              {isAddingNewAddress ? (
                <form onSubmit={handleSaveNewAddress} className="space-y-3 pt-1">
                  <div className="flex gap-2">
                    {(['Casa', 'Trabalho', 'Outro'] as const).map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setNewLabel(lbl)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-bold ${
                          newLabel === lbl
                            ? 'bg-amber-500 text-black border-amber-500'
                            : 'bg-[#0A0A0B] border-white/5 text-white/60'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Rua / Av."
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      required
                      className="col-span-2 bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-white/30"
                    />
                    <input
                      type="text"
                      placeholder="Nº"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                      required
                      className="bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-white/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Complemento (opcional)"
                      value={newComplement}
                      onChange={(e) => setNewComplement(e.target.value)}
                      className="bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-white/30"
                    />
                    <select
                      value={newNeighborhood}
                      onChange={(e) => setNewNeighborhood(e.target.value)}
                      className="bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                    >
                      {deliveryZones.map((z) => (
                        <option key={z.id} value={z.neighborhood}>
                          {z.neighborhood} ({formatCurrency(z.fee)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-500 text-black font-black py-2.5 rounded-2xl text-xs shadow-md"
                    >
                      Salvar Endereço
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="px-4 bg-[#0A0A0B] text-white/50 font-bold py-2.5 rounded-2xl text-xs border border-white/5"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  {customer.addresses.map((addr) => {
                    const isSel = addr.id === selectedAddressId;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSel
                            ? 'bg-amber-500/10 border-amber-500/60 text-white'
                            : 'bg-[#0A0A0B] border-white/5 text-white/50 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="text-base mt-0.5">
                            {addr.label === 'Casa' ? '🏠' : addr.label === 'Trabalho' ? '💼' : '📍'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                              <span>{addr.label}</span>
                              <span className="text-white/30 font-normal">•</span>
                              <span className="text-white/80 font-normal">
                                {addr.street}, {addr.number}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/40 mt-0.5">
                              {addr.neighborhood} - {addr.city} {addr.complement ? `(${addr.complement})` : ''}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSel ? 'border-amber-500 bg-amber-500 text-black font-black text-[10px]' : 'border-white/20'
                          }`}
                        >
                          {isSel && '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 text-xs shadow-lg">
              <span className="font-bold text-amber-500 block mb-1">Local de Retirada:</span>
              <p className="text-white font-medium">{storeSettings.name}</p>
              <p className="text-white/40">{storeSettings.address}</p>
              <p className="text-white/40 mt-1">Tempo estimado de preparo: 20-30 min</p>
            </div>
          )}

          {/* 3. Forma de Pagamento */}
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2.5">
              2. Forma de pagamento
            </label>
            <div className="space-y-2">
              {/* PIX */}
              <div
                onClick={() => setPaymentMethod('pix')}
                className={`p-3.5 rounded-3xl border cursor-pointer transition-all ${
                  paymentMethod === 'pix'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#151518] border-white/5 text-white/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black text-xs">
                      ❖
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <span>PIX</span>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Aprovação imediata
                        </span>
                      </div>
                      <span className="text-[11px] text-white/40">
                        Chave copia e cola ou QR Code
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'pix' ? 'border-amber-500 bg-amber-500 text-black font-black text-[10px]' : 'border-white/20'
                    }`}
                  >
                    {paymentMethod === 'pix' && '✓'}
                  </div>
                </div>

                {paymentMethod === 'pix' && (
                  <div className="mt-3 pt-3 border-t border-white/5 bg-[#0A0A0B] p-4 rounded-2xl flex flex-col items-center text-center">
                    <div className="w-28 h-28 bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                      <QrCode className="w-24 h-24 text-black" />
                    </div>
                    <span className="text-[11px] text-white/60 mb-2">
                      Após confirmar, copie e pague pelo app do seu banco
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="flex items-center gap-1.5 text-xs bg-amber-500 text-black font-black px-4 py-2 rounded-xl active:scale-95 shadow-md"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Cartão de Crédito */}
              <div
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3.5 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'credit_card'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#151518] border-white/5 text-white/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-white/40" />
                  <div>
                    <span className="font-bold text-xs text-white block">Cartão de Crédito</span>
                    <span className="text-[11px] text-white/40">Pagamento online seguro</span>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'credit_card' ? 'border-amber-500 bg-amber-500 text-black font-black text-[10px]' : 'border-white/20'
                  }`}
                >
                  {paymentMethod === 'credit_card' && '✓'}
                </div>
              </div>

              {/* Dinheiro */}
              <div
                onClick={() => setPaymentMethod('cash')}
                className={`p-3.5 rounded-3xl border cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#151518] border-white/5 text-white/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Banknote className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="font-bold text-xs text-white block">Dinheiro</span>
                      <span className="text-[11px] text-white/40">Pague ao entregador / balcão</span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'border-amber-500 bg-amber-500 text-black font-black text-[10px]' : 'border-white/20'
                    }`}
                  >
                    {paymentMethod === 'cash' && '✓'}
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needChange}
                        onChange={(e) => setNeedChange(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Precisa de troco?</span>
                    </label>

                    {needChange && (
                      <input
                        type="number"
                        placeholder="Troco para R$"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        className="w-32 bg-[#0A0A0B] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Cartão na entrega */}
              <div
                onClick={() => setPaymentMethod('on_delivery')}
                className={`p-3.5 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'on_delivery'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#151518] border-white/5 text-white/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#202024] text-amber-500 flex items-center justify-center text-xs font-bold">
                    💳
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">Máquina de Cartão na Entrega</span>
                    <span className="text-[11px] text-white/40">Débito, Crédito ou VR/VA</span>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'on_delivery' ? 'border-amber-500 bg-amber-500 text-black font-black text-[10px]' : 'border-white/20'
                  }`}
                >
                  {paymentMethod === 'on_delivery' && '✓'}
                </div>
              </div>
            </div>
          </div>

          {/* Observações gerais */}
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5">
              Observações para entrega
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Ex: Tocar interfone 42, portaria, sem gelo..."
              className="w-full bg-[#151518] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Avisos no Celular (Requirements 29 & 31) */}
          <div className="bg-[#151518] border border-white/5 rounded-3xl p-4 space-y-2.5 shadow-lg">
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Acompanhamento no Celular</span>
            </h4>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyOrderStatus}
                onChange={(e) => setNotifyOrderStatus(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-500 bg-[#0A0A0B] border-white/20 focus:ring-0"
              />
              <span className="text-xs text-white/80">
                Receber atualizações sobre a <strong>preparação e entrega</strong> do pedido
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none pt-2 border-t border-white/5">
              <input
                type="checkbox"
                checked={notifyPromotions}
                onChange={(e) => setNotifyPromotions(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-500 bg-[#0A0A0B] border-white/20 focus:ring-0"
              />
              <span className="text-xs text-white/60">
                Desejo receber <strong>cupons com desconto</strong> e novidades exclusivas
              </span>
            </label>
          </div>

          {/* Resumo Final de Valores */}
          <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 space-y-2.5 text-xs shadow-lg">
            <div className="flex justify-between text-white/50">
              <span>Subtotal dos produtos</span>
              <span className="text-white font-medium">{formatCurrency(cartTotals.subtotal)}</span>
            </div>
            {cartTotals.discount > 0 && (
              <div className="flex justify-between text-amber-400 font-bold">
                <span>Desconto aplicado</span>
                <span>- {formatCurrency(cartTotals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-white/50">
              <span>Taxa de entrega</span>
              <span className="text-white font-medium">
                {deliveryType === 'delivery'
                  ? formatCurrency(selectedDeliveryZone?.fee || 5.00)
                  : 'Grátis (Retirada)'}
              </span>
            </div>
            <div className="border-t border-white/5 pt-2.5 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Total a pagar</span>
              <span className="text-2xl font-black text-amber-500">
                {formatCurrency(
                  deliveryType === 'delivery'
                    ? cartTotals.total
                    : Math.max(0, cartTotals.subtotal - cartTotals.discount)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-white/5 bg-[#0A0A0B] flex gap-3">
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            className="px-5 py-3.5 bg-[#151518] hover:bg-[#202024] text-white/60 hover:text-white font-bold rounded-2xl text-xs border border-white/5 transition-colors"
          >
            Voltar
          </button>
          <button
            id="confirm-order-btn"
            type="button"
            onClick={handleConfirmOrder}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-4 px-6 rounded-2xl shadow-[0_8px_25px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 text-sm transition-transform active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>CONFIRMAR PEDIDO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
