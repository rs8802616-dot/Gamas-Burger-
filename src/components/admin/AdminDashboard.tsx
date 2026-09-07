import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  Tag,
  MapPin,
  Settings,
  TrendingUp,
  DollarSign,
  Clock,
  Printer,
  Plus,
  Trash2,
  Edit2,
  Check,
  Flame,
  MessageCircle,
  Eye,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Bell,
  Users,
  Database,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, generateWhatsAppLink } from '../../utils/formatters';
import { Product, Coupon, DeliveryZone, OrderStatus } from '../../types';
import { AdminNotificationsManager } from './AdminNotificationsManager';
import { AdminCustomersManager } from './AdminCustomersManager';
import { AdminFirebaseManager } from './AdminFirebaseManager';

export const AdminDashboard: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    orders,
    products,
    categories,
    coupons,
    deliveryZones,
    storeSettings,
    updateStoreSettings,
    updateOrderStatus,
    printThermalReceipt,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    addCoupon,
    deleteCoupon,
    updateDeliveryZoneFee,
    addDeliveryZone,
    deleteDeliveryZone,
    simulateIncomingOrder,
  } = useStore();

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState(categories[0]?.id || 'cat-burgers');
  const [prodPrice, setProdPrice] = useState('29.90');
  const [prodPromoPrice, setProdPromoPrice] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPhoto, setProdPhoto] = useState('');
  const [prodIngredients, setProdIngredients] = useState('Pão brioche, blend 160g, queijo cheddar');
  const [prodIsDailyOffer, setProdIsDailyOffer] = useState(false);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);

  // Coupon modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState<'percentage' | 'fixed'>('percentage');
  const [coupValue, setCoupValue] = useState('10');
  const [coupMin, setCoupMin] = useState('30');

  // Delivery zone state
  const [newZoneNeighborhood, setNewZoneNeighborhood] = useState('');
  const [newZoneFee, setNewZoneFee] = useState('6.00');

  // Category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🍔');

  // Orders status filter in admin
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');

  // Financial calculations
  const totalSalesToday = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, curr) => acc + curr.total, 0);

  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const averageTicket = totalOrdersCount > 0 ? totalSalesToday / totalOrdersCount : 0;

  // Best selling products summary
  const productSalesMap: Record<string, { count: number; name: string; revenue: number }> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productSalesMap[item.product.id]) {
        productSalesMap[item.product.id] = { count: 0, name: item.product.name, revenue: 0 };
      }
      productSalesMap[item.product.id].count += item.quantity;
      productSalesMap[item.product.id].revenue += item.itemTotalPrice * item.quantity;
    });
  });

  const topSellingList = Object.values(productSalesMap).sort((a, b) => b.count - a.count);

  const handleOpenNewProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategoryId(categories[0]?.id || 'cat-burgers');
    setProdPrice('29.90');
    setProdPromoPrice('');
    setProdDescription('');
    setProdPhoto('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80');
    setProdIngredients('Pão brioche, blend 180g, queijo cheddar, bacon crocante, molho especial');
    setProdIsDailyOffer(false);
    setProdIsBestSeller(false);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategoryId(prod.categoryId);
    setProdPrice(prod.price.toString());
    setProdPromoPrice(prod.promoPrice ? prod.promoPrice.toString() : '');
    setProdDescription(prod.description);
    setProdPhoto(prod.photo);
    setProdIngredients(prod.ingredients?.join(', ') || '');
    setProdIsDailyOffer(!!prod.isDailyOffer);
    setProdIsBestSeller(!!prod.isBestSeller);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: prodName,
      categoryId: prodCategoryId,
      price: parseFloat(prodPrice) || 0,
      promoPrice: prodPromoPrice ? parseFloat(prodPromoPrice) : undefined,
      description: prodDescription,
      photo: prodPhoto || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      ingredients: prodIngredients.split(',').map((s) => s.trim()).filter(Boolean),
      isDailyOffer: prodIsDailyOffer,
      isBestSeller: prodIsBestSeller,
      available: true,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setIsProductModalOpen(false);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupCode) return;
    addCoupon({
      code: coupCode.toUpperCase(),
      discountType: coupType,
      value: parseFloat(coupValue) || 0,
      minOrderValue: parseFloat(coupMin) || 0,
      isActive: true,
      maxUses: 100,
      currentUses: 0,
    });
    setCoupCode('');
    setIsCouponModalOpen(false);
  };

  const handleAddDeliveryZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneNeighborhood) return;
    addDeliveryZone(newZoneNeighborhood, parseFloat(newZoneFee) || 5.00);
    setNewZoneNeighborhood('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    addCategory(newCatName, newCatIcon);
    setNewCatName('');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Admin Header Bar */}
      <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-white tracking-tight">
              Painel do Proprietário
            </h1>
            <span className="bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Gerência
            </span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            Gestão operacional, vendas, cardápio, pedidos e integrações
          </p>
        </div>

        {/* Quick simulation button */}
        <div className="flex items-center gap-2">
          <button
            onClick={simulateIncomingOrder}
            className="flex items-center gap-2 bg-[#0A0A0B] hover:bg-[#202024] text-amber-400 border border-white/5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simular Pedido</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation: Desktop Sidebar + Mobile Scrollable Tabs */}
      <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
          { id: 'orders', label: 'Pedidos', icon: ShoppingBag, count: activeOrdersCount },
          { id: 'products', label: 'Cardápio', icon: UtensilsCrossed },
          { id: 'categories', label: 'Categorias', icon: Layers },
          { id: 'coupons', label: 'Cupons', icon: Tag },
          { id: 'delivery', label: 'Taxas', icon: MapPin },
          { id: 'notifications', label: 'Notificações', icon: Bell },
          { id: 'customers', label: 'Clientes', icon: Users },
          { id: 'settings', label: 'Configurações', icon: Settings },
          { id: 'firebase', label: 'Banco Firebase', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as typeof adminTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-[#151518] text-white/50 border-white/5 hover:border-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6 items-start">
        {/* Desktop Sidebar (Requirement 25) */}
        <aside className="hidden lg:block bg-[#151518] border border-white/5 rounded-3xl p-4 sticky top-4 shadow-xl space-y-2">
          <div className="px-3 py-2 mb-2 border-b border-white/5">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
              Menu Administrativo
            </span>
            <span className="text-xs text-white/40">Gestão integrada</span>
          </div>

          {[
            { id: 'dashboard', label: 'Visão Geral & Vendas', icon: LayoutDashboard },
            { id: 'orders', label: 'Gestão de Pedidos', icon: ShoppingBag, count: activeOrdersCount },
            { id: 'products', label: 'Produtos do Cardápio', icon: UtensilsCrossed },
            { id: 'categories', label: 'Categorias', icon: Layers },
            { id: 'coupons', label: 'Cupons de Desconto', icon: Tag },
            { id: 'delivery', label: 'Taxas & Bairros', icon: MapPin },
            { id: 'notifications', label: 'Notificações & Promoções', icon: Bell },
            { id: 'customers', label: 'Clientes & Fidelidade', icon: Users },
            { id: 'settings', label: 'Configurações', icon: Settings },
            { id: 'firebase', label: 'Banco Firebase', icon: Database },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id as typeof adminTab)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-black text-amber-400' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 space-y-6">

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-white/40 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Vendas Hoje</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{formatCurrency(totalSalesToday)}</div>
              <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
                +18% vs ontem
              </span>
            </div>

            <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-white/40 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pedidos Feitos</span>
                <ShoppingBag className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{totalOrdersCount}</div>
              <span className="text-[11px] text-white/40 mt-1 block">
                {activeOrdersCount} em andamento
              </span>
            </div>

            <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-white/40 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Ticket Médio</span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{formatCurrency(averageTicket)}</div>
              <span className="text-[11px] text-white/40 mt-1 block">Por pedido</span>
            </div>

            <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-white/40 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tempo Médio</span>
                <Clock className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-black text-white">28 min</div>
              <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
                Dentro da meta (&lt;35m)
              </span>
            </div>
          </div>

          {/* Vendas por Horário (Visual Simulation) & Top Selling Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Sales Progression Chart */}
            <div className="lg:col-span-2 bg-[#151518] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Fluxo de Vendas por Hora</h3>
                  <p className="text-xs text-white/40">Picos de pedidos no almoço e jantar</p>
                </div>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">Hoje</span>
              </div>

              {/* Visual Bars for Hourly Distribution */}
              <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
                {[
                  { hour: '11h', val: 35, orders: 4 },
                  { hour: '12h', val: 75, orders: 11 },
                  { hour: '13h', val: 90, orders: 14 },
                  { hour: '14h', val: 40, orders: 5 },
                  { hour: '18h', val: 60, orders: 9 },
                  { hour: '19h', val: 85, orders: 13 },
                  { hour: '20h', val: 100, orders: 18 },
                  { hour: '21h', val: 80, orders: 12 },
                  { hour: '22h', val: 50, orders: 7 },
                  { hour: '23h', val: 30, orders: 4 },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {bar.orders} ped
                    </span>
                    <div
                      style={{ height: `${bar.val}%` }}
                      className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500 rounded-t-xl group-hover:from-amber-400 group-hover:to-orange-400 transition-all cursor-pointer"
                    />
                    <span className="text-[10px] text-white/40 font-medium">{bar.hour}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-[#151518] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-black text-white">Produtos Mais Vendidos</h3>
              <div className="space-y-3">
                {topSellingList.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#0A0A0B] text-amber-500 border border-white/5 flex items-center justify-center font-black text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-white/80 font-bold truncate max-w-[130px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold block">{item.count} un</span>
                      <span className="text-[10px] text-amber-500 font-black">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-base font-black text-white">Gestão Operacional de Pedidos</h2>

            {/* Order filter */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'received', label: 'Recebido' },
                { id: 'preparing', label: 'Preparando' },
                { id: 'ready', label: 'Pronto' },
                { id: 'out_for_delivery', label: 'Saiu p/ entrega' },
                { id: 'delivered', label: 'Entregue' },
                { id: 'cancelled', label: 'Cancelado' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id as typeof orderFilter)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    orderFilter === f.id
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-[#151518] text-white/50 hover:text-white border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#151518] border border-white/5 rounded-3xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0A0B] text-white/40 uppercase font-black tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4">Pedido</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Itens</th>
                    <th className="p-4">Total / Pagto</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders
                    .filter((o) => (orderFilter === 'all' ? true : o.status === orderFilter))
                    .map((order) => (
                      <tr key={order.id} className="hover:bg-[#202024]/40 transition-colors">
                        <td className="p-4 font-black text-white whitespace-nowrap">
                          #{order.orderNumber}
                          <span className="block text-[10px] text-white/40 font-normal">
                            {order.createdAt}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-white block">{order.customer.name}</span>
                          <span className="text-[11px] text-white/40">{order.customer.phone}</span>
                        </td>

                        <td className="p-4 max-w-[200px]">
                          <span className="text-white/80 font-medium block truncate">
                            {order.items
                              .map((i) => `${i.quantity}x ${i.product.name}`)
                              .join(', ')}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="font-black text-amber-500 block">
                            {formatCurrency(order.total)}
                          </span>
                          <span className="text-[10px] uppercase text-white/40 font-bold">
                            {order.paymentMethod}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              order.deliveryType === 'delivery'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {order.deliveryType === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.id, e.target.value as OrderStatus)
                            }
                            className="bg-[#0A0A0B] border border-white/5 text-white rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                          >
                            <option value="received">Recebido</option>
                            <option value="preparing">Preparando</option>
                            <option value="ready">Pronto</option>
                            <option value="out_for_delivery">Saiu p/ entrega</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* WhatsApp alert */}
                            <button
                              onClick={() => {
                                const msg = `Olá, ${order.customer.name}! Seu pedido #${order.orderNumber} na ${storeSettings.name} está ${order.status}.`;
                                window.open(
                                  generateWhatsAppLink(order.customer.phone, msg),
                                  '_blank'
                                );
                              }}
                              title="Enviar WhatsApp"
                              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>

                            {/* Print */}
                            <button
                              onClick={() => printThermalReceipt(order)}
                              title="Imprimir comanda térmica"
                              className="p-2 rounded-xl bg-[#0A0A0B] text-white/50 hover:text-white border border-white/5 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS (CRUD) */}
      {adminTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Produtos do Cardápio ({products.length})</h2>
              <p className="text-xs text-white/40">Adicione, edite preços ou pause produtos</p>
            </div>

            <button
              onClick={handleOpenNewProductModal}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95 shadow-[0_4px_15px_rgba(245,158,11,0.25)]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Novo Produto</span>
            </button>
          </div>

          {/* Products List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-[#151518] border border-white/5 rounded-3xl p-4 flex gap-4 items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={prod.photo}
                    alt={prod.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-[#202024] shrink-0 border border-white/5"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{prod.name}</h4>
                      {prod.isDailyOffer && (
                        <span className="bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Oferta
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs font-black text-amber-500">
                        {formatCurrency(prod.promoPrice ?? prod.price)}
                      </span>
                      {prod.promoPrice && (
                        <span className="text-[10px] text-white/40 line-through">
                          {formatCurrency(prod.price)}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-white/40 block truncate max-w-xs mt-0.5">
                      {prod.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEditProduct(prod)}
                    className="p-2.5 rounded-2xl bg-[#0A0A0B] hover:bg-[#202024] text-white/60 hover:text-white border border-white/5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(`Deseja excluir "${prod.name}"?`)) {
                        deleteProduct(prod.id);
                      }
                    }}
                    className="p-2.5 rounded-2xl bg-[#0A0A0B] hover:bg-red-950/60 text-white/40 hover:text-red-400 border border-white/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES (CRUD) */}
      {adminTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-[#151518] border border-white/5 rounded-3xl p-6 shadow-lg">
            <h3 className="text-sm font-black text-white mb-3">Adicionar Nova Categoria</h3>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                placeholder="Emoji (🍔)"
                className="w-16 bg-[#0A0A0B] border border-white/5 rounded-2xl px-2 py-2.5 text-center text-sm text-white"
              />
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nome da categoria (ex: Sobremesas Artesanais)"
                className="flex-1 bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider"
              >
                Adicionar
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#151518] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-bold text-xs text-white">{cat.name}</span>
                </div>
                {categories.length > 1 && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-white/30 hover:text-red-400 p-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS (CRUD) */}
      {adminTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Cupons de Desconto ({coupons.length})</h2>
              <p className="text-xs text-white/40">Crie cupons promocionais para seus clientes</p>
            </div>

            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Novo Cupom</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-[#151518] border border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-amber-500 tracking-wider bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="text-white/30 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-white font-bold">
                    Desconto:{' '}
                    {coupon.discountType === 'percentage'
                      ? `${coupon.value}%`
                      : formatCurrency(coupon.value)}
                  </p>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    Pedido mínimo: {formatCurrency(coupon.minOrderValue)}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-white/5 flex justify-between text-[11px] text-white/40">
                  <span>Usos: {coupon.currentUses} vezes</span>
                  <span className="text-emerald-400 font-bold">Ativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DELIVERY ZONES */}
      {adminTab === 'delivery' && (
        <div className="space-y-4">
          <div className="bg-[#151518] border border-white/5 rounded-3xl p-6 shadow-lg">
            <h3 className="text-sm font-black text-white mb-3">Cadastrar Novo Bairro e Taxa</h3>
            <form onSubmit={handleAddDeliveryZone} className="flex gap-2">
              <input
                type="text"
                value={newZoneNeighborhood}
                onChange={(e) => setNewZoneNeighborhood(e.target.value)}
                placeholder="Nome do Bairro (ex: Vila Mariana)"
                className="flex-1 bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
              />
              <input
                type="number"
                step="0.50"
                value={newZoneFee}
                onChange={(e) => setNewZoneFee(e.target.value)}
                placeholder="Taxa R$"
                className="w-24 bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider"
              >
                Salvar Bairro
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {deliveryZones.map((zone) => (
              <div
                key={zone.id}
                className="bg-[#151518] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-md"
              >
                <div>
                  <span className="font-bold text-xs text-white block">{zone.neighborhood}</span>
                  <span className="text-xs font-black text-amber-500">
                    Taxa: {formatCurrency(zone.fee)}
                  </span>
                </div>
                <button
                  onClick={() => deleteDeliveryZone(zone.id)}
                  className="text-white/30 hover:text-red-400 p-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS & THERMAL PRINTER */}
      {adminTab === 'settings' && (
        <div className="bg-[#151518] border border-white/5 rounded-3xl p-6 sm:p-7 space-y-6 shadow-lg">
          <div>
            <h2 className="text-base font-black text-white">Configurações Gerais da Loja</h2>
            <p className="text-xs text-white/40">
              Dados da empresa, WhatsApp de atendimento e impressora térmica
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 mb-1.5">Nome da Hamburgueria</label>
              <input
                type="text"
                value={storeSettings.name}
                onChange={(e) => updateStoreSettings({ name: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 mb-1.5">WhatsApp de Atendimento</label>
              <input
                type="text"
                value={storeSettings.whatsapp}
                onChange={(e) => updateStoreSettings({ whatsapp: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 mb-1.5">Horário de Funcionamento</label>
              <input
                type="text"
                value={storeSettings.openingHours}
                onChange={(e) => updateStoreSettings({ openingHours: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 mb-1.5">Endereço Físico</label>
              <input
                type="text"
                value={storeSettings.address}
                onChange={(e) => updateStoreSettings({ address: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Thermal Printer Settings Section */}
          <div className="border-t border-white/5 pt-5 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-500" />
              <span>Configuração da Impressora Térmica de Pedidos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/50 mb-1.5">Largura da Bobina</label>
                <select
                  value={storeSettings.printerSettings.paperWidth}
                  onChange={(e) =>
                    updateStoreSettings({
                      printerSettings: {
                        ...storeSettings.printerSettings,
                        paperWidth: e.target.value as '58mm' | '80mm',
                      },
                    })
                  }
                  className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                >
                  <option value="80mm">80mm (Padrão de Restaurantes e Delivery)</option>
                  <option value="58mm">58mm (Mini Impressoras Bluetooth / Portáteis)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 mb-1.5">Rodapé da Comanda</label>
                <input
                  type="text"
                  value={storeSettings.printerSettings.customFooterText}
                  onChange={(e) =>
                    updateStoreSettings({
                      printerSettings: {
                        ...storeSettings.printerSettings,
                        customFooterText: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => printThermalReceipt(orders[0])}
                className="bg-[#0A0A0B] hover:bg-[#202024] text-white/80 hover:text-white font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 border border-white/5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Testar Impressão da Comanda Térmica</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: NOTIFICATIONS & CAMPAIGNS (Requirement 32) */}
      {adminTab === 'notifications' && <AdminNotificationsManager />}

      {/* TAB 9: CUSTOMERS & FIDELITY (Requirement 33 & 35) */}
      {adminTab === 'customers' && <AdminCustomersManager />}

      {/* TAB 10: FIREBASE DATABASE & CONSOLE (Requirement: rs8802616@gmail.com) */}
      {adminTab === 'firebase' && <AdminFirebaseManager />}

        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#151518] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-white">
              {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-white/50 mb-1.5">Nome do Produto</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ex: X-Bacon Artesanal Duplo"
                  required
                  className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5">Categoria</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5">Preço Normal (R$)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                    className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5">Preço Promocional (Opcional)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={prodPromoPrice}
                    onChange={(e) => setProdPromoPrice(e.target.value)}
                    placeholder="Ex: 24.90"
                    className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5">URL da Foto</label>
                  <input
                    type="text"
                    value={prodPhoto}
                    onChange={(e) => setProdPhoto(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 mb-1.5">Descrição</label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Descrição apetitosa do produto..."
                  className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl p-3 text-xs text-white resize-none focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 mb-1.5">
                  Ingredientes (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={prodIngredients}
                  onChange={(e) => setProdIngredients(e.target.value)}
                  placeholder="Pão brioche, hambúrguer 160g, queijo cheddar"
                  className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsDailyOffer}
                    onChange={(e) => setProdIsDailyOffer(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>Destacar como Oferta do Dia 🔥</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsBestSeller}
                    onChange={(e) => setProdIsBestSeller(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>Mais Vendido ⭐</span>
                </label>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md"
                >
                  Salvar Produto
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 bg-[#0A0A0B] hover:bg-[#202024] text-white/60 font-bold py-3 rounded-2xl text-xs border border-white/5"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-[#151518] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white">Criar Novo Cupom</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-white/50 mb-1.5">Código do Cupom</label>
                <input
                  type="text"
                  value={coupCode}
                  onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                  placeholder="Ex: QUERO10"
                  required
                  className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5">Tipo de Desconto</label>
                  <select
                    value={coupType}
                    onChange={(e) => setCoupType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Fixo em Reais (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5">Valor do Desconto</label>
                  <input
                    type="number"
                    value={coupValue}
                    onChange={(e) => setCoupValue(e.target.value)}
                    required
                    className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 mb-1.5">Pedido Mínimo (R$)</label>
                <input
                  type="number"
                  value={coupMin}
                  onChange={(e) => setCoupMin(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md"
                >
                  Criar Cupom
                </button>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 bg-[#0A0A0B] hover:bg-[#202024] text-white/60 font-bold py-3 rounded-2xl text-xs border border-white/5"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
