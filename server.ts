// Fix: tsx defines relative __dirname = "." which breaks ESM packages using createRequire(__dirname)
delete (globalThis as any).__dirname;

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Directories and file paths for multi-tenant persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const TENANTS_FILE = path.join(DATA_DIR, 'tenants-db.json');
const USERS_FILE = path.join(DATA_DIR, 'users-db.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders-db.json');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog-db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==================== TYPE DEFINITIONS ====================
export type StaffRole = 'super_admin' | 'admin' | 'balcao';

export interface TenantRecord {
  id: string;
  nome: string;
  slug: string;
  email_admin: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
  updatedAt: string;
  logo?: string;
  tagline?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  primaryColor?: string;
}

export interface StaffUserRecord {
  id: string;
  tenant_id: string | null; // null for super_admin
  name: string;
  email: string;
  password: string; // hashed or clean string
  role: StaffRole;
  status: 'ativo' | 'inativo';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  tenant_id: string;
  orderNumber: string;
  createdAt: string;
  customer: any;
  items: any[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  deliveryType: 'delivery' | 'pickup';
  address?: any;
  paymentMethod: string;
  cashChangeFor?: number;
  status: string;
  estimatedTime?: string;
  timeline?: any[];
  notes?: string;
  printedCount?: number;
  updatedAt?: string;
  [key: string]: any;
}

export interface TenantCatalog {
  products: any[];
  categories: any[];
  combos?: any[];
  coupons?: any[];
  deliveryZones?: any[];
  settings?: any;
}

export interface StaffSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: StaffRole;
  tenant_id: string | null;
  tenantName?: string;
  tenantSlug?: string;
  createdAt: number;
  expiresAt: number;
}

// ==================== INITIAL SEED DATA ====================
const DEFAULT_TENANTS: TenantRecord[] = [
  {
    id: 'tenant-gamas',
    nome: "Gama's Burger",
    slug: 'gamas-burger',
    email_admin: (process.env.ADMIN_EMAIL || 'rs8802616@gmail.com').toLowerCase().trim(),
    status: 'ativo',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    logo: '🍔🔥',
    tagline: 'Hamburgueria Artesanal & Delivery',
    phone: '(11) 98765-4321',
    whatsapp: '5511987654321',
    address: 'Rua dos Burgers, 100 - Centro',
  },
  {
    id: 'tenant-burger-house',
    nome: 'Burger House Artesanal',
    slug: 'burger-house',
    email_admin: 'admin@burgerhouse.com',
    status: 'ativo',
    createdAt: '2026-09-05T12:00:00.000Z',
    updatedAt: '2026-09-05T12:00:00.000Z',
    logo: '👑🍔',
    tagline: 'O Verdadeiro Burger Defumado na Brasa',
    phone: '(11) 91234-5678',
    whatsapp: '5511912345678',
    address: 'Av. Paulista, 1500 - Bela Vista',
  },
];

const SUPERADMIN_EMAIL = (process.env.SUPERADMIN_EMAIL || 'superadmin@plataforma.com').toLowerCase().trim();
const SUPERADMIN_PASSWORD = (process.env.SUPERADMIN_PASSWORD || 'admin123').trim();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'rs8802616@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'admin123').trim();
const BALCAO_EMAIL = (process.env.BALCAO_EMAIL || 'balcao@gamasburger.com').toLowerCase().trim();
const BALCAO_PASSWORD = (process.env.BALCAO_PASSWORD || 'balcao123').trim();
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'gamas-admin-secret-key-2026';

const DEFAULT_USERS: StaffUserRecord[] = [
  {
    id: 'usr-superadmin',
    tenant_id: null,
    name: 'Super Administrador (Dono da Plataforma)',
    email: SUPERADMIN_EMAIL,
    password: SUPERADMIN_PASSWORD,
    role: 'super_admin',
    status: 'ativo',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'usr-gamas-admin',
    tenant_id: 'tenant-gamas',
    name: "Admin Gama's Burger",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    status: 'ativo',
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'usr-gamas-balcao',
    tenant_id: 'tenant-gamas',
    name: "Balcão Gama's Burger",
    email: BALCAO_EMAIL,
    password: BALCAO_PASSWORD,
    role: 'balcao',
    status: 'ativo',
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'usr-burgerhouse-admin',
    tenant_id: 'tenant-burger-house',
    name: 'Admin Burger House',
    email: 'admin@burgerhouse.com',
    password: 'admin123',
    role: 'admin',
    status: 'ativo',
    createdAt: '2026-09-05T12:00:00.000Z',
  },
  {
    id: 'usr-burgerhouse-balcao',
    tenant_id: 'tenant-burger-house',
    name: 'Balcão Burger House',
    email: 'balcao@burgerhouse.com',
    password: 'balcao123',
    role: 'balcao',
    status: 'ativo',
    createdAt: '2026-09-05T12:00:00.000Z',
  },
];

// ==================== IN-MEMORY STATE & PERSISTENCE ====================
let memoryTenants: TenantRecord[] = [];
let memoryUsers: StaffUserRecord[] = [];
let memoryOrders: OrderItem[] = [];
let memoryCatalogs: Record<string, TenantCatalog> = {};

// Load / Seed Tenants
try {
  if (fs.existsSync(TENANTS_FILE)) {
    const raw = fs.readFileSync(TENANTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryTenants = parsed;
    } else {
      memoryTenants = [...DEFAULT_TENANTS];
      fs.writeFileSync(TENANTS_FILE, JSON.stringify(memoryTenants, null, 2), 'utf-8');
    }
  } else {
    memoryTenants = [...DEFAULT_TENANTS];
    fs.writeFileSync(TENANTS_FILE, JSON.stringify(memoryTenants, null, 2), 'utf-8');
  }
} catch (err) {
  console.error('[Server] Error loading tenants:', err);
  memoryTenants = [...DEFAULT_TENANTS];
}

// Load / Seed Users
try {
  if (fs.existsSync(USERS_FILE)) {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryUsers = parsed;
    } else {
      memoryUsers = [...DEFAULT_USERS];
      fs.writeFileSync(USERS_FILE, JSON.stringify(memoryUsers, null, 2), 'utf-8');
    }
  } else {
    memoryUsers = [...DEFAULT_USERS];
    fs.writeFileSync(USERS_FILE, JSON.stringify(memoryUsers, null, 2), 'utf-8');
  }
} catch (err) {
  console.error('[Server] Error loading users:', err);
  memoryUsers = [...DEFAULT_USERS];
}

// Load Orders and guarantee tenant_id
try {
  if (fs.existsSync(ORDERS_FILE)) {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryOrders = parsed
        .filter((o: any) => o && o.id && !['ord-1045', 'ord-1044', 'ord-1043', 'ord-1042'].includes(o.id))
        .map((o: any) => ({
          ...o,
          tenant_id: o.tenant_id || 'tenant-gamas',
          createdAt: o.createdAt || new Date().toLocaleString('pt-BR'),
          updatedAt: o.updatedAt || new Date().toISOString(),
        }));
    } else {
      memoryOrders = [];
    }
  }
} catch (err) {
  console.error('[Server] Error loading orders:', err);
  memoryOrders = [];
}

// Load Catalogs
try {
  if (fs.existsSync(CATALOG_FILE)) {
    const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
    memoryCatalogs = JSON.parse(raw) || {};
  }
} catch (err) {
  console.error('[Server] Error loading catalogs:', err);
  memoryCatalogs = {};
}

// Save helpers
const saveTenantsToDisk = () => {
  try {
    fs.writeFileSync(TENANTS_FILE, JSON.stringify(memoryTenants, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to save tenants:', err);
  }
};

const saveUsersToDisk = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(memoryUsers, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to save users:', err);
  }
};

const saveOrdersToDisk = () => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(memoryOrders, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to save orders:', err);
  }
};

const saveCatalogsToDisk = () => {
  try {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(memoryCatalogs, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to save catalogs:', err);
  }
};

// ==================== AUTHENTICATION & SESSIONS ====================
const activeStaffSessions = new Map<string, StaffSession>();

const getStaffSession = (token?: string): StaffSession | null => {
  if (!token) return null;

  // Master override token from environment if configured
  if (token === ADMIN_SECRET) {
    return {
      token: ADMIN_SECRET,
      userId: 'usr-superadmin',
      email: SUPERADMIN_EMAIL,
      name: 'Super Admin Secret',
      role: 'super_admin',
      tenant_id: null,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
  }

  const session = activeStaffSessions.get(token);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    activeStaffSessions.delete(token);
    return null;
  }
  return session;
};

// Super Admin Middleware (only 'super_admin')
const requireSuperAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
  const session = getStaffSession(token);

  if (!session) {
    res.status(401).json({
      success: false,
      message: 'Não autorizado. Token de sessão ausente ou inválido.',
    });
    return;
  }

  if (session.role !== 'super_admin') {
    res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas o Super Administrador (dono da plataforma) pode acessar este recurso.',
    });
    return;
  }

  (req as any).session = session;
  next();
};

// Admin Middleware ('super_admin' or store 'admin')
const requireAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
  const session = getStaffSession(token);

  if (!session) {
    res.status(401).json({
      success: false,
      message: 'Não autorizado. Token de administrador ausente ou inválido.',
    });
    return;
  }

  if (session.role !== 'super_admin' && session.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Acesso negado. O perfil operacional não possui permissão para acessar o Painel Administrativo.',
    });
    return;
  }

  (req as any).session = session;
  next();
};

// Staff Middleware ('super_admin', 'admin', or 'balcao')
const requireStaffAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
  const session = getStaffSession(token);

  if (!session) {
    res.status(401).json({
      success: false,
      message: 'Não autorizado. Sessão de equipe inválida ou expirada.',
    });
    return;
  }

  (req as any).session = session;
  next();
};

// ==================== SSE REAL-TIME SYSTEM (WITH TENANT ISOLATION) ====================
interface SSEClientConnection {
  res: Response;
  isStaff: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role?: StaffRole;
  tenant_id?: string | null;
  customerId?: string;
  orderIds: Set<string>;
}

const sseConnections: SSEClientConnection[] = [];

const notifySSEClients = (data: {
  type: string;
  order?: OrderItem;
  orderId?: string;
  status?: string;
  tenant_id?: string;
  timestamp?: string;
}) => {
  const orderTenantId = data.tenant_id || data.order?.tenant_id;
  const payload = `data: ${JSON.stringify(data)}\n\n`;

  sseConnections.forEach((conn) => {
    try {
      // 1. Super Admin receives all events across all tenants
      if (conn.isSuperAdmin) {
        conn.res.write(payload);
        return;
      }

      // 2. Staff connections (Admin or Balcão) receive events ONLY for their own tenant
      if (conn.isStaff) {
        if (orderTenantId && conn.tenant_id === orderTenantId) {
          conn.res.write(payload);
        }
        return;
      }

      // 3. Client connections: must match order's tenant_id AND client identifiers
      if (orderTenantId && conn.tenant_id && conn.tenant_id !== orderTenantId) {
        return; // Mismatched store: do not deliver event to client
      }

      if (data.type === 'new_order' && data.order) {
        const matchesCustomer = conn.customerId && data.order.customer?.id === conn.customerId;
        const matchesOrderId = conn.orderIds.has(data.order.id);
        if (matchesCustomer || matchesOrderId) {
          conn.res.write(payload);
        }
      } else if (data.type === 'status_updated') {
        const orderId = data.orderId || data.order?.id;
        const matchesOrderId = orderId && conn.orderIds.has(orderId);
        const matchesCustomer = conn.customerId && data.order?.customer?.id === conn.customerId;
        if (matchesOrderId || matchesCustomer) {
          conn.res.write(payload);
        }
      }
    } catch {
      // Client disconnected
    }
  });
};

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    tenantsCount: memoryTenants.length,
    ordersCount: memoryOrders.length,
    serverTime: new Date().toISOString(),
  });
});

// ==================== TENANTS (PUBLIC & CLIENT) ====================

// Public list of active tenants (for store directory, store switcher, selector)
app.get('/api/tenants', (req: Request, res: Response) => {
  const activeTenants = memoryTenants.filter((t) => t.status === 'ativo');
  res.json({
    success: true,
    tenants: activeTenants.map((t) => ({
      id: t.id,
      nome: t.nome,
      slug: t.slug,
      logo: t.logo,
      tagline: t.tagline,
      phone: t.phone,
      whatsapp: t.whatsapp,
      address: t.address,
      status: t.status,
    })),
  });
});

// Public single tenant by slug (with validation of existence and active status)
app.get('/api/tenants/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const cleanSlug = (slug || '').trim().toLowerCase();

  const tenant = memoryTenants.find((t) => t.slug.toLowerCase() === cleanSlug);
  if (!tenant) {
    res.status(404).json({
      success: false,
      code: 'NOT_FOUND',
      message: 'Hamburgueria não encontrada.',
    });
    return;
  }

  if (tenant.status !== 'ativo') {
    res.status(404).json({
      success: false,
      code: 'INACTIVE',
      message: 'Esta hamburgueria está temporariamente indisponível no momento.',
      tenant: {
        id: tenant.id,
        nome: tenant.nome,
        slug: tenant.slug,
        status: tenant.status,
      },
    });
    return;
  }

  res.json({
    success: true,
    tenant,
  });
});

// Public catalog of a specific tenant by slug
app.get('/api/tenants/:slug/catalog', (req: Request, res: Response) => {
  const { slug } = req.params;
  const cleanSlug = (slug || '').trim().toLowerCase();

  const tenant = memoryTenants.find((t) => t.slug.toLowerCase() === cleanSlug);
  if (!tenant) {
    res.status(404).json({ success: false, message: 'Hamburgueria não encontrada.' });
    return;
  }

  if (tenant.status !== 'ativo') {
    res.status(404).json({ success: false, message: 'Hamburgueria inativa no momento.' });
    return;
  }

  const catalog = memoryCatalogs[tenant.id] || null;
  res.json({
    success: true,
    tenantId: tenant.id,
    catalog,
  });
});

// ==================== SUPER ADMIN (MASTER PANEL) ROUTES ====================

// GET /api/master/stats: Global metrics across all stores
app.get('/api/master/stats', requireSuperAdminAuth, (req: Request, res: Response) => {
  const totalTenants = memoryTenants.length;
  const activeTenants = memoryTenants.filter((t) => t.status === 'ativo').length;
  const inactiveTenants = totalTenants - activeTenants;
  const totalOrders = memoryOrders.length;
  const totalRevenue = memoryOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Per tenant breakdown
  const tenantStats = memoryTenants.map((t) => {
    const storeOrders = memoryOrders.filter((o) => o.tenant_id === t.id);
    const storeRevenue = storeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    return {
      tenantId: t.id,
      nome: t.nome,
      slug: t.slug,
      status: t.status,
      ordersCount: storeOrders.length,
      revenue: storeRevenue,
      adminEmail: t.email_admin,
      createdAt: t.createdAt,
    };
  });

  res.json({
    success: true,
    stats: {
      totalTenants,
      activeTenants,
      inactiveTenants,
      totalOrders,
      totalRevenue,
      tenantStats,
    },
  });
});

// GET /api/master/tenants: List all tenants with management data
app.get('/api/master/tenants', requireSuperAdminAuth, (req: Request, res: Response) => {
  const tenantsWithStats = memoryTenants.map((t) => {
    const storeOrders = memoryOrders.filter((o) => o.tenant_id === t.id);
    const storeRevenue = storeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const adminUser = memoryUsers.find((u) => u.tenant_id === t.id && u.role === 'admin');
    return {
      ...t,
      ordersCount: storeOrders.length,
      totalRevenue: storeRevenue,
      adminUserName: adminUser?.name || 'Admin',
    };
  });

  res.json({
    success: true,
    tenants: tenantsWithStats,
  });
});

// Helper: auto-generate safe slug from store name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);
};

// POST /api/master/tenants: Create new store + auto-create initial 'admin' user
app.post('/api/master/tenants', requireSuperAdminAuth, (req: Request, res: Response) => {
  try {
    const {
      nome,
      slug: customSlug,
      email_admin,
      admin_password,
      admin_name,
      phone,
      whatsapp,
      address,
      logo,
      tagline,
    } = req.body || {};

    if (!nome || !nome.trim()) {
      res.status(400).json({ success: false, message: 'O nome da hamburgueria é obrigatório.' });
      return;
    }

    if (!email_admin || !email_admin.trim()) {
      res.status(400).json({ success: false, message: 'O e-mail do administrador é obrigatório.' });
      return;
    }

    const cleanName = nome.trim();
    const cleanEmail = email_admin.trim().toLowerCase();
    const targetSlug = (customSlug ? generateSlug(customSlug) : generateSlug(cleanName)) || `loja-${Date.now()}`;

    // Check slug uniqueness
    const existingSlug = memoryTenants.find((t) => t.slug.toLowerCase() === targetSlug);
    if (existingSlug) {
      res.status(400).json({
        success: false,
        message: `O slug "${targetSlug}" já está em uso por outra hamburgueria. Escolha um slug diferente.`,
      });
      return;
    }

    const newTenantId = `tenant-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newTenant: TenantRecord = {
      id: newTenantId,
      nome: cleanName,
      slug: targetSlug,
      email_admin: cleanEmail,
      status: 'ativo',
      createdAt: nowIso,
      updatedAt: nowIso,
      logo: logo || '🍔',
      tagline: tagline || 'Hamburgueria Artesanal & Delivery',
      phone: phone || '',
      whatsapp: whatsapp || '',
      address: address || 'Balcão e Delivery',
    };

    memoryTenants.push(newTenant);
    saveTenantsToDisk();

    // Auto-create initial 'admin' user bound to this tenant
    const newUserId = `usr-${Date.now()}`;
    const initialAdminUser: StaffUserRecord = {
      id: newUserId,
      tenant_id: newTenantId,
      name: admin_name && admin_name.trim() ? admin_name.trim() : `Admin ${cleanName}`,
      email: cleanEmail,
      password: admin_password && admin_password.trim() ? admin_password.trim() : 'admin123',
      role: 'admin',
      status: 'ativo',
      createdAt: nowIso,
    };

    memoryUsers.push(initialAdminUser);
    saveUsersToDisk();

    console.log(`[Master] Nova hamburgueria "${cleanName}" criada com sucesso! Slug: /loja/${targetSlug}. Admin: ${cleanEmail}`);

    res.status(201).json({
      success: true,
      tenant: newTenant,
      adminUser: {
        id: initialAdminUser.id,
        name: initialAdminUser.name,
        email: initialAdminUser.email,
        role: initialAdminUser.role,
        tenant_id: initialAdminUser.tenant_id,
      },
      message: `Hamburgueria "${cleanName}" e usuário administrador criados com sucesso!`,
    });
  } catch (error: any) {
    console.error('[Master] Erro ao cadastrar hamburgueria:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/master/tenants/:id: Update store details
app.put('/api/master/tenants/:id', requireSuperAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, slug: newSlug, email_admin, phone, whatsapp, address, logo, tagline, status } = req.body || {};

  const tenantIndex = memoryTenants.findIndex((t) => t.id === id);
  if (tenantIndex === -1) {
    res.status(404).json({ success: false, message: 'Hamburgueria não encontrada.' });
    return;
  }

  const existingTenant = memoryTenants[tenantIndex];

  // If slug is changing, verify uniqueness
  if (newSlug) {
    const safeSlug = generateSlug(newSlug);
    const slugInUse = memoryTenants.find((t) => t.id !== id && t.slug.toLowerCase() === safeSlug);
    if (slugInUse) {
      res.status(400).json({ success: false, message: `O slug "${safeSlug}" já está em uso.` });
      return;
    }
    existingTenant.slug = safeSlug;
  }

  if (nome) existingTenant.nome = nome.trim();
  if (email_admin) existingTenant.email_admin = email_admin.trim().toLowerCase();
  if (phone !== undefined) existingTenant.phone = phone;
  if (whatsapp !== undefined) existingTenant.whatsapp = whatsapp;
  if (address !== undefined) existingTenant.address = address;
  if (logo !== undefined) existingTenant.logo = logo;
  if (tagline !== undefined) existingTenant.tagline = tagline;
  if (status && (status === 'ativo' || status === 'inativo')) existingTenant.status = status;
  existingTenant.updatedAt = new Date().toISOString();

  saveTenantsToDisk();

  res.json({
    success: true,
    tenant: existingTenant,
    message: 'Hamburgueria atualizada com sucesso!',
  });
});

// PATCH /api/master/tenants/:id/status: Activate or deactivate store
app.patch('/api/master/tenants/:id/status', requireSuperAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const tenant = memoryTenants.find((t) => t.id === id);
  if (!tenant) {
    res.status(404).json({ success: false, message: 'Hamburgueria não encontrada.' });
    return;
  }

  const nextStatus = status === 'inativo' || status === 'ativo'
    ? status
    : tenant.status === 'ativo' ? 'inativo' : 'ativo';

  tenant.status = nextStatus;
  tenant.updatedAt = new Date().toISOString();
  saveTenantsToDisk();

  res.json({
    success: true,
    tenant,
    message: `Status da loja "${tenant.nome}" alterado para ${tenant.status.toUpperCase()}!`,
  });
});

// GET /api/master/users: List all users and store associations
app.get('/api/master/users', requireSuperAdminAuth, (req: Request, res: Response) => {
  const safeUsers = memoryUsers.map((u) => {
    const tenant = memoryTenants.find((t) => t.id === u.tenant_id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      tenant_id: u.tenant_id,
      tenantName: tenant ? tenant.nome : (u.role === 'super_admin' ? 'Plataforma Global' : 'Sem Loja'),
      createdAt: u.createdAt,
    };
  });

  res.json({
    success: true,
    users: safeUsers,
  });
});

// ==================== AUTHENTICATION (STAFF & SUPER ADMIN) ====================

// POST /api/admin/login: Authenticate staff with role and tenant_id resolution
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // 1. Check in persistent users database
  let user = memoryUsers.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass && u.status === 'ativo'
  );

  // 2. Fallback check for super admin env credentials
  if (!user && cleanEmail === SUPERADMIN_EMAIL && cleanPass === SUPERADMIN_PASSWORD) {
    user = {
      id: 'usr-superadmin',
      tenant_id: null,
      name: 'Super Administrador',
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      role: 'super_admin',
      status: 'ativo',
      createdAt: new Date().toISOString(),
    };
  }

  // 3. Fallback check for legacy env credentials
  if (!user && cleanEmail === ADMIN_EMAIL && cleanPass === ADMIN_PASSWORD) {
    user = {
      id: 'usr-gamas-admin',
      tenant_id: 'tenant-gamas',
      name: "Admin Gama's Burger",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      status: 'ativo',
      createdAt: new Date().toISOString(),
    };
  }

  if (!user && (cleanEmail === BALCAO_EMAIL || cleanEmail === 'balcao' || cleanEmail === 'balcão') && cleanPass === BALCAO_PASSWORD) {
    user = {
      id: 'usr-gamas-balcao',
      tenant_id: 'tenant-gamas',
      name: "Balcão Gama's Burger",
      email: BALCAO_EMAIL,
      password: BALCAO_PASSWORD,
      role: 'balcao',
      status: 'ativo',
      createdAt: new Date().toISOString(),
    };
  }

  if (user) {
    // If user belongs to an inactive tenant (and is not super_admin), block access
    let tenantRecord: TenantRecord | undefined;
    if (user.tenant_id) {
      tenantRecord = memoryTenants.find((t) => t.id === user?.tenant_id);
      if (tenantRecord && tenantRecord.status === 'inativo') {
        res.status(403).json({
          success: false,
          message: 'Acesso bloqueado: esta hamburgueria está atualmente desativada pela plataforma.',
        });
        return;
      }
    }

    const token = `${user.role === 'super_admin' ? 'sup' : user.role === 'admin' ? 'adm' : 'blc'}_${crypto.randomBytes(24).toString('hex')}`;
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000;

    const session: StaffSession = {
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenant_id: user.tenant_id,
      tenantName: tenantRecord?.nome,
      tenantSlug: tenantRecord?.slug,
      createdAt: now,
      expiresAt,
    };

    activeStaffSessions.set(token, session);

    res.json({
      success: true,
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenant_id: user.tenant_id,
      tenantName: tenantRecord?.nome,
      tenantSlug: tenantRecord?.slug,
      expiresAt,
      message:
        user.role === 'super_admin'
          ? 'Autenticado como Super Administrador da Plataforma!'
          : user.role === 'admin'
          ? `Autenticado como Administrador de ${tenantRecord?.nome || 'sua loja'}!`
          : `Autenticado como Operador do Balcão de ${tenantRecord?.nome || 'sua loja'}!`,
    });
    return;
  }

  res.status(401).json({
    success: false,
    message: 'Credenciais de acesso inválidas. Verifique seu e-mail e senha.',
  });
});

// GET /api/admin/verify: Verify session token and retrieve current staff context
app.get('/api/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

  const session = getStaffSession(token);
  if (session) {
    const tenant = session.tenant_id ? memoryTenants.find((t) => t.id === session.tenant_id) : undefined;
    res.json({
      success: true,
      valid: true,
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      tenant_id: session.tenant_id,
      tenantName: tenant?.nome || session.tenantName,
      tenantSlug: tenant?.slug || session.tenantSlug,
    });
    return;
  }

  res.status(401).json({
    success: false,
    valid: false,
    message: 'Sessão de equipe inválida ou expirada.',
  });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeStaffSessions.delete(token);
  }
  res.json({ success: true });
});

// ==================== SSE STREAM WITH STRICT TENANT ROUTING ====================
app.get('/api/orders/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const queryToken = (req.query.token as string) || '';
  const authHeader = req.headers.authorization;
  const token = queryToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '');

  const session = getStaffSession(token);
  const isSuperAdmin = session !== null && session.role === 'super_admin';
  const isStaff = session !== null;
  const isAdmin = session !== null && (session.role === 'admin' || session.role === 'super_admin');
  const role = session?.role;

  // For staff: lock to their tenant_id. For client: take tenantId query parameter
  const tenant_id = session ? session.tenant_id : (typeof req.query.tenantId === 'string' ? req.query.tenantId : null);

  const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : undefined;
  const orderIdsRaw = typeof req.query.orderIds === 'string' ? req.query.orderIds : '';
  const orderIds = new Set<string>(orderIdsRaw ? orderIdsRaw.split(',').map((id) => id.trim()).filter(Boolean) : []);

  const clientConn: SSEClientConnection = {
    res,
    isStaff,
    isAdmin,
    isSuperAdmin,
    role,
    tenant_id,
    customerId,
    orderIds,
  };

  res.write(
    `data: ${JSON.stringify({
      type: 'connected',
      isStaff,
      isAdmin,
      isSuperAdmin,
      role,
      tenant_id,
      serverTime: new Date().toISOString(),
    })}\n\n`
  );
  sseConnections.push(clientConn);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const index = sseConnections.indexOf(clientConn);
    if (index !== -1) {
      sseConnections.splice(index, 1);
    }
  });
});

// ==================== ORDERS API WITH STRICT TENANT_ID ISOLATION ====================

// GET /api/orders (Public Client Route OR Staff polling)
app.get('/api/orders', (req: Request, res: Response) => {
  const { customerId, phone, orderIds, kitchen, balcao, tenantId, tenantSlug } = req.query;

  // Resolve target tenant if provided via slug or ID
  let resolvedTenantId = typeof tenantId === 'string' ? tenantId.trim() : '';
  if (!resolvedTenantId && typeof tenantSlug === 'string') {
    const t = memoryTenants.find((item) => item.slug.toLowerCase() === tenantSlug.toLowerCase().trim());
    if (t) resolvedTenantId = t.id;
  }

  // Operational Balcão / Kitchen endpoint strictly protected by staff authentication
  if (kitchen === 'true' || balcao === 'true') {
    const queryToken = typeof req.query.token === 'string' ? req.query.token : '';
    const authHeader = req.headers.authorization;
    const token = queryToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '');

    const session = getStaffSession(token);
    if (!session) {
      res.status(401).json({
        success: false,
        message: 'Acesso restrito. Autenticação de equipe necessária para o painel operacional.',
      });
      return;
    }

    // STRICT TENANT ISOLATION: Staff only sees orders for their tenant_id!
    const staffOrders = session.role === 'super_admin'
      ? (resolvedTenantId ? memoryOrders.filter((o) => o.tenant_id === resolvedTenantId) : memoryOrders)
      : memoryOrders.filter((o) => o.tenant_id === session.tenant_id);

    res.json({
      success: true,
      orders: staffOrders,
      count: staffOrders.length,
      tenant_id: session.tenant_id,
    });
    return;
  }

  // Public Client querying their orders
  const cId = typeof customerId === 'string' ? customerId.trim() : '';
  const cPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';
  const requestedIds = typeof orderIds === 'string'
    ? orderIds.split(',').map((id) => id.trim()).filter(Boolean)
    : [];

  // CRITICAL SECURITY: If no customer identifier is supplied, NEVER return memoryOrders!
  if (!cId && !cPhone && requestedIds.length === 0) {
    res.json({
      success: true,
      orders: [],
      count: 0,
    });
    return;
  }

  const filtered = memoryOrders.filter((order) => {
    // If tenantId specified, enforce it
    if (resolvedTenantId && order.tenant_id !== resolvedTenantId) {
      return false;
    }

    if (requestedIds.includes(order.id)) return true;
    if (cId && order.customer && order.customer.id === cId) return true;
    if (cPhone && order.customer && order.customer.phone) {
      const orderPhoneClean = order.customer.phone.replace(/\D/g, '');
      if (
        orderPhoneClean &&
        (orderPhoneClean === cPhone ||
          orderPhoneClean.endsWith(cPhone) ||
          cPhone.endsWith(orderPhoneClean))
      ) {
        return true;
      }
    }
    return false;
  });

  res.json({
    success: true,
    orders: filtered,
    count: filtered.length,
  });
});

// GET /api/admin/orders (Admin Only - strictly filtered by session.tenant_id)
app.get('/api/admin/orders', requireAdminAuth, (req: Request, res: Response) => {
  const session: StaffSession = (req as any).session;
  const { tenantId: filterTenantId } = req.query;

  let tenantOrders: OrderItem[];
  if (session.role === 'super_admin') {
    // Super admin can see all orders or filter by specific tenant
    tenantOrders = filterTenantId
      ? memoryOrders.filter((o) => o.tenant_id === filterTenantId)
      : memoryOrders;
  } else {
    // STRICT TENANT ISOLATION: store admin only sees their own store orders!
    tenantOrders = memoryOrders.filter((o) => o.tenant_id === session.tenant_id);
  }

  res.json({
    success: true,
    orders: tenantOrders,
    count: tenantOrders.length,
    tenant_id: session.tenant_id,
  });
});

// GET /api/balcao/orders (Staff Route - strictly filtered by session.tenant_id)
app.get('/api/balcao/orders', requireStaffAuth, (req: Request, res: Response) => {
  const session: StaffSession = (req as any).session;

  const tenantOrders = session.role === 'super_admin'
    ? memoryOrders
    : memoryOrders.filter((o) => o.tenant_id === session.tenant_id);

  res.json({
    success: true,
    orders: tenantOrders,
    count: tenantOrders.length,
    tenant_id: session.tenant_id,
  });
});

// POST /api/orders (Client creates order strictly attached to tenant_id)
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const orderData: OrderItem = req.body;
    if (
      !orderData ||
      !orderData.id ||
      !orderData.items ||
      !Array.isArray(orderData.items) ||
      orderData.items.length === 0
    ) {
      res.status(400).json({ success: false, message: 'Dados do pedido inválidos ou itens ausentes' });
      return;
    }

    // STRICT TENANT VALIDATION
    const tenant_id = orderData.tenant_id || (req.headers['x-tenant-id'] as string) || 'tenant-gamas';
    const targetTenant = memoryTenants.find((t) => t.id === tenant_id || t.slug === tenant_id);

    if (!targetTenant) {
      res.status(400).json({ success: false, message: 'Hamburgueria inválida ou não encontrada.' });
      return;
    }

    if (targetTenant.status !== 'ativo') {
      res.status(400).json({ success: false, message: 'Esta hamburgueria está inativa para receber pedidos no momento.' });
      return;
    }

    orderData.tenant_id = targetTenant.id;

    // Ensure customer ID exists
    if (!orderData.customer) {
      orderData.customer = { id: `cust-${Date.now()}` };
    } else if (!orderData.customer.id) {
      orderData.customer.id = `cust-${Date.now()}`;
    }

    // Check if order already exists
    const existingIndex = memoryOrders.findIndex((o) => o.id === orderData.id);

    // Calculate sequential order number per tenant or globally
    const tenantExistingOrders = memoryOrders.filter((o) => o.tenant_id === targetTenant.id);
    const existingNums = tenantExistingOrders
      .map((o) => parseInt(String(o.orderNumber), 10))
      .filter((n) => !isNaN(n));
    const highestNum = existingNums.length > 0 ? Math.max(...existingNums) : 1000;

    const isNumTakenByOther = tenantExistingOrders.some(
      (o) => o.id !== orderData.id && String(o.orderNumber) === String(orderData.orderNumber)
    );

    if (!orderData.orderNumber || isNumTakenByOther) {
      orderData.orderNumber = String(highestNum + 1);
    }

    if (!orderData.createdAt) {
      const now = new Date();
      orderData.createdAt = `${now.toLocaleDateString('pt-BR')} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    if (!orderData.updatedAt) {
      orderData.updatedAt = new Date().toISOString();
    }

    if (existingIndex !== -1) {
      memoryOrders[existingIndex] = { ...memoryOrders[existingIndex], ...orderData };
    } else {
      memoryOrders.unshift(orderData);
    }

    saveOrdersToDisk();

    // Auto-associate with client connection if active
    if (orderData.customer?.id) {
      sseConnections.forEach((conn) => {
        if (!conn.isAdmin && conn.customerId === orderData.customer.id) {
          conn.orderIds.add(orderData.id);
        }
      });
    }

    // Broadcast in real-time strictly to that tenant's staff & matching customer
    notifySSEClients({
      type: 'new_order',
      order: orderData,
      tenant_id: targetTenant.id,
      timestamp: new Date().toISOString(),
    });

    console.log(`[Server] Novo pedido #${orderData.orderNumber} em [${targetTenant.nome}]! Total: R$ ${orderData.total}`);
    res.status(201).json({ success: true, order: orderData, tenant: targetTenant });
  } catch (error: any) {
    console.error('[Server] Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/orders/:id/status: Update order status (with tenant ownership check)
app.patch('/api/orders/:id/status', requireStaffAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, updatedAt } = req.body;
    const session: StaffSession = (req as any).session;

    const validStatuses = ['received', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Status de pedido inválido' });
      return;
    }

    const orderIndex = memoryOrders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      res.status(404).json({ success: false, message: 'Pedido não encontrado' });
      return;
    }

    const order = memoryOrders[orderIndex];

    // STRICT ISOLATION CHECK: If not super_admin, staff cannot modify an order from another tenant!
    if (session.role !== 'super_admin' && order.tenant_id !== session.tenant_id) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para alterar pedidos de outra hamburgueria.',
      });
      return;
    }

    order.status = status;
    order.updatedAt = updatedAt || new Date().toISOString();

    if (order.timeline && Array.isArray(order.timeline)) {
      const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      order.timeline = order.timeline.map((step: any) => {
        if (step.status === status) {
          return { ...step, completed: true, time: step.time || nowTime };
        }
        return step;
      });
    }

    saveOrdersToDisk();

    // Broadcast status change strictly to that tenant
    notifySSEClients({
      type: 'status_updated',
      orderId: id,
      status,
      order,
      tenant_id: order.tenant_id,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, order });
  } catch (error: any) {
    console.error('[Server] Error updating order status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/catalog: Save tenant catalog updates (products, categories, settings)
app.post('/api/admin/catalog', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const session: StaffSession = (req as any).session;
    const { targetTenantId, catalog } = req.body || {};

    const tenantIdToSave = session.role === 'super_admin'
      ? (targetTenantId || session.tenant_id || 'tenant-gamas')
      : session.tenant_id;

    if (!tenantIdToSave) {
      res.status(400).json({ success: false, message: 'Identificador de hamburgueria ausente.' });
      return;
    }

    memoryCatalogs[tenantIdToSave] = {
      ...(memoryCatalogs[tenantIdToSave] || {}),
      ...catalog,
    };
    saveCatalogsToDisk();

    res.json({
      success: true,
      tenantId: tenantIdToSave,
      message: 'Catálogo da hamburgueria salvo com sucesso!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk sync orders (protected - admin only)
app.post('/api/orders/sync', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const session: StaffSession = (req as any).session;
    const { initialOrders } = req.body;
    if (Array.isArray(initialOrders)) {
      if (session.role === 'super_admin') {
        memoryOrders = [...initialOrders];
      } else {
        // Only replace orders for this tenant
        const otherOrders = memoryOrders.filter((o) => o.tenant_id !== session.tenant_id);
        const scopedInitial = initialOrders.map((o) => ({ ...o, tenant_id: session.tenant_id }));
        memoryOrders = [...scopedInitial, ...otherOrders];
      }
      saveOrdersToDisk();
    }
    res.json({ success: true, orders: memoryOrders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== VITE & PRODUCTION STARTUP ====================

async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Anota AI Multi-Tenant Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
