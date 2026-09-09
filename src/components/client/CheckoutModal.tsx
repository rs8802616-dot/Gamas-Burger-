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
  User,
  Phone,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  formatCurrency,
  formatPhoneNumber,
  buildOrderWhatsAppMessage,
  generateWhatsAppLink,
} from '../../utils/formatters';
import { Order, CustomerAddress } from '../../types';

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
    setTrackingOrderId,
    setClientTab,
  } = useStore();

  const isDark = theme === 'dark';

  // Customer identification for this order
  const [customerName, setCustomerName] = useState(() => {
    if (customer.name === 'João Silva' || customer.email === 'rs8802616@gmail.com') {
      return '';
    }
    return customer.name || '';
  });

  const [customerPhone, setCustomerPhone] = useState(() => {
    if (customer.phone === '(11) 99888-7766' || customer.email === 'rs8802616@gmail.com') {
      return '';
    }
    return customer.phone || '';
  });

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    customer.addresses[0]?.id || ''
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(
    customer.addresses.length === 0
  );
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
  const [formError, setFormError] = useState<string | null>(null);

  // Success state after order placed
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isCheckoutOpen) return null;

  const currentAddress: CustomerAddress | null =
    customer.addresses.find((a) => a.id === selectedAddressId) || customer.addresses[0] || null;

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newNumber.trim()) return;

    const newAddr: CustomerAddress = {
      id: `addr-${Date.now()}`,
      label: 'Casa',
      street: newStreet.trim(),
      number: newNumber.trim(),
      complement: newComplement.trim(),
      neighborhood: newNeighborhood.trim(),
      city: 'São Paulo/SP',
      zipCode: '01000-000',
    };

    addAddress(newAddr);
    setSelectedAddressId(newAddr.id);
    setIsAddingNewAddress(false);
    setIsChangingAddress(false);
    setNewStreet('');
    setNewNumber('');
    setNewComplement('');
  };

  const handleConfirmOrder = () => {
    if (!customerName.trim()) {
      setFormError('Por favor, informe seu nome para identificação do pedido.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError('Por favor, informe seu WhatsApp ou telefone com DDD (mínimo 10 dígitos).');
      return;
    }

    let finalAddress: CustomerAddress | undefined = undefined;

    if (deliveryType === 'delivery') {
      if (isAddingNewAddress || !currentAddress) {
        if (!newStreet.trim() || !newNumber.trim()) {
          setFormError('Por favor, preencha o endereço de entrega (Rua e Número).');
          return;
        }
        finalAddress = {
          id: `addr-${Date.now()}`,
          label: 'Casa',
          street: newStreet.trim(),
          number: newNumber.trim(),
          complement: newComplement.trim(),
          neighborhood: newNeighborhood.trim(),
          city: 'São Paulo/SP',
          zipCode: '01000-000',
        };
        addAddress(finalAddress);
      } else {
        finalAddress = currentAddress;
      }
    }

    setFormError(null);

    const order = placeOrder({
      deliveryType,
      address: finalAddress,
      paymentMethod,
      cashChangeFor: needChange ? Number(changeFor) : undefined,
      notes: orderNotes,
      customerInfo: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
      },
    });

    setPlacedOrder(order);

    // Pre-build WhatsApp message and trigger sending
    const msg = buildOrderWhatsAppMessage(order, storeSettings.name);
    const link = generateWhatsAppLink(storeSettings.whatsapp, msg);

    try {
      window.open(link, '_blank');
    } catch {
      // Handled via modal button
    }
  };

  const handleCloseModal = () => {
    setIsCheckoutOpen(false);
    setPlacedOrder(null);
  };

  const handleTrackOrder = () => {
    if (placedOrder) {
      setTrackingOrderId(placedOrder.id);
      setClientTab('orders');
    }
    handleCloseModal();
  };

  const pixKeyMock =
    '00020126580014BR.GOV.BCB.PIX0136b92a6c1e-3f8d-4a57-89df-1045gamas00520400005303986540564.705802BR5925GAMAS BURGER ARTESANAL6009SAO PAULO62070503***6304E8A2';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKeyMock);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  // SUCCESS SCREEN
  if (placedOrder) {
    const whatsappMsg = buildOrderWhatsAppMessage(placedOrder, storeSettings.name);
    const whatsappUrl = generateWhatsAppLink(storeSettings.whatsapp, whatsappMsg);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
        <div
          className={`w-full max-w-md border rounded-3xl p-6 flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#0e0e11] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          {/* Success Header */}
          <div className="text-center space-y-2 mb-5">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg">
              ✅
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Pedido #{placedOrder.orderNumber} Realizado!
            </h2>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
              Seu pedido já foi salvo e enviado para a nossa cozinha.
            </p>
          </div>

          {/* Primary WhatsApp Action */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-3 mb-5">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wide">
              <span>📲 Envie no WhatsApp para agilizar</span>
            </div>
            <p className={`text-xs ${isDark ? 'text-neutral-300' : 'text-gray-700'} leading-relaxed`}>
              Para confirmar o recebimento imediato e receber fotos do preparo, envie a comanda diretamente para o nosso WhatsApp:
            </p>
            <a
              id="send-order-whatsapp-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              <span>Abrir WhatsApp com o Pedido</span>
            </a>
          </div>

          {/* Order Details Preview */}
          <div
            className={`border rounded-2xl p-4 space-y-2.5 text-xs mb-5 ${
              isDark ? 'bg-[#151518] border-white/5' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex justify-between font-bold">
              <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Cliente:</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{placedOrder.customer.name}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Telefone / WhatsApp:</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{placedOrder.customer.phone}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Modalidade:</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                {placedOrder.deliveryType === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}
              </span>
            </div>
            {placedOrder.deliveryType === 'delivery' && placedOrder.address && (
              <div className="flex justify-between font-bold">
                <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Endereço:</span>
                <span className="text-right max-w-[200px] truncate">
                  {placedOrder.address.street}, {placedOrder.address.number}
                </span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between items-baseline font-black">
              <span>Total a pagar:</span>
              <span className="text-base text-amber-500">{formatCurrency(placedOrder.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleTrackOrder}
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Bike className="w-4 h-4 stroke-[2.5]" />
              <span>Acompanhar Pedido em Tempo Real</span>
            </button>
            <button
              onClick={handleCloseModal}
              className={`w-full py-2.5 rounded-2xl text-xs font-bold border transition-colors ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/5'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
              }`}
            >
              Voltar ao Cardápio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT FORM
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div
        className={`w-full sm:max-w-md border-t sm:border rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-200 ${
          isDark ? 'bg-[#0e0e11] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Header */}
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
          <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Finalizar Pedido
          </h2>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between relative">
            <div className={`absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 z-0 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

            {/* Step 1: Identificação & Endereço */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-black shadow-lg shadow-amber-500/20">
                <User className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-amber-500 mt-1">Identificação</span>
            </div>

            {/* Step 2: Entrega */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
                  isDark
                    ? 'bg-[#1e1e24] text-amber-500 border-amber-500/40'
                    : 'bg-amber-50 text-amber-600 border-amber-300'
                }`}
              >
                <MapPin className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Entrega
              </span>
            </div>

            {/* Step 3: Pagamento */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
                  isDark
                    ? 'bg-[#18181c] text-neutral-500 border-white/10'
                    : 'bg-gray-100 text-gray-400 border-gray-300'
                }`}
              >
                <CreditCard className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                Pagamento
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Error Banner */}
          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-2xl flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* SECTION 1: SEUS DADOS DE CONTATO */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#151518] border-white/5' : 'bg-amber-500/5 border-amber-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Seus Dados para o Pedido
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                  Seu Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-customer-name"
                  type="text"
                  placeholder="Ex: Carlos Oliveira"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none ${
                    isDark
                      ? 'bg-[#0e0e11] border-white/10 text-white placeholder-neutral-500 focus:border-amber-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-amber-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                  WhatsApp / Celular com DDD <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-customer-phone"
                  type="tel"
                  placeholder="Ex: (11) 98765-4321"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(formatPhoneNumber(e.target.value));
                    if (formError) setFormError(null);
                  }}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none ${
                    isDark
                      ? 'bg-[#0e0e11] border-white/10 text-white placeholder-neutral-500 focus:border-amber-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-amber-500'
                  }`}
                  required
                />
                <p className={`text-[10px] mt-1 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>
                  Este pedido será registrado com o seu nome e telefone.
                </p>
              </div>
            </div>
          </div>

          {/* Forma de recebimento */}
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider mb-2.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Forma de Recebimento
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
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Entrega em Domicílio
                    </h4>
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
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-[#202024] text-neutral-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Store className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Retirada no Balcão
                    </h4>
                    <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                      Retire direto em nossa hamburgueria
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Endereço de entrega */}
          {deliveryType === 'delivery' ? (
            <div>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-2.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Endereço de Entrega
              </h3>

              {!isAddingNewAddress && currentAddress ? (
                <div
                  className={`border rounded-2xl p-4 space-y-3 ${
                    isDark ? 'bg-[#151518] border-white/5' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Endereço Selecionado
                        </span>
                        <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          {currentAddress.street}, {currentAddress.number}
                          {currentAddress.complement ? ` - ${currentAddress.complement}` : ''}
                        </p>
                        <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                          {currentAddress.neighborhood} - {currentAddress.city}
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
                    <span>Adicionar outro endereço</span>
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSaveNewAddress}
                  className={`border rounded-2xl p-4 space-y-2.5 ${
                    isDark ? 'bg-[#151518] border-white/5' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className={`text-xs font-bold block mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Novo Endereço de Entrega
                  </span>
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
                    placeholder="Complemento / Ponto de referência (opcional)"
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
                    {deliveryZones.map((zone) => (
                      <option key={zone.id} value={zone.neighborhood}>
                        {zone.neighborhood} (+ {formatCurrency(zone.fee)})
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-500 text-neutral-950 text-xs font-bold py-2 rounded-xl"
                    >
                      Salvar Endereço
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className={`px-3 text-xs rounded-xl border ${
                        isDark ? 'border-white/10 text-neutral-400' : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div
              className={`border rounded-2xl p-4 flex items-center gap-3 ${
                isDark ? 'bg-[#151518] border-white/5' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Store className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Retirada no Balcão
                </h4>
                <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                  {storeSettings.address}
                </p>
              </div>
            </div>
          )}

          {/* Formas de pagamento */}
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider mb-2.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Forma de Pagamento
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
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'pix'
                          ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]'
                          : 'border-neutral-500'
                      }`}
                    >
                      {paymentMethod === 'pix' && '✓'}
                    </div>
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      PIX
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    Aprovação Imediata
                  </span>
                </div>

                {paymentMethod === 'pix' && (
                  <div className={`mt-2.5 pt-2.5 border-t space-y-2 ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                    <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                      Copie a chave PIX abaixo ou pague pelo QR Code:
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex-1 font-mono text-[10px] truncate p-2 rounded-xl border ${
                          isDark ? 'bg-[#0A0A0B] border-white/5 text-neutral-400' : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        {pixKeyMock}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0"
                      >
                        {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Cartão de Crédito na Entrega */}
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
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'credit_card'
                        ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]'
                        : 'border-neutral-500'
                    }`}
                  >
                    {paymentMethod === 'credit_card' && '✓'}
                  </div>
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Cartão de Crédito (na maquininha)
                  </span>
                </div>
              </div>

              {/* Option 3: Cartão de Débito na Entrega */}
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
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'debit_card'
                        ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]'
                        : 'border-neutral-500'
                    }`}
                  >
                    {paymentMethod === 'debit_card' && '✓'}
                  </div>
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Cartão de Débito (na maquininha)
                  </span>
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
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'cash'
                          ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]'
                          : 'border-neutral-500'
                      }`}
                    >
                      {paymentMethod === 'cash' && '✓'}
                    </div>
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Dinheiro
                    </span>
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
                        className={`w-28 border rounded-lg px-2 py-1 text-xs ${
                          isDark ? 'bg-[#0e0e11] border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Option 5: Pagar na Entrega */}
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
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'on_delivery'
                        ? 'border-amber-500 bg-amber-500 text-black font-black text-[9px]'
                        : 'border-neutral-500'
                    }`}
                  >
                    {paymentMethod === 'on_delivery' && '✓'}
                  </div>
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Pagar na Entrega / Retirada
                  </span>
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
              placeholder="Ex: Tocar interfone 42, deixar na portaria..."
              className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 ${
                isDark
                  ? 'bg-[#151518] border-white/10 text-white placeholder-neutral-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* Resumo de Valores */}
          <div
            className={`border rounded-2xl p-4 space-y-2 text-xs ${
              isDark ? 'bg-[#151518] border-white/5' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className={`flex justify-between ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
              <span>Subtotal</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(cartTotals.subtotal)}
              </span>
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

        {/* Sticky Bottom Action */}
        <div className={`p-4 border-t ${isDark ? 'border-white/10 bg-[#0e0e11]' : 'border-gray-200 bg-white'}`}>
          <button
            id="confirm-order-btn"
            type="button"
            onClick={handleConfirmOrder}
            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition-transform active:scale-[0.98]"
          >
            <span>Confirmar e Enviar Pedido</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
