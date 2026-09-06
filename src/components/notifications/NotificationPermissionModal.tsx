import React from 'react';
import { Bell, Check, X, ShieldCheck, Zap } from 'lucide-react';
import { NotificationService } from '../../services/notificationService';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGranted?: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onGranted,
}) => {
  if (!isOpen) return null;

  const handleEnable = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted && onGranted) {
      onGranted();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151518] border border-amber-500/25 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-black font-black mb-4 shadow-lg shadow-amber-500/20">
          <Bell className="w-7 h-7" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
          Acompanhamento em Tempo Real
        </span>
        <h3 className="text-base font-extrabold text-white mb-2 leading-snug">
          Ativar notificações de pedidos?
        </h3>

        <p className="text-xs text-white/70 mb-5 leading-relaxed">
          Ative as notificações para saber exatamente quando seu pedido for para a chapa, quando estiver pronto e quando sair para entrega, além de receber cupons exclusivos.
        </p>

        <div className="space-y-2.5 mb-6 text-xs text-white/80">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Status da cozinha em tempo real</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Avisos de saída do motoboy</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Sem spam: você pode desativar quando quiser</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleEnable}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all transform active:scale-98 shadow-lg shadow-amber-500/25"
          >
            <Bell className="w-4 h-4" />
            <span>Ativar Notificações</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-white/50 hover:text-white font-semibold transition-colors"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};
