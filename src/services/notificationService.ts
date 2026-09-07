import { AppNotification, Order, OrderStatus } from '../types';
import { playOrderNotificationSound } from '../utils/formatters';

const STORAGE_KEYS = {
  NOTIFICATIONS: 'burger10_notifications_v1',
  PERMISSION_STATE: 'burger10_notification_permission_v1',
  PROMO_OPT_IN: 'burger10_promo_opt_in_v1',
};

// Initial seed notifications demonstrating system & promos
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: '🍔 Bem-vindo à Burger10!',
    message: 'Aproveite nosso cardápio artesanal com ingredientes frescos e carnes no ponto certo.',
    type: 'system',
    createdAt: 'Hoje, 19:00',
    read: false,
    ctaLabel: 'Ver Cardápio',
    ctaAction: 'menu',
  },
  {
    id: 'notif-promo-1',
    title: '🔥 OFERTA DO DIA: Combo Família',
    message: 'Hoje o Combo Família está com R$ 25 de desconto! 2 Burgers artesanais + Batata Grande + Bebida.',
    type: 'promo',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
    createdAt: 'Hoje, 18:30',
    read: false,
    ctaLabel: 'Pedir com Desconto',
    ctaAction: 'prod-combo-familia',
    targetAudience: 'all',
  },
];

export class NotificationService {
  private static listeners: Array<(notification: AppNotification) => void> = [];

  public static getNotifications(): AppNotification[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public static saveNotifications(list: AppNotification[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    } catch {
      // Storage quota or error fallback
    }
  }

  public static hasPermission(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEYS.PERMISSION_STATE);
    if (stored === 'granted') return true;
    if ('Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  public static isPromotionsOptedIn(): boolean {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem(STORAGE_KEYS.PROMO_OPT_IN);
    return val !== 'false'; // Defaults to true
  }

  public static isMarketingConsentGranted(): boolean {
    return this.isPromotionsOptedIn();
  }

  public static setPromotionsOptIn(optIn: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROMO_OPT_IN, optIn ? 'true' : 'false');
  }

  public static setMarketingConsent(optIn: boolean) {
    this.setPromotionsOptIn(optIn);
  }

  public static getPermissionState(): 'granted' | 'denied' | 'default' {
    if (typeof window === 'undefined') return 'default';
    const stored = localStorage.getItem(STORAGE_KEYS.PERMISSION_STATE);
    if (stored === 'granted' || stored === 'denied') return stored;
    if ('Notification' in window) {
      return Notification.permission as 'granted' | 'denied' | 'default';
    }
    return 'default';
  }

  public static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check Native browser Notification API
    if ('Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        const granted = res === 'granted';
        localStorage.setItem(STORAGE_KEYS.PERMISSION_STATE, granted ? 'granted' : 'denied');
        return granted;
      } catch {
        // Fallback for browsers with restricted notification API in sandboxes
      }
    }

    // Fallback: Enable in-app simulated push notifications
    localStorage.setItem(STORAGE_KEYS.PERMISSION_STATE, 'granted');
    return true;
  }

  public static subscribe(listener: (notification: AppNotification) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public static notify(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: `Hoje, ${timeStr}`,
      read: false,
    };

    // Save to stored list
    const current = this.getNotifications();
    this.saveNotifications([newNotif, ...current]);

    // Play chime sound
    playOrderNotificationSound();

    // Trigger browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotif.title, {
          body: newNotif.message,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
        });
      } catch {
        // Browser context restriction fallback
      }
    }

    // Trigger in-app listeners asynchronously to prevent React render-cycle / setState conflicts
    setTimeout(() => {
      this.listeners.forEach((listener) => {
        try {
          listener(newNotif);
        } catch (err) {
          console.error('Error in notification listener:', err);
        }
      });
    }, 0);

    return newNotif;
  }

  // Order status transition triggers
  public static triggerOrderStatusNotification(order: Order, status: OrderStatus) {
    let title = '';
    let message = '';

    switch (status) {
      case 'received':
        title = `🍔 Pedido Recebido (#${order.orderNumber})`;
        message = `Seu pedido foi recebido com sucesso e já está sendo verificado pela nossa equipe!`;
        break;
      case 'preparing':
        title = `👨‍🍳 Pedido em Preparação (#${order.orderNumber})`;
        message = `O hambúrguer está na chapa! Seu pedido está sendo preparado pela nossa cozinha com todo capricho.`;
        break;
      case 'ready':
        if (order.deliveryType === 'delivery') {
          title = `🛵 Saiu para Entrega (#${order.orderNumber})`;
          message = `Seu pedido está prontinho e saiu para entrega! Nosso entregador já está a caminho.`;
        } else {
          title = `📦 Pedido Pronto (#${order.orderNumber})`;
          message = `Seu pedido está pronto para retirada no balcão! Venha buscar enquanto está quentinho.`;
        }
        break;
      case 'delivered':
        title = `✅ Pedido Entregue (#${order.orderNumber})`;
        message = `Pedido entregue. Bom apetite e muito obrigado pela preferência! ❤️`;
        break;
      default:
        return;
    }

    this.notify({
      title,
      message,
      type: 'order_status',
      orderId: order.id,
      ctaLabel: 'Acompanhar Pedido',
      ctaAction: order.id,
    });
  }

  // Promotional push campaign trigger with customer segmentation (Requirements 31, 32, 35)
  public static sendPromotionalBroadcast(
    title: string,
    message: string,
    imageUrl?: string,
    ctaLabel: string = 'PEDIR AGORA',
    ctaAction: string = 'menu',
    targetAudience: AppNotification['targetAudience'] = 'all',
    customerContext?: {
      ordersCount: number;
      isPWAInstalled?: boolean;
      loyaltyTier?: 'bronze' | 'silver' | 'gold';
    }
  ) {
    const isPromoOptedIn = this.isPromotionsOptedIn();

    // Check audience segmentation criteria
    if (targetAudience === 'promo_opt_in' && !isPromoOptedIn) {
      return null;
    }

    if (customerContext) {
      if (targetAudience === 'past_buyers' && customerContext.ordersCount === 0) {
        return null;
      }
      if (targetAudience === 'loyal_customers' && customerContext.ordersCount < 3) {
        return null;
      }
      if (targetAudience === 'pwa_installed' && !customerContext.isPWAInstalled) {
        return null;
      }
    }

    return this.notify({
      title,
      message,
      type: 'promo',
      imageUrl,
      ctaLabel,
      ctaAction,
      targetAudience,
    });
  }
}
