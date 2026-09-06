import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Trash2, ChevronRight, Sparkles, ShoppingBag } from 'lucide-react';
import { AppNotification } from '../../types';
import { NotificationService } from '../../services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrder: (orderId: string) => void;
  onSelectProduct?: (productId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenOrder,
  onSelectProduct,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isOpen) {
      setNotifications(NotificationService.getNotifications());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    NotificationService.saveNotifications(updated);
  };

  const handleClearAll = () => {
    setNotifications([]);
    NotificationService.saveNotifications([]);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    // Mark as read
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
    setNotifications(updated);
    NotificationService.saveNotifications(updated);

    if (notif.orderId) {
      onOpenOrder(notif.orderId);
      onClose();
    } else if (notif.ctaAction && notif.ctaAction.startsWith('prod-') && onSelectProduct) {
      onSelectProduct(notif.ctaAction.replace('prod-', ''));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151518] border border-amber-500/20 rounded-3xl max-w-md w-full h-[80vh] flex flex-col text-white shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111113]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Central de Avisos</h3>
              <p className="text-[10px] text-white/40">Notificações e novidades</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllAsRead}
                  title="Marcar todas como lidas"
                  className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearAll}
                  title="Limpar todas"
                  className="p-2 text-white/40 hover:text-red-400 rounded-xl hover:bg-white/5 transition-colors text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
              <Bell className="w-12 h-12 stroke-[1.5] mb-3 text-white/20" />
              <p className="text-xs font-semibold text-white/60">Nenhuma notificação por aqui</p>
              <p className="text-[11px] text-white/40 mt-1 max-w-xs">
                Você receberá atualizações do seu pedido e promoções especiais da Burger10 aqui.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isPromo = notif.type === 'promo';
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    notif.read
                      ? 'bg-[#101012] border-white/5 opacity-80'
                      : 'bg-[#1a1a1e] border-amber-500/30 shadow-md'
                  }`}
                >
                  {!notif.read && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                  )}

                  <div className="flex items-start gap-3">
                    {notif.imageUrl ? (
                      <img
                        src={notif.imageUrl}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isPromo
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-white/5 text-white/70'
                        }`}
                      >
                        {isPromo ? <Sparkles className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                      </div>
                    )}

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                          {isPromo ? 'Oferta' : 'Pedido'}
                        </span>
                        <span className="text-[10px] text-white/40">{notif.createdAt}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-tight">{notif.title}</h4>
                      <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.ctaLabel && (
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <span>{notif.ctaLabel}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
