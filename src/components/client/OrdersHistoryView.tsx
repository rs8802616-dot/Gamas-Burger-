import React, { useState } from 'react';
import { RotateCcw, Clock, ArrowRight, CheckCircle, Package, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, getStatusBadgeInfo } from '../../utils/formatters';
import { Order } from '../../types';

export const OrdersHistoryView: React.FC = () => {
  const {
    orders,
    reorder,
    setTrackingOrderId,
    setClientTab,
    theme,
    customer,
    clientOrderIds,
    isAdminAuthenticated,
    trackingOrderId,
    refreshOrders,
  } = useStore();
  const [filterTab, setFilterTab] = useState<'all' | 'delivered' | 'ongoing' | 'cancelled'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isDark = theme === 'dark';

  const localClientOrderIds = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('gamas_client_order_ids');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }, []);

  const cleanPhone = (customer.phone || '').replace(/\D/g, '');
  const cleanCustomerName = (customer.name || '').trim().toLowerCase();

  // Show orders placed by this customer or in this session
  const myOrders = orders.filter((order) => {
    // If tracking this exact order
    if (trackingOrderId && order.id === trackingOrderId) return true;

    // Direct ID match from state or localStorage
    if (clientOrderIds?.includes(order.id) || localClientOrderIds.includes(order.id)) return true;

    // Customer ID match
    if (customer.id && order.customer?.id === customer.id) return true;

    // Phone match (digits only, flexible)
    if (cleanPhone && order.customer?.phone) {
      const orderPhoneClean = order.customer.phone.replace(/\D/g, '');
      if (
        orderPhoneClean &&
        (orderPhoneClean === cleanPhone ||
          orderPhoneClean.endsWith(cleanPhone) ||
          cleanPhone.endsWith(orderPhoneClean))
      ) {
        return true;
      }
    }

    // Name match if user has set a non-empty name
    if (
      cleanCustomerName &&
      order.customer?.name &&
      order.customer.name.trim().toLowerCase() === cleanCustomerName
    ) {
      return true;
    }

    // If not logged in as admin, any real order currently in client state was scoped for this client
    if (!isAdminAuthenticated) {
      // Exclude legacy template demo seed orders
      if (!['ord-1045', 'ord-1044', 'ord-1043', 'ord-1042'].includes(order.id)) {
        return true;
      }
    }

    return false;
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredOrders = myOrders.filter((order) => {
    if (filterTab === 'delivered') return order.status === 'delivered';
    if (filterTab === 'ongoing')
      return (
        order.status === 'received' ||
        order.status === 'preparing' ||
        order.status === 'ready' ||
        order.status === 'out_for_delivery'
      );
    if (filterTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Title & Refresh Button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Meus Pedidos
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            Acompanhe pedidos em andamento ou repita seus favoritos com um toque
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all active:scale-95 ${
            isDark
              ? 'bg-[#151518] border-white/10 text-white hover:border-amber-500/40'
              : 'bg-white border-gray-200 text-gray-700 hover:border-amber-400 shadow-sm'
          }`}
          title="Atualizar lista de pedidos"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'ongoing', label: 'Em andamento' },
          { id: 'delivered', label: 'Entregues' },
          { id: 'cancelled', label: 'Cancelados' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as typeof filterTab)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-wider ${
              filterTab === tab.id
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : isDark
                ? 'bg-[#151518] text-white/60 border border-white/5 hover:border-white/15 hover:text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-400 hover:text-gray-900 shadow-sm'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List in Expansive Grid for PC & Tablets */}
      {filteredOrders.length === 0 ? (
        <div
          className={`border rounded-3xl p-10 text-center shadow-lg transition-all ${
            isDark
              ? 'bg-[#151518] border-white/5'
              : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-3xl border flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner ${
              isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-gray-100 border-gray-200'
            }`}
          >
            📦
          </div>
          <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {myOrders.length === 0 ? 'Você ainda não realizou nenhum pedido' : 'Nenhum pedido nesta aba'}
          </h3>
          <p className={`text-xs mb-5 max-w-sm mx-auto leading-relaxed ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            {myOrders.length === 0
              ? 'Seus pedidos aparecerão aqui assim que você finalizar sua primeira compra no cardápio.'
              : 'Selecione outra aba para visualizar seus pedidos anteriores.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setClientTab('home')}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md active:scale-95 transition-transform"
            >
              Ver Cardápio
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider border active:scale-95 transition-transform ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Atualizar Pedidos</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadgeInfo(order.status, order.deliveryType);
            const isOngoing =
              order.status === 'received' ||
              order.status === 'preparing' ||
              order.status === 'ready' ||
              order.status === 'out_for_delivery';

            const firstItemImage = order.items[0]?.product?.photo;

            return (
              <div
                key={order.id}
                className={`border rounded-3xl p-5 shadow-lg flex flex-col justify-between gap-4 transition-all ${
                  isDark
                    ? 'bg-[#151518] border-white/5 hover:border-amber-500/30'
                    : 'bg-white border-gray-200 hover:border-amber-500 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Top Bar: Thumbnail, Order Number, Date, Status Badge */}
                <div className="flex items-start gap-4">
                  {firstItemImage && (
                    <img
                      src={firstItemImage}
                      alt="Pedido"
                      className={`w-18 h-18 rounded-2xl object-cover shrink-0 border ${
                        isDark
                          ? 'bg-[#202024] border-white/5'
                          : 'bg-gray-100 border-gray-200'
                      }`}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Pedido #{order.orderNumber}
                      </h4>
                      <span
                        className={`text-[10px] font-black px-3 py-1 rounded-full border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                      {order.createdAt}
                    </p>

                    {/* Items preview text */}
                    <p className={`text-xs font-medium mt-1 truncate ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                      {order.items
                        .map((it) => `${it.quantity}x ${it.product.name}`)
                        .join(' + ')}
                    </p>

                    <div className="mt-2 flex items-center justify-between flex-wrap gap-1">
                      <span className="text-sm font-black text-amber-500">
                        Total: {formatCurrency(order.total)}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-xl border ${
                          isDark
                            ? 'text-white/60 bg-[#0A0A0B] border-white/5'
                            : 'text-gray-600 bg-gray-100 border-gray-200'
                        }`}
                      >
                        {order.deliveryType === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions (Customer actions: Pedir Novamente & Acompanhar/Detalhes, without print button) */}
                <div className={`border-t pt-3.5 flex items-center gap-2.5 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                  {/* Pedir Novamente Button */}
                  <button
                    onClick={() => reorder(order)}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_4px_15px_rgba(245,158,11,0.2)]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
                    <span>PEDIR NOVAMENTE</span>
                  </button>

                  {/* Acompanhar / Detalhes tracking button */}
                  {isOngoing ? (
                    <button
                      onClick={() => setTrackingOrderId(order.id)}
                      className="px-4 py-3 bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-black rounded-2xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Acompanhar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setTrackingOrderId(order.id)}
                      className={`px-4 py-3 font-bold rounded-2xl text-xs border flex items-center gap-1 transition-colors ${
                        isDark
                          ? 'bg-[#0A0A0B] hover:bg-[#202024] text-white/70 hover:text-white border-white/5'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border-gray-200'
                      }`}
                    >
                      <span>Detalhes</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
