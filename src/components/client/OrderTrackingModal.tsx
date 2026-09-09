import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Check,
  Flame,
  Bike,
  PackageCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, generateWhatsAppLink } from '../../utils/formatters';

export const OrderTrackingModal: React.FC = () => {
  const {
    trackingOrderId,
    setTrackingOrderId,
    orders,
    storeSettings,
  } = useStore();

  if (!trackingOrderId) return null;

  const order = orders.find((o) => o.id === trackingOrderId);
  if (!order) return null;

  const handleWhatsAppContact = () => {
    const msg = `Olá, gostaria de saber sobre o andamento do meu pedido #${order.orderNumber} (${order.customer.name}).`;
    window.open(generateWhatsAppLink(storeSettings.whatsapp, msg), '_blank');
  };

  const steps = [
    {
      key: 'received',
      label: 'Pedido recebido',
      icon: Check,
      isDone: true,
      time: order.timeline[0]?.time || '19:30',
      description: 'Recebido pela hamburgueria',
    },
    {
      key: 'preparing',
      label: 'Em preparação',
      icon: Flame,
      isDone: ['preparing', 'ready', 'delivering', 'completed'].includes(order.status),
      isActive: order.status === 'preparing',
      time: order.timeline[1]?.time || '19:35',
      description: 'Lanche na chapa sendo montado com carinho',
    },
    {
      key: 'delivering',
      label: order.deliveryType === 'delivery' ? 'Saiu para entrega' : 'Pronto para retirada',
      icon: Bike,
      isDone: ['delivering', 'completed'].includes(order.status),
      isActive: order.status === 'delivering' || order.status === 'ready',
      time: order.timeline[2]?.time,
      description: order.deliveryType === 'delivery' ? 'Entregador a caminho da sua casa' : 'Pode retirar no balcão',
    },
    {
      key: 'completed',
      label: 'Entregue',
      icon: PackageCheck,
      isDone: order.status === 'completed',
      isActive: false,
      time: order.timeline[3]?.time,
      description: 'Pedido finalizado com sucesso. Bom apetite!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-md bg-[#0e0e11] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-200">
        {/* Top Header matching Screen 5: "← Pedido #1234" */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTrackingOrderId(null)}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-base font-black text-white">
              Pedido #{order.orderNumber}
            </h2>
          </div>

          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            Ao vivo
          </span>
        </div>

        {/* Tracking Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Estimated Time Card matching Screen 5 */}
          <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block font-medium">
                Tempo estimado de entrega
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">
                {order.estimatedTime || '35 - 45 min'}
              </h3>
            </div>
          </div>

          {/* Delivery Address Card */}
          {order.address && (
            <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 flex items-start gap-3 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="text-neutral-400 block font-semibold">Entregar em:</span>
                <p className="text-white font-bold mt-0.5">
                  {order.address.street}, {order.address.number}
                  {order.address.complement ? ` (${order.address.complement})` : ''}
                </p>
                <p className="text-neutral-400 text-[11px]">
                  {order.address.neighborhood} - {order.address.city}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Status do Pedido
            </h4>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative flex items-start justify-between">
                    {/* Circle on timeline */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                        step.isDone
                          ? 'bg-amber-500 border-amber-500 text-neutral-950 shadow-md shadow-amber-500/30'
                          : step.isActive
                          ? 'bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse ring-4 ring-amber-500/20'
                          : 'bg-[#151518] border-neutral-700 text-neutral-600'
                      }`}
                    >
                      {step.isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                    </div>

                    <div className="min-w-0 flex-1 pr-2">
                      <h5
                        className={`text-xs font-bold ${
                          step.isDone ? 'text-white' : step.isActive ? 'text-amber-400' : 'text-neutral-500'
                        }`}
                      >
                        {step.label}
                      </h5>
                      <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                        {step.description}
                      </p>
                    </div>

                    {step.time && (
                      <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                        {step.time}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="bg-[#151518] border border-white/5 rounded-2xl p-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">
              Itens do Pedido ({order.items.length})
            </h4>

            <div className="space-y-2.5 divide-y divide-white/5">
              {order.items.map((item, i) => (
                <div key={i} className={`flex items-start justify-between gap-2 ${i > 0 ? 'pt-2.5' : ''}`}>
                  <div className="text-xs">
                    <div className="font-bold text-white">
                      <span className="text-amber-500 mr-1.5">{item.quantity}x</span>
                      <span>{item.product.name}</span>
                    </div>
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {item.selectedAddons.map((sa) => `+ ${sa.addon.name}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-black text-white shrink-0">
                    {formatCurrency(item.itemTotalPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 mt-3 pt-3 flex justify-between items-baseline">
              <span className="text-xs font-bold text-neutral-400">
                Total ({order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'cash' ? 'Dinheiro' : 'Cartão'})
              </span>
              <span className="text-base font-black text-amber-500">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#0e0e11] flex gap-2">
          <button
            type="button"
            onClick={handleWhatsAppContact}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-600/20 transition-transform active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Precisa de ajuda? WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setTrackingOrderId(null)}
            className="px-5 py-3 bg-[#151518] hover:bg-[#1c1c21] text-white font-bold rounded-2xl text-xs border border-white/10 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
