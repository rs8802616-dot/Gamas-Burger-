import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent JSON file path for orders storage
const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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
    memoryOrders = JSON.parse(raw);
    console.log(`[Server] Loaded ${memoryOrders.length} orders from persistent storage.`);
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

// SSE connected clients
const sseClients: Response[] = [];

const notifySSEClients = (data: any) => {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // client disconnected
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

// SSE endpoint for instant real-time order broadcast
app.get('/api/orders/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected', serverTime: new Date().toISOString() })}\n\n`);
  sseClients.push(res);

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// GET all orders
app.get('/api/orders', (req: Request, res: Response) => {
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
    if (!orderData || !orderData.id) {
      res.status(400).json({ success: false, message: 'Dados do pedido inválidos' });
      return;
    }

    // Check if order already exists
    const existingIndex = memoryOrders.findIndex((o) => o.id === orderData.id);
    if (existingIndex !== -1) {
      memoryOrders[existingIndex] = { ...memoryOrders[existingIndex], ...orderData };
    } else {
      memoryOrders.unshift(orderData);
    }

    saveOrdersToDisk();

    // Broadcast in real-time to burger shop PC & other clients
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

// PATCH order status (from kitchen or admin on PC)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderIndex = memoryOrders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      res.status(404).json({ success: false, message: 'Pedido não encontrado' });
      return;
    }

    const order = memoryOrders[orderIndex];
    order.status = status;

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

    // Broadcast status change so mobile customer sees the live tracker update
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

// Bulk sync / seed initial orders if server is empty
app.post('/api/orders/sync', (req: Request, res: Response) => {
  try {
    const { initialOrders } = req.body;
    if (memoryOrders.length === 0 && Array.isArray(initialOrders) && initialOrders.length > 0) {
      memoryOrders = [...initialOrders];
      saveOrdersToDisk();
      console.log(`[Server] Initialized server with ${memoryOrders.length} initial orders.`);
    }
    res.json({ success: true, orders: memoryOrders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== VITE & PRODUCTION STARTUP ====================

async function startServer() {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Burger10 Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
