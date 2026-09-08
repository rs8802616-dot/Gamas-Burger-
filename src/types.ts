export type OrderStatus =
  | 'received'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type AppTheme = 'light' | 'dark';

export interface AddonOption {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  category?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  promoPrice?: number;
  categoryId: string;
  photo: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  isDailyOffer?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  discountPercentage?: number;
  rating?: number;
  reviewsCount?: number;
  addons?: AddonOption[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  photo: string;
  originalPrice: number;
  price: number;
  items: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
}

export interface SelectedAddon {
  addon: AddonOption;
  quantity: number;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedAddons: SelectedAddon[];
  observation: string;
  itemTotalPrice: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  expiryDate: string;
  maxUsage: number;
  currentUsage: number;
  active: boolean;
}

export interface CustomerAddress {
  id: string;
  label: 'Casa' | 'Trabalho' | 'Outro';
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  reference?: string;
}

export interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  addresses: CustomerAddress[];
  allowPromotionalNotifications?: boolean;
  isPWAInstalled?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order_status' | 'promo' | 'system';
  orderId?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaAction?: string;
  createdAt: string;
  read: boolean;
  targetAudience?: 'all' | 'past_buyers' | 'loyal_customers' | 'promo_opt_in' | 'pwa_installed';
  sentCount?: number;
}

export interface LoyaltyTier {
  id: 'bronze' | 'silver' | 'gold';
  name: string;
  minOrders: number;
  perkDescription: string;
  discountPercent?: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  time: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  deliveryType: 'delivery' | 'pickup';
  address?: CustomerAddress;
  paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'on_delivery';
  cashChangeFor?: number;
  status: OrderStatus;
  estimatedTime: string;
  timeline: OrderTimelineEvent[];
  notes?: string;
  printedCount?: number;
}

export interface DeliveryZone {
  id: string;
  neighborhood: string;
  fee: number;
  estimatedMinutes: string;
  minOrder: number;
}

export interface DaySchedule {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  logo: string;
  phone: string;
  whatsapp: string;
  address: string;
  publicStoreUrl?: string;
  openingHours?: string;
  minOrderValue: number;
  averagePrepMinutes: number;
  manualStatus: 'auto' | 'open' | 'closed';
  schedule: DaySchedule[];
  printerSettings: {
    paperWidth: '58mm' | '80mm';
    autoPrintOnOrder: boolean;
    printCustomerAddress: boolean;
    customFooterText: string;
  };
  whatsappTemplates: {
    greeting: string;
    orderReceived: string;
    orderPreparing: string;
    orderReady: string;
    orderOutForDelivery: string;
    orderDelivered: string;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'kitchen' | 'attendant';
}
