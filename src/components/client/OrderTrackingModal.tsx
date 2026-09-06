import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Printer,
  MessageCircle,
  Package,
  Bike,
  Store,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, getStatusBadgeInfo, generateWhatsAppLink } from '../../utils/formatters';

export const OrderTrackingModal: React.FC = () => {
  const {
    trackingOrderId,
    setTrackingOrderId,
    orders,
    storeSettings,
    printThermalReceipt,
  } = useStore();

  if (!trackingOrderId) return null;

  const order = orders.find((o) => o.id === trackingOrderId) || orders[0];
  if (!order) return null;

  const statusBadge = getStatusBadgeInfo(order.status, order.deliveryType);

  const handleWhatsAppContact = () => {
    const msg = `Olá, gostaria de saber sobre o andamento do meu pedido #${order.orderNumber} (${order.customer.name}).`;
    window.open(generateWhatsAppLink(storeSettings.whatsapp, msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-md bg-[#14151e] border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTrackingOrderId(null)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-black text-white">Acompanhar Pedido</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => printThermalReceipt(order)}
              title="Visualizar Comanda Térmica"
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tracking Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Order Header Card */}
          <div className="flex items-center justify-between bg-[#181922] border border-neutral-800 rounded-2xl p-4">
            <div>
              <span className="text-xs text-neutral-400">Número do pedido</span>
              <h3 className="text-xl font-black text-white tracking-tight">
                Pedido #{order.orderNumber}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">{order.createdAt}</p>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full text-xs font-black border flex items-center gap-1.5 ${statusBadge.color}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              <span>{statusBadge.label}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#181922] border border-neutral-800 rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
              Status do Pedido
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
              {order.timeline.map((step, idx) => {
                const isCurrent =
                  step.status === order.status ||
                  (step.completed &&
                    order.timeline[idx + 1] &&
                    !order.timeline[idx + 1].completed);

                return (
                  <div key={idx} className="relative flex items-start justify-between">
                    {/* Dot on line */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        step.completed
                          ? 'bg-amber-500 border-amber-500 text-neutral-950 shadow-md shadow-amber-500/30'
                          : isCurrent
                          ? 'bg-neutral-900 border-amber-500 text-amber-500 animate-pulse'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-600'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>

                    <div>
                      <h5
                        className={`text-sm font-bold ${
                          step.completed
                            ? 'text-white'
                            : isCurrent
                            ? 'text-amber-400'
                            : 'text-neutral-500'
                        }`}
                      >
                        {step.label}
                      </h5>
                      <span className="text-[11px] text-neutral-400">
                        {step.time ? `Registrado às ${step.time}` : 'Aguardando etapa anterior'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estimated Time Card */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl shrink-0">
              ⏰
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-400">Tempo estimado</span>
              <h4 className="text-lg font-black text-amber-400">{order.estimatedTime}</h4>
              <p className="text-[11px] text-neutral-300">
                Seu pedido está sendo preparado com muito carinho!
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-[#181922] border border-neutral-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
              Seus Produtos ({order.items.length})
            </h4>

            <div className="space-y-2.5 divide-y divide-neutral-800/60">
              {order.items.map((item, i) => (
                <div key={i} className={`flex items-start justify-between gap-3 ${i > 0 ? 'pt-2.5' : ''}`}>
                  <div className="flex items-start gap-2.5">
                    <img
                      src={item.product.photo}
                      alt={item.product.name}
                      className="w-11 h-11 rounded-lg object-cover bg-neutral-800 shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        <span className="text-amber-500 font-black mr-1">{item.quantity}x</span>
                        <span>{item.product.name}</span>
                      </div>
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <p className="text-[11px] text-neutral-400">
                          {item.selectedAddons.map((sa) => `+ ${sa.addon.name}`).join(', ')}
                        </p>
                      )}
                      {item.observation && (
                        <p className="text-[11px] text-amber-300/80 italic">
                          Obs: {item.observation}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-black text-white whitespace-nowrap">
                    {formatCurrency(item.itemTotalPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-800 mt-3 pt-3 flex justify-between items-baseline">
              <span className="text-xs font-bold text-neutral-400">Total do pedido</span>
              <span className="text-base font-black text-amber-500">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-[#12131a] flex gap-2">
          <button
            type="button"
            onClick={handleWhatsAppContact}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs transition-transform active:scale-[0.98] shadow-md shadow-emerald-600/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setTrackingOrderId(null)}
            className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-2xl text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
