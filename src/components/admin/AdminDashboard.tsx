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
  Copy,
  Share2,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, generateWhatsAppLink, getCleanClientMenuUrl } from '../../utils/formatters';
import { Product, Coupon, DeliveryZone, OrderStatus } from '../../types';
import { AdminNotificationsManager } from './AdminNotificationsManager';
import { AdminCustomersManager } from './AdminCustomersManager';

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
    isServerConnected,
    setCurrentView,
    theme,
    changeAdminPassword,
  } = useStore();

  const isDark = theme === 'dark';

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (!newPass || newPass.length < 4) {
      setPassMessage({ type: 'error', text: 'A nova senha deve possuir no mínimo 4 caracteres.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMessage({ type: 'error', text: 'A confirmação de senha não confere com a nova senha digitada.' });
      return;
    }

    setPassSubmitting(true);
    try {
      const res = await changeAdminPassword(currentPass, newPass);
      if (res.success) {
        setPassMessage({ type: 'success', text: res.message || 'Senha atualizada com sucesso no banco de dados e Firestore!' });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setPassMessage({ type: 'error', text: res.message || 'Não foi possível atualizar a senha.' });
      }
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err?.message || 'Erro de comunicação ao atualizar senha.' });
    } finally {
      setPassSubmitting(false);
    }
  };

  // Client menu share link (guaranteed clean client link without #admin or credentials)
  const [copiedClientUrl, setCopiedClientUrl] = useState(false);
  const clientShareUrl = getCleanClientMenuUrl(storeSettings?.publicStoreUrl);
  const shareWhatsAppText = `🍔 Olá! Confira nosso cardápio online e faça seu pedido direto pelo link:\n${clientShareUrl}`;
  const shareWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(shareWhatsAppText)}`;

  const handleCopyClientUrl = () => {
    try {
      navigator.clipboard.writeText(clientShareUrl);
      setCopiedClientUrl(true);
      setTimeout(() => setCopiedClientUrl(false), 2500);
    } catch {
      // Fallback
    }
  };

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
      ingredients: typeof prodIngredients === 'string' ? prodIngredients.split(',').map((s) => s.trim()).filter(Boolean) : [],
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
      <div
        className={`border rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
          isDark
            ? 'bg-[#151518] border-white/5 text-white shadow-lg'
            : 'bg-white border-gray-200 text-slate-900 shadow-sm'
        }`}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className={`text-xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Painel do Proprietário
            </h1>
            <span className="bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Gerência
            </span>
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                isServerConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
              }`}
              title="Sincronizado automaticamente com os pedidos feitos pelo celular dos clientes"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isServerConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                }`}
              />
              {isServerConnected ? 'Celular & PC Conectados' : 'Conectando Servidor...'}
            </span>
          </div>
          <p
            className={`text-xs mt-0.5 ${
              isDark ? 'text-white/40' : 'text-slate-500'
            }`}
          >
            Gestão operacional, vendas, cardápio, pedidos e integrações
          </p>
        </div>

        {/* Quick simulation button */}
        <div className="flex items-center gap-2">
          <button
            onClick={simulateIncomingOrder}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm ${
              isDark
                ? 'bg-[#0A0A0B] hover:bg-[#202024] text-amber-400 border border-white/5'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Simular Pedido</span>
          </button>
        </div>
      </div>

      {/* CARD DE COMPARTILHAMENTO DO CARDÁPIO PARA CLIENTES */}
      <div
        className={`border rounded-3xl p-5 shadow-lg transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-amber-500/10 via-[#151518] to-[#151518] border-amber-500/30'
            : 'bg-gradient-to-r from-amber-50 via-white to-white border-amber-300 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl">📲</span>
              <h2
                className={`text-base font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Link do Cardápio para seus Clientes
              </h2>
              <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Exclusivo para Pedidos
              </span>
            </div>
            <p
              className={`text-xs max-w-2xl leading-relaxed ${
                isDark ? 'text-white/60' : 'text-slate-600'
              }`}
            >
              Divulgue este link no WhatsApp, Instagram e panfletos. Ele abre <strong>direto no cardápio de cliente</strong>, sem pedir senha e sem dar acesso à sua conta de administrador.
            </p>
            <div
              className={`inline-flex items-center gap-2 border rounded-xl px-3 py-1.5 mt-1 font-mono text-xs select-all ${
                isDark
                  ? 'bg-[#0A0A0B] border-white/10 text-amber-400'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <span>{clientShareUrl}</span>
              <button
                type="button"
                onClick={() => setAdminTab('settings')}
                className={`text-[10px] underline font-sans ml-2 transition-colors ${
                  isDark
                    ? 'text-white/40 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Configurar URL oficial nas configurações"
              >
                Alterar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="copy-client-link-btn"
              onClick={handleCopyClientUrl}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              {copiedClientUrl ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
              <span>{copiedClientUrl ? 'Link Copiado!' : 'Copiar Link do Cardápio'}</span>
            </button>
            <a
              id="whatsapp-share-client-link-btn"
              href={shareWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span>Enviar no WhatsApp</span>
            </a>
            <button
              id="preview-as-client-btn"
              onClick={() => setCurrentView('client')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 border ${
                isDark
                  ? 'bg-[#202024] hover:bg-white/10 text-neutral-200 border-white/10'
                  : 'bg-gray-100 hover:bg-gray-200 text-slate-800 border-gray-300'
              }`}
            >
              <Eye className="w-4 h-4 text-slate-700 dark:text-neutral-200" />
              <span>Ver como Cliente</span>
            </button>
          </div>
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
                  : isDark
                  ? 'bg-[#151518] text-white/60 border-white/5 hover:border-white/10 hover:text-white'
                  : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50 hover:text-slate-950'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-black' : isDark ? 'text-neutral-400' : 'text-slate-700'}`} />
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
        <aside
          className={`hidden lg:block border rounded-3xl p-4 sticky top-4 shadow-xl space-y-2 transition-colors ${
            isDark
              ? 'bg-[#151518] border-white/5 text-white'
              : 'bg-white border-gray-200 text-slate-900 shadow-sm'
          }`}
        >
          <div
            className={`px-3 py-2 mb-2 border-b ${
              isDark ? 'border-white/5' : 'border-gray-200'
            }`}
          >
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Menu Administrativo
            </span>
            <span
              className={`text-xs ${
                isDark ? 'text-white/40' : 'text-slate-500'
              }`}
            >
              Gestão integrada
            </span>
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
                    : isDark
                    ? 'text-white/70 hover:text-white hover:bg-white/5'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-black' : isDark ? 'text-neutral-400' : 'text-slate-700'}`} />
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
            <div
              className={`border rounded-3xl p-5 shadow-lg transition-colors ${
                isDark
                  ? 'bg-[#151518] border-white/5'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div
                className={`flex items-center justify-between mb-2 ${
                  isDark ? 'text-white/50' : 'text-slate-600'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">Vendas Hoje</span>
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div
                className={`text-2xl font-black ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {formatCurrency(totalSalesToday)}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                +18% vs ontem
              </span>
            </div>

            <div
              className={`border rounded-3xl p-5 shadow-lg transition-colors ${
                isDark
                  ? 'bg-[#151518] border-white/5'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div
                className={`flex items-center justify-between mb-2 ${
                  isDark ? 'text-white/50' : 'text-slate-600'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">Pedidos Feitos</span>
                <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div
                className={`text-2xl font-black ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {totalOrdersCount}
              </div>
              <span
                className={`text-[11px] mt-1 block ${
                  isDark ? 'text-white/40' : 'text-slate-500'
                }`}
              >
                {activeOrdersCount} em andamento
              </span>
            </div>

            <div
              className={`border rounded-3xl p-5 shadow-lg transition-colors ${
                isDark
                  ? 'bg-[#151518] border-white/5'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div
                className={`flex items-center justify-between mb-2 ${
                  isDark ? 'text-white/50' : 'text-slate-600'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">Ticket Médio</span>
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div
                className={`text-2xl font-black ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {formatCurrency(averageTicket)}
              </div>
              <span
                className={`text-[11px] mt-1 block ${
                  isDark ? 'text-white/40' : 'text-slate-500'
                }`}
              >
                Por pedido
              </span>
            </div>

            <div
              className={`border rounded-3xl p-5 shadow-lg transition-colors ${
                isDark
                  ? 'bg-[#151518] border-white/5'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div
                className={`flex items-center justify-between mb-2 ${
                  isDark ? 'text-white/50' : 'text-slate-600'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">Tempo Médio</span>
                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div
                className={`text-2xl font-black ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                28 min
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                Dentro da meta (&lt;35m)
              </span>
            </div>
          </div>

          {/* Vendas por Horário (Visual Simulation) & Top Selling Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Sales Progression Chart */}
            <div
              className={`lg:col-span-2 border rounded-3xl p-6 shadow-lg space-y-4 transition-colors ${
                isDark
                  ? 'bg-[#151518] border-white/5 text-white'
                  : 'bg-white border-gray-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`text-sm font-black ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Fluxo de Vendas por Hora
                  </h3>
                  <p
                    className={`text-xs ${
                      isDark ? 'text-white/40' : 'text-slate-500'
                    }`}
                  >
                    Picos de pedidos no almoço e jantar
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">Hoje</span>
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
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {bar.orders} ped
                    </span>
                    <div
                      style={{ height: `${bar.val}%` }}
                      className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500 rounded-t-xl group-hover:from-amber-400 group-hover:to-orange-400 transition-all cursor-pointer"
                    />
                    <span
                      className={`text-[10px] font-medium ${
                        isDark ? 'text-white/40' : 'text-slate-600'
                      }`}
                    >
                      {bar.hour}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Products */}
            <div
              className={`border rounded-3xl p-6 shadow-lg space-y-4 transition-colors ${
                isDark
                  ? 'bg-[#151518] border-white/5 text-white'
                  : 'bg-white border-gray-200 text-slate-900 shadow-sm'
              }`}
            >
              <h3
                className={`text-sm font-black ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Produtos Mais Vendidos
              </h3>
              <div className="space-y-3">
                {topSellingList.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs pb-2 border-b last:border-0 ${
                      isDark ? 'border-white/5' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] border ${
                          isDark
                            ? 'bg-[#0A0A0B] text-amber-500 border-white/5'
                            : 'bg-amber-100 text-amber-900 border-amber-200'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`font-bold truncate max-w-[130px] ${
                          isDark ? 'text-white/80' : 'text-slate-800'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-bold block ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.count} un
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-500 font-black">
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
            <h2
              className={`text-base font-black ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Gestão Operacional de Pedidos
            </h2>

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
                      : isDark
                      ? 'bg-[#151518] text-white/60 hover:text-white border border-white/5'
                      : 'bg-white text-slate-700 hover:text-slate-950 border border-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`border rounded-3xl overflow-hidden shadow-lg transition-colors ${
              isDark
                ? 'bg-[#151518] border-white/5'
                : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`uppercase font-black tracking-wider border-b ${
                    isDark
                      ? 'bg-[#0A0A0B] text-white/50 border-white/5'
                      : 'bg-gray-50 text-slate-700 border-gray-200'
                  }`}
                >
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
                <tbody
                  className={`divide-y ${
                    isDark ? 'divide-white/5' : 'divide-gray-100'
                  }`}
                >
                  {orders.filter((o) => (orderFilter === 'all' ? true : o.status === orderFilter)).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShoppingBag
                            className={`w-10 h-10 ${
                              isDark ? 'text-white/20' : 'text-slate-300'
                            }`}
                          />
                          <p
                            className={`text-sm font-bold ${
                              isDark ? 'text-white/70' : 'text-slate-700'
                            }`}
                          >
                            Nenhum pedido encontrado {orderFilter !== 'all' ? `com status "${orderFilter}"` : ''}
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? 'text-white/40' : 'text-slate-500'
                            }`}
                          >
                            Assim que os clientes realizarem novos pedidos, eles aparecerão aqui em tempo real.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders
                      .filter((o) => (orderFilter === 'all' ? true : o.status === orderFilter))
                      .map((order) => (
                        <tr
                          key={order.id}
                          className={`transition-colors ${
                            isDark ? 'hover:bg-[#202024]/40' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td
                            className={`p-4 font-black whitespace-nowrap ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            #{order.orderNumber}
                            <span
                              className={`block text-[10px] font-normal ${
                                isDark ? 'text-white/40' : 'text-slate-500'
                              }`}
                            >
                              {order.createdAt}
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`font-bold block ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {order.customer.name}
                            </span>
                            <span
                              className={`text-[11px] ${
                                isDark ? 'text-white/40' : 'text-slate-500'
                              }`}
                            >
                              {order.customer.phone}
                            </span>
                          </td>

                          <td className="p-4 max-w-[200px]">
                            <span
                              className={`font-medium block truncate ${
                                isDark ? 'text-white/80' : 'text-slate-800'
                              }`}
                            >
                              {order.items
                                .map((i) => `${i.quantity}x ${i.product.name}`)
                                .join(', ')}
                            </span>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span className="font-black text-amber-600 dark:text-amber-500 block">
                              {formatCurrency(order.total)}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold ${
                                isDark ? 'text-white/40' : 'text-slate-500'
                              }`}
                            >
                              {order.paymentMethod}
                            </span>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                order.deliveryType === 'delivery'
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
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
                              className={`border rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-amber-500 ${
                                isDark
                                  ? 'bg-[#0A0A0B] border-white/10 text-white'
                                  : 'bg-white border-gray-300 text-slate-900'
                              }`}
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
                                className={`p-2 rounded-xl transition-colors border ${
                                  isDark
                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                                }`}
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              </button>

                              {/* Print */}
                              <button
                                onClick={() => printThermalReceipt(order)}
                                title="Imprimir comanda térmica"
                                className={`p-2 rounded-xl transition-colors border ${
                                  isDark
                                    ? 'bg-[#0A0A0B] text-neutral-300 hover:text-white border-white/5'
                                    : 'bg-gray-100 text-slate-700 hover:text-slate-950 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-700 dark:text-neutral-300" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
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
              <h2
                className={`text-base font-black ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Produtos do Cardápio ({products.length})
              </h2>
              <p
                className={`text-xs ${
                  isDark ? 'text-white/40' : 'text-slate-500'
                }`}
              >
                Adicione, edite preços ou pause produtos
              </p>
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
                className={`border rounded-3xl p-4 flex gap-4 items-center justify-between shadow-lg transition-colors ${
                  isDark
                    ? 'bg-[#151518] border-white/5'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={prod.photo}
                    alt={prod.name}
                    className={`w-16 h-16 rounded-2xl object-cover shrink-0 border ${
                      isDark
                        ? 'bg-[#202024] border-white/5'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {prod.name}
                      </h4>
                      {prod.isDailyOffer && (
                        <span className="bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Oferta
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-500">
                        {formatCurrency(prod.promoPrice ?? prod.price)}
                      </span>
                      {prod.promoPrice && (
                        <span
                          className={`text-[10px] line-through ${
                            isDark ? 'text-white/40' : 'text-slate-400'
                          }`}
                        >
                          {formatCurrency(prod.price)}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[11px] block truncate max-w-xs mt-0.5 ${
                        isDark ? 'text-white/40' : 'text-slate-500'
                      }`}
                    >
                      {prod.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEditProduct(prod)}
                    className={`p-2.5 rounded-2xl border transition-colors ${
                      isDark
                        ? 'bg-[#0A0A0B] hover:bg-[#202024] text-neutral-300 hover:text-white border-white/5'
                        : 'bg-gray-100 hover:bg-gray-200 text-slate-700 hover:text-slate-950 border-gray-300'
                    }`}
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
                    className={`p-2.5 rounded-2xl border transition-colors ${
                      isDark
                        ? 'bg-[#0A0A0B] hover:bg-red-950/60 text-white/40 hover:text-red-400 border-white/5'
                        : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                    }`}
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
          <div
            className={`border rounded-3xl p-6 shadow-lg transition-colors ${
              isDark
                ? 'bg-[#151518] border-white/5'
                : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <h3
              className={`text-sm font-black mb-3 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Adicionar Nova Categoria
            </h3>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                placeholder="Emoji (🍔)"
                className={`w-16 border rounded-2xl px-2 py-2.5 text-center text-sm ${
                  isDark
                    ? 'bg-[#0A0A0B] border-white/10 text-white'
                    : 'bg-gray-50 border-gray-300 text-slate-900'
                }`}
              />
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nome da categoria (ex: Sobremesas Artesanais)"
                className={`flex-1 border rounded-2xl px-3.5 py-2.5 text-xs ${
                  isDark
                    ? 'bg-[#0A0A0B] border-white/10 text-white'
                    : 'bg-gray-50 border-gray-300 text-slate-900'
                }`}
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider shadow-sm"
              >
                Adicionar
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`border rounded-2xl p-4 flex items-center justify-between shadow-md transition-colors ${
                  isDark
                    ? 'bg-[#151518] border-white/5'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <span
                    className={`font-bold text-xs ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {cat.name}
                  </span>
                </div>
                {categories.length > 1 && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className={`p-1.5 transition-colors ${
                      isDark
                        ? 'text-white/30 hover:text-red-400'
                        : 'text-slate-400 hover:text-red-600'
                    }`}
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
              <h2
                className={`text-base font-black ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Cupons de Desconto ({coupons.length})
              </h2>
              <p
                className={`text-xs ${
                  isDark ? 'text-white/40' : 'text-slate-500'
                }`}
              >
                Crie cupons promocionais para seus clientes
              </p>
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
                className={`border rounded-3xl p-5 flex flex-col justify-between shadow-lg transition-colors ${
                  isDark
                    ? 'bg-[#151518] border-white/5'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-black tracking-wider px-3 py-1 rounded-xl border ${
                        isDark
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          : 'text-amber-900 bg-amber-100 border-amber-300'
                      }`}
                    >
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className={`p-1 transition-colors ${
                        isDark
                          ? 'text-white/30 hover:text-red-400'
                          : 'text-slate-400 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p
                    className={`text-xs font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Desconto:{' '}
                    {coupon.discountType === 'percentage'
                      ? `${coupon.value}%`
                      : formatCurrency(coupon.value)}
                  </p>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      isDark ? 'text-white/40' : 'text-slate-500'
                    }`}
                  >
                    Pedido mínimo: {formatCurrency(coupon.minOrderValue)}
                  </p>
                </div>

                <div
                  className={`mt-3.5 pt-2.5 border-t flex justify-between text-[11px] ${
                    isDark
                      ? 'border-white/5 text-white/40'
                      : 'border-gray-100 text-slate-500'
                  }`}
                >
                  <span>Usos: {coupon.currentUses} vezes</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DELIVERY ZONES */}
      {adminTab === 'delivery' && (
        <div className="space-y-4">
          <div
            className={`border rounded-3xl p-6 shadow-lg transition-colors ${
              isDark
                ? 'bg-[#151518] border-white/5'
                : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <h3
              className={`text-sm font-black mb-3 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Cadastrar Novo Bairro e Taxa
            </h3>
            <form onSubmit={handleAddDeliveryZone} className="flex gap-2">
              <input
                type="text"
                value={newZoneNeighborhood}
                onChange={(e) => setNewZoneNeighborhood(e.target.value)}
                placeholder="Nome do Bairro (ex: Vila Mariana)"
                className={`flex-1 border rounded-2xl px-3.5 py-2.5 text-xs ${
                  isDark
                    ? 'bg-[#0A0A0B] border-white/10 text-white'
                    : 'bg-gray-50 border-gray-300 text-slate-900'
                }`}
              />
              <input
                type="number"
                step="0.50"
                value={newZoneFee}
                onChange={(e) => setNewZoneFee(e.target.value)}
                placeholder="Taxa R$"
                className={`w-24 border rounded-2xl px-3.5 py-2.5 text-xs ${
                  isDark
                    ? 'bg-[#0A0A0B] border-white/10 text-white'
                    : 'bg-gray-50 border-gray-300 text-slate-900'
                }`}
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider shadow-sm"
              >
                Salvar Bairro
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {deliveryZones.map((zone) => (
              <div
                key={zone.id}
                className={`border rounded-2xl p-4 flex items-center justify-between shadow-md transition-colors ${
                  isDark
                    ? 'bg-[#151518] border-white/5'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div>
                  <span
                    className={`font-bold text-xs block ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {zone.neighborhood}
                  </span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-500">
                    Taxa: {formatCurrency(zone.fee)}
                  </span>
                </div>
                <button
                  onClick={() => deleteDeliveryZone(zone.id)}
                  className={`p-1.5 transition-colors ${
                    isDark
                      ? 'text-white/30 hover:text-red-400'
                      : 'text-slate-400 hover:text-red-600'
                  }`}
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
        <div
          className={`border rounded-3xl p-6 sm:p-7 space-y-6 shadow-lg transition-colors ${
            isDark
              ? 'bg-[#151518] border-white/5'
              : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div>
            <h2
              className={`text-base font-black ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Configurações Gerais da Loja
            </h2>
            <p
              className={`text-xs ${
                isDark ? 'text-white/40' : 'text-slate-500'
              }`}
            >
              Dados da empresa, WhatsApp de atendimento e impressora térmica
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isDark ? 'text-white/60' : 'text-slate-700'
                }`}
              >
                Nome da Hamburgueria
              </label>
              <input
                type="text"
                value={storeSettings.name}
                onChange={(e) => updateStoreSettings({ name: e.target.value })}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                  isDark
                    ? 'bg-[#0A0A0B] border-white/10 text-white'
                    : 'bg-gray-50 border-gray-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isDark ? 'text-white/60' : 'text-slate-700'
                }`}
              >
                WhatsApp de Atendimento
              </label>
              <input
                type="text"
                value={storeSettings.whatsapp}
                onChange={(e) => updateStoreSettings({ whatsapp: e.target.value })}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                  isDark
                    ? 'bg-[#0A0A0B] border-white/10 text-white'
                    : 'bg-gray-50 border-gray-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isDark ? 'text-white/60' : 'text-slate-700'
                }`}
              >
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={storeSettings.openingHours}
                onChange={(e) => updateStoreSettings({ openingHours: e.target.value })}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                  isDark
                    ? 'bg-[#0A0A0B] border-white/10 text-white'
                    : 'bg-gray-50 border-gray-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isDark ? 'text-white/60' : 'text-slate-700'
                }`}
              >
                Endereço Físico
              </label>
              <input
                type="text"
                value={storeSettings.address}
                onChange={(e) => updateStoreSettings({ address: e.target.value })}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                  isDark
                    ? 'bg-[#0A0A0B] border-white/10 text-white'
                    : 'bg-gray-50 border-gray-300 text-slate-900'
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isDark ? 'text-white/60' : 'text-slate-700'
                }`}
              >
                Link Oficial do Cardápio para Clientes (URL Pública / Vercel)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://gamas-burger.vercel.app"
                  value={storeSettings.publicStoreUrl || ''}
                  onChange={(e) => updateStoreSettings({ publicStoreUrl: e.target.value })}
                  className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs font-mono focus:border-amber-500 focus:outline-none ${
                    isDark
                      ? 'bg-[#0A0A0B] border-amber-500/30 text-amber-300'
                      : 'bg-amber-50/70 border-amber-300 text-amber-950'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => updateStoreSettings({ publicStoreUrl: 'https://gamas-burger.vercel.app' })}
                  className={`shrink-0 px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-colors border ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/5'
                      : 'bg-gray-100 hover:bg-gray-200 text-slate-700 hover:text-slate-950 border-gray-300'
                  }`}
                  title="Restaurar link oficial Vercel"
                >
                  Usar Vercel
                </button>
              </div>
              <p
                className={`text-[11px] mt-1.5 ${
                  isDark ? 'text-white/40' : 'text-slate-500'
                }`}
              >
                Link divulgado aos clientes nos botões &quot;Copiar Link&quot; e &quot;Enviar no WhatsApp&quot;. Padrão: <strong className="text-amber-600 dark:text-amber-400 font-mono">https://gamas-burger.vercel.app</strong>.
              </p>
            </div>
          </div>

          {/* Thermal Printer Settings Section */}
          <div
            className={`border-t pt-5 space-y-4 ${
              isDark ? 'border-white/5' : 'border-gray-200'
            }`}
          >
            <h3
              className={`text-sm font-black flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Printer className="w-4 h-4 text-amber-500" />
              <span>Configuração da Impressora Térmica de Pedidos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? 'text-white/60' : 'text-slate-700'
                  }`}
                >
                  Largura da Bobina
                </label>
                <select
                  value={storeSettings?.printerSettings?.paperWidth || '80mm'}
                  onChange={(e) =>
                    updateStoreSettings({
                      printerSettings: {
                        ...(storeSettings?.printerSettings || {
                          paperWidth: '80mm',
                          customFooterText: 'Obrigado pela preferência!',
                          autoPrintOnReceive: false,
                        }),
                        paperWidth: e.target.value as '58mm' | '80mm',
                      },
                    })
                  }
                  className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                    isDark
                      ? 'bg-[#0A0A0B] border-white/10 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                >
                  <option value="80mm">80mm (Padrão de Restaurantes e Delivery)</option>
                  <option value="58mm">58mm (Mini Impressoras Bluetooth / Portáteis)</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? 'text-white/60' : 'text-slate-700'
                  }`}
                >
                  Rodapé da Comanda
                </label>
                <input
                  type="text"
                  value={storeSettings?.printerSettings?.customFooterText || ''}
                  onChange={(e) =>
                    updateStoreSettings({
                      printerSettings: {
                        ...(storeSettings?.printerSettings || {
                          paperWidth: '80mm',
                          customFooterText: 'Obrigado pela preferência!',
                          autoPrintOnReceive: false,
                        }),
                        customFooterText: e.target.value,
                      },
                    })
                  }
                  className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                    isDark
                      ? 'bg-[#0A0A0B] border-white/10 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => printThermalReceipt(orders[0])}
                className={`font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 border transition-colors ${
                  isDark
                    ? 'bg-[#0A0A0B] hover:bg-[#202024] text-neutral-200 hover:text-white border-white/5'
                    : 'bg-gray-100 hover:bg-gray-200 text-slate-800 hover:text-slate-950 border-gray-300'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>Testar Impressão da Comanda Térmica</span>
              </button>
            </div>
          </div>

          {/* Security & Password Update Section */}
          <div
            className={`border-t pt-5 space-y-4 ${
              isDark ? 'border-white/5' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-black flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Segurança de Acesso & Troca de Senha</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Banco de Dados Conectado
              </span>
            </div>

            <p
              className={`text-xs ${
                isDark ? 'text-white/60' : 'text-slate-600'
              }`}
            >
              Atualize sua senha de administrador aqui. As alterações são sincronizadas e persistidas de forma duradoura no banco de dados Firestore e na plataforma.
            </p>

            {passMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  passMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                }`}
              >
                {passMessage.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-white/60' : 'text-slate-700'
                    }`}
                  >
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs font-mono ${
                      isDark
                        ? 'bg-[#0A0A0B] border-white/10 text-white'
                        : 'bg-gray-50 border-gray-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-white/60' : 'text-slate-700'
                    }`}
                  >
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Nova senha"
                    required
                    minLength={4}
                    className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs font-mono ${
                      isDark
                        ? 'bg-[#0A0A0B] border-white/10 text-white'
                        : 'bg-gray-50 border-gray-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-white/60' : 'text-slate-700'
                    }`}
                  >
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    minLength={4}
                    className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs font-mono ${
                      isDark
                        ? 'bg-[#0A0A0B] border-white/10 text-white'
                        : 'bg-gray-50 border-gray-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={passSubmitting}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{passSubmitting ? 'Salvando no Banco...' : 'Atualizar Senha no Banco de Dados'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 8: NOTIFICATIONS & CAMPAIGNS (Requirement 32) */}
      {adminTab === 'notifications' && <AdminNotificationsManager />}

      {/* TAB 9: CUSTOMERS & FIDELITY (Requirement 33 & 35) */}
      {adminTab === 'customers' && <AdminCustomersManager />}

        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div
            className={`w-full max-w-lg border rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto transition-colors ${
              isDark
                ? 'bg-[#151518] border-white/10 text-white'
                : 'bg-white border-gray-200 text-slate-900'
            }`}
          >
            <h3
              className={`text-base font-black ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? 'text-white/60' : 'text-slate-700'
                  }`}
                >
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ex: X-Bacon Artesanal Duplo"
                  required
                  className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 ${
                    isDark
                      ? 'bg-[#0A0A0B] border-white/10 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-white/60' : 'text-slate-700'
                    }`}
                  >
                    Categoria
                  </label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                      isDark
                        ? 'bg-[#0A0A0B] border-white/10 text-white'
                        : 'bg-gray-50 border-gray-300 text-slate-900'
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-white/60' : 'text-slate-700'
                    }`}
                  >
                    Preço Normal (R$)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                    className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                      isDark
                        ? 'bg-[#0A0A0B] border-white/10 text-white'
                        : 'bg-gray-50 border-gray-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-white/60' : 'text-slate-700'
                    }`}
                  >
                    Preço Promocional (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={prodPromoPrice}
                    onChange={(e) => setProdPromoPrice(e.target.value)}
                    placeholder="Ex: 24.90"
                    className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                      isDark
                        ? 'bg-[#0A0A0B] border-white/10 text-white'
                        : 'bg-gray-50 border-gray-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-white/60' : 'text-slate-700'
                    }`}
                  >
                    URL da Foto
                  </label>
                  <input
                    type="text"
                    value={prodPhoto}
                    onChange={(e) => setProdPhoto(e.target.value)}
                    placeholder="https://..."
                    className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                      isDark
                        ? 'bg-[#0A0A0B] border-white/10 text-white'
                        : 'bg-gray-50 border-gray-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? 'text-white/60' : 'text-slate-700'
                  }`}
                >
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Descrição apetitosa do produto..."
                  className={`w-full border rounded-2xl p-3 text-xs resize-none focus:outline-none focus:border-amber-500 ${
                    isDark
                      ? 'bg-[#0A0A0B] border-white/10 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? 'text-white/60' : 'text-slate-700'
                  }`}
                >
                  Ingredientes (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={prodIngredients}
                  onChange={(e) => setProdIngredients(e.target.value)}
                  placeholder="Pão brioche, hambúrguer 160g, queijo cheddar"
                  className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                    isDark
                      ? 'bg-[#0A0A0B] border-white/10 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex gap-4 pt-1">
                <label
                  className={`flex items-center gap-2 text-xs cursor-pointer ${
                    isDark ? 'text-white/70' : 'text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={prodIsDailyOffer}
                    onChange={(e) => setProdIsDailyOffer(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>Destacar como Oferta do Dia 🔥</span>
                </label>

                <label
                  className={`flex items-center gap-2 text-xs cursor-pointer ${
                    isDark ? 'text-white/70' : 'text-slate-700'
                  }`}
                >
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
                  className={`px-5 font-bold py-3 rounded-2xl text-xs border transition-colors ${
                    isDark
                      ? 'bg-[#0A0A0B] hover:bg-[#202024] text-white/60 hover:text-white border-white/5'
                      : 'bg-gray-100 hover:bg-gray-200 text-slate-700 hover:text-slate-950 border-gray-300'
                  }`}
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
          <div
            className={`w-full max-w-sm border rounded-3xl p-6 space-y-4 shadow-2xl transition-colors ${
              isDark
                ? 'bg-[#151518] border-white/10 text-white'
                : 'bg-white border-gray-200 text-slate-900'
            }`}
          >
            <h3
              className={`text-base font-black ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Criar Novo Cupom
            </h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? 'text-white/60' : 'text-slate-700'
                  }`}
                >
                  Código do Cupom
                </label>
                <input
                  type="text"
                  value={coupCode}
                  onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                  placeholder="Ex: QUERO10"
                  required
                  className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs uppercase focus:outline-none focus:border-amber-500 ${
                    isDark
                      ? 'bg-[#0A0A0B] border-white/10 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-white/60' : 'text-slate-700'
                    }`}
                  >
                    Tipo de Desconto
                  </label>
                  <select
                    value={coupType}
                    onChange={(e) => setCoupType(e.target.value as 'percentage' | 'fixed')}
                    className={`w-full border rounded-2xl px-3 py-2.5 text-xs ${
                      isDark
                        ? 'bg-[#0A0A0B] border-white/10 text-white'
                        : 'bg-gray-50 border-gray-300 text-slate-900'
                    }`}
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Fixo em Reais (R$)</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-white/60' : 'text-slate-700'
                    }`}
                  >
                    Valor do Desconto
                  </label>
                  <input
                    type="number"
                    value={coupValue}
                    onChange={(e) => setCoupValue(e.target.value)}
                    required
                    className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                      isDark
                        ? 'bg-[#0A0A0B] border-white/10 text-white'
                        : 'bg-gray-50 border-gray-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? 'text-white/60' : 'text-slate-700'
                  }`}
                >
                  Pedido Mínimo (R$)
                </label>
                <input
                  type="number"
                  value={coupMin}
                  onChange={(e) => setCoupMin(e.target.value)}
                  className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${
                    isDark
                      ? 'bg-[#0A0A0B] border-white/10 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
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
                  className={`px-4 font-bold py-3 rounded-2xl text-xs border transition-colors ${
                    isDark
                      ? 'bg-[#0A0A0B] hover:bg-[#202024] text-white/60 hover:text-white border-white/5'
                      : 'bg-gray-100 hover:bg-gray-200 text-slate-700 hover:text-slate-950 border-gray-300'
                  }`}
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
