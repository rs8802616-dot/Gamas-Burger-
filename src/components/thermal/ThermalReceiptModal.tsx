import React, { useState } from 'react';
import { X, Printer, Check, Copy } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';

export const ThermalReceiptModal: React.FC = () => {
  const { thermalReceiptOrder, setThermalReceiptOrder, storeSettings } = useStore();
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(
    storeSettings.printerSettings.paperWidth || '80mm'
  );
  const [copied, setCopied] = useState(false);

  if (!thermalReceiptOrder) return null;

  const order = thermalReceiptOrder;

  const handlePrint = () => {
    window.print();
  };

  const getPlainTextReceipt = () => {
    const divider = '------------------------------------------';
    let text = `${storeSettings.name}\n${storeSettings.tagline}\n${divider}\n`;
    text += `PEDIDO #${order.orderNumber}\n`;
    text += `DATA/HORA: ${order.createdAt}\n`;
    text += `CLIENTE: ${order.customer.name}\n`;
    text += `TEL: ${order.customer.phone}\n`;
    text += `${divider}\nITENS DO PEDIDO:\n\n`;

    order.items.forEach((item) => {
      text += `${item.quantity}x ${item.product.name.toUpperCase()} - ${formatCurrency(
        item.itemTotalPrice * item.quantity
      )}\n`;
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        item.selectedAddons.forEach((sa) => {
          text += `   + ${sa.addon.name} (${formatCurrency(sa.addon.price)})\n`;
        });
      }
      if (item.observation) {
        text += `   OBS: ${item.observation.toUpperCase()}\n`;
      }
      text += '\n';
    });

    text += `${divider}\n`;
    text += `TIPO: ${order.deliveryType === 'delivery' ? 'ENTREGA (DELIVERY)' : 'RETIRADA NO BALCAO'}\n`;
    if (order.deliveryType === 'delivery' && order.address) {
      text += `ENDERECO: ${order.address.street}, ${order.address.number}\n`;
      if (order.address.complement) text += `COMPL: ${order.address.complement}\n`;
      text += `BAIRRO: ${order.address.neighborhood} - ${order.address.city}\n`;
    }

    text += `${divider}\n`;
    text += `SUBTOTAL: ${formatCurrency(order.subtotal)}\n`;
    if (order.discount > 0) text += `DESCONTO: -${formatCurrency(order.discount)}\n`;
    text += `TAXA DE ENTREGA: ${formatCurrency(order.deliveryFee)}\n`;
    text += `TOTAL: ${formatCurrency(order.total)}\n`;
    text += `FORMA PAGAMENTO: ${order.paymentMethod.toUpperCase()}\n`;
    if (order.cashChangeFor) text += `TROCO PARA: ${formatCurrency(order.cashChangeFor)}\n`;
    text += `${divider}\n`;
    text += `${storeSettings.printerSettings.customFooterText}\n`;
    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getPlainTextReceipt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#151518] border border-white/10 rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-[#151518]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Comanda Térmica de Produção</h3>
              <p className="text-[11px] text-white/40">
                Otimizado para impressoras térmicas (ESC/POS)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 58mm vs 80mm Switcher */}
            <div className="flex bg-[#0A0A0B] border border-white/5 rounded-xl p-1 text-xs font-black uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  paperWidth === '58mm' ? 'bg-amber-500 text-black shadow-sm' : 'text-white/40 hover:text-white'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  paperWidth === '80mm' ? 'bg-amber-500 text-black shadow-sm' : 'text-white/40 hover:text-white'
                }`}
              >
                80mm
              </button>
            </div>

            <button
              onClick={() => setThermalReceiptOrder(null)}
              className="p-2 rounded-xl text-white/40 hover:text-white bg-[#0A0A0B] border border-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A0A0B] flex justify-center">
          {/* Printable Element with ID #thermal-receipt for print stylesheet */}
          <div
            id="thermal-receipt"
            className={`bg-white text-black font-mono-thermal p-4 shadow-2xl rounded-sm text-xs leading-relaxed ${
              paperWidth === '58mm' ? 'w-[240px]' : 'w-[320px]'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-2 border-b-2 border-dashed border-neutral-400">
              <h1 className="font-black text-base tracking-wider">{storeSettings.name}</h1>
              <p className="text-[10px] uppercase">{storeSettings.tagline}</p>
              <p className="text-[10px]">{storeSettings.address}</p>
              <p className="text-[10px]">TEL / WHATSAPP: {storeSettings.phone}</p>
            </div>

            {/* Order info */}
            <div className="py-2 border-b-2 border-dashed border-neutral-400 text-center font-bold">
              <span className="text-sm">PEDIDO #{order.orderNumber}</span>
              <div className="text-[10px] font-normal flex justify-between mt-1">
                <span>{order.createdAt}</span>
                <span>{order.deliveryType === 'delivery' ? 'MOTOBOY' : 'BALCAO'}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="py-2 border-b-2 border-dashed border-neutral-400 text-[11px]">
              <div className="font-bold uppercase">CLIENTE: {order.customer.name}</div>
              <div>FONE: {order.customer.phone}</div>
              {order.deliveryType === 'delivery' && order.address && (
                <div className="mt-1">
                  <div className="font-bold">ENDEREÇO DE ENTREGA:</div>
                  <div>
                    {order.address.street}, {order.address.number}
                  </div>
                  {order.address.complement && <div>Compl: {order.address.complement}</div>}
                  <div>
                    {order.address.neighborhood} - {order.address.city}
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="py-2 border-b-2 border-dashed border-neutral-400 space-y-2">
              <div className="font-black text-center text-xs tracking-wider pb-1">
                --- ITENS DA COMANDA ---
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold">
                    <span>
                      {item.quantity}x {item.product.name.toUpperCase()}
                    </span>
                    <span>{formatCurrency(item.itemTotalPrice * item.quantity)}</span>
                  </div>

                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <div className="text-[10px] pl-3 text-neutral-800">
                      {item.selectedAddons.map((sa, sIdx) => (
                        <div key={sIdx}>
                          + {sa.addon.name} ({formatCurrency(sa.addon.price)})
                        </div>
                      ))}
                    </div>
                  )}

                  {item.observation && (
                    <div className="text-[10px] font-black bg-neutral-200 p-1 mt-0.5 rounded uppercase">
                      *** OBS: {item.observation} ***
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2 border-b-2 border-dashed border-neutral-400 text-xs space-y-1">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span>DESCONTO:</span>
                  <span>- {formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>TAXA DE ENTREGA:</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-dotted border-neutral-400">
                <span>TOTAL A PAGAR:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between font-bold text-[11px] pt-1">
                <span>PAGAMENTO:</span>
                <span>{order.paymentMethod.toUpperCase()}</span>
              </div>
              {order.cashChangeFor && (
                <div className="flex justify-between text-[11px]">
                  <span>TROCO PARA:</span>
                  <span>{formatCurrency(order.cashChangeFor)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 text-center text-[10px] text-neutral-600 space-y-0.5">
              <p className="font-bold">{storeSettings.printerSettings.customFooterText}</p>
              <p>IMPRESSO EM {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-[#151518] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0A0A0B] hover:bg-[#202024] text-white/70 hover:text-white text-xs font-bold border border-white/5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setThermalReceiptOrder(null)}
              className="px-4 py-2.5 rounded-2xl bg-[#0A0A0B] hover:bg-[#202024] text-white/50 hover:text-white text-xs font-bold border border-white/5 transition-colors"
            >
              Fechar
            </button>
            <button
              id="print-thermal-btn"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-transform active:scale-95 shadow-[0_4px_15px_rgba(245,158,11,0.25)]"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Comanda</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
