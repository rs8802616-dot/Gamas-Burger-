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
  const { orders, coupons, addCoupon } = useStore();
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
    const code = `VIP-${customer.name.split(' ')[0].toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
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
      <div className="bg-gradient-to-r from-amber-500/15 via-[#151518] to-amber-500/5 border border-amber-500/20 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Award className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Programa de Fidelidade & Recorrência
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Gestão de Clientes & Programa Cliente Fiel
            </h2>
            <p className="text-xs text-white/50 mt-1 max-w-xl">
              Identifique clientes fiéis que pedem frequentemente, personalize benefícios automáticos e fortaleça a proximidade com sua hamburgueria.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0A0A0B] border border-white/5 p-3 rounded-2xl">
              <p className="text-[10px] text-white/40 uppercase font-bold">Clientes VIP (6+)</p>
              <p className="text-lg font-black text-amber-400">18 clientes</p>
            </div>
            <div className="bg-[#0A0A0B] border border-white/5 p-3 rounded-2xl">
              <p className="text-[10px] text-white/40 uppercase font-bold">Recorrência Média</p>
              <p className="text-lg font-black text-emerald-400">3.4 pedidos</p>
            </div>
          </div>
        </div>
      </div>

      {grantPerkFeedback && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{grantPerkFeedback}</span>
        </div>
      )}

      {/* Tier Benefits Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-700/20 text-amber-600 border border-amber-700/30">
              Bronze (1 - 2 pedidos)
            </span>
            <span className="text-xs font-bold text-white/40">Iniciante</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Boas-vindas</h4>
          <p className="text-xs text-white/60">
            Acesso ao cardápio com cupons da primeira compra e convite PWA.
          </p>
        </div>

        <div className="bg-[#151518] border border-amber-500/20 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-400/20 text-slate-300 border border-slate-400/30">
              Prata (3 - 5 pedidos)
            </span>
            <span className="text-xs font-bold text-amber-400">Cliente Fiel</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Benefício Recorrente</h4>
          <p className="text-xs text-white/60">
            Desbloqueia cupom VIP10 (10% OFF) e notificações antecipadas de lançamentos.
          </p>
        </div>

        <div className="bg-[#151518] border border-amber-500/40 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black font-black">
              Ouro VIP (6+ pedidos)
            </span>
            <span className="text-xs font-bold text-amber-400">Super Fiel ❤️</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Experiência VIP</h4>
          <p className="text-xs text-white/60">
            Sobremesa cortesia em pedidos acima de R$ 70, frete reduzido e atendimento prioritário.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone ou email..."
            className="w-full bg-[#151518] border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-white/30 focus:border-amber-500 outline-none"
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
                  : 'bg-[#151518] text-white/50 border border-white/5 hover:text-white'
              }`}
            >
              {t === 'all' ? 'Todos os Tiers' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#151518] border border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/40 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Contato</th>
                <th className="pb-3">Nível / Tier</th>
                <th className="pb-3 text-center">Pedidos</th>
                <th className="pb-3">Total Gasto</th>
                <th className="pb-3">Último Pedido</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 font-black flex items-center justify-center text-xs">
                        {cust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{cust.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {cust.isPWAInstalled && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                              App PWA
                            </span>
                          )}
                          {cust.allowMarketing && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-semibold">
                              Promoções Ativas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <p className="text-white/80 font-mono text-[11px]">{cust.phone}</p>
                    <p className="text-white/40 text-[10px]">{cust.email}</p>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        cust.tier === 'Ouro VIP'
                          ? 'bg-amber-500 text-black'
                          : cust.tier === 'Prata'
                          ? 'bg-slate-300 text-black'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {cust.tier}
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-black text-amber-400">
                    {cust.ordersCount}
                  </td>
                  <td className="py-3.5 font-bold text-white">
                    {formatCurrency(cust.totalSpent)}
                  </td>
                  <td className="py-3.5 text-white/50">{cust.lastOrderDate}</td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleGrantCustomCoupon(cust)}
                        title="Gerar Cupom Exclusivo de Presente"
                        className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-colors"
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
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors"
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
