import React from 'react';
import { Store, AlertCircle, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface StoreUnavailableViewProps {
  reason?: 'not_found' | 'inactive';
}

export const StoreUnavailableView: React.FC<StoreUnavailableViewProps> = ({ reason = 'not_found' }) => {
  const { currentStoreSlug, allTenants, selectStoreBySlug, theme } = useStore();
  const isDark = theme === 'dark';

  const activeTenants = allTenants.filter((t) => t.status === 'ativo');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mb-4 text-amber-500">
        🍔
      </div>

      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
        {reason === 'inactive'
          ? 'Hamburgueria Temporariamente Indisponível'
          : 'Hamburgueria Não Encontrada'}
      </h1>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        {reason === 'inactive' ? (
          <>
            A hamburgueria identificada pelo link{' '}
            <code className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-amber-500">
              /loja/{currentStoreSlug}
            </code>{' '}
            está temporariamente desativada pela gerência da plataforma.
          </>
        ) : (
          <>
            Não encontramos nenhuma loja ativa com o link{' '}
            <code className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-amber-500">
              /loja/{currentStoreSlug}
            </code>
            . Verifique se o endereço foi digitado corretamente.
          </>
        )}
      </p>

      {/* Directory of active stores to choose from */}
      <div
        className={`w-full p-6 rounded-2xl border text-left ${
          isDark ? 'bg-[#121215] border-white/5 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-4 h-4 text-amber-500" />
          <h2 className="font-bold text-sm">Hamburguerias Disponíveis na Plataforma:</h2>
        </div>

        {activeTenants.length > 0 ? (
          <div className="space-y-2.5">
            {activeTenants.map((tenant) => (
              <div
                key={tenant.id}
                onClick={() => selectStoreBySlug(tenant.slug)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
                  isDark
                    ? 'bg-white/5 border-white/5 hover:border-amber-500/50 hover:bg-white/10'
                    : 'bg-gray-50 border-gray-100 hover:border-amber-500/50 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl shrink-0">
                    {tenant.logo || '🍔'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{tenant.nome}</h3>
                    <p className="text-xs text-gray-400 font-mono">/loja/{tenant.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs font-bold text-amber-500">Acessar Cardápio</span>
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-4">
            Nenhuma outra hamburgueria ativa no momento.
          </p>
        )}
      </div>
    </div>
  );
};
