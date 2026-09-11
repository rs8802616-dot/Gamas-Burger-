import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminLoginViewProps {
  onSuccess: () => void;
  onBackToClient: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onSuccess, onBackToClient }) => {
  const { adminLogin, theme } = useStore();
  const isDark = theme === 'dark';

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
      <div
        className={`w-full max-w-md border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#151518] border-white/10 text-white'
            : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        {/* Close / Return button in upper corner */}
        <button
          onClick={onBackToClient}
          title="Fechar e ir para o cardápio"
          className={`absolute right-4 top-4 p-2 rounded-xl transition-colors z-10 ${
            isDark
              ? 'text-white/40 hover:text-white hover:bg-white/10'
              : 'text-slate-500 hover:text-slate-900 hover:bg-gray-100'
          }`}
        >
          <X className="w-5 h-5 text-slate-600 dark:text-neutral-300" />
        </button>

        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with security shield */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block mb-2">
            Área Restrita da Equipe (Admin & Balcão)
          </span>
          <h2
            className={`text-xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Acesso Operacional & Gestão
          </h2>
          <p
            className={`text-xs mt-1 ${
              isDark ? 'text-white/50' : 'text-slate-500'
            }`}
          >
            Autenticação restrita da gerência e equipe de balcão Gama's Burger
          </p>
        </div>

        {error && (
          <div
            className={`mb-4 p-3 rounded-2xl border text-xs flex items-center gap-2 ${
              isDark
                ? 'bg-red-950/40 border-red-500/30 text-red-300'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-white/50' : 'text-slate-700'
              }`}
            >
              E-mail de Acesso
            </label>
            <div className="relative">
              <Mail
                className={`w-4 h-4 absolute left-3.5 top-3 pointer-events-none ${
                  isDark ? 'text-white/40' : 'text-slate-500'
                }`}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gamasburger.com ou balcao@gamasburger.com"
                className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-xs transition-colors focus:outline-none focus:border-amber-500 ${
                  isDark
                    ? 'bg-[#101012] border-white/10 text-white placeholder-white/20'
                    : 'bg-gray-50 border-gray-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-white/50' : 'text-slate-700'
              }`}
            >
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock
                className={`w-4 h-4 absolute left-3.5 top-3 pointer-events-none ${
                  isDark ? 'text-white/40' : 'text-slate-500'
                }`}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full border rounded-xl py-2.5 pl-10 pr-10 text-xs transition-colors focus:outline-none focus:border-amber-500 ${
                  isDark
                    ? 'bg-[#101012] border-white/10 text-white placeholder-white/20'
                    : 'bg-gray-50 border-gray-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-3 transition-colors ${
                  isDark
                    ? 'text-white/40 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-600 dark:text-neutral-300" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-600 dark:text-neutral-300" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 disabled:opacity-50 mt-2"
          >
            {loading ? 'Validando Acesso...' : 'Acessar Área Restrita'}
          </button>
        </form>

        {/* Return to client app button */}
        <div
          className={`mt-5 pt-4 border-t text-center ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}
        >
          <button
            type="button"
            onClick={onBackToClient}
            className={`w-full py-2.5 px-4 rounded-xl inline-flex items-center justify-center gap-2 text-xs font-bold transition-colors border ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-300 border-white/5'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 hover:text-amber-900 border-amber-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Voltar ao Cardápio (Sou Cliente)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
