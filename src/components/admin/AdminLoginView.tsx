import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminLoginViewProps {
  onSuccess: () => void;
  onBackToClient: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onSuccess, onBackToClient }) => {
  const { adminLogin } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await adminLogin(email, password);
      setLoading(false);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message);
      }
    } catch {
      setLoading(false);
      setError('Erro ao processar login. Tente novamente.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md bg-[#151518] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Close / Return button in upper corner */}
        <button
          onClick={onBackToClient}
          title="Fechar e ir para o cardápio"
          className="absolute right-4 top-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with security shield */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block mb-2">
            Área Restrita do Lojista
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            Painel do Administrador
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Autenticação restrita da gerência e operadores Gama's Burger
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
              E-mail do Administrador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-[#101012] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#101012] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/30 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50 mt-2"
          >
            {loading ? 'Validando Acesso...' : 'Acessar Painel de Gestão'}
          </button>
        </form>

        {/* Return to client app button */}
        <div className="mt-5 pt-4 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={onBackToClient}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 rounded-xl inline-flex items-center justify-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Cardápio (Sou Cliente)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
