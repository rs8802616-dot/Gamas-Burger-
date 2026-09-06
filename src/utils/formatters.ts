import { Order } from '../types';

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const playOrderNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play pleasant chime
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playNote(587.33, 0, 0.15); // D5
    playNote(880, 0.12, 0.25); // A5
    playNote(1174.66, 0.25, 0.4); // D6
  } catch {
    // Audio might be blocked if user hasn't interacted yet
  }
};

export const generateWhatsAppLink = (phone: string, message: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
};

export const getStatusBadgeInfo = (status: Order['status'], deliveryType: 'delivery' | 'pickup' = 'delivery') => {
  switch (status) {
    case 'received':
      return {
        label: 'Pedido recebido',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        dot: 'bg-blue-400',
      };
    case 'preparing':
      return {
        label: 'Em preparação',
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400 animate-pulse',
      };
    case 'ready':
      return {
        label: deliveryType === 'pickup' ? 'Pronto para retirada' : 'Pedido pronto',
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'out_for_delivery':
      return {
        label: 'Saiu para entrega',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        dot: 'bg-purple-400',
      };
    case 'delivered':
      return {
        label: deliveryType === 'pickup' ? 'Retirado' : 'Entregue',
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'cancelled':
      return {
        label: 'Cancelado',
        color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400',
      };
  }
};
