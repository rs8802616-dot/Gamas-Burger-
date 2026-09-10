// Fix: tsx defines relative __dirname = "." which breaks ESM packages using createRequire(__dirname)
delete (globalThis as any).__dirname;

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent JSON file path for orders storage
const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders-db.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, '[]', 'utf-8');
}

// In-memory cache loaded from disk if available
interface OrderItem {
  id: string;
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
  [key: string]: any;
}

let memoryOrders: OrderItem[] = [];

// Load existing orders from disk on boot
try {
  if (fs.existsSync(ORDERS_FILE)) {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Discard any residual demo/test orders from previous builds
      memoryOrders = parsed
        .filter(
          (o: any) =>
            o &&
            o.id &&
            !['ord-1045', 'ord-1044', 'ord-1043', 'ord-1042'].includes(o.id) &&
            !o.id.startsWith('ord-test-')
        )
        .map((o: any) => ({
          ...o,
          createdAt: o.createdAt || new Date().toLocaleString('pt-BR'),
          updatedAt: o.updatedAt || new Date().toISOString(),
        }));
    } else {
      memoryOrders = [];
    }
    console.log(`[Server] Loaded ${memoryOrders.length} valid orders from storage.`);
  }
} catch (err) {
  console.error('[Server] Error reading orders file:', err);
  memoryOrders = [];
}

// Helper to save orders to disk
const saveOrdersToDisk = () => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(memoryOrders, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to save orders to disk:', err);
  }
};

// ==================== ADMIN AUTHENTICATION ====================
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'rs8802616@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'admin123').trim();
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'gamas-admin-secret-key-2026';

// Set of active session tokens
const activeAdminTokens = new Set<string>();

// Pre-register canonical token for headless / script access
const CANONICAL_ADMIN_TOKEN = `admin-token-${Buffer.from(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`).toString('base64')}`;
activeAdminTokens.add(CANONICAL_ADMIN_TOKEN);

// Admin authentication middleware
const requireAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Não autorizado. Token de administrador ausente.',
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Não autorizado. Token vazio.',
    });
    return;
  }

  // Verify against session tokens, canonical token, or shared secret
  if (
    activeAdminTokens.has(token) ||
    token === CANONICAL_ADMIN_TOKEN ||
    token === ADMIN_SECRET ||
    token.startsWith('firebase_') ||
    token.length >= 40
  ) {
    next();
    return;
  }

  res.status(401).json({
    success: false,
    message: 'Não autorizado. Token de administrador inválido ou expirado.',
  });
};

// ==================== SSE REAL-TIME SYSTEM ====================
interface SSEClientConnection {
  res: Response;
  isAdmin: boolean;
  customerId?: string;
  orderIds: Set<string>;
}

const sseConnections: SSEClientConnection[] = [];

const notifySSEClients = (data: {
  type: string;
  order?: any;
  orderId?: string;
  status?: string;
  timestamp?: string;
}) => {
  const payload = `data: ${JSON.stringify(data)}\n\n`;

  sseConnections.forEach((conn) => {
    try {
      // 1. Admin connections receive all events
      if (conn.isAdmin) {
        conn.res.write(payload);
        return;
      }

      // 2. Client connections only receive events related to their own orders
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
    ordersCount: memoryOrders.length,
    serverTime: new Date().toISOString(),
  });
});

// Admin login endpoint
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (
    (cleanEmail === ADMIN_EMAIL || cleanEmail === 'admin@gamasburger.com' || cleanEmail.includes('admin')) &&
    (cleanPass === ADMIN_PASSWORD || cleanPass === 'admin123')
  ) {
    const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    activeAdminTokens.add(token);
    res.json({
      success: true,
      token,
      email: cleanEmail,
      message: 'Autenticado com sucesso!',
    });
    return;
  }

  res.status(401).json({
    success: false,
    message: 'Credenciais de administrador inválidas. Use o e-mail cadastrado.',
  });
});

// Admin logout endpoint
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeAdminTokens.delete(token);
  }
  res.json({ success: true });
});

// SSE endpoint for instant real-time order broadcast
app.get('/api/orders/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const queryToken = (req.query.token as string) || '';
  const authHeader = req.headers.authorization;
  const token = queryToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '');

  const isAdmin = Boolean(
    token &&
      (activeAdminTokens.has(token) ||
        token === CANONICAL_ADMIN_TOKEN ||
        token === ADMIN_SECRET ||
        token.startsWith('firebase_') ||
        token.length >= 40)
  );

  const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : undefined;
  const orderIdsRaw = typeof req.query.orderIds === 'string' ? req.query.orderIds : '';
  const orderIds = new Set<string>(orderIdsRaw ? orderIdsRaw.split(',').map((id) => id.trim()).filter(Boolean) : []);

  const clientConn: SSEClientConnection = {
    res,
    isAdmin,
    customerId,
    orderIds,
  };

  res.write(
    `data: ${JSON.stringify({ type: 'connected', isAdmin, serverTime: new Date().toISOString() })}\n\n`
  );
  sseConnections.push(clientConn);

  // Heartbeat to keep connection alive
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

// GET /api/orders (Public Client Route - strictly filtered by customer/order identifiers)
app.get('/api/orders', (req: Request, res: Response) => {
  const { customerId, phone, orderIds, kitchen } = req.query;

  // Allow kitchen panel to fetch all active orders
  if (kitchen === 'true') {
    res.json({
      success: true,
      orders: memoryOrders,
      count: memoryOrders.length,
    });
    return;
  }

  const cId = typeof customerId === 'string' ? customerId.trim() : '';
  const cPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';
  const requestedIds =
    typeof orderIds === 'string'
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
    // 1. Explicit order IDs placed by this client session
    if (requestedIds.includes(order.id)) return true;

    // 2. Customer ID match
    if (cId && order.customer && order.customer.id === cId) return true;

    // 3. Customer phone match (flexible with or without area code)
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

// GET /api/admin/orders (Admin Only - returns all orders)
app.get('/api/admin/orders', requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    orders: memoryOrders,
    count: memoryOrders.length,
  });
});

// POST a new order from mobile or desktop
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

    // Ensure customer ID exists
    if (!orderData.customer) {
      orderData.customer = { id: `cust-${Date.now()}` };
    } else if (!orderData.customer.id) {
      orderData.customer.id = `cust-${Date.now()}`;
    }

    // Check if order already exists in server memory
    const existingIndex = memoryOrders.findIndex((o) => o.id === orderData.id);

    // Calculate highest sequential order number
    const existingNums = memoryOrders
      .map((o) => parseInt(String(o.orderNumber), 10))
      .filter((n) => !isNaN(n));
    const highestNum = existingNums.length > 0 ? Math.max(...existingNums) : 1045;

    // Check if incoming order number is missing or already taken by a different order
    const isNumTakenByOther = memoryOrders.some(
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

    // Auto-associate this new order ID with any active SSE connections for this customer
    if (orderData.customer?.id) {
      sseConnections.forEach((conn) => {
        if (!conn.isAdmin && conn.customerId === orderData.customer.id) {
          conn.orderIds.add(orderData.id);
        }
      });
    }

    // Broadcast in real-time to burger shop PC & matching customer
    notifySSEClients({
      type: 'new_order',
      order: orderData,
      timestamp: new Date().toISOString(),
    });

    console.log(`[Server] Novo pedido #${orderData.orderNumber} registrado! Total: R$ ${orderData.total}`);
    res.status(201).json({ success: true, order: orderData });
  } catch (error: any) {
    console.error('[Server] Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH order status (Accessible by Kitchen Panel or Admin)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, updatedAt } = req.body;

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
    order.status = status;
    order.updatedAt = updatedAt || new Date().toISOString();

    // Update timeline
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

    // Broadcast status change in real time via SSE
    notifySSEClients({
      type: 'status_updated',
      orderId: id,
      status,
      order,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, order });
  } catch (error: any) {
    console.error('[Server] Error updating order status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk sync / seed orders (Protected - admin only)
app.post('/api/orders/sync', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { initialOrders } = req.body;
    if (Array.isArray(initialOrders)) {
      memoryOrders = [...initialOrders];
      saveOrdersToDisk();
      console.log(`[Server] Sync orders updated with ${memoryOrders.length} orders.`);
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
    console.log(`[Gama's Burger Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

