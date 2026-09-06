import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  MessageCircle,
  Clock,
  HelpCircle,
  ChefHat,
  ShieldCheck,
  Check,
  Award,
  Sparkles,
  Bell,
  Smartphone,
  Gift,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, generateWhatsAppLink } from '../../utils/formatters';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { NotificationService } from '../../services/notificationService';

export const ProfileView: React.FC = () => {
  const {
    customer,
    updateCustomerProfile,
    deleteAddress,
    addAddress,
    deliveryZones,
    storeSettings,
    setCurrentView,
    orders,
    loyaltyTierInfo,
  } = useStore();

  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Marketing & Notifications State (Requirement 29, 31)
  const [marketingConsent, setMarketingConsent] = useState(
    NotificationService.isMarketingConsentGranted()
  );
  const [notifState, setNotifState] = useState(
    NotificationService.getPermissionState()
  );

  const totalCustomerOrders = loyaltyTierInfo.ordersCount;
  const isLoyalCustomer = totalCustomerOrders >= 3;
  const loyaltyTier = loyaltyTierInfo.tier;

  const handleToggleMarketing = () => {
    const nextVal = !marketingConsent;
    NotificationService.setMarketingConsent(nextVal);
    setMarketingConsent(nextVal);
  };

  const handleRequestNotif = async () => {
    const perm = await NotificationService.requestPermission();
    setNotifState(perm);
  };

  // New address inline form
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState(deliveryZones[0]?.neighborhood || 'Centro');
  const [complement, setComplement] = useState('');
  const [label, setLabel] = useState<'Casa' | 'Trabalho' | 'Outro'>('Casa');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({ name, phone, email });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !number) return;
    addAddress({
      label,
      street,
      number,
      complement,
      neighborhood,
      city: 'São Paulo/SP',
      zipCode: '01000-000',
    });
    setStreet('');
    setNumber('');
    setComplement('');
    setShowAddAddr(false);
  };

  return (
    <div className="space-y-6 pb-28">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Meu Perfil</h2>
        <p className="text-xs text-white/40 mt-0.5">
          Gerencie seus dados de contato, fidelidade e preferências de avisos
        </p>
      </div>

      {/* Cartão 1: PROGRAMA CLIENTE FIEL (Requirement 35) */}
      <div className="bg-gradient-to-br from-amber-500/20 via-[#151518] to-amber-500/5 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Programa Cliente Fiel</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black">
                  {loyaltyTier}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                🍔 Você já fez <strong className="text-amber-400 font-black">{totalCustomerOrders} pedidos</strong> conosco!
              </p>
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex justify-between text-[11px] font-bold text-white/60 mb-1.5">
            <span>Progresso da Fidelidade</span>
            <span className="text-amber-400">
              {totalCustomerOrders >= 6 ? 'Nível Máximo VIP alcançado!' : `${totalCustomerOrders}/6 pedidos para Ouro VIP`}
            </span>
          </div>
          <div className="w-full bg-[#0A0A0B] h-2.5 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalCustomerOrders / 6) * 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center gap-2 bg-[#0A0A0B]/80 rounded-2xl p-3 border border-white/5">
            <Gift className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-white/80">
              Benefício atual:{' '}
              <strong className="text-amber-300">
                {loyaltyTier === 'Ouro VIP'
                  ? '15% OFF em combos + Sobremesa cortesia'
                  : loyaltyTier === 'Prata'
                  ? 'Cupom VIP10 (10% OFF)'
                  : 'Acumule 3 pedidos para desbloquear cupom de 10% OFF'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Cartão 2: APLICATIVO & NOTIFICAÇÕES (Requirements 28, 29, 31) */}
      <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-amber-500" />
          <span>Aplicativo no Celular & Notificações</span>
        </h3>

        {/* PWA Install Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#0A0A0B] border border-white/5 rounded-2xl">
          <div>
            <p className="text-xs font-bold text-white">Instalar App Burger10 no Celular</p>
            <p className="text-[11px] text-white/40">
              Acesso rápido com 1 toque na tela inicial, sem gastar memória da loja de apps.
            </p>
          </div>
          <PWAInstallButton />
        </div>

        {/* Operational Notifications */}
        <div className="flex items-center justify-between gap-3 p-3.5 bg-[#0A0A0B] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Avisos de Pedido (Status em Tempo Real)</p>
              <p className="text-[11px] text-white/40">
                {notifState === 'granted'
                  ? 'Ativado: você será avisado quando o pedido estiver pronto ou sair para entrega.'
                  : 'Receba alertas instantâneos quando o burger for preparado.'}
              </p>
            </div>
          </div>

          {notifState !== 'granted' ? (
            <button
              onClick={handleRequestNotif}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-transform active:scale-95 shrink-0"
            >
              Ativar
            </button>
          ) : (
            <span className="text-[10px] font-black uppercase text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              Ativo ✓
            </span>
          )}
        </div>

        {/* Marketing / Promotions Opt-In (Requirement 31: Escolha separada) */}
        <div className="flex items-center justify-between gap-3 p-3.5 bg-[#0A0A0B] border border-white/5 rounded-2xl">
          <div>
            <p className="text-xs font-bold text-white">Ofertas & Cupons Especiais</p>
            <p className="text-[11px] text-white/40">
              Desejo receber novidades e cupons com desconto pelo aplicativo (Sim / Não)
            </p>
          </div>

          <button
            onClick={handleToggleMarketing}
            className={`p-1 rounded-xl transition-colors ${
              marketingConsent ? 'text-amber-500' : 'text-white/30 hover:text-white/50'
            }`}
            title={marketingConsent ? 'Promoções ativadas' : 'Promoções desativadas'}
          >
            {marketingConsent ? (
              <ToggleRight className="w-8 h-8" />
            ) : (
              <ToggleLeft className="w-8 h-8" />
            )}
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-[#151518] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg"
      >
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-500" />
          <span>Informações Pessoais</span>
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                WhatsApp / Celular
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
          >
            Salvar Alterações
          </button>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Atualizado com sucesso!
            </span>
          )}
        </div>
      </form>

      {/* Saved Addresses */}
      <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Endereços Salvos</span>
          </h3>

          {!showAddAddr && (
            <button
              onClick={() => setShowAddAddr(true)}
              className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          )}
        </div>

        {showAddAddr && (
          <form onSubmit={handleAddNewAddress} className="bg-[#0A0A0B] p-4 rounded-2xl border border-white/5 space-y-3">
            <div className="flex gap-2">
              {(['Casa', 'Trabalho', 'Outro'] as const).map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setLabel(lbl)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-bold ${
                    label === lbl
                      ? 'bg-amber-500 text-black border-amber-500'
                      : 'bg-[#151518] border-white/5 text-white/60'
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
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className="col-span-2 bg-[#151518] border border-white/5 rounded-2xl px-3.5 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Nº"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                className="bg-[#151518] border border-white/5 rounded-2xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Complemento (Apto, bloco)"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className="bg-[#151518] border border-white/5 rounded-2xl px-3.5 py-2 text-xs text-white"
              />
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="bg-[#151518] border border-white/5 rounded-2xl px-3.5 py-2 text-xs text-white"
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
                className="bg-amber-500 text-black font-black px-4 py-2 rounded-xl text-xs"
              >
                Salvar Endereço
              </button>
              <button
                type="button"
                onClick={() => setShowAddAddr(false)}
                className="bg-[#151518] text-white/50 font-bold px-4 py-2 rounded-xl text-xs border border-white/5"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2.5">
          {customer.addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <span>{addr.label === 'Casa' ? '🏠' : addr.label === 'Trabalho' ? '💼' : '📍'}</span>
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

              {customer.addresses.length > 1 && (
                <button
                  onClick={() => deleteAddress(addr.id)}
                  title="Excluir endereço"
                  className="text-white/30 hover:text-red-400 p-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info & WhatsApp */}
      <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Informações da Loja</span>
        </h3>

        <div className="space-y-2.5 text-xs text-white/70">
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Horário de funcionamento:</span>
            <span className="font-bold text-white">{storeSettings.openingHours}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Endereço da Loja:</span>
            <span className="font-medium text-white">{storeSettings.address}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-white/40">Tempo médio de entrega:</span>
            <span className="font-bold text-amber-500">{storeSettings.deliveryTimeEstimate}</span>
          </div>
        </div>

        <a
          href={generateWhatsAppLink(storeSettings.whatsapp, 'Olá! Gostaria de tirar uma dúvida.')}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          <span>FALAR CONOSCO NO WHATSAPP</span>
        </a>
      </div>

      {/* Área da Equipe & Gestão (Discreta) */}
      <div className="pt-2 text-center">
        <details className="group">
          <summary className="cursor-pointer text-[11px] text-white/30 hover:text-white/60 transition-colors list-none inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/5 hover:bg-white/10 select-none">
            <ShieldCheck className="w-3 h-3 text-amber-500/70" />
            <span>Acesso da Equipe (Admin & Cozinha)</span>
          </summary>
          <div className="mt-3 p-4 bg-[#151518] border border-white/5 rounded-2xl max-w-sm mx-auto space-y-2.5 shadow-lg">
            <p className="text-[10px] text-white/40 text-left">
              Acesso exclusivo para gerentes, chapeiros e operadores de caixa.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setCurrentView('kitchen')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl text-xs font-bold hover:bg-orange-500/20 transition-colors"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Cozinha KDS</span>
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Painel Admin</span>
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};
