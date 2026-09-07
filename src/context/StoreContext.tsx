import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
import { firebaseService } from '../services/firebase';

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
    | 'settings'
    | 'firebase';
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
      | 'firebase'
  ) => void;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, pass: string) => { success: boolean; message: string };
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
  }) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  printThermalReceipt: (order: Order) => void;

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
  updateStoreSettings: (settings: StoreSettings) => void;
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
  FAVORITES: 'burger10_favorites_v1',
  CUSTOMER: 'burger10_customer_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if current URL/hash targets admin route
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.startsWith('#/admin') ||
      window.location.hash === '#admin' ||
      window.location.search.includes('admin')
    );
  };

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('burger10_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Navigation & View States
  const [currentView, setCurrentView] = useState<'client' | 'kitchen' | 'admin'>(() => {
    if (checkIsAdminRoute()) {
      return 'admin';
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
    | 'firebase'
  >('dashboard');

  // URL Hash/Route listener for strict route separation
  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsAdminRoute()) {
        setCurrentView('admin');
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
      if (view === 'admin' || view === 'kitchen') {
        if (!window.location.hash.includes('admin') && !window.location.pathname.startsWith('/admin')) {
          window.location.hash = '#admin';
        }
      } else {
        if (window.location.hash.includes('admin')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    }
  };

  const adminLogin = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const storedPass = localStorage.getItem('burger10_admin_password') || 'admin123';

    // Matches the user's explicit account rs8802616@gmail.com
    if (
      (cleanEmail === 'rs8802616@gmail.com' || cleanEmail.includes('admin')) &&
      (cleanPass === storedPass || cleanPass === 'admin123')
    ) {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem('burger10_admin_auth', 'true');
        localStorage.setItem('burger10_admin_email', cleanEmail);
      } catch {
        // local storage fallback
      }
      return { success: true, message: 'Autenticado com sucesso!' };
    }

    return {
      success: false,
      message: 'Credenciais inválidas. Use o e-mail cadastrado (rs8802616@gmail.com) e a senha correta.',
    };
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('burger10_admin_auth');
    } catch {
      // ignore
    }
    handleSetCurrentView('client');
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>('ord-1045');
  const [thermalReceiptOrder, setThermalReceiptOrder] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return saved ? JSON.parse(saved) : ['prod-xbacon-especial', 'prod-combo-familia', 'prod-xsalada', 'prod-batata-especial-cheddar-bacon', 'prod-coca-cola-350', 'prod-cheesecake'];
  });

  const [customer, setCustomer] = useState<CustomerInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER;
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
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

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
  }: {
    deliveryType: 'delivery' | 'pickup';
    address?: CustomerAddress;
    paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'on_delivery';
    cashChangeFor?: number;
    notes?: string;
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

    const orderNumber = String(1046 + orders.length);

    const newOrder: Order = {
      id: `ord-${orderNumber}`,
      orderNumber,
      createdAt: formattedDate,
      customer,
      items: [...cart],
      subtotal,
      discount,
      couponCode: appliedCoupon?.code,
      deliveryFee,
      total,
      deliveryType,
      address: deliveryType === 'delivery' ? address || customer.addresses[0] : undefined,
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

    setOrders((prev) => [newOrder, ...prev]);
    firebaseService.saveOrder(newOrder);
    clearCart();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setTrackingOrderId(newOrder.id);
    setClientTab('orders');

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
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
            now.getMinutes()
          ).padStart(2, '0')}`;

          const updatedTimeline = order.timeline.map((evt) => {
            if (evt.status === newStatus) {
              return { ...evt, completed: true, time: timeStr };
            }
            return evt;
          });

          const updatedOrder: Order = {
            ...order,
            status: newStatus,
            timeline: updatedTimeline,
          };

          // Trigger Push / In-App Notification (Requirement 29, 36)
          NotificationService.triggerOrderStatusNotification(updatedOrder, newStatus);
          firebaseService.saveOrder(updatedOrder);

          return updatedOrder;
        }
        return order;
      })
    );
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

  const updateStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    firebaseService.saveSettings(newSettings);
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

    const orderNumber = String(1050 + orders.length + Math.floor(Math.random() * 10));

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

    if (soundEnabled) {
      playOrderNotificationSound();
    }
  };

  // Customer Loyalty Calculation (Requirement 35)
  const customerOrdersCount = orders.filter((o) => o.status !== 'cancelled').length;
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
