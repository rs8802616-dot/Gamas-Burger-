import React from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle, Sparkles } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  context: 'menu' | 'after_order' | null;
  isIOS: boolean;
  showIOSGuide: boolean;
  onCloseIOSGuide: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  context,
  isIOS,
  showIOSGuide,
  onCloseIOSGuide,
}) => {
  // iOS Step-by-step Installation Guide Modal
  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#151518] border border-amber-500/20 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl relative">
          <button
            onClick={onCloseIOSGuide}
            className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-full bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
            <Smartphone className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-black text-white mb-1">Como instalar no seu iPhone / iPad</h3>
          <p className="text-xs text-white/60 mb-5">
            Tenha o cardápio do Gama's Burger na tela de início sem precisar da App Store:
          </p>

          <div className="space-y-3 mb-6 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#0A0A0B] border border-white/5">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <p className="text-white/90">No navegador <strong>Safari</strong>, toque no ícone de <strong>Compartilhar</strong> na barra inferior:</p>
                <div className="flex items-center gap-1.5 text-amber-400 mt-1 font-semibold">
                  <Share className="w-3.5 h-3.5" /> Barra do Safari
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#0A0A0B] border border-white/5">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <p className="text-white/90">Role para baixo e selecione a opção:</p>
                <div className="flex items-center gap-1.5 text-amber-400 mt-1 font-bold">
                  <PlusSquare className="w-3.5 h-3.5" /> Adicionar à Tela de Início
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#0A0A0B] border border-white/5">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <p className="text-white/90">Toque em <strong>Adicionar</strong> no topo direito. O app estará pronto para uso!</p>
              </div>
            </div>
          </div>

          <button
            onClick={onCloseIOSGuide}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
          >
            Entendido, fechar
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  const isAfterOrder = context === 'after_order';

  return (
    <div className="fixed inset-x-0 bottom-0 sm:bottom-6 sm:max-w-md sm:mx-auto z-40 p-4 animate-slide-up">
      <div className="bg-gradient-to-b from-[#1c1c20] to-[#121215] border border-amber-500/30 rounded-3xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/30 shrink-0">
            {isAfterOrder ? <Sparkles className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
          </div>
          <div className="pr-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-0.5">
              {isAfterOrder ? '🍔 Gostou da experiência?' : "📱 Aplicativo Gama's Burger"}
            </span>
            <h4 className="text-sm font-extrabold text-white leading-tight">
              {isAfterOrder
                ? 'Tenha acesso rápido aos seus pedidos e ofertas!'
                : 'Quer ter nosso cardápio sempre à mão?'}
            </h4>
          </div>
        </div>

        <p className="text-xs text-white/70 mb-4 leading-relaxed">
          {isAfterOrder
            ? 'Instale nosso aplicativo e acompanhe seus pedidos em tempo real, receba cupons exclusivos e peça novamente em 1 toque.'
            : 'Instale nosso aplicativo para fazer seus pedidos ainda mais rápido, sem digitar o link e com notificações de preparo.'}
        </p>

        {/* Benefits bullets */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] text-white/80">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Acesso em 1 toque</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Notificações de entrega</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onInstall}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all transform active:scale-95 shadow-lg shadow-amber-500/25"
          >
            <Download className="w-4 h-4" />
            <span>{isAfterOrder ? 'Instalar Aplicativo' : 'Instalar Aplicativo'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl text-xs font-semibold transition-colors"
          >
            {isAfterOrder ? 'Agora não' : 'Continuar no navegador'}
          </button>
        </div>
      </div>
    </div>
  );
};
