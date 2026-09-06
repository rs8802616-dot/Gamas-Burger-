import React, { useState } from 'react';
import { RotateCcw, Clock, ArrowRight, Printer, CheckCircle, Package } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, getStatusBadgeInfo } from '../../utils/formatters';
import { Order } from '../../types';

export const OrdersHistoryView: React.FC = () => {
  const { orders, reorder, setTrackingOrderId, printThermalReceipt, setClientTab } = useStore();
  const [filterTab, setFilterTab] = useState<'all' | 'delivered' | 'ongoing' | 'cancelled'>('all');

  const filteredOrders = orders.filter((order) => {
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
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Meus Pedidos</h2>
        <p className="text-xs text-white/40 mt-0.5">
          Acompanhe pedidos em andamento ou repita seus favoritos com um toque
        </p>
      </div>

      {/* Filter Tabs matching Immersive UI */}
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
                : 'bg-[#151518] text-white/50 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#151518] border border-white/5 rounded-3xl p-10 text-center shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-[#0A0A0B] border border-white/5 flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
            📦
          </div>
          <h3 className="text-base font-bold text-white mb-1">Nenhum pedido nesta aba</h3>
          <p className="text-xs text-white/40 mb-5 max-w-sm mx-auto leading-relaxed">
            Faça seu primeiro pedido no nosso cardápio e saboreie nossos smash e burgers artesanais!
          </p>
          <button
            onClick={() => setClientTab('home')}
            className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md"
          >
            Ver Cardápio
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
                className="bg-[#151518] border border-white/5 rounded-3xl p-5 shadow-lg flex flex-col gap-3.5 transition-all hover:border-white/15"
              >
                {/* Top Bar: Thumbnail, Order Number, Date, Status Badge */}
                <div className="flex items-start gap-4">
                  {firstItemImage && (
                    <img
                      src={firstItemImage}
                      alt="Pedido"
                      className="w-18 h-18 rounded-2xl object-cover bg-[#202024] shrink-0 border border-white/5"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-base font-black text-white tracking-tight">
                        Pedido #{order.orderNumber}
                      </h4>
                      <span
                        className={`text-[10px] font-black px-3 py-1 rounded-full border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/40 mt-0.5">{order.createdAt}</p>

                    {/* Items preview text */}
                    <p className="text-xs text-white/80 font-medium mt-1 truncate">
                      {order.items
                        .map((it) => `${it.quantity}x ${it.product.name}`)
                        .join(' + ')}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-black text-amber-500">
                        Total: {formatCurrency(order.total)}
                      </span>
                      <span className="text-[11px] text-white/50 bg-[#0A0A0B] px-2.5 py-1 rounded-xl border border-white/5">
                        {order.deliveryType === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-white/5 pt-3.5 flex items-center gap-2.5">
                  {/* Pedir Novamente Button */}
                  <button
                    onClick={() => reorder(order)}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_4px_15px_rgba(245,158,11,0.2)]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
                    <span>PEDIR NOVAMENTE</span>
                  </button>

                  {/* Acompanhar tracking button if ongoing */}
                  {isOngoing ? (
                    <button
                      onClick={() => setTrackingOrderId(order.id)}
                      className="px-4 py-3 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-500 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Acompanhar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setTrackingOrderId(order.id)}
                      className="px-4 py-3 bg-[#0A0A0B] hover:bg-[#202024] text-white/70 hover:text-white font-bold rounded-2xl text-xs border border-white/5 flex items-center gap-1 transition-colors"
                    >
                      <span>Detalhes</span>
                    </button>
                  )}

                  {/* Print receipt button */}
                  <button
                    onClick={() => printThermalReceipt(order)}
                    title="Imprimir comanda térmica"
                    className="p-3 bg-[#0A0A0B] hover:bg-[#202024] text-white/60 hover:text-white font-bold rounded-2xl text-xs border border-white/5 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
