import React, { useState } from 'react';
import {
  ArrowLeft,
  Bike,
  Store,
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  Copy,
  Check,
  ChevronRight,
  Plus,
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
    cartTotals,
    placeOrder,
    storeSettings,
  } = useStore();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    customer.addresses[0]?.id || ''
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState(deliveryZones[0]?.neighborhood || 'Centro');
  const [newComplement, setNewComplement] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<
    'pix' | 'credit_card' | 'debit_card' | 'cash' | 'on_delivery'
  >('pix');
  const [needChange, setNeedChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isCheckoutOpen) return null;

  const currentAddress =
    customer.addresses.find((a) => a.id === selectedAddressId) || customer.addresses[0] || {
      id: 'default',
      label: 'Casa',
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo/SP',
      zipCode: '01000-000',
    };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newNumber) return;

    addAddress({
      label: 'Casa',
      street: newStreet,
      number: newNumber,
      complement: newComplement,
      neighborhood: newNeighborhood,
      city: 'São Paulo/SP',
      zipCode: '01000-000',
    });

    setIsAddingNewAddress(false);
    setIsChangingAddress(false);
    setNewStreet('');
    setNewNumber('');
    setNewComplement('');
  };

  const handleConfirmOrder = () => {
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
      <div className="w-full sm:max-w-md bg-[#0e0e11] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-200">
        {/* Header matching Screen 4: "← Finalizar pedido" */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className="text-base font-black text-white">Finalizar pedido</h2>
        </div>

        {/* Step Indicator matching Screen 4: 1. Endereço -> 2. Pagamento -> 3. Confirmar */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 bg-white/10 z-0" />

            {/* Step 1: Endereço */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-black shadow-lg shadow-amber-500/20">
                <MapPin className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-amber-500 mt-1">Endereço</span>
            </div>

            {/* Step 2: Pagamento */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#1e1e24] text-amber-500 border border-amber-500/40 flex items-center justify-center text-xs font-black">
                <CreditCard className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-white mt-1">Pagamento</span>
            </div>

            {/* Step 3: Confirmar */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#18181c] text-neutral-500 border border-white/10 flex items-center justify-center text-xs font-black">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-neutral-400 mt-1">Confirmar</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Forma de recebimento */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2.5">
              Forma de recebimento
            </h3>
            <div className="space-y-2">
              {/* Option 1: Entrega */}
              <div
                onClick={() => setDeliveryType('delivery')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  deliveryType === 'delivery'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#151518] border-white/5 text-neutral-300 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Entrega</h4>
                    <p className="text-[11px] text-neutral-400">
                      Receba no conforto da sua casa
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </div>

              {/* Option 2: Retirada */}
              <div
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  deliveryType === 'pickup'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#151518] border-white/5 text-neutral-300 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#202024] text-neutral-300 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Retirada no estabelecimento</h4>
                    <p className="text-[11px] text-neutral-400">Retire no nosso balcão</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </div>
            </div>
          </div>

          {/* Endereço de entrega matching Screen 4 */}
          {deliveryType === 'delivery' ? (
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2.5">
                Endereço de entrega
              </h3>

              {!isAddingNewAddress ? (
                <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Meu endereço</span>
                        <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                          {currentAddress.street}, {currentAddress.number}
                          {currentAddress.complement ? ` - ${currentAddress.complement}` : ''}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {currentAddress.neighborhood} - {currentAddress.city}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          CEP {currentAddress.zipCode || '01000-000'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsChangingAddress(!isChangingAddress)}
                      className="text-xs font-bold text-amber-500 hover:text-amber-400"
                    >
                      Alterar
                    </button>
                  </div>

                  {/* If changing address, list customer addresses */}
                  {isChangingAddress && (
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      {customer.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setIsChangingAddress(false);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer ${
                            addr.id === currentAddress.id
                              ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                              : 'border-white/5 bg-[#0e0e11] text-neutral-300'
                          }`}
                        >
                          {addr.street}, {addr.number} ({addr.neighborhood})
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="w-full py-2.5 bg-[#0e0e11] hover:bg-[#121215] border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar novo endereço</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveNewAddress} className="bg-[#151518] border border-white/5 rounded-2xl p-4 space-y-2.5">
                  <span className="text-xs font-bold text-white block mb-1">Novo Endereço</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Rua / Av."
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      required
                      className="col-span-2 bg-[#0e0e11] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500"
                    />
                    <input
                      type="text"
                      placeholder="Nº"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                      required
                      className="bg-[#0e0e11] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Complemento (opcional)"
                    value={newComplement}
                    onChange={(e) => setNewComplement(e.target.value)}
                    className="w-full bg-[#0e0e11] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500"
                  />
                  <select
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className="w-full bg-[#0e0e11] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {deliveryZones.map((z) => (
                      <option key={z.id} value={z.neighborhood}>
                        {z.neighborhood} ({formatCurrency(z.fee)})
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-500 text-neutral-950 font-black py-2 rounded-xl text-xs"
                    >
                      Salvar Endereço
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="px-3 bg-neutral-800 text-white font-bold py-2 rounded-xl text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 text-xs">
              <span className="font-bold text-amber-500 block mb-1">Local de Retirada:</span>
              <p className="text-white font-medium">{storeSettings.name}</p>
              <p className="text-neutral-400">{storeSettings.address}</p>
            </div>
          )}

          {/* Forma de pagamento matching Screen 4 */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2.5">
              Forma de pagamento
            </h3>

            <div className="space-y-2">
              {/* Option 1: PIX */}
              <div
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'pix'
                    ? 'bg-amber-500/10 border-amber-500'
                    : 'bg-[#151518] border-white/5 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'pix' ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]' : 'border-neutral-600'
                    }`}>
                      {paymentMethod === 'pix' && '✓'}
                    </div>
                    <span className="text-xs font-bold text-white">PIX</span>
                    <span className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">Imediato</span>
                </div>

                {paymentMethod === 'pix' && (
                  <div className="mt-3 pt-3 border-t border-white/5 bg-[#0e0e11] p-3 rounded-xl flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg mb-2">
                      <QrCode className="w-20 h-20 text-black" />
                    </div>
                    <p className="text-[10px] text-neutral-400 mb-2">
                      Escaneie ou copie a chave PIX abaixo:
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="flex items-center gap-1.5 text-xs bg-amber-500 text-black font-black px-4 py-2 rounded-xl"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar Chave PIX'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Option 2: Cartão de crédito */}
              <div
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'bg-amber-500/10 border-amber-500'
                    : 'bg-[#151518] border-white/5 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'credit_card' ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]' : 'border-neutral-600'
                  }`}>
                    {paymentMethod === 'credit_card' && '✓'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Cartão de crédito</span>
                    <span className="text-[10px] text-neutral-500">Em até 12x (com juros)</span>
                  </div>
                </div>
              </div>

              {/* Option 3: Cartão de débito */}
              <div
                onClick={() => setPaymentMethod('debit_card')}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'debit_card'
                    ? 'bg-amber-500/10 border-amber-500'
                    : 'bg-[#151518] border-white/5 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'debit_card' ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]' : 'border-neutral-600'
                  }`}>
                    {paymentMethod === 'debit_card' && '✓'}
                  </div>
                  <span className="text-xs font-bold text-white">Cartão de débito</span>
                </div>
              </div>

              {/* Option 4: Dinheiro */}
              <div
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/10 border-amber-500'
                    : 'bg-[#151518] border-white/5 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]' : 'border-neutral-600'
                    }`}>
                      {paymentMethod === 'cash' && '✓'}
                    </div>
                    <span className="text-xs font-bold text-white">Dinheiro</span>
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center gap-2">
                    <label className="text-[11px] text-neutral-300 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needChange}
                        onChange={(e) => setNeedChange(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Troco para:</span>
                    </label>
                    {needChange && (
                      <input
                        type="number"
                        placeholder="R$ 50,00"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        className="w-24 bg-[#0e0e11] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Option 5: Pagamento na entrega */}
              <div
                onClick={() => setPaymentMethod('on_delivery')}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'on_delivery'
                    ? 'bg-amber-500/10 border-amber-500'
                    : 'bg-[#151518] border-white/5 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'on_delivery' ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]' : 'border-neutral-600'
                  }`}>
                    {paymentMethod === 'on_delivery' && '✓'}
                  </div>
                  <span className="text-xs font-bold text-white">Pagamento na entrega</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1.5">
              Observações gerais
            </h3>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Ex: Tocar interfone 42, campainha..."
              className="w-full bg-[#151518] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Summary Box */}
          <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span className="text-white font-semibold">{formatCurrency(cartTotals.subtotal)}</span>
            </div>
            {cartTotals.discount > 0 && (
              <div className="flex justify-between text-amber-400 font-bold">
                <span>Desconto</span>
                <span>- {formatCurrency(cartTotals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-400">
              <span>Taxa de entrega</span>
              <span className="text-white font-semibold">
                {deliveryType === 'delivery'
                  ? formatCurrency(selectedDeliveryZone?.fee || 5.0)
                  : 'Grátis'}
              </span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
              <span className="text-xs font-bold text-white">Total</span>
              <span className="text-xl font-black text-amber-500">
                {formatCurrency(
                  deliveryType === 'delivery'
                    ? cartTotals.total
                    : Math.max(0, cartTotals.subtotal - cartTotals.discount)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action matching Screen 4: "Ir para o pagamento >" */}
        <div className="p-4 border-t border-white/10 bg-[#0e0e11]">
          <button
            id="confirm-order-btn"
            type="button"
            onClick={handleConfirmOrder}
            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-1 shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition-transform active:scale-[0.98]"
          >
            <span>Ir para o pagamento</span>
            <span>&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
