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
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    
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

export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  if (cleaned.length <= 2) return cleaned.length > 0 ? `(${cleaned}` : '';
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

export const getCleanClientMenuUrl = (configuredUrl?: string): string => {
  // 1. If configured in Store Settings, use the custom public URL
  if (configuredUrl && configuredUrl.trim()) {
    let clean = configuredUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, '');
  }

  // 2. Check browser environment
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // When previewing in Google AI Studio Cloud Run or local dev, don't share the internal dev URL
    if (origin.includes('run.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'https://gamas-burger.vercel.app';
    }
    // If running directly on production (e.g. Vercel or custom domain)
    return origin.replace(/\/+$/, '');
  }

  return 'https://gamas-burger.vercel.app';
};

export const buildOrderWhatsAppMessage = (order: Order, storeName: string = 'Burger10 Hamburgueria'): string => {
  const lines: string[] = [
    `🍔 *NOVO PEDIDO #${order.orderNumber}*`,
    `🏪 *${storeName}*`,
    `📅 ${order.createdAt}`,
    ``,
    `👤 *Cliente:* ${order.customer.name}`,
    `📱 *WhatsApp:* ${order.customer.phone}`,
    ``,
    `🛒 *ITENS DO PEDIDO:*`,
  ];

  order.items.forEach((item) => {
    lines.push(`• *${item.quantity}x ${item.product.name}* (${formatCurrency(item.itemTotalPrice * item.quantity)})`);
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      const addonsStr = item.selectedAddons
        .map((a) => `+ ${a.addon?.name || 'Adicional'}${a.quantity > 1 ? ` (${a.quantity}x)` : ''}`)
        .join(', ');
      lines.push(`   └ ${addonsStr}`);
    }
    if (item.observation) {
      lines.push(`   └ Obs: _${item.observation}_`);
    }
  });

  lines.push(``);
  lines.push(`📦 *MODALIDADE:* ${order.deliveryType === 'delivery' ? '🛵 Entrega em Domicílio' : '🏪 Retirada no Balcão'}`);

  if (order.deliveryType === 'delivery' && order.address) {
    lines.push(`📍 *Endereço:* ${order.address.street}, ${order.address.number}`);
    if (order.address.complement) lines.push(`   Complemento: ${order.address.complement}`);
    lines.push(`   Bairro: ${order.address.neighborhood}`);
    if (order.address.reference) lines.push(`   Ponto de Referência: ${order.address.reference}`);
  }

  const paymentLabels: Record<string, string> = {
    pix: 'PIX (Chave enviada)',
    credit_card: 'Cartão de Crédito (na entrega/retirada)',
    debit_card: 'Cartão de Débito (na entrega/retirada)',
    cash: order.cashChangeFor ? `Dinheiro (Troco para ${formatCurrency(order.cashChangeFor)})` : 'Dinheiro (Sem troco)',
    on_delivery: 'Pagar na Entrega',
  };

  lines.push(``);
  lines.push(`💳 *Forma de Pagamento:* ${paymentLabels[order.paymentMethod] || order.paymentMethod}`);
  if (order.discount > 0) {
    lines.push(`🏷️ *Desconto:* - ${formatCurrency(order.discount)}`);
  }
  if (order.deliveryFee > 0) {
    lines.push(`🛵 *Taxa de Entrega:* ${formatCurrency(order.deliveryFee)}`);
  }
  lines.push(`💰 *VALOR TOTAL: ${formatCurrency(order.total)}*`);

  if (order.notes) {
    lines.push(``);
    lines.push(`📝 *Observações:* ${order.notes}`);
  }

  lines.push(``);
  lines.push(`👉 _Por favor, confirme o recebimento do meu pedido! Obrigado!_`);

  return lines.join('\n');
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
