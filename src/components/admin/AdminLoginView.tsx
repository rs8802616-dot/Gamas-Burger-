import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminLoginViewProps {
  onSuccess: () => void;
  onBackToClient: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onSuccess, onBackToClient }) => {
  const { adminLogin } = useStore();
  const [email, setEmail] = useState('rs8802616@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = adminLogin(email, password);
      setLoading(false);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message);
      }
    }, 400);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[#151518] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with security shield */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block mb-2">
            Área Restrita
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            Painel do Administrador
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Autenticação de gerência e operadores Burger10
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
                placeholder="seu.email@gmail.com"
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

        {/* Credentials reminder badge */}
        <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/40 text-center">
          <span className="font-bold text-white/60">Credencial de Administrador:</span>
          <br />
          E-mail: <strong className="text-amber-400">rs8802616@gmail.com</strong>
          <br />
          Senha padrão: <strong className="text-white/80">admin123</strong>
        </div>

        {/* Return to client app */}
        <div className="mt-4 pt-4 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={onBackToClient}
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Cardápio do Cliente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
