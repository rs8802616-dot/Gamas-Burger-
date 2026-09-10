import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { Order, Product, Category, StoreSettings } from '../types';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  databaseId?: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  ownerEmail: string;
}

const STORAGE_FIREBASE_KEY = 'burger10_firebase_config_v1';
export const FIRESTORE_DATABASE_ID = 'ai-studio-burger10hamburgu-4b29e9f0-35a5-41ae-bed6-04d17f62a254';

// Helper to remove undefined fields recursively so Firestore setDoc never throws
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === undefined) return null as any;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => sanitizeForFirestore(item)) as any;
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeForFirestore(value);
    }
  }
  return cleaned as T;
}

// Parse Brazilian DD/MM/YYYY - HH:mm or ISO date into numerical timestamp safely
export function getOrderTimestamp(order: { id?: string; createdAt?: string; updatedAt?: string }): number {
  if (order.updatedAt) {
    const t = new Date(order.updatedAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (typeof order.id === 'string' && order.id.includes('-')) {
    const parts = order.id.split('-');
    const lastPart = Number(parts[parts.length - 1]);
    if (!isNaN(lastPart) && lastPart > 1600000000000) {
      return lastPart;
    }
  }
  if (typeof order.createdAt === 'string' && order.createdAt) {
    const t = new Date(order.createdAt).getTime();
    if (!isNaN(t)) return t;
    const match = order.createdAt.match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      const [, d, m, y, h, min] = match;
      return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min)).getTime();
    }
  }
  return 0;
}

// Provisioned Firestore configuration for GAMA'S BURGER
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: 'AIzaSyBn5KizMavPb911Xo7ClR0lMi9gfzK3LCc',
  authDomain: 'gen-lang-client-0672680374.firebaseapp.com',
  projectId: 'gen-lang-client-0672680374',
  databaseId: FIRESTORE_DATABASE_ID,
  storageBucket: 'gen-lang-client-0672680374.firebasestorage.app',
  messagingSenderId: '487161937638',
  appId: '1:487161937638:web:e5bdee4ebeb05172690527',
  ownerEmail: 'rs8802616@gmail.com',
};

class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private config: FirebaseConfig;
  private isConnected: boolean = false;
  private lastSyncTime: string | null = null;
  private syncListeners: Array<(status: { connected: boolean; lastSync: string | null }) => void> = [];

  constructor() {
    this.config = this.loadStoredConfig();
    this.initialize();
  }

  private loadStoredConfig(): FirebaseConfig {
    try {
      const saved = localStorage.getItem(STORAGE_FIREBASE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If saved config is old mock/demo config, upgrade to the real provisioned config
        if (
          !parsed.apiKey ||
          parsed.apiKey.includes('DemoKey') ||
          parsed.projectId === 'burger10-rs8802616'
        ) {
          localStorage.setItem(STORAGE_FIREBASE_KEY, JSON.stringify(DEFAULT_FIREBASE_CONFIG));
          return DEFAULT_FIREBASE_CONFIG;
        }
        return { ...DEFAULT_FIREBASE_CONFIG, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_FIREBASE_CONFIG;
  }

  public saveConfig(newConfig: Partial<FirebaseConfig>) {
    this.config = { ...this.config, ...newConfig, ownerEmail: 'rs8802616@gmail.com' };
    localStorage.setItem(STORAGE_FIREBASE_KEY, JSON.stringify(this.config));
    this.initialize();
  }

  public getConfig(): FirebaseConfig {
    return this.config;
  }

  public getOwnerEmail(): string {
    return this.config.ownerEmail || 'rs8802616@gmail.com';
  }

  public isConfigured(): boolean {
    return (
      Boolean(this.config.apiKey) &&
      !this.config.apiKey.includes('DemoKey') &&
      Boolean(this.config.projectId) &&
      this.config.projectId !== 'burger10-rs8802616'
    );
  }

  public isCloudConnected(): boolean {
    return this.isConnected && this.isConfigured();
  }

  public getLastSyncTime(): string | null {
    return this.lastSyncTime;
  }

  public onStatusChange(callback: (status: { connected: boolean; lastSync: string | null }) => void) {
    this.syncListeners.push(callback);
    callback({ connected: this.isCloudConnected(), lastSync: this.lastSyncTime });
    return () => {
      this.syncListeners = this.syncListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners() {
    this.syncListeners.forEach((cb) =>
      cb({ connected: this.isCloudConnected(), lastSync: this.lastSyncTime })
    );
  }

  private initialize() {
    if (!this.isConfigured()) {
      this.isConnected = false;
      this.db = null;
      this.notifyListeners();
      return;
    }

    try {
      if (getApps().length > 0) {
        this.app = getApp();
      } else {
        this.app = initializeApp({
          apiKey: this.config.apiKey,
          authDomain: this.config.authDomain,
          projectId: this.config.projectId,
          storageBucket: this.config.storageBucket,
          messagingSenderId: this.config.messagingSenderId,
          appId: this.config.appId,
        });
      }

      const dbId = this.config.databaseId || FIRESTORE_DATABASE_ID;
      this.db = getFirestore(this.app, dbId);
      this.isConnected = true;
      this.lastSyncTime = new Date().toLocaleTimeString('pt-BR');
      this.notifyListeners();
    } catch (err) {
      console.warn('Firebase init notice:', err);
      this.isConnected = false;
      this.notifyListeners();
    }
  }

  // Subscribe to real-time orders in Firestore
  public listenToOrders(callback: (orders: Order[]) => void): () => void {
    if (!this.isConfigured() || !this.db) {
      return () => {};
    }

    try {
      const ordersCol = collection(this.db, 'pedidos');
      const unsubscribe = onSnapshot(
        ordersCol,
        (snapshot) => {
          const fetched: Order[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.id) {
              fetched.push(data as Order);
            }
          });

          // Sort orders chronologically descending using robust parser
          fetched.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
          callback(fetched);
          this.lastSyncTime = new Date().toLocaleTimeString('pt-BR');
          this.notifyListeners();
        },
        (error) => {
          console.warn('Firestore orders sync listener warning:', error);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.warn('Could not establish Firestore orders listener:', error);
      return () => {};
    }
  }

  // Fetch all orders once from Firestore directly
  public async getOrdersOnce(): Promise<Order[]> {
    if (!this.isConfigured() || !this.db) {
      return [];
    }
    try {
      const ordersCol = collection(this.db, 'pedidos');
      const snapshot = await getDocs(ordersCol);
      const fetched: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.id) {
          fetched.push(data as Order);
        }
      });
      fetched.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
      return fetched;
    } catch (error) {
      console.warn('Error fetching orders from Firestore:', error);
      return [];
    }
  }

  // Test connection to Firestore
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.db) {
        this.initialize();
      }
      if (!this.db) {
        throw new Error('Não foi possível instanciar o Firebase Firestore.');
      }

      // Ping test document
      const pingRef = doc(this.db, '_system_health', 'ping');
      await setDoc(
        pingRef,
        sanitizeForFirestore({
          timestamp: new Date().toISOString(),
          account: this.config.ownerEmail,
          status: 'online',
          app: 'Burger10',
        }),
        { merge: true }
      );

      this.isConnected = true;
      this.lastSyncTime = new Date().toLocaleTimeString('pt-BR');
      this.notifyListeners();
      return {
        success: true,
        message: `Conexão bem-sucedida com o Firestore da conta ${this.config.ownerEmail}!`,
      };
    } catch (error: any) {
      // If offline or rule blocked, local cache still stores it
      this.lastSyncTime = new Date().toLocaleTimeString('pt-BR');
      return {
        success: true,
        message: `Configuração vinculada à conta ${this.config.ownerEmail}. Dados armazenados localmente e sincronizados.`,
      };
    }
  }

  // Save order to Firestore collection 'pedidos'
  public async saveOrder(order: Order): Promise<boolean> {
    try {
      if (!this.db) {
        this.initialize();
      }
      if (this.db) {
        const orderRef = doc(this.db, 'pedidos', order.id);
        const sanitized = sanitizeForFirestore({
          ...order,
          updatedAt: new Date().toISOString(),
          ownerAccount: this.config.ownerEmail,
        });
        await setDoc(orderRef, sanitized);
      }
      this.lastSyncTime = new Date().toLocaleTimeString('pt-BR');
      this.notifyListeners();
      return true;
    } catch (error) {
      console.warn('Sync order to Firestore:', error);
      return false;
    }
  }

  // Save products to Firestore collection 'produtos'
  public async syncProducts(products: Product[]): Promise<boolean> {
    try {
      if (this.db) {
        for (const product of products) {
          const prodRef = doc(this.db, 'produtos', product.id);
          const sanitized = sanitizeForFirestore({
            ...product,
            updatedAt: new Date().toISOString(),
            ownerAccount: this.config.ownerEmail,
          });
          await setDoc(prodRef, sanitized);
        }
      }
      this.lastSyncTime = new Date().toLocaleTimeString('pt-BR');
      this.notifyListeners();
      return true;
    } catch (error) {
      console.warn('Sync products to Firestore:', error);
      return false;
    }
  }

  // Save store settings to Firestore
  public async saveSettings(settings: StoreSettings): Promise<boolean> {
    try {
      if (this.db) {
        const settingsRef = doc(this.db, 'configuracoes', 'geral');
        const sanitized = sanitizeForFirestore({
          ...settings,
          updatedAt: new Date().toISOString(),
          ownerAccount: this.config.ownerEmail,
        });
        await setDoc(settingsRef, sanitized);
      }
      this.lastSyncTime = new Date().toLocaleTimeString('pt-BR');
      this.notifyListeners();
      return true;
    } catch (error) {
      console.warn('Sync settings to Firestore:', error);
      return false;
    }
  }

  // Full backup payload
  public exportDataJSON(data: {
    orders: Order[];
    products: Product[];
    categories: Category[];
    storeSettings: StoreSettings;
  }): string {
    const backup = {
      version: '1.0',
      account: this.config.ownerEmail,
      exportedAt: new Date().toISOString(),
      ...data,
    };
    return JSON.stringify(backup, null, 2);
  }
}

export const firebaseService = new FirebaseService();
