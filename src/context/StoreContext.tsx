import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Product,
  Category,
  Combo,
  AddonOption,
  CartItem,
  Coupon,
  Order,
  OrderStatus,
  CustomerInfo,
  CustomerAddress,
  DeliveryZone,
  StoreSettings,
  SelectedAddon,
  AppNotification,
  AppTheme,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ADDONS,
  INITIAL_COMBOS,
  INITIAL_COUPONS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_SETTINGS,
  INITIAL_CUSTOMER,
  INITIAL_ORDERS,
} from '../data/initialData';
import { playOrderNotificationSound } from '../utils/formatters';
import { NotificationService } from '../services/notificationService';
import { firebaseService, getOrderTimestamp } from '../services/firebase';

interface StoreContextType {
  // Navigation & UI State
  currentView: 'client' | 'kitchen' | 'admin';
  setCurrentView: (view: 'client' | 'kitchen' | 'admin') => void;
  clientTab: 'home' | 'menu' | 'cart' | 'orders' | 'favorites' | 'profile';
  setClientTab: (tab: 'home' | 'menu' | 'cart' | 'orders' | 'favorites' | 'profile') => void;
  adminTab:
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'categories'
    | 'coupons'
    | 'delivery'
    | 'notifications'
    | 'customers'
    | 'settings';
  setAdminTab: (
    tab:
      | 'dashboard'
      | 'orders'
      | 'products'
      | 'categories'
      | 'coupons'
      | 'delivery'
      | 'notifications'
      | 'customers'
      | 'settings'
  ) => void;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  adminLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;
  thermalReceiptOrder: Order | null;
  setThermalReceiptOrder: (order: Order | null) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;

  // Data
  products: Product[];
  categories: Category[];
  combos: Combo[];
  addons: AddonOption[];
  coupons: Coupon[];
  deliveryZones: DeliveryZone[];
  storeSettings: StoreSettings;
  orders: Order[];
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  favorites: string[];
  customer: CustomerInfo;
  clientOrderIds: string[];
  selectedDeliveryZone: DeliveryZone;
  setSelectedDeliveryZone: (zone: DeliveryZone) => void;

  // Cart operations
  addToCart: (
    product: Product,
    quantity: number,
    selectedAddons: SelectedAddon[],
    observation: string
  ) => void;
  updateCartItemQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  reorder: (previousOrder: Order) => void;

  // Checkout & Orders
  cartTotals: {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
  };
  placeOrder: (options: {
    deliveryType: 'delivery' | 'pickup';
    address?: CustomerAddress;
    paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'on_delivery';
    cashChangeFor?: number;
    notes?: string;
    customerInfo?: {
      name: string;
      phone: string;
      email?: string;
    };
  }) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  printThermalReceipt: (order: Order) => void;
  refreshOrders: () => Promise<void>;
  isServerConnected: boolean;

  simulateIncomingOrder: () => void;
  sendBroadcastNotification: (
    title: string,
    message: string,
    imageUrl?: string,
    ctaLabel?: string,
    ctaAction?: string,
    targetAudience?: AppNotification['targetAudience']
  ) => AppNotification | null;

  // Customer & Favorites
  loyaltyTierInfo: {
    tier: 'Bronze' | 'Prata' | 'Ouro VIP';
    tierId: 'bronze' | 'silver' | 'gold';
    ordersCount: number;
    ordersNeededForNext: number;
    discountPercent: number;
    perk: string;
  };
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  updateCustomer: (info: Partial<CustomerInfo>) => void;
  updateCustomerProfile: (info: Partial<CustomerInfo>) => void;
  addAddress: (address: Omit<CustomerAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;

  // Admin CRUD
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  addCombo: (combo: Omit<Combo, 'id'>) => void;
  updateCombo: (id: string, combo: Partial<Combo>) => void;
  deleteCombo: (id: string) => void;
  addDeliveryZone: (neighborhood: string, fee: number) => void;
  updateDeliveryZoneFee: (id: string, fee: number) => void;
  deleteDeliveryZone: (id: string) => void;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'burger10_products_v1',
  CATEGORIES: 'burger10_categories_v1',
  COMBOS: 'burger10_combos_v1',
  ADDONS: 'burger10_addons_v1',
  COUPONS: 'burger10_coupons_v1',
  ZONES: 'burger10_zones_v1',
  SETTINGS: 'burger10_settings_v1',
  ORDERS: 'burger10_orders_v1',
  FAVORITES: 'gamas_burger_favorites_v2',
  CUSTOMER: 'burger10_customer_v1',
};

// Status hierarchy priority to prevent polling race condition regressions
const STATUS_RANK: Record<string, number> = {
  received: 10,
  preparing: 20,
  ready: 30,
  out_for_delivery: 40,
  delivered: 50,
  cancelled: 60,
};

// Helper to safely merge orders without ever dropping existing/in-flight orders or regressing status
export const mergeOrders = (prev: Order[], incoming: Order[]): Order[] => {
  const map = new Map<string, Order>();
  const blacklist = ['ord-1045', 'ord-1044', 'ord-1043', 'ord-1042'];

  const sanitizeOrder = (o: Order): Order => {
    const cust = o.customer;
    return {
      ...o,
      createdAt: o.createdAt || new Date().toLocaleDateString('pt-BR'),
      customer: cust
        ? {
            id: cust.id || `cust-${Date.now()}`,
            name: cust.name || 'Cliente',
            phone: cust.phone || '',
            email: cust.email || '',
            addresses: Array.isArray(cust.addresses) ? cust.addresses : [],
            allowPromotionalNotifications: cust.allowPromotionalNotifications,
            isPWAInstalled: cust.isPWAInstalled,
          }
        : {
            id: `cust-${Date.now()}`,
            name: 'Cliente',
            phone: '',
            email: '',
            addresses: [],
          },
      items: Array.isArray(o.items) ? o.items : [],
      timeline: Array.isArray(o.timeline) ? o.timeline : [],
    };
  };

  prev.forEach((raw) => {
    if (raw && raw.id && !blacklist.includes(raw.id)) {
      map.set(raw.id, sanitizeOrder(raw));
    }
  });
  incoming.forEach((raw) => {
    if (raw && raw.id && !blacklist.includes(raw.id)) {
      const o = sanitizeOrder(raw);
      const existing = map.get(o.id);
      if (existing) {
        const existingRank = STATUS_RANK[existing.status] || 0;
        const incomingRank = STATUS_RANK[o.status] || 0;

        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const incomingTime = o.updatedAt ? new Date(o.updatedAt).getTime() : 0;
        const isIncomingNewer = incomingTime > existingTime;

        let finalStatus = existing.status;
        let finalTimeline = existing.timeline;

        // Item 3.1: Advance status only if incoming rank is higher or equal, or if incoming is cancelled; never regress backwards
        if (o.status === 'cancelled' || incomingRank >= existingRank) {
          finalStatus = o.status;
          finalTimeline = o.timeline && o.timeline.length > 0 ? o.timeline : existing.timeline;
        }

        map.set(o.id, {
          ...existing,
          ...o,
          status: finalStatus,
          timeline: finalTimeline,
          updatedAt: isIncomingNewer ? o.updatedAt : existing.updatedAt,
        });
      } else {
        map.set(o.id, o);
      }
    }
  });
  const list = Array.from(map.values());
  list.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
  return list;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Check if current URL/hash targets admin route
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    // Explicit client override: if url contains view=client or #client or #cardapio, always open client view!
    if (
      window.location.search.includes('view=client') ||
      window.location.hash === '#client' ||
      window.location.hash === '#cardapio'
    ) {
      return false;
    }

    return (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.startsWith('#/admin') ||
      window.location.hash === '#admin' ||
      window.location.search.includes('view=admin')
    );
  };

  const [adminToken, setAdminToken] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('gamas_admin_token');
      if (saved && !saved.startsWith('admin-token-')) return saved;
      return '';
    } catch {
      return '';
    }
  });

  // Item 2.2: Verify saved admin session on startup with the server
  useEffect(() => {
    const saved = localStorage.getItem('gamas_admin_token');
    if (saved && !saved.startsWith('admin-token-')) {
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.valid) {
            setIsAdminAuthenticated(true);
            setAdminToken(saved);
          } else {
            setIsAdminAuthenticated(false);
            setAdminToken('');
            localStorage.removeItem('burger10_admin_auth');
            localStorage.removeItem('burger10_admin_email');
            localStorage.removeItem('gamas_admin_token');
          }
        })
        .catch(() => {
          setIsAdminAuthenticated(false);
          setAdminToken('');
        });
    } else {
      setIsAdminAuthenticated(false);
      setAdminToken('');
      localStorage.removeItem('burger10_admin_auth');
      localStorage.removeItem('gamas_admin_token');
    }
  }, []);

  // Navigation & View States: Always default to 'client' for customers
  const [currentView, setCurrentView] = useState<'client' | 'kitchen' | 'admin'>(() => {
    if (checkIsAdminRoute()) {
      return 'admin';
    }
    // Clean any accidental #admin or ?admin from the URL if not logged in
    if (typeof window !== 'undefined' && window.location.hash.includes('admin')) {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        // ignore
      }
    }
    return 'client';
  });

  const [clientTab, setClientTab] = useState<'home' | 'menu' | 'cart' | 'orders' | 'favorites' | 'profile'>('home');
  const [adminTab, setAdminTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'categories'
    | 'coupons'
    | 'delivery'
    | 'notifications'
    | 'customers'
    | 'settings'
  >('dashboard');

  // URL Hash/Route listener
  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsAdminRoute()) {
        setCurrentView('admin');
      } else {
        setCurrentView('client');
      }
    };
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const handleSetCurrentView = (view: 'client' | 'kitchen' | 'admin') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'client') {
        if (window.location.hash.includes('admin')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else if (isAdminAuthenticated && (view === 'admin' || view === 'kitchen')) {
        if (!window.location.hash.includes('admin') && !window.location.pathname.startsWith('/admin')) {
          window.location.hash = '#admin';
        }
      }
    }
  };

  // Item 2.2: Authenticate strictly via server API with no client-side password bypass
  const adminLogin = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });
      const data = await res.json();

      if (res.ok && data && data.success && data.token) {
        setIsAdminAuthenticated(true);
        setAdminToken(data.token);
        try {
          localStorage.setItem('burger10_admin_auth', 'true');
          localStorage.setItem('burger10_admin_email', data.email || cleanEmail);
          localStorage.setItem('gamas_admin_token', data.token);
        } catch {
          // local storage fallback
        }
        return { success: true, message: 'Autenticado com sucesso!' };
      }

      return {
        success: false,
        message: data?.message || 'Credenciais inválidas. Verifique seu e-mail e senha.',
      };
    } catch {
      return {
        success: false,
        message: 'Erro de conexão com o servidor ao autenticar.',
      };
    }
  };

  const adminLogout = () => {
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch(() => {});
    }
    setIsAdminAuthenticated(false);
    setAdminToken('');
    try {
      localStorage.removeItem('burger10_admin_auth');
      localStorage.removeItem('burger10_admin_email');
      localStorage.removeItem('gamas_admin_token');
    } catch {
      // ignore
    }
    // Restore client orders from storage rather than wiping out the state
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      setOrders(saved ? JSON.parse(saved) : []);
    } catch {
      setOrders([]);
    }
    handleSetCurrentView('client');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [thermalReceiptOrder, setThermalReceiptOrder] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Theme Management (Default to 'light' as requested, with instant toggle to 'dark')
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('burger10_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light'; // Default to Modo Claro
  });

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('burger10_theme', t);
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Core Data States with initial localStorage check
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [combos, setCombos] = useState<Combo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMBOS);
    return saved ? JSON.parse(saved) : INITIAL_COMBOS;
  });

  const [addons] = useState<AddonOption[]>(INITIAL_ADDONS);

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ZONES);
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_ZONES;
  });
  const [selectedDeliveryZone, setSelectedDeliveryZone] = useState<DeliveryZone>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ZONES);
    const parsed = saved ? JSON.parse(saved) : INITIAL_DELIVERY_ZONES;
    return parsed[0] || INITIAL_DELIVERY_ZONES[0];
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          name: parsed.name && !parsed.name.includes('BURGER10') ? parsed.name : "Gama's Burger",
          address: parsed.address && !parsed.address.includes('Rua das Flores') ? parsed.address : INITIAL_SETTINGS.address,
          publicStoreUrl: parsed.publicStoreUrl || INITIAL_SETTINGS.publicStoreUrl || 'https://gamas-burger.vercel.app',
          printerSettings: {
            ...INITIAL_SETTINGS.printerSettings,
            ...(parsed.printerSettings || {}),
          },
        };
      }
    } catch {
      // fallback
    }
    return INITIAL_SETTINGS;
  });

  // Customer & Client Identifiers
  const [customerId] = useState<string>(() => {
    try {
      let id = localStorage.getItem('gamas_customer_id');
      if (!id) {
        id = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('gamas_customer_id', id);
      }
      return id;
    } catch {
      return `cust-${Date.now()}`;
    }
  });

  const [customer, setCustomer] = useState<CustomerInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.name &&
          parsed.name !== 'João Silva' &&
          parsed.phone !== '(11) 99888-7766'
        ) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_CUSTOMER;
  });

  // Client personal order IDs
  const [clientOrderIds, setClientOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gamas_client_order_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id) => !['ord-1045', 'ord-1044', 'ord-1043', 'ord-1042'].includes(id));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (o: Order) => !['ord-1045', 'ord-1044', 'ord-1043', 'ord-1042'].includes(o.id)
          );
        }
      }
    } catch {}
    return [];
  });

  const [isServerConnected, setIsServerConnected] = useState<boolean>(false);

  // Function to fetch orders based on role or view
  const refreshOrders = useCallback(async () => {
    try {
      const isStaffView = isAdminAuthenticated || currentView === 'kitchen' || currentView === 'admin';
      if (isStaffView) {
        // 1. Check cloud orders in Firestore directly
        if (firebaseService.isConfigured()) {
          const cloudOrders = await firebaseService.getOrdersOnce();
          if (Array.isArray(cloudOrders)) {
            if (cloudOrders.length > 0) {
              setOrders((prev) => mergeOrders(prev, cloudOrders));
            }
            setIsServerConnected(true);
          }
        }

        // 2. Fetch from Express API (try kitchen endpoint first, or admin endpoint)
        const res = await fetch('/api/orders?kitchen=true', {
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.orders)) {
            const clean = data.orders.filter(
              (o: Order) => !['ord-1045', 'ord-1044', 'ord-1043', 'ord-1042'].includes(o.id)
            );
            setOrders((prev) => mergeOrders(prev, clean));
            setIsServerConnected(true);
          }
        }
      } else {
        // 1. Client checks cloud orders in Firestore directly first
        const storedIdsRaw = localStorage.getItem('gamas_client_order_ids');
        const storedIds: string[] = storedIdsRaw ? JSON.parse(storedIdsRaw) : clientOrderIds;
        const phoneDigits = customer.phone ? customer.phone.replace(/\D/g, '') : '';

        if (firebaseService.isConfigured()) {
          const cloudOrders = await firebaseService.getOrdersOnce();
          if (Array.isArray(cloudOrders)) {
            setIsServerConnected(true);
            if (cloudOrders.length > 0) {
              const myOrders = cloudOrders.filter((o) => {
                if (storedIds.includes(o.id)) return true;
                if (customerId && o.customer?.id === customerId) return true;
                if (
                  phoneDigits &&
                  o.customer?.phone &&
                  o.customer.phone.replace(/\D/g, '').includes(phoneDigits)
                )
                  return true;
                return false;
              });
              if (myOrders.length > 0) {
                setOrders((prev) => mergeOrders(prev, myOrders));
              }
            }
          }
        }

        const params = new URLSearchParams();
        if (customerId) params.set('customerId', customerId);
        if (storedIds.length > 0) params.set('orderIds', storedIds.join(','));
        if (phoneDigits) params.set('phone', phoneDigits);

        if (storedIds.length > 0 || phoneDigits || customerId) {
          const res = await fetch(`/api/orders?${params.toString()}`).catch(() => null);
          if (res && res.ok) {
            const data = await res.json();
            if (data && data.success && Array.isArray(data.orders)) {
              const clean = data.orders.filter(
                (o: Order) => !['ord-1045', 'ord-1044', 'ord-1043', 'ord-1042'].includes(o.id)
              );
              setOrders((prev) => mergeOrders(prev, clean));
              setIsServerConnected(true);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Orders sync error:', err);
    }
  }, [isAdminAuthenticated, currentView, adminToken, customerId, clientOrderIds, customer.phone]);

  // Real-time server sync between Mobile (customer) and PC (burger shop / kitchen)
  useEffect(() => {
    let isMounted = true;
    let eventSource: EventSource | null = null;

    // Trigger immediate fetch
    refreshOrders();

    // Setup SSE connection
    try {
      const sseUrl = isAdminAuthenticated && adminToken
        ? `/api/orders/stream?token=${encodeURIComponent(adminToken)}`
        : `/api/orders/stream?customerId=${encodeURIComponent(customerId)}&orderIds=${encodeURIComponent(clientOrderIds.join(','))}`;

      eventSource = new EventSource(sseUrl);
      eventSource.onopen = () => {
        if (isMounted) setIsServerConnected(true);
      };
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const isStaff = isAdminAuthenticated || currentView === 'kitchen' || currentView === 'admin';

          if (data.type === 'new_order' && data.order) {
            if (!isStaff) {
              const isMyOrder =
                clientOrderIds.includes(data.order.id) ||
                (data.order.customer && data.order.customer.id === customerId);
              if (!isMyOrder) return;
            }

            setOrders((prev) => {
              const hasOrder = prev.some((o) => o.id === data.order.id);
              if (soundEnabled && !hasOrder) playOrderNotificationSound();
              NotificationService.triggerOrderStatusNotification(data.order, 'received');
              return mergeOrders(prev, [data.order]);
            });
          } else if (data.type === 'status_updated' && data.order) {
            if (!isStaff) {
              const isMyOrder =
                clientOrderIds.includes(data.order.id) ||
                (data.order.customer && data.order.customer.id === customerId);
              if (!isMyOrder) return;
            }

            setOrders((prev) =>
              prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o))
            );
          }
        } catch {
          // ignore parsing issues
        }
      };
      eventSource.onerror = () => {
        if (isMounted && !firebaseService.isConfigured()) {
          setIsServerConnected(false);
        }
      };
    } catch {
      // SSE unsupported fallback
    }

    // Setup Firestore real-time listener if cloud is configured
    let unsubFirestore: (() => void) | null = null;
    if (firebaseService.isConfigured()) {
      try {
        unsubFirestore = firebaseService.listenToOrders((cloudOrders) => {
          if (!isMounted) return;
          setIsServerConnected(true);

          const isStaff = isAdminAuthenticated || currentView === 'kitchen' || currentView === 'admin';
          if (isStaff) {
            setOrders((prev) => {
              // Check if there are newly arrived orders to trigger audio alert
              const prevIds = new Set(prev.map((o) => o.id));
              const hasNew = cloudOrders.some((o) => !prevIds.has(o.id));
              if (hasNew && soundEnabled && prev.length > 0) {
                playOrderNotificationSound();
              }
              return mergeOrders(prev, cloudOrders);
            });
          } else {
            // Client only gets their own orders
            const storedIdsRaw = localStorage.getItem('gamas_client_order_ids');
            const storedIds: string[] = storedIdsRaw ? JSON.parse(storedIdsRaw) : clientOrderIds;
            const phoneDigits = customer.phone ? customer.phone.replace(/\D/g, '') : '';
            const myOrders = cloudOrders.filter((o) => {
              if (storedIds.includes(o.id)) return true;
              if (customerId && o.customer?.id === customerId) return true;
              if (
                phoneDigits &&
                o.customer?.phone &&
                o.customer.phone.replace(/\D/g, '').includes(phoneDigits)
              )
                return true;
              return false;
            });
            setOrders((prev) => mergeOrders(prev, myOrders));
          }
        });
      } catch (err) {
        console.warn('Firebase real-time listener init notice:', err);
      }
    }

    // Polling fallback every 5 seconds
    const pollInterval = setInterval(() => {
      if (isMounted) {
        refreshOrders();
      }
    }, 5000);

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (unsubFirestore) unsubFirestore();
      clearInterval(pollInterval);
    };
  }, [isAdminAuthenticated, currentView, adminToken, customerId, clientOrderIds, customer.phone, soundEnabled, refreshOrders]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      // Check current v2 storage key
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove any legacy mock favorites that might have been carried over
          const legacyMockIds = [
            'prod-xbacon-especial',
            'prod-combo-familia',
            'prod-xsalada',
            'prod-batata-especial-cheddar-bacon',
            'prod-coca-cola-350',
            'prod-cheesecake',
          ];
          const isExactLegacyMatch =
            parsed.length === legacyMockIds.length &&
            parsed.every((id) => legacyMockIds.includes(id));
          if (isExactLegacyMatch) {
            localStorage.removeItem(STORAGE_KEYS.FAVORITES);
            return [];
          }
          return parsed;
        }
      }
      // Also clean old legacy key if it existed
      localStorage.removeItem('burger10_favorites_v1');
    } catch {
      // ignore
    }
    // Never pre-populate with mock favorites for any customer!
    return [];
  });

  // Client Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  }, [orders, isAdminAuthenticated]);

  useEffect(() => {
    localStorage.setItem('gamas_client_order_ids', JSON.stringify(clientOrderIds));
  }, [clientOrderIds]);


  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(deliveryZones));
  }, [deliveryZones]);

  // Cart Calculations
  const calculateTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + item.itemTotalPrice * item.quantity, 0);
    let discount = 0;

    if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = (subtotal * appliedCoupon.value) / 100;
      } else {
        discount = appliedCoupon.value;
      }
    }

    // Default delivery fee if delivery
    const deliveryFee = selectedDeliveryZone ? selectedDeliveryZone.fee : 5.00;
    const total = Math.max(0, subtotal - discount + deliveryFee);

    return {
      subtotal,
      discount,
      deliveryFee,
      total,
    };
  };

  const cartTotals = calculateTotals();

  // Add to cart
  const addToCart = (
    product: Product,
    quantity: number,
    selectedAddons: SelectedAddon[],
    observation: string
  ) => {
    const basePrice = product.promoPrice ?? product.price;
    const addonsTotal = selectedAddons.reduce(
      (acc, curr) => acc + curr.addon.price * curr.quantity,
      0
    );
    const itemTotalPrice = basePrice + addonsTotal;

    const newItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      product,
      quantity,
      selectedAddons,
      observation,
      itemTotalPrice,
    };

    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const updateCartItemQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === clean && c.active);
    if (!found) {
      return { success: false, message: 'Cupom inválido ou expirado.' };
    }
    const currentSubtotal = cart.reduce((acc, item) => acc + item.itemTotalPrice * item.quantity, 0);
    if (currentSubtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Pedido mínimo para este cupom é de R$ ${found.minOrderValue.toFixed(2)}.`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Cupom ${found.code} aplicado com sucesso!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Reorder feature (PEDIR NOVAMENTE)
  const reorder = (previousOrder: Order) => {
    // Clone all items from the previous order into cart
    const newItems: CartItem[] = previousOrder.items.map((item, idx) => ({
      cartItemId: `reorder-${Date.now()}-${idx}`,
      product: item.product,
      quantity: item.quantity,
      selectedAddons: item.selectedAddons || [],
      observation: item.observation || '',
      itemTotalPrice: item.itemTotalPrice,
    }));

    setCart(newItems);
    setIsCartOpen(true);
    setClientTab('cart');
  };

  // Place Order
  const placeOrder = ({
    deliveryType,
    address,
    paymentMethod,
    cashChangeFor,
    notes,
    customerInfo,
  }: {
    deliveryType: 'delivery' | 'pickup';
    address?: CustomerAddress;
    paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'on_delivery';
    cashChangeFor?: number;
    notes?: string;
    customerInfo?: {
      name: string;
      phone: string;
      email?: string;
    };
  }): Order => {
    const subtotal = cart.reduce((acc, item) => acc + item.itemTotalPrice * item.quantity, 0);
    let discount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
      discount =
        appliedCoupon.discountType === 'percentage'
          ? (subtotal * appliedCoupon.value) / 100
          : appliedCoupon.value;
    }
    const deliveryFee = deliveryType === 'delivery' ? (selectedDeliveryZone?.fee || 5.00) : 0;
    const total = Math.max(0, subtotal - discount + deliveryFee);

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    // Use customized customer data from checkout if provided
    let orderCustomer = {
      ...customer,
      id: customer.id || customerId,
    };
    if (customerInfo && customerInfo.name && customerInfo.name.trim()) {
      orderCustomer = {
        ...orderCustomer,
        name: customerInfo.name.trim(),
        phone: customerInfo.phone ? customerInfo.phone.trim() : customer.phone,
        email: customerInfo.email ? customerInfo.email.trim() : customer.email,
      };
      setCustomer(orderCustomer);
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(orderCustomer));
      } catch {}
    }

    // Determine sequential order number
    const existingNums = orders
      .map((o) => parseInt(String(o.orderNumber), 10))
      .filter((n) => !isNaN(n));
    let lastSaved = 1045;
    try {
      const raw = localStorage.getItem('gamas_last_order_num');
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed > lastSaved) lastSaved = parsed;
      }
    } catch {}
    const maxOrderNum = Math.max(existingNums.length > 0 ? Math.max(...existingNums) : 1045, lastSaved);
    const nextOrderNum = maxOrderNum + 1;
    try {
      localStorage.setItem('gamas_last_order_num', String(nextOrderNum));
    } catch {}
    const orderNumber = String(nextOrderNum);
    const uniqueOrderId = `ord-${orderNumber}-${Date.now()}`;

    const newOrder: Order = {
      id: uniqueOrderId,
      orderNumber,
      createdAt: formattedDate,
      customer: orderCustomer,
      items: [...cart],
      subtotal,
      discount,
      couponCode: appliedCoupon?.code,
      deliveryFee,
      total,
      deliveryType,
      address: deliveryType === 'delivery' ? address || orderCustomer.addresses[0] : undefined,
      paymentMethod,
      cashChangeFor,
      status: 'received',
      estimatedTime: deliveryType === 'delivery' ? `${storeSettings.averagePrepMinutes} - ${storeSettings.averagePrepMinutes + 15} min` : `${storeSettings.averagePrepMinutes} min`,
      timeline: [
        {
          status: 'received',
          label: 'Pedido recebido',
          time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          completed: true,
        },
        { status: 'preparing', label: 'Em preparação', time: '', completed: false },
        {
          status: 'ready',
          label: deliveryType === 'pickup' ? 'Pronto para retirada' : 'Pedido pronto',
          time: '',
          completed: false,
        },
        ...(deliveryType === 'delivery'
          ? [
              { status: 'out_for_delivery' as OrderStatus, label: 'Saiu para entrega', time: '', completed: false },
              { status: 'delivered' as OrderStatus, label: 'Entregue', time: '', completed: false },
            ]
          : [{ status: 'delivered' as OrderStatus, label: 'Retirado', time: '', completed: false }]),
      ],
      notes,
      printedCount: 0,
    };

    setOrders((prev) => mergeOrders([newOrder], prev));
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const existing: Order[] = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(mergeOrders([newOrder], existing)));
    } catch {}
    firebaseService.saveOrder(newOrder);

    // Sync in real-time to server so burger shop PC receives the order immediately
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.order && data.order.orderNumber) {
          const serverNum = String(data.order.orderNumber);
          try {
            localStorage.setItem('gamas_last_order_num', serverNum);
          } catch {}
          if (serverNum !== orderNumber) {
            const renumbered: Order = { ...newOrder, orderNumber: serverNum };
            setOrders((prev) =>
              prev.map((o) => (o.id === newOrder.id ? renumbered : o))
            );
            firebaseService.saveOrder(renumbered);
          }
        }
      })
      .catch((err) => console.warn('Sync order to server:', err));

    clearCart();
    setTrackingOrderId(newOrder.id);

    // Save order ID to client's personal order history list
    setClientOrderIds((prev) => {
      const updated = [newOrder.id, ...prev];
      try {
        localStorage.setItem('gamas_client_order_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#10b981'],
    });

    if (soundEnabled) {
      playOrderNotificationSound();
    }

    // Trigger Notification for Client (Requirement 29, 36)
    NotificationService.triggerOrderStatusNotification(newOrder, 'received');

    return newOrder;
  };

  // Update order status (Kitchen or Admin)
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const updatedAt = now.toISOString();

    // Prepare updated order synchronously from existing state
    const currentOrder = orders.find((o) => o.id === orderId);
    let targetOrder: Order | null = null;

    if (currentOrder) {
      const updatedTimeline = (currentOrder.timeline || []).map((evt) => {
        if (evt.status === newStatus) {
          return { ...evt, completed: true, time: evt.time || timeStr };
        }
        return evt;
      });

      targetOrder = {
        ...currentOrder,
        status: newStatus,
        timeline: updatedTimeline,
        updatedAt,
      };
    }

    setOrders((prev) => {
      const next = prev.map((order) => {
        if (order.id === orderId) {
          const updatedTimeline = (order.timeline || []).map((evt) => {
            if (evt.status === newStatus) {
              return { ...evt, completed: true, time: evt.time || timeStr };
            }
            return evt;
          });
          const updated: Order = {
            ...order,
            status: newStatus,
            timeline: updatedTimeline,
            updatedAt,
          };
          if (!targetOrder) targetOrder = updated;
          return updated;
        }
        return order;
      });

      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(next));
      } catch {}

      return next;
    });

    const finalOrder = targetOrder || currentOrder;
    if (finalOrder) {
      const payloadOrder: Order = {
        ...finalOrder,
        status: newStatus,
        updatedAt,
      };

      // Trigger Push / In-App Notification and database save
      NotificationService.triggerOrderStatusNotification(payloadOrder, newStatus);
      firebaseService.saveOrder(payloadOrder);

      // Sync status change in real-time to server so customer's cell phone updates live
      fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, updatedAt }),
      }).catch((err) => console.warn('Sync status to server:', err));
    }
  };

  const printThermalReceipt = (order: Order) => {
    setThermalReceiptOrder(order);
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, printedCount: (o.printedCount || 0) + 1 } : o))
    );
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  // Favorites
  const isFavorite = (productId: string) => favorites.includes(productId);
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Customer info & address management
  const updateCustomer = (info: Partial<CustomerInfo>) => {
    setCustomer((prev) => ({ ...prev, ...info }));
  };

  const addAddress = (addressData: Omit<CustomerAddress, 'id'>) => {
    const newAddress: CustomerAddress = {
      ...addressData,
      id: `addr-${Date.now()}`,
    };
    setCustomer((prev) => ({
      ...prev,
      addresses: [...prev.addresses, newAddress],
    }));
  };

  const deleteAddress = (id: string) => {
    setCustomer((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((a) => a.id !== id),
    }));
  };

  // Admin CRUD
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...p, id: `prod-${Date.now()}` };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleProductAvailability = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  const addCategory = (c: Omit<Category, 'id'>) => {
    const newCat: Category = { ...c, id: `cat-${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addCoupon = (c: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = { ...c, id: `coupon-${Date.now()}` };
    setCoupons((prev) => [...prev, newCoupon]);
  };

  const updateCoupon = (id: string, updated: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const addCombo = (c: Omit<Combo, 'id'>) => {
    const newCombo: Combo = { ...c, id: `combo-${Date.now()}` };
    setCombos((prev) => [...prev, newCombo]);
  };

  const updateCombo = (id: string, updated: Partial<Combo>) => {
    setCombos((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCombo = (id: string) => {
    setCombos((prev) => prev.filter((c) => c.id !== id));
  };

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const updated: StoreSettings = {
        ...prev,
        ...newSettings,
        printerSettings: {
          ...(prev?.printerSettings || INITIAL_SETTINGS.printerSettings),
          ...(newSettings.printerSettings || {}),
        },
      };
      firebaseService.saveSettings(updated);
      return updated;
    });
  };

  const addDeliveryZone = (neighborhood: string, fee: number) => {
    const newZone: DeliveryZone = {
      id: `zone-${Date.now()}`,
      neighborhood,
      fee,
      estimatedMinutes: '30-45 min',
      minOrder: 20.0,
    };
    setDeliveryZones((prev) => [...prev, newZone]);
  };

  const updateDeliveryZoneFee = (id: string, fee: number) => {
    setDeliveryZones((prev) => prev.map((z) => (z.id === id ? { ...z, fee } : z)));
  };

  const deleteDeliveryZone = (id: string) => {
    setDeliveryZones((prev) => prev.filter((z) => z.id !== id));
  };

  const simulateIncomingOrder = () => {
    const randomCustomerNames = [
      'Lucas Andrade',
      'Fernanda Lima',
      'Gabriel Santos',
      'Mariana Costa',
      'Thiago Oliveira',
      'Beatriz Souza',
    ];
    const randomNeighborhoods = [
      'Centro',
      'Jardim América',
      'Vila Mariana',
      'Pinheiros',
      'Bela Vista',
    ];
    const randomCustomerName =
      randomCustomerNames[Math.floor(Math.random() * randomCustomerNames.length)];
    const randomNeighborhood =
      randomNeighborhoods[Math.floor(Math.random() * randomNeighborhoods.length)];

    const availableProducts = products.length > 0 ? products : INITIAL_PRODUCTS;
    const prod1 = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const prod2 = availableProducts[Math.floor(Math.random() * availableProducts.length)];

    const items: CartItem[] = [
      {
        cartItemId: `sim-item-${Date.now()}-1`,
        product: prod1,
        quantity: 1,
        selectedAddons: [],
        observation: 'Sem cebola, por favor',
        itemTotalPrice: prod1.promoPrice ?? prod1.price,
      },
    ];

    if (prod2.id !== prod1.id) {
      items.push({
        cartItemId: `sim-item-${Date.now()}-2`,
        product: prod2,
        quantity: 1,
        selectedAddons: [],
        observation: '',
        itemTotalPrice: prod2.promoPrice ?? prod2.price,
      });
    }

    const subtotal = items.reduce((acc, i) => acc + i.itemTotalPrice * i.quantity, 0);
    const deliveryFee = 7.0;
    const total = subtotal + deliveryFee;

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const existingNums = orders
      .map((o) => parseInt(String(o.orderNumber), 10))
      .filter((n) => !isNaN(n));
    let lastSaved = 1045;
    try {
      const raw = localStorage.getItem('gamas_last_order_num');
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed > lastSaved) lastSaved = parsed;
      }
    } catch {}
    const maxOrderNum = Math.max(existingNums.length > 0 ? Math.max(...existingNums) : 1045, lastSaved);
    const nextOrderNum = maxOrderNum + 1;
    try {
      localStorage.setItem('gamas_last_order_num', String(nextOrderNum));
    } catch {}
    const orderNumber = String(nextOrderNum);

    const simulatedOrder: Order = {
      id: `ord-${orderNumber}-${Date.now().toString().slice(-4)}`,
      orderNumber,
      createdAt: formattedDate,
      customer: {
        id: `cust-sim-${Date.now()}`,
        name: randomCustomerName,
        phone: '(11) 98765-4321',
        email: 'cliente@teste.com',
        addresses: [],
      },
      items,
      subtotal,
      discount: 0,
      deliveryFee,
      total,
      deliveryType: 'delivery',
      address: {
        id: `addr-sim-${Date.now()}`,
        label: 'Casa',
        street: 'Rua das Flores',
        number: `${Math.floor(Math.random() * 800) + 100}`,
        neighborhood: randomNeighborhood,
        city: 'São Paulo',
        zipCode: '01415-000',
        reference: 'Próximo à padaria',
      },
      paymentMethod: 'pix',
      status: 'received',
      estimatedTime: `${storeSettings.averagePrepMinutes} - ${storeSettings.averagePrepMinutes + 15} min`,
      timeline: [
        {
          status: 'received',
          label: 'Pedido recebido',
          time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          completed: true,
        },
        { status: 'preparing', label: 'Em preparação', time: '', completed: false },
        { status: 'ready', label: 'Pedido pronto', time: '', completed: false },
        { status: 'out_for_delivery', label: 'Saiu para entrega', time: '', completed: false },
        { status: 'delivered', label: 'Entregue', time: '', completed: false },
      ],
      notes: 'Campainha 202',
      printedCount: 0,
    };

    setOrders((prev) => [simulatedOrder, ...prev]);

    const tokenToSend = adminToken;
    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(tokenToSend ? { Authorization: `Bearer ${tokenToSend}` } : {}),
      },
      body: JSON.stringify(simulatedOrder),
    }).catch((err) => console.warn('Sync simulated order to server:', err));

    if (soundEnabled) {
      playOrderNotificationSound();
    }
  };

  // Customer Loyalty Calculation - only based on orders placed by THIS customer
  const customerOrdersCount = orders.filter(
    (o) =>
      o.status !== 'cancelled' &&
      (clientOrderIds.includes(o.id) ||
        (o.customer && (o.customer.id === customer.id || o.customer.id === customerId)) ||
        (customer.phone && o.customer && o.customer.phone === customer.phone) ||
        (customer.name && customer.name.trim() !== '' && customer.name !== 'João Silva' && o.customer && o.customer.name === customer.name))
  ).length;
  const loyaltyTierInfo = useMemo(() => {
    if (customerOrdersCount >= 6) {
      return {
        tier: 'Ouro VIP' as const,
        tierId: 'gold' as const,
        ordersCount: customerOrdersCount,
        ordersNeededForNext: 0,
        discountPercent: 10,
        perk: '10% de desconto em todos os pedidos e prioridade máxima na chapa',
      };
    } else if (customerOrdersCount >= 3) {
      return {
        tier: 'Prata' as const,
        tierId: 'silver' as const,
        ordersCount: customerOrdersCount,
        ordersNeededForNext: 6 - customerOrdersCount,
        discountPercent: 5,
        perk: '5% de desconto em pedidos e sobremesa grátis em compras acima de R$ 50',
      };
    } else {
      return {
        tier: 'Bronze' as const,
        tierId: 'bronze' as const,
        ordersCount: customerOrdersCount,
        ordersNeededForNext: 3 - customerOrdersCount,
        discountPercent: 0,
        perk: 'Faça 3 pedidos para desbloquear o nível Prata com descontos exclusivos',
      };
    }
  }, [customerOrdersCount]);

  const sendBroadcastNotification = (
    title: string,
    message: string,
    imageUrl?: string,
    ctaLabel: string = 'PEDIR AGORA',
    ctaAction: string = 'menu',
    targetAudience: AppNotification['targetAudience'] = 'all'
  ) => {
    return NotificationService.sendPromotionalBroadcast(
      title,
      message,
      imageUrl,
      ctaLabel,
      ctaAction,
      targetAudience,
      {
        ordersCount: customerOrdersCount,
        isPWAInstalled: customer.isPWAInstalled,
        loyaltyTier: loyaltyTierInfo.tierId,
      }
    );
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView: handleSetCurrentView,
        clientTab,
        setClientTab,
        adminTab,
        setAdminTab,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        simulateIncomingOrder,
        sendBroadcastNotification,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedProductForModal,
        setSelectedProductForModal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        trackingOrderId,
        setTrackingOrderId,
        thermalReceiptOrder,
        setThermalReceiptOrder,
        soundEnabled,
        toggleSound,
        theme,
        setTheme,
        toggleTheme,

        products,
        categories,
        combos,
        addons,
        coupons,
        deliveryZones,
        storeSettings,
        orders,
        cart,
        appliedCoupon,
        favorites,
        customer,
        clientOrderIds,
        selectedDeliveryZone,
        setSelectedDeliveryZone,

        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        reorder,

        cartTotals,
        placeOrder,
        updateOrderStatus,
        printThermalReceipt,
        refreshOrders,
        isServerConnected,

        isFavorite,
        toggleFavorite,
        loyaltyTierInfo,
        updateCustomer,
        updateCustomerProfile: updateCustomer,
        addAddress,
        deleteAddress,

        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        addCombo,
        updateCombo,
        deleteCombo,
        addDeliveryZone,
        updateDeliveryZoneFee,
        deleteDeliveryZone,
        updateStoreSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
