import React, { useState } from 'react';
import {
  Store,
  Clock,
  Printer,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Volume2,
  VolumeX,
  PlusCircle,
  RefreshCw,
  Bike,
  Search,
  Filter,
  PackageCheck,
  Timer,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateWhatsAppLink } from '../../utils/formatters';
import { Order, OrderStatus } from '../../types';

export const BalcaoPanel: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    printThermalReceipt,
    simulateIncomingOrder,
    storeSettings,
    isServerConnected,
    refreshOrders,
    theme,
    routeAccessDeniedMessage,
    clearRouteAccessDeniedMessage,
  } = useStore();

  const isDark = theme === 'dark';
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<'all' | 'delivery' | 'pickup'>('all');

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Filter orders by search (number or customer name) and delivery type
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      searchFilter.trim() === '' ||
      o.orderNumber.toString().includes(searchFilter.trim()) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (o.customer?.phone && o.customer.phone.includes(searchFilter));

    const matchesType =
      deliveryTypeFilter === 'all' ||
      (deliveryTypeFilter === 'delivery' && o.deliveryType === 'delivery') ||
      (deliveryTypeFilter === 'pickup' && o.deliveryType !== 'delivery');

    return matchesSearch && matchesType;
  });

  // Group active orders for Balcão operational columns
  const receivedOrders = filteredOrders.filter((o) => o.status === 'received');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'preparing');
  const readyOrders = filteredOrders.filter((o) => o.status === 'ready');
  const deliveredOrders = filteredOrders.filter(
    (o) => o.status === 'delivered' || o.status === 'out_for_delivery'
  ).slice(0, 10); // Show recent 10 dispatched

  // Status advancement handler (Recebido -> Em preparo -> Pronto -> Entregue)
  const handleAdvanceStatus = (order: Order) => {
    if (order.status === 'received') {
      updateOrderStatus(order.id, 'preparing');
    } else if (order.status === 'preparing') {
      updateOrderStatus(order.id, 'ready');
    } else if (order.status === 'ready') {
      if (order.deliveryType === 'delivery') {
        updateOrderStatus(order.id, 'out_for_delivery');
      } else {
        updateOrderStatus(order.id, 'delivered');
      }
    } else if (order.status === 'out_for_delivery') {
      updateOrderStatus(order.id, 'delivered');
    }
  };

  const handleNotifyCustomerWhatsApp = (order: Order) => {
    let msg = '';
    if (order.status === 'received') {
      msg = `Olá, ${order.customer?.name || 'Cliente'}! Confirmamos seu pedido #${order.orderNumber} no balcão da ${storeSettings.name}! 🍔`;
    } else if (order.status === 'preparing') {
      msg = `Olá, ${order.customer?.name || 'Cliente'}! Seu pedido #${order.orderNumber} já está sendo preparado com todo capricho! 👨‍🍳🔥`;
    } else if (order.status === 'ready') {
      if (order.deliveryType === 'delivery') {
        msg = `Olá, ${order.customer?.name || 'Cliente'}! Seu pedido #${order.orderNumber} está pronto e saindo para entrega! 🛵💨`;
      } else {
        msg = `Olá, ${order.customer?.name || 'Cliente'}! Seu pedido #${order.orderNumber} está PRONTO no balcão da ${storeSettings.name}! Pode retirar! 🍔✨`;
      }
    } else {
      msg = `Olá, ${order.customer?.name || 'Cliente'}! Atualização do seu pedido #${order.orderNumber} na ${storeSettings.name}.`;
    }

    if (order.customer?.phone) {
      window.open(generateWhatsAppLink(order.customer.phone, msg), '_blank');
    }
  };

  // Render individual operational order card (WITHOUT any financial metric aggregations)
  const renderOrderCard = (order: Order, stageColor: string, nextActionText: string) => {
    const isReady = order.status === 'ready';
    const isPreparing = order.status === 'preparing';

    return (
      <div
        key={order.id}
        className={`rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 border ${
          isDark
            ? 'bg-[#151518] border-white/10 hover:border-white/20 shadow-lg text-white'
            : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm text-gray-900'
        }`}
      >
        <div>
          {/* Card Header: Order Number & Delivery Tag */}
          <div
            className={`flex items-start justify-between gap-2 pb-3 border-b ${
              isDark ? 'border-white/10' : 'border-gray-100'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl sm:text-2xl font-black ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  #{order.orderNumber}
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border ${
                    order.deliveryType === 'delivery'
                      ? isDark
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                      : isDark
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {order.deliveryType === 'delivery' ? (
                    <>
                      <Bike className="w-3 h-3 text-blue-500" /> Entrega
                    </>
                  ) : (
                    <>
                      <Store className="w-3 h-3 text-emerald-500" /> Retirada Balcão
                    </>
                  )}
                </span>
              </div>
              <p
                className={`text-xs mt-1 font-medium ${
                  isDark ? 'text-neutral-400' : 'text-slate-600'
                }`}
              >
                Cliente:{' '}
                <span
                  className={`font-bold ${isDark ? 'text-neutral-100' : 'text-slate-900'}`}
                >
                  {order.customer?.name || 'Cliente'}
                </span>
              </p>
              {order.deliveryType === 'delivery' && order.address && (
                <p
                  className={`text-[11px] mt-0.5 ${
                    isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  📍 {order.address.neighborhood} - {order.address.street},{' '}
                  {order.address.number}
                </p>
              )}
            </div>

            {/* Time / Preparation Clock */}
            <div className="text-right shrink-0">
              <div
                className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {order.createdAt
                    ? order.createdAt.includes('-')
                      ? order.createdAt.split('-')[1]?.trim() || order.createdAt
                      : order.createdAt
                    : 'Agora'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <Timer className="w-3 h-3 text-amber-500" />
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {order.estimatedTime || '30-40 min'}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Items List (Quantity, Product, Addons, Kitchen Notes) */}
          <div className="py-3.5 space-y-2.5">
            {(order.items || []).map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-3 border space-y-1.5 ${
                  isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-baseline justify-between text-sm font-black">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
                      {item.quantity}x
                    </span>
                    <span className={isDark ? 'text-white' : 'text-slate-900'}>
                      {item.product?.name || 'Item do Cardápio'}
                    </span>
                  </div>
                </div>

                {/* Addons List */}
                {item.selectedAddons && item.selectedAddons.length > 0 && (
                  <div
                    className={`pl-8 text-xs font-semibold space-y-0.5 ${
                      isDark ? 'text-amber-400' : 'text-amber-700'
                    }`}
                  >
                    {item.selectedAddons.map((sa, sIdx) => (
                      <div key={sIdx}>+ {sa.addon.name}</div>
                    ))}
                  </div>
                )}

                {/* Specific item observations (allergies, no onion, etc.) */}
                {item.observation && (
                  <div className="pl-8 pt-0.5">
                    <div
                      className={`text-xs px-2.5 py-1.5 rounded-xl uppercase tracking-wide font-black flex items-center gap-1.5 border ${
                        isDark
                          ? 'bg-red-500/10 border-red-500/30 text-red-300'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>OBS: {item.observation}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* General order notes */}
            {order.notes && (
              <div
                className={`text-xs p-3 rounded-2xl font-medium border ${
                  isDark
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <strong>Nota:</strong> {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Operational Actions (Print Comanda, WhatsApp, Next Status) */}
        <div
          className={`pt-3 border-t space-y-2 ${
            isDark ? 'border-white/10' : 'border-gray-100'
          }`}
        >
          {/* Operational payment type tag */}
          <div className="flex items-center justify-between text-xs pb-1">
            <span
              className={`font-semibold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
            >
              Forma de Pagamento:
            </span>
            <span
              className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                isDark
                  ? 'bg-[#0A0A0B] text-neutral-300 border-white/10'
                  : 'bg-gray-100 text-slate-800 border-gray-200'
              }`}
            >
              {order.paymentMethod === 'pix'
                ? 'PIX'
                : order.paymentMethod === 'credit_card' || order.paymentMethod === 'debit_card'
                ? 'Cartão'
                : order.paymentMethod === 'cash'
                ? 'Dinheiro'
                : 'Na Entrega'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Thermal Print */}
            <button
              onClick={() => printThermalReceipt(order)}
              title="Imprimir comanda térmica"
              className={`p-2.5 sm:p-3 rounded-2xl border transition-colors flex items-center justify-center ${
                isDark
                  ? 'bg-[#0A0A0B] hover:bg-[#202024] text-neutral-300 hover:text-white border-white/10'
                  : 'bg-gray-100 hover:bg-gray-200 text-slate-700 hover:text-slate-900 border-gray-300'
              }`}
            >
              <Printer className="w-4 h-4 text-slate-700 dark:text-neutral-200" />
            </button>

            {/* Notify customer on WhatsApp */}
            <button
              onClick={() => handleNotifyCustomerWhatsApp(order)}
              title="Avisar cliente pelo WhatsApp"
              className={`p-2.5 sm:p-3 rounded-2xl border transition-colors flex items-center justify-center ${
                isDark
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Advance Status Action Button */}
            <button
              onClick={() => handleAdvanceStatus(order)}
              className={`flex-1 py-2.5 sm:py-3 px-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md ${stageColor}`}
            >
              <span>{nextActionText}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Route access warning banner if balcao attempted to access admin */}
      {routeAccessDeniedMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md ${
            isDark
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-xs font-bold">{routeAccessDeniedMessage}</span>
          </div>
          <button
            onClick={clearRouteAccessDeniedMessage}
            className="text-xs font-black uppercase px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Top Balcão Header & Toolbar */}
      <div
        className={`border rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg transition-colors ${
          isDark
            ? 'bg-[#151518] border-white/10 text-white'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-2xl shrink-0">
            <Store className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className={`text-xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Visão do Balcão
              </h1>
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Operacional
              </span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${
                  isServerConnected
                    ? isDark
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isDark
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isServerConnected
                      ? 'bg-emerald-500 animate-ping'
                      : 'bg-amber-500'
                  }`}
                />
                {isServerConnected ? 'Sincronizado em Tempo Real' : 'Conectando Servidor...'}
              </span>
            </div>
            <p
              className={`text-xs mt-0.5 ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}
            >
              Fila operacional de pedidos, tempos de espera e despacho (Sem dados financeiros)
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Quick Search */}
          <div className="relative flex-1 md:w-48">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-3 pointer-events-none ${
                isDark ? 'text-neutral-400' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar #pedido ou cliente..."
              className={`w-full rounded-2xl py-2 pl-8 pr-3 text-xs border focus:outline-none focus:border-amber-500 transition-colors ${
                isDark
                  ? 'bg-[#0A0A0B] border-white/10 text-white placeholder-neutral-500'
                  : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Sync Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-colors active:scale-95 ${
              isDark
                ? 'bg-[#0A0A0B] border-white/10 text-white hover:border-amber-500/40'
                : 'bg-gray-50 border-gray-200 text-slate-800 hover:border-amber-500 hover:bg-gray-100'
            }`}
            title="Sincronizar pedidos com a nuvem"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-colors ${
              soundEnabled
                ? isDark
                  ? 'bg-[#0A0A0B] border-amber-500/30 text-amber-400'
                  : 'bg-amber-50 border-amber-300 text-amber-800'
                : isDark
                ? 'bg-[#0A0A0B] border-white/10 text-neutral-400'
                : 'bg-gray-50 border-gray-200 text-slate-500'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
          </button>

          {/* Order Simulation (Testing) */}
          <button
            onClick={simulateIncomingOrder}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Simular Pedido</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs: All, Delivery, Pickup */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDeliveryTypeFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            deliveryTypeFilter === 'all'
              ? 'bg-amber-500 text-slate-950 font-black'
              : isDark
              ? 'bg-[#151518] text-neutral-400 hover:text-white border border-white/5'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-gray-200'
          }`}
        >
          Todos ({filteredOrders.length})
        </button>
        <button
          onClick={() => setDeliveryTypeFilter('delivery')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            deliveryTypeFilter === 'delivery'
              ? 'bg-blue-500 text-white font-black'
              : isDark
              ? 'bg-[#151518] text-neutral-400 hover:text-white border border-white/5'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-gray-200'
          }`}
        >
          <Bike className="w-3 h-3" />
          Entrega
        </button>
        <button
          onClick={() => setDeliveryTypeFilter('pickup')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            deliveryTypeFilter === 'pickup'
              ? 'bg-emerald-500 text-white font-black'
              : isDark
              ? 'bg-[#151518] text-neutral-400 hover:text-white border border-white/5'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-gray-200'
          }`}
        >
          <Store className="w-3 h-3" />
          Balcão
        </button>
      </div>

      {/* 3 Operational Work Stages Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Coluna 1: 1. Recebidos (Aguardando Início do Preparo) */}
        <div className="space-y-4">
          <div
            className={`flex items-center justify-between rounded-2xl p-3 px-4 border shadow-sm ${
              isDark
                ? 'bg-[#151518] border-blue-500/20'
                : 'bg-blue-50/70 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                1. Recebidos
              </h2>
            </div>
            <span className="bg-blue-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
              {receivedOrders.length}
            </span>
          </div>

          <div className="space-y-4 min-h-[260px]">
            {receivedOrders.length === 0 ? (
              <div
                className={`border border-dashed rounded-3xl p-8 text-center text-xs ${
                  isDark
                    ? 'bg-[#151518]/50 border-white/10 text-neutral-500'
                    : 'bg-white border-gray-200 text-slate-400'
                }`}
              >
                Nenhum pedido novo pendente no momento
              </div>
            ) : (
              receivedOrders.map((order) =>
                renderOrderCard(
                  order,
                  'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20',
                  'Iniciar Preparo'
                )
              )
            )}
          </div>
        </div>

        {/* Coluna 2: 2. Em Preparação (Chapa / Montagem) */}
        <div className="space-y-4">
          <div
            className={`flex items-center justify-between rounded-2xl p-3 px-4 border shadow-sm ${
              isDark
                ? 'bg-[#151518] border-amber-500/20'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                2. Em Preparação
              </h2>
            </div>
            <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-4 min-h-[260px]">
            {preparingOrders.length === 0 ? (
              <div
                className={`border border-dashed rounded-3xl p-8 text-center text-xs ${
                  isDark
                    ? 'bg-[#151518]/50 border-white/10 text-neutral-500'
                    : 'bg-white border-gray-200 text-slate-400'
                }`}
              >
                Nenhum pedido sendo montado agora
              </div>
            ) : (
              preparingOrders.map((order) =>
                renderOrderCard(
                  order,
                  'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20',
                  'Marcar Pronto'
                )
              )
            )}
          </div>
        </div>

        {/* Coluna 3: 3. Prontos (Aguardando Retirada ou Motoboy) */}
        <div className="space-y-4">
          <div
            className={`flex items-center justify-between rounded-2xl p-3 px-4 border shadow-sm ${
              isDark
                ? 'bg-[#151518] border-emerald-500/20'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                3. Prontos p/ Retirada
              </h2>
            </div>
            <span className="bg-emerald-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-4 min-h-[260px]">
            {readyOrders.length === 0 ? (
              <div
                className={`border border-dashed rounded-3xl p-8 text-center text-xs ${
                  isDark
                    ? 'bg-[#151518]/50 border-white/10 text-neutral-500'
                    : 'bg-white border-gray-200 text-slate-400'
                }`}
              >
                Nenhum pedido aguardando despacho no balcão
              </div>
            ) : (
              readyOrders.map((order) =>
                renderOrderCard(
                  order,
                  'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
                  order.deliveryType === 'delivery'
                    ? 'Despachar Entrega'
                    : 'Entregar ao Cliente'
                )
              )
            )}
          </div>
        </div>
      </div>

      {/* Recentes Despachados / Entregues (Apenas lista operacional recente) */}
      {deliveredOrders.length > 0 && (
        <div
          className={`border rounded-3xl p-5 shadow-sm transition-colors ${
            isDark ? 'bg-[#151518] border-white/10' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <PackageCheck className="w-4 h-4 text-emerald-500" />
            <h3
              className={`text-xs font-black uppercase tracking-wider ${
                isDark ? 'text-neutral-300' : 'text-slate-800'
              }`}
            >
              Últimos Pedidos Despachados / Concluídos
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {deliveredOrders.map((order) => (
              <div
                key={order.id}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                  isDark
                    ? 'bg-[#0A0A0B] border-white/5 text-neutral-300'
                    : 'bg-gray-50 border-gray-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-amber-500 font-black">#{order.orderNumber}</span>
                    <span>{order.customer?.name || 'Cliente'}</span>
                  </div>
                  <span
                    className={`text-[10px] ${
                      isDark ? 'text-neutral-500' : 'text-slate-400'
                    }`}
                  >
                    {order.deliveryType === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'} •{' '}
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <button
                  onClick={() => printThermalReceipt(order)}
                  title="Reimprimir comanda"
                  className={`p-2 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-[#151518] border-white/10 hover:text-white'
                      : 'bg-white border-gray-300 hover:bg-gray-100 text-slate-700'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5 text-slate-700 dark:text-neutral-200" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
