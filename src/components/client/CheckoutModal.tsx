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
    theme,
  } = useStore();

  const isDark = theme === 'dark';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className={`w-full sm:max-w-md border-t sm:border rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-200 ${
        isDark ? 'bg-[#0e0e11] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        {/* Header matching Screen 4: "← Finalizar pedido" */}
        <div className={`p-4 border-b flex items-center gap-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Finalizar pedido</h2>
        </div>

        {/* Step Indicator matching Screen 4: 1. Endereço -> 2. Pagamento -> 3. Confirmar */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className={`absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 z-0 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

            {/* Step 1: Endereço */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-black shadow-lg shadow-amber-500/20">
                <MapPin className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-amber-500 mt-1">Endereço</span>
            </div>

            {/* Step 2: Pagamento */}
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
                isDark ? 'bg-[#1e1e24] text-amber-500 border-amber-500/40' : 'bg-amber-50 text-amber-600 border-amber-300'
              }`}>
                <CreditCard className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Pagamento</span>
            </div>

            {/* Step 3: Confirmar */}
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
                isDark ? 'bg-[#18181c] text-neutral-500 border-white/10' : 'bg-gray-100 text-gray-400 border-gray-300'
              }`}>
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Confirmar</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Forma de recebimento */}
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider mb-2.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Forma de recebimento
            </h3>
            <div className="space-y-2">
              {/* Option 1: Entrega */}
              <div
                onClick={() => setDeliveryType('delivery')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  deliveryType === 'delivery'
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-amber-50 border-amber-500 text-gray-900'
                    : isDark
                    ? 'bg-[#151518] border-white/5 text-neutral-300 hover:border-white/10'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 shadow-sm">
                    <Bike className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Entrega</h4>
                    <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                      Receba no conforto da sua casa
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>

              {/* Option 2: Retirada */}
              <div
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  deliveryType === 'pickup'
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-amber-50 border-amber-500 text-gray-900'
                    : isDark
                    ? 'bg-[#151518] border-white/5 text-neutral-300 hover:border-white/10'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-[#202024] text-neutral-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    <Store className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Retirada no estabelecimento</h4>
                    <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Retire no nosso balcão</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Endereço de entrega matching Screen 4 */}
          {deliveryType === 'delivery' ? (
            <div>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-2.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Endereço de entrega
              </h3>

              {!isAddingNewAddress ? (
                <div className={`border rounded-2xl p-4 space-y-3 ${
                  isDark ? 'bg-[#151518] border-white/5' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-gray-900'}`}>Meu endereço</span>
                        <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          {currentAddress.street}, {currentAddress.number}
                          {currentAddress.complement ? ` - ${currentAddress.complement}` : ''}
                        </p>
                        <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                          {currentAddress.neighborhood} - {currentAddress.city}
                        </p>
                        <p className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
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
                    <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                      {customer.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setIsChangingAddress(false);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer ${
                            addr.id === currentAddress.id
                              ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                              : isDark
                              ? 'border-white/5 bg-[#0e0e11] text-neutral-300'
                              : 'border-gray-200 bg-white text-gray-700'
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
                    className={`w-full py-2.5 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isDark
                        ? 'bg-[#0e0e11] hover:bg-[#121215] border-white/10 text-white'
                        : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-800'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar novo endereço</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveNewAddress} className={`border rounded-2xl p-4 space-y-2.5 ${
                  isDark ? 'bg-[#151518] border-white/5' : 'bg-gray-50 border-gray-200'
                }`}>
                  <span className={`text-xs font-bold block mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Novo Endereço</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Rua / Av."
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      required
                      className={`col-span-2 border rounded-xl px-3 py-2 text-xs ${
                        isDark
                          ? 'bg-[#0e0e11] border-white/10 text-white placeholder-neutral-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Nº"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                      required
                      className={`border rounded-xl px-3 py-2 text-xs ${
                        isDark
                          ? 'bg-[#0e0e11] border-white/10 text-white placeholder-neutral-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Complemento (opcional)"
                    value={newComplement}
                    onChange={(e) => setNewComplement(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark
                        ? 'bg-[#0e0e11] border-white/10 text-white placeholder-neutral-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  <select
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark
                        ? 'bg-[#0e0e11] border-white/10 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                      className={`px-3 font-bold py-2 rounded-xl text-xs ${
                        isDark ? 'bg-neutral-800 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className={`border rounded-2xl p-4 text-xs ${
              isDark ? 'bg-[#151518] border-white/5' : 'bg-gray-50 border-gray-200'
            }`}>
              <span className="font-bold text-amber-500 block mb-1">Local de Retirada:</span>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{storeSettings.name}</p>
              <p className={isDark ? 'text-neutral-400' : 'text-gray-500'}>{storeSettings.address}</p>
            </div>
          )}

          {/* Forma de pagamento matching Screen 4 */}
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider mb-2.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Forma de pagamento
            </h3>

            <div className="space-y-2">
              {/* Option 1: PIX */}
              <div
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'pix'
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-amber-50 border-amber-500'
                    : isDark
                    ? 'bg-[#151518] border-white/5 text-neutral-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'pix' ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]' : 'border-neutral-500'
                    }`}>
                      {paymentMethod === 'pix' && '✓'}
                    </div>
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>PIX</span>
                    <span className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-500 font-bold">Imediato</span>
                </div>

                {paymentMethod === 'pix' && (
                  <div className={`mt-3 pt-3 border-t p-3 rounded-xl flex flex-col items-center text-center ${
                    isDark ? 'border-white/5 bg-[#0e0e11]' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg mb-2 border border-gray-200">
                      <QrCode className="w-20 h-20 text-black" />
                    </div>
                    <p className={`text-[10px] mb-2 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
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
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-amber-50 border-amber-500'
                    : isDark
                    ? 'bg-[#151518] border-white/5 text-neutral-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'credit_card' ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]' : 'border-neutral-500'
                  }`}>
                    {paymentMethod === 'credit_card' && '✓'}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-gray-900'}`}>Cartão de crédito</span>
                    <span className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>Em até 12x (com juros)</span>
                  </div>
                </div>
              </div>

              {/* Option 3: Cartão de débito */}
              <div
                onClick={() => setPaymentMethod('debit_card')}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'debit_card'
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-amber-50 border-amber-500'
                    : isDark
                    ? 'bg-[#151518] border-white/5 text-neutral-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'debit_card' ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]' : 'border-neutral-500'
                  }`}>
                    {paymentMethod === 'debit_card' && '✓'}
                  </div>
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Cartão de débito</span>
                </div>
              </div>

              {/* Option 4: Dinheiro */}
              <div
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-amber-50 border-amber-500'
                    : isDark
                    ? 'bg-[#151518] border-white/5 text-neutral-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]' : 'border-neutral-500'
                    }`}>
                      {paymentMethod === 'cash' && '✓'}
                    </div>
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dinheiro</span>
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <div className={`mt-2.5 pt-2.5 border-t flex items-center gap-2 ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                    <label className={`text-[11px] flex items-center gap-1.5 cursor-pointer ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
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
                        className={`w-24 border rounded-lg px-2 py-1 text-xs ${
                          isDark
                            ? 'bg-[#0e0e11] border-white/10 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
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
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-amber-50 border-amber-500'
                    : isDark
                    ? 'bg-[#151518] border-white/5 text-neutral-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'on_delivery' ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]' : 'border-neutral-500'
                  }`}>
                    {paymentMethod === 'on_delivery' && '✓'}
                  </div>
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pagamento na entrega</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Observações gerais
            </h3>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Ex: Tocar interfone 42, campainha..."
              className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 ${
                isDark
                  ? 'bg-[#151518] border-white/10 text-white placeholder-neutral-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* Summary Box */}
          <div className={`border rounded-2xl p-4 space-y-2 text-xs ${
            isDark ? 'bg-[#151518] border-white/5' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`flex justify-between ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
              <span>Subtotal</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(cartTotals.subtotal)}</span>
            </div>
            {cartTotals.discount > 0 && (
              <div className="flex justify-between text-amber-500 font-bold">
                <span>Desconto</span>
                <span>- {formatCurrency(cartTotals.discount)}</span>
              </div>
            )}
            <div className={`flex justify-between ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
              <span>Taxa de entrega</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {deliveryType === 'delivery'
                  ? formatCurrency(selectedDeliveryZone?.fee || 5.0)
                  : 'Grátis'}
              </span>
            </div>
            <div className={`border-t pt-2 flex justify-between items-baseline ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total</span>
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
        <div className={`p-4 border-t ${isDark ? 'border-white/10 bg-[#0e0e11]' : 'border-gray-200 bg-white'}`}>
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
