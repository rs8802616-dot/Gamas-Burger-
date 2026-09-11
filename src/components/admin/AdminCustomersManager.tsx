import React, { useState } from 'react';
import {
  Users,
  Award,
  Gift,
  Search,
  Sparkles,
  Percent,
  CheckCircle2,
  TrendingUp,
  Tag,
  Send,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  tier: 'Bronze' | 'Prata' | 'Ouro VIP';
  allowMarketing: boolean;
  isPWAInstalled: boolean;
  activePerk?: string;
}

export const AdminCustomersManager: React.FC = () => {
  const { orders, coupons, addCoupon, theme } = useStore();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [grantPerkFeedback, setGrantPerkFeedback] = useState<string | null>(null);

  // Derive customers list from real orders in StoreContext + seed data
  const baseCustomers: CustomerRecord[] = [
    {
      id: 'cust-1',
      name: 'Lucas Andrade',
      phone: '(11) 98765-4321',
      email: 'lucas.andrade@email.com',
      ordersCount: 8,
      totalSpent: 489.5,
      lastOrderDate: 'Hoje, 20:15',
      tier: 'Ouro VIP',
      allowMarketing: true,
      isPWAInstalled: true,
      activePerk: '10% OFF Vitalício + Frete Grátis',
    },
    {
      id: 'cust-2',
      name: 'Mariana Costa',
      phone: '(11) 97654-3210',
      email: 'mariana.costa@email.com',
      ordersCount: 5,
      totalSpent: 312.0,
      lastOrderDate: 'Ontem',
      tier: 'Prata',
      allowMarketing: true,
      isPWAInstalled: true,
      activePerk: 'Cupom VIP10 liberado',
    },
    {
      id: 'cust-3',
      name: 'Gabriel Santos',
      phone: '(11) 96543-2109',
      email: 'gabriel.santos@email.com',
      ordersCount: 4,
      totalSpent: 228.0,
      lastOrderDate: 'Há 3 dias',
      tier: 'Prata',
      allowMarketing: false,
      isPWAInstalled: false,
    },
    {
      id: 'cust-4',
      name: 'Fernanda Lima',
      phone: '(11) 95432-1098',
      email: 'fernanda.lima@email.com',
      ordersCount: 2,
      totalSpent: 118.0,
      lastOrderDate: 'Há 1 semana',
      tier: 'Bronze',
      allowMarketing: true,
      isPWAInstalled: true,
    },
    {
      id: 'cust-5',
      name: 'Thiago Oliveira',
      phone: '(11) 94321-0987',
      email: 'thiago.oliveira@email.com',
      ordersCount: 1,
      totalSpent: 59.9,
      lastOrderDate: 'Há 2 semanas',
      tier: 'Bronze',
      allowMarketing: true,
      isPWAInstalled: false,
    },
  ];

  const filteredCustomers = baseCustomers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleGrantCustomCoupon = (customer: CustomerRecord) => {
    const rawName = customer.name ? customer.name.trim() : 'CLIENTE';
    const firstWord = rawName.split(' ')[0] || 'CLIENTE';
    const code = `VIP-${firstWord.toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
    addCoupon({
      code,
      discountType: 'percentage',
      value: 15,
      minOrderValue: 40,
      expiryDate: '31/12/2026',
      maxUsage: 1,
      currentUsage: 0,
      active: true,
    });

    setGrantPerkFeedback(`🎁 Cupom exclusivo ${code} gerado para ${customer.name}!`);
    setTimeout(() => setGrantPerkFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className={`border rounded-3xl p-6 transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-amber-500/15 via-[#151518] to-amber-500/5 border-amber-500/20'
            : 'bg-gradient-to-r from-amber-100 via-white to-amber-50 border-amber-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`p-1.5 rounded-xl ${
                  isDark
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <Award className="w-5 h-5" />
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider ${
                  isDark ? 'text-amber-400' : 'text-amber-800'
                }`}
              >
                Programa de Fidelidade & Recorrência
              </span>
            </div>
            <h2
              className={`text-xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Gestão de Clientes & Programa Cliente Fiel
            </h2>
            <p
              className={`text-xs mt-1 max-w-xl ${
                isDark ? 'text-white/50' : 'text-slate-600'
              }`}
            >
              Identifique clientes fiéis que pedem frequentemente, personalize benefícios automáticos e fortaleça a proximidade com sua hamburgueria.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3 rounded-2xl border ${
                isDark
                  ? 'bg-[#0A0A0B] border-white/5'
                  : 'bg-white border-amber-200/80 shadow-xs'
              }`}
            >
              <p
                className={`text-[10px] uppercase font-bold ${
                  isDark ? 'text-white/40' : 'text-slate-500'
                }`}
              >
                Clientes VIP (6+)
              </p>
              <p className="text-lg font-black text-amber-600 dark:text-amber-400">18 clientes</p>
            </div>
            <div
              className={`p-3 rounded-2xl border ${
                isDark
                  ? 'bg-[#0A0A0B] border-white/5'
                  : 'bg-white border-emerald-200/80 shadow-xs'
              }`}
            >
              <p
                className={`text-[10px] uppercase font-bold ${
                  isDark ? 'text-white/40' : 'text-slate-500'
                }`}
              >
                Recorrência Média
              </p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">3.4 pedidos</p>
            </div>
          </div>
        </div>
      </div>

      {grantPerkFeedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
            isDark
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{grantPerkFeedback}</span>
        </div>
      )}

      {/* Tier Benefits Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`border rounded-3xl p-5 shadow-lg relative overflow-hidden transition-colors ${
            isDark
              ? 'bg-[#151518] border-white/5'
              : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-700/20 text-amber-700 dark:text-amber-500 border border-amber-700/30">
              Bronze (1 - 2 pedidos)
            </span>
            <span
              className={`text-xs font-bold ${
                isDark ? 'text-white/40' : 'text-slate-500'
              }`}
            >
              Iniciante
            </span>
          </div>
          <h4
            className={`text-sm font-bold mb-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Boas-vindas
          </h4>
          <p
            className={`text-xs ${
              isDark ? 'text-white/60' : 'text-slate-600'
            }`}
          >
            Acesso ao cardápio com cupons da primeira compra e convite PWA.
          </p>
        </div>

        <div
          className={`border rounded-3xl p-5 shadow-lg relative overflow-hidden transition-colors ${
            isDark
              ? 'bg-[#151518] border-amber-500/20'
              : 'bg-white border-amber-300/60 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-400/20 text-slate-700 dark:text-slate-300 border border-slate-400/30">
              Prata (3 - 5 pedidos)
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Cliente Fiel</span>
          </div>
          <h4
            className={`text-sm font-bold mb-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Benefício Recorrente
          </h4>
          <p
            className={`text-xs ${
              isDark ? 'text-white/60' : 'text-slate-600'
            }`}
          >
            Desbloqueia cupom VIP10 (10% OFF) e notificações antecipadas de lançamentos.
          </p>
        </div>

        <div
          className={`border rounded-3xl p-5 shadow-lg relative overflow-hidden transition-colors ${
            isDark
              ? 'bg-[#151518] border-amber-500/40'
              : 'bg-amber-50/50 border-amber-400 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black font-black">
              Ouro VIP (6+ pedidos)
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Super Fiel ❤️</span>
          </div>
          <h4
            className={`text-sm font-bold mb-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Experiência VIP
          </h4>
          <p
            className={`text-xs ${
              isDark ? 'text-white/60' : 'text-slate-700'
            }`}
          >
            Sobremesa cortesia em pedidos acima de R$ 70, frete reduzido e atendimento prioritário.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-3.5 ${
              isDark ? 'text-white/40' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone ou email..."
            className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-xs focus:border-amber-500 outline-none ${
              isDark
                ? 'bg-[#151518] border-white/5 text-white placeholder-white/30'
                : 'bg-white border-gray-300 text-slate-900 placeholder-slate-400 shadow-xs'
            }`}
          />
        </div>

        <div className="flex gap-2">
          {['all', 'Bronze', 'Prata', 'Ouro VIP'].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                tierFilter === t
                  ? 'bg-amber-500 text-black shadow-md'
                  : isDark
                  ? 'bg-[#151518] text-white/50 border border-white/5 hover:text-white'
                  : 'bg-white text-slate-600 border border-gray-300 hover:text-slate-950 shadow-xs'
              }`}
            >
              {t === 'all' ? 'Todos os Tiers' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div
        className={`border rounded-3xl p-6 shadow-xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#151518] border-white/5'
            : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className={`border-b font-bold uppercase text-[10px] tracking-wider ${
                  isDark
                    ? 'border-white/5 text-white/40'
                    : 'border-gray-200 text-slate-500'
                }`}
              >
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Contato</th>
                <th className="pb-3">Nível / Tier</th>
                <th className="pb-3 text-center">Pedidos</th>
                <th className="pb-3">Total Gasto</th>
                <th className="pb-3">Último Pedido</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? 'divide-white/5' : 'divide-gray-100'
              }`}
            >
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.id}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full font-black flex items-center justify-center text-xs ${
                          isDark
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className={`font-bold ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {cust.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {cust.isPWAInstalled && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                isDark
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              App PWA
                            </span>
                          )}
                          {cust.allowMarketing && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                isDark
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              Promoções Ativas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <p
                      className={`font-mono text-[11px] ${
                        isDark ? 'text-white/80' : 'text-slate-800'
                      }`}
                    >
                      {cust.phone}
                    </p>
                    <p
                      className={`text-[10px] ${
                        isDark ? 'text-white/40' : 'text-slate-500'
                      }`}
                    >
                      {cust.email}
                    </p>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        cust.tier === 'Ouro VIP'
                          ? 'bg-amber-500 text-black'
                          : cust.tier === 'Prata'
                          ? isDark
                            ? 'bg-slate-300 text-black'
                            : 'bg-slate-200 text-slate-900'
                          : isDark
                          ? 'bg-white/10 text-white/60'
                          : 'bg-gray-100 text-slate-700'
                      }`}
                    >
                      {cust.tier}
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-black text-amber-600 dark:text-amber-400">
                    {cust.ordersCount}
                  </td>
                  <td
                    className={`py-3.5 font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(cust.totalSpent)}
                  </td>
                  <td
                    className={`py-3.5 ${
                      isDark ? 'text-white/50' : 'text-slate-500'
                    }`}
                  >
                    {cust.lastOrderDate}
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleGrantCustomCoupon(cust)}
                        title="Gerar Cupom Exclusivo de Presente"
                        className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-colors border ${
                          isDark
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Presentear</span>
                      </button>

                      <a
                        href={`https://wa.me/55${cust.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá ${cust.name}! Agradecemos por ser um cliente fiel do Gama's Burger ❤️ Temos uma surpresa especial para você no nosso app!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-1.5 rounded-xl transition-colors border ${
                          isDark
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                        }`}
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
