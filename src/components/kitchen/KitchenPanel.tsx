import React, { useState } from 'react';
import {
  ChefHat,
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
  Store,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, generateWhatsAppLink } from '../../utils/formatters';
import { Order, OrderStatus } from '../../types';

export const KitchenPanel: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    printThermalReceipt,
    simulateIncomingOrder,
    storeSettings,
    isServerConnected,
    refreshOrders,
  } = useStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Group active orders for KDS
  const receivedOrders = orders.filter((o) => o.status === 'received');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  const handleNextStatus = (order: Order) => {
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
    }
  };

  const handleNotifyCustomerWhatsApp = (order: Order) => {
    let msg = '';
    if (order.status === 'preparing') {
      msg = `Olá, ${order.customer.name}! Seu pedido #${order.orderNumber} da ${storeSettings.name} já começou a ser preparado na cozinha! 👨‍🍳🔥`;
    } else if (order.status === 'ready') {
      if (order.deliveryType === 'delivery') {
        msg = `Olá, ${order.customer.name}! Seu pedido #${order.orderNumber} está quentinho e pronto! O motoboy já vai sair para entrega. 🛵🍔`;
      } else {
        msg = `Olá, ${order.customer.name}! Seu pedido #${order.orderNumber} está PRONTO no balcão da ${storeSettings.name} esperando por você! 🍔✨`;
      }
    } else {
      msg = `Olá, ${order.customer.name}! Atualização do pedido #${order.orderNumber}: status ${order.status}.`;
    }

    window.open(generateWhatsAppLink(order.customer.phone, msg), '_blank');
  };

  const renderOrderCard = (order: Order, stageColor: string) => {
    return (
      <div
        key={order.id}
        className="bg-[#151518] border border-white/5 hover:border-white/15 rounded-3xl p-5 flex flex-col justify-between shadow-lg transition-all"
      >
        <div>
          {/* Header of Card */}
          <div className="flex items-start justify-between gap-2 pb-3.5 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-white">
                  #{order.orderNumber}
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    order.deliveryType === 'delivery'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {order.deliveryType === 'delivery' ? (
                    <>
                      <Bike className="w-3 h-3" /> Entrega
                    </>
                  ) : (
                    <>
                      <Store className="w-3 h-3" /> Balcão
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5 font-medium">
                Cliente: <span className="text-white font-bold">{order.customer?.name || 'Cliente'}</span>
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-white/40">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>
                  {order.createdAt
                    ? order.createdAt.includes('-')
                      ? order.createdAt.split('-')[1]?.trim() || order.createdAt
                      : order.createdAt
                    : 'Agora'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-500">{order.estimatedTime || '30-40 min'}</span>
            </div>
          </div>

          {/* Items & Ingredients & Observations */}
          <div className="py-3.5 space-y-3">
            {(order.items || []).map((item, idx) => (
              <div
                key={idx}
                className="bg-[#0A0A0B] rounded-2xl p-3.5 border border-white/5 space-y-1.5"
              >
                <div className="flex items-baseline justify-between text-sm font-black text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-black flex items-center justify-center text-xs font-black shrink-0">
                      {item.quantity}x
                    </span>
                    <span>{item.product?.name || 'Item'}</span>
                  </div>
                </div>

                {/* Addons */}
                {item.selectedAddons && item.selectedAddons.length > 0 && (
                  <div className="pl-8 text-xs text-amber-400 font-semibold space-y-0.5">
                    {item.selectedAddons.map((sa, sIdx) => (
                      <div key={sIdx}>+ {sa.addon.name}</div>
                    ))}
                  </div>
                )}

                {/* Observation highlighted for the kitchen */}
                {item.observation && (
                  <div className="pl-8 pt-1">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-wide flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>OBS: {item.observation}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* General order notes */}
            {order.notes && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs p-3 rounded-2xl font-medium">
                Nota geral: {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-white/5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-white/50 pb-1">
            <span>Total: {formatCurrency(order.total)}</span>
            <span className="uppercase text-[10px] bg-[#0A0A0B] px-2.5 py-1 rounded-xl font-bold text-white/70 border border-white/5">
              {order.paymentMethod}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Thermal Print */}
            <button
              onClick={() => printThermalReceipt(order)}
              title="Imprimir comanda"
              className="p-3 rounded-2xl bg-[#0A0A0B] hover:bg-[#202024] text-white/60 hover:text-white border border-white/5 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Notify on WhatsApp */}
            <button
              onClick={() => handleNotifyCustomerWhatsApp(order)}
              title="Notificar cliente via WhatsApp"
              className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {/* Next Status CTA */}
            <button
              onClick={() => handleNextStatus(order)}
              className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md ${stageColor}`}
            >
              {order.status === 'received' && (
                <>
                  <span>INICIAR PREPARO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
              {order.status === 'preparing' && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>MARCAR PRONTO</span>
                </>
              )}
              {order.status === 'ready' && (
                <>
                  <span>
                    {order.deliveryType === 'delivery' ? 'DESPACHAR MOTOBOY' : 'ENTREGAR NO BALCÃO'}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Toolbar */}
      <div className="bg-[#151518] border border-white/5 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-2xl shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                Painel da Cozinha (KDS)
              </h1>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                  isServerConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
                title="Sincronizado automaticamente com os pedidos feitos pelo celular dos clientes"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isServerConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                {isServerConnected ? 'Celular & PC Sincronizados' : 'Conectando Servidor...'}
              </span>
            </div>
            <p className="text-xs text-white/40 mt-0.5">
              Controle visual dos pedidos para a equipe de montagem e chapa
            </p>
          </div>
        </div>

        {/* Quick Toolbar Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/10 bg-[#0A0A0B] text-white hover:border-amber-500/40 transition-colors active:scale-95"
            title="Sincronizar pedidos com a nuvem e o servidor local"
          >
            <RefreshCw className={`w-4 h-4 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-colors ${
              soundEnabled
                ? 'bg-[#0A0A0B] border-amber-500/30 text-amber-400'
                : 'bg-[#0A0A0B] border-white/5 text-white/40'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Som: {soundEnabled ? 'Ativo' : 'Mudo'}</span>
          </button>

          <button
            onClick={simulateIncomingOrder}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-[0_4px_15px_rgba(245,158,11,0.25)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simular Pedido</span>
          </button>
        </div>
      </div>

      {/* 3 Production Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Recebidos (Novos) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#151518] border border-blue-500/20 rounded-2xl p-3 px-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-xs font-black text-blue-400 uppercase tracking-widest">
                1. Recebidos
              </h2>
            </div>
            <span className="bg-blue-500 text-black font-black text-xs px-2.5 py-0.5 rounded-full">
              {receivedOrders.length}
            </span>
          </div>

          <div className="space-y-4 min-h-[300px]">
            {receivedOrders.length === 0 ? (
              <div className="bg-[#151518] border border-dashed border-white/5 rounded-3xl p-8 text-center text-white/30 text-xs">
                Nenhum pedido novo no momento
              </div>
            ) : (
              receivedOrders.map((order) =>
                renderOrderCard(
                  order,
                  'bg-blue-500 hover:bg-blue-400 text-black shadow-blue-500/20'
                )
              )
            )}
          </div>
        </div>

        {/* 2. Em Preparação */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#151518] border border-amber-500/20 rounded-2xl p-3 px-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                2. Em Preparação
              </h2>
            </div>
            <span className="bg-amber-500 text-black font-black text-xs px-2.5 py-0.5 rounded-full">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-4 min-h-[300px]">
            {preparingOrders.length === 0 ? (
              <div className="bg-[#151518] border border-dashed border-white/5 rounded-3xl p-8 text-center text-white/30 text-xs">
                Nenhum pedido sendo preparado
              </div>
            ) : (
              preparingOrders.map((order) =>
                renderOrderCard(
                  order,
                  'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                )
              )
            )}
          </div>
        </div>

        {/* 3. Prontos (Aguardando Retirada ou Motoboy) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#151518] border border-emerald-500/20 rounded-2xl p-3 px-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                3. Prontos p/ Entrega
              </h2>
            </div>
            <span className="bg-emerald-500 text-black font-black text-xs px-2.5 py-0.5 rounded-full">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-4 min-h-[300px]">
            {readyOrders.length === 0 ? (
              <div className="bg-[#151518] border border-dashed border-white/5 rounded-3xl p-8 text-center text-white/30 text-xs">
                Nenhum pedido aguardando despacho
              </div>
            ) : (
              readyOrders.map((order) =>
                renderOrderCard(
                  order,
                  'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
