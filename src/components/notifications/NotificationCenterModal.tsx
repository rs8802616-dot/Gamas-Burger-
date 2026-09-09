import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, CheckCheck, Trash2, ChevronRight, Sparkles, ShoppingBag } from 'lucide-react';
import { AppNotification } from '../../types';
import { NotificationService } from '../../services/notificationService';
import { useStore } from '../../context/StoreContext';

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
  const {
    theme,
    products,
    setSelectedProductForModal,
    setClientTab,
    setCurrentView,
    setTrackingOrderId,
  } = useStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isOpen) {
      setNotifications(NotificationService.getNotifications());
      const unsubChanges = NotificationService.subscribeChanges((list) => {
        setNotifications(list);
      });
      return unsubChanges;
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

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
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
    setNotifications(updated);
    NotificationService.saveNotifications(updated);

    if (notif.orderId) {
      if (onOpenOrder) onOpenOrder(notif.orderId);
      else setTrackingOrderId(notif.orderId);
      onClose();
    } else if (notif.ctaAction && notif.ctaAction.startsWith('prod-')) {
      const prodId = notif.ctaAction.replace('prod-', '');
      const found = products.find((p) => p.id === prodId || p.id === notif.ctaAction);
      if (found) {
        setSelectedProductForModal(found);
      } else if (onSelectProduct) {
        onSelectProduct(prodId);
      } else {
        setCurrentView('client');
        setClientTab('menu');
      }
      onClose();
    } else if (notif.ctaAction === 'menu' || notif.type === 'promo' || notif.type === 'system') {
      setCurrentView('client');
      setClientTab('menu');
      onClose();
    }
  };

  const handleSendTestNotification = () => {
    NotificationService.notify({
      title: '🍔 Teste de Notificação: Burger Artesanal',
      message: "Notificações funcionando 100%! Aproveite as promoções exclusivas do Gama's Burger.",
      type: 'promo',
      ctaLabel: 'Ver Oferta',
      ctaAction: 'menu',
    });
  };

  const isDark = theme === 'dark';

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-all animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#151518] border-white/10 text-white'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 border-b flex items-center justify-between transition-colors ${
            isDark
              ? 'bg-[#111114] border-white/10'
              : 'bg-gray-50/90 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Central de Avisos
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                Notificações e novidades
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllAsRead}
                  title="Marcar todas como lidas"
                  className={`p-2 rounded-xl transition-colors text-xs flex items-center gap-1 ${
                    isDark
                      ? 'text-neutral-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <CheckCheck className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline text-[11px] font-semibold">Lidas</span>
                </button>
                <button
                  onClick={handleClearAll}
                  title="Limpar todas as notificações"
                  className={`p-2 rounded-xl transition-colors text-xs ${
                    isDark
                      ? 'text-neutral-400 hover:text-red-400 hover:bg-white/10'
                      : 'text-gray-500 hover:text-red-600 hover:bg-gray-200'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              title="Fechar"
              className={`p-2 rounded-xl transition-colors ${
                isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <Bell className="w-7 h-7" />
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Nenhuma notificação por aqui
              </p>
              <p className={`text-xs mt-1 max-w-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                Você receberá avisos do andamento do seu pedido e promoções imperdíveis aqui.
              </p>
              <button
                onClick={handleSendTestNotification}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-transform active:scale-95 shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simular Notificação de Teste</span>
              </button>
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
                      ? isDark
                        ? 'bg-[#101012] border-white/5 opacity-75 hover:opacity-100'
                        : 'bg-gray-50 border-gray-200 opacity-80 hover:opacity-100'
                      : isDark
                      ? 'bg-[#1a1a1e] border-amber-500/40 shadow-md hover:border-amber-500'
                      : 'bg-amber-50/60 border-amber-300 shadow-sm hover:border-amber-500'
                  }`}
                >
                  {!notif.read && (
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                  )}

                  <div className="flex items-start gap-3">
                    {notif.imageUrl ? (
                      <img
                        src={notif.imageUrl}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-amber-500/20"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isPromo
                            ? 'bg-amber-500/20 text-amber-500'
                            : isDark
                            ? 'bg-white/5 text-white/70'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {isPromo ? <Sparkles className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                      </div>
                    )}

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {isPromo ? 'Oferta' : 'Pedido'}
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-gray-400'}`}>
                          {notif.createdAt}
                        </span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {notif.title}
                      </h4>
                      <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-neutral-300' : 'text-gray-600'}`}>
                        {notif.message}
                      </p>

                      {notif.ctaLabel && (
                        <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
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
    </div>,
    document.body
  );
};
