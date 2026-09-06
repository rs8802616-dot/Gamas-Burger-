import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../../types';
import { NotificationService } from '../../services/notificationService';

interface InAppNotificationBannerProps {
  onOpenOrder: (orderId: string) => void;
  onOpenPromo?: (target: string) => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  onOpenOrder,
  onOpenPromo,
}) => {
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);

  useEffect(() => {
    const unsubscribe = NotificationService.subscribe((notification) => {
      setActiveNotification(notification);

      // Auto-hide after 7 seconds
      const timer = setTimeout(() => {
        setActiveNotification((current) => (current?.id === notification.id ? null : current));
      }, 7000);

      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  if (!activeNotification) return null;

  const handleClick = () => {
    if (activeNotification.orderId) {
      onOpenOrder(activeNotification.orderId);
    } else if (activeNotification.ctaAction && onOpenPromo) {
      onOpenPromo(activeNotification.ctaAction);
    }
    setActiveNotification(null);
  };

  const isPromo = activeNotification.type === 'promo';

  return (
    <div className="fixed top-3 inset-x-3 sm:top-5 sm:max-w-md sm:mx-auto z-50 animate-bounce-in">
      <div
        onClick={handleClick}
        className={`cursor-pointer rounded-2xl p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.85)] border transition-all active:scale-98 relative overflow-hidden backdrop-blur-md ${
          isPromo
            ? 'bg-gradient-to-r from-[#1c1408] via-[#1a181e] to-[#121215] border-amber-500/40 text-white'
            : 'bg-[#151518]/95 border-amber-500/30 text-white'
        }`}
      >
        <div className="flex items-start gap-3">
          {activeNotification.imageUrl ? (
            <img
              src={activeNotification.imageUrl}
              alt=""
              className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isPromo
                  ? 'bg-amber-500 text-black font-black'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isPromo ? <Sparkles className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
          )}

          <div className="flex-1 min-w-0 pr-5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                {isPromo ? 'Promoção' : 'Status do Pedido'}
              </span>
              <span className="text-[10px] text-white/40">{activeNotification.createdAt}</span>
            </div>
            <h4 className="text-xs font-bold text-white truncate">{activeNotification.title}</h4>
            <p className="text-[11px] text-white/70 line-clamp-2 mt-0.5 leading-snug">
              {activeNotification.message}
            </p>

            {activeNotification.ctaLabel && (
              <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300">
                <span>{activeNotification.ctaLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveNotification(null);
            }}
            className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
