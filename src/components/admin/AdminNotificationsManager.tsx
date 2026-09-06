import React, { useState } from 'react';
import {
  Bell,
  Send,
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Smartphone,
  ExternalLink,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AppNotification } from '../../types';

export const AdminNotificationsManager: React.FC = () => {
  const { sendBroadcastNotification } = useStore();

  const [title, setTitle] = useState('🔥 OFERTA ESPECIAL DE HOJE!');
  const [message, setMessage] = useState(
    'Hoje o Combo Especial Burger10 está com 20% de desconto! 2 Burgers Artesanais + Batata Rústica + 2 Bebidas.'
  );
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80'
  );
  const [ctaLabel, setCtaLabel] = useState('PEDIR AGORA');
  const [ctaAction, setCtaAction] = useState('menu');
  const [targetAudience, setTargetAudience] =
    useState<AppNotification['targetAudience']>('all');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // History of sent campaign notifications
  const [sentHistory, setSentHistory] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      audience: string;
      date: string;
      status: 'sent' | 'scheduled';
      clicks: number;
    }>
  >([
    {
      id: 'h-1',
      title: '🔥 Quarta do Smash Burger: Compre 1 Leve 2',
      message: 'Só hoje no app! Peça seu Smash Burger com queijo duplo e ganhe outro.',
      audience: 'Clientes que autorizaram promoções',
      date: 'Ontem, 19:30',
      status: 'sent',
      clicks: 48,
    },
    {
      id: 'h-2',
      title: '🎁 Cupom VIP: R$ 15 OFF para Clientes Fiéis',
      message: 'Você acumulou 5 pedidos conosco! Use o cupom VIP15 no checkout.',
      audience: 'Clientes Fiéis (3+ pedidos)',
      date: 'Há 3 dias',
      status: 'sent',
      clicks: 34,
    },
  ]);

  const handleSendNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    // Send via StoreContext & NotificationService
    const result = sendBroadcastNotification(
      title,
      message,
      imageUrl.trim() ? imageUrl : undefined,
      ctaLabel,
      ctaAction,
      targetAudience
    );

    const audienceLabels: Record<string, string> = {
      all: 'Todos os clientes',
      past_buyers: 'Clientes que já compraram',
      loyal_customers: 'Clientes Fiéis (3+ pedidos)',
      promo_opt_in: 'Clientes que autorizaram promoções',
      pwa_installed: 'Clientes com App PWA instalado',
    };

    const newHistoryItem = {
      id: `camp-${Date.now()}`,
      title,
      message,
      audience: audienceLabels[targetAudience || 'all'] || 'Todos os clientes',
      date: 'Agora mesmo',
      status: 'sent' as const,
      clicks: 1,
    };

    setSentHistory([newHistoryItem, ...sentHistory]);
    setFeedbackMessage('✅ Notificação disparada com sucesso para o público selecionado!');

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleSchedule = () => {
    if (!scheduleTime) {
      alert('Por favor, selecione uma data e horário para agendamento.');
      return;
    }

    const audienceLabels: Record<string, string> = {
      all: 'Todos os clientes',
      past_buyers: 'Clientes que já compraram',
      loyal_customers: 'Clientes Fiéis (3+ pedidos)',
      promo_opt_in: 'Clientes que autorizaram promoções',
      pwa_installed: 'Clientes com App PWA instalado',
    };

    setSentHistory([
      {
        id: `camp-sched-${Date.now()}`,
        title,
        message,
        audience: audienceLabels[targetAudience || 'all'] || 'Todos os clientes',
        date: `Agendado para ${scheduleTime}`,
        status: 'scheduled',
        clicks: 0,
      },
      ...sentHistory,
    ]);

    setIsScheduled(false);
    setFeedbackMessage(`⏰ Notificação agendada para ${scheduleTime}!`);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-[#151518] to-amber-500/5 border border-amber-500/20 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Bell className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Marketing Direto & Relacionamento
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Central de Notificações Push & Campanhas
            </h2>
            <p className="text-xs text-white/50 mt-1 max-w-xl">
              Crie notificações promocionais para engajar seus clientes no celular, divulgar combos do dia e recuperar clientes inativos com respeito à privacidade.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0A0A0B] border border-white/5 p-3 rounded-2xl">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold">Taxa de Abertura PWA</p>
              <p className="text-sm font-black text-white">4.8x maior que e-mail</p>
            </div>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Grid: Create Campaign + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-[#151518] border border-white/5 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Criar Nova Notificação Promocional</span>
          </h3>

          <form onSubmit={handleSendNow} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-white/60 mb-1.5">
                Título da Notificação (Curto e Atraente)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: 🔥 OFERTA ESPECIAL DE HOJE!"
                required
                className="w-full bg-[#0A0A0B] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-white/60 mb-1.5">
                Mensagem
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Ex: Hoje o Combo Família está com preço especial. Aproveite!"
                required
                className="w-full bg-[#0A0A0B] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Image URL & Button Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/60 mb-1.5">
                  Imagem Opcional (URL)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 mb-1.5">
                  Texto do Botão (CTA)
                </label>
                <input
                  type="text"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="PEDIR AGORA"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Segmentation (Requirement 33) */}
            <div className="p-4 bg-[#0A0A0B] border border-white/5 rounded-2xl space-y-3">
              <label className="block text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Segmentação de Público-Alvo</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'all',
                    title: 'Todos os Clientes',
                    desc: 'Base completa cadastrada',
                  },
                  {
                    id: 'promo_opt_in',
                    title: 'Quem autorizou promoções',
                    desc: 'Respeita preferência LGPD',
                  },
                  {
                    id: 'loyal_customers',
                    title: 'Clientes Fiéis (3+ pedidos)',
                    desc: 'Clientes VIP e recorrentes',
                  },
                  {
                    id: 'pwa_installed',
                    title: 'Com Aplicativo Instalado',
                    desc: 'Usuários de PWA / Atalho',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                      targetAudience === item.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-[#151518] border-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="audience"
                      checked={targetAudience === item.id}
                      onChange={() =>
                        setTargetAudience(item.id as AppNotification['targetAudience'])
                      }
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <p className="text-xs font-bold">{item.title}</p>
                      <p className="text-[10px] text-white/40">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Schedule Option */}
            {isScheduled && (
              <div className="p-4 bg-[#0A0A0B] border border-amber-500/30 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-white">
                  Data e Horário de Envio
                </label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-[#151518] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-transform active:scale-98 shadow-lg shadow-amber-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Disparar Notificação Agora</span>
              </button>

              {!isScheduled ? (
                <button
                  type="button"
                  onClick={() => setIsScheduled(true)}
                  className="flex items-center gap-2 px-4 py-3.5 bg-[#0A0A0B] hover:bg-[#202024] text-white/70 hover:text-white border border-white/5 rounded-2xl text-xs font-bold transition-colors"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Agendar Envio</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSchedule}
                    className="px-4 py-3.5 bg-amber-500 text-black font-black rounded-2xl text-xs uppercase"
                  >
                    Confirmar Agendamento
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsScheduled(false)}
                    className="px-3 py-3.5 text-white/40 hover:text-white text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Live Smartphone Preview */}
        <div className="bg-[#151518] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-start text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/40 mb-3 block">
            Pré-visualização no Smartphone
          </span>

          {/* Smartphone Mock Frame */}
          <div className="w-full max-w-[280px] bg-[#0A0A0B] border-4 border-[#252528] rounded-[36px] p-3 shadow-2xl relative overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="w-16 h-3.5 bg-[#252528] rounded-full mx-auto mb-4" />

            {/* Notification Card */}
            <div className="bg-[#18181c] border border-amber-500/30 rounded-2xl p-3 text-left shadow-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-md bg-amber-500 text-black font-black text-[9px] flex items-center justify-center">
                  B10
                </div>
                <span className="text-[10px] font-bold text-white/80">BURGER10</span>
                <span className="text-[9px] text-white/40 ml-auto">Agora</span>
              </div>

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-24 object-cover rounded-xl mb-2 border border-white/5"
                />
              )}

              <h4 className="text-xs font-black text-white leading-snug">{title || 'Título'}</h4>
              <p className="text-[10px] text-white/70 line-clamp-2 mt-0.5 leading-snug">
                {message || 'Mensagem da notificação...'}
              </p>

              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                  {ctaLabel || 'PEDIR AGORA'}
                </span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </div>
            </div>

            {/* Home Screen Icons Sim */}
            <div className="mt-8 grid grid-cols-4 gap-2 opacity-20 px-2 pb-4">
              <div className="h-8 bg-white/20 rounded-xl" />
              <div className="h-8 bg-white/20 rounded-xl" />
              <div className="h-8 bg-white/20 rounded-xl" />
              <div className="h-8 bg-white/20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[#151518] border border-white/5 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Histórico de Disparos Recentes</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/40 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Campanha</th>
                <th className="pb-3">Público-Alvo</th>
                <th className="pb-3">Data/Hora</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Cliques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sentHistory.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="py-3">
                    <p className="font-bold text-white leading-tight">{item.title}</p>
                    <p className="text-[11px] text-white/50 truncate max-w-xs">{item.message}</p>
                  </td>
                  <td className="py-3 text-white/70">{item.audience}</td>
                  <td className="py-3 text-white/50">{item.date}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'sent'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.status === 'sent' ? 'Enviado' : 'Agendado'}
                    </span>
                  </td>
                  <td className="py-3 text-right font-black text-amber-400">{item.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
