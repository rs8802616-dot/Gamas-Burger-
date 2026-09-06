import React from 'react';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'full' | 'compact' | 'badge';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'full',
  className = '',
}) => {
  const { isInstalled, install, setShowIOSGuide } = usePWAInstall();

  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>App Instalado</span>
        </span>
      );
    }
    return null;
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${className}`}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  return (
    <button
      onClick={install}
      className={`w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/15 via-[#18181b] to-amber-500/5 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl text-left transition-all group active:scale-[0.99] shadow-lg shadow-amber-500/5 ${className}`}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">
            Progressive Web App
          </span>
          <span className="text-sm font-bold text-white block">
            Instalar Aplicativo Burger10
          </span>
          <span className="text-[11px] text-white/50 block">
            Acesso rápido, notificações e pedidos em 1 toque
          </span>
        </div>
      </div>
      <div className="bg-amber-500 group-hover:bg-amber-400 text-black p-2.5 rounded-xl transition-colors shrink-0 ml-3">
        <Download className="w-4 h-4" />
      </div>
    </button>
  );
};
