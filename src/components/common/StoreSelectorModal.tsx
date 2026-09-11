import React, { useState } from 'react';
import { Store, Check, ArrowRight, X, Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface StoreSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreSelectorModal: React.FC<StoreSelectorModalProps> = ({ isOpen, onClose }) => {
  const { allTenants, currentTenant, selectStoreBySlug, theme } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const activeTenants = allTenants.filter((t) => t.status === 'ativo');
  const filtered = activeTenants.filter(
    (t) =>
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = async (slug: string) => {
    await selectStoreBySlug(slug);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-md rounded-2xl border p-5 max-h-[85vh] flex flex-col ${
          isDark ? 'bg-[#121215] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-2xl'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg">
              🍔
            </div>
            <div>
              <h2 className="font-bold text-sm">Escolher Hamburgueria</h2>
              <p className="text-[11px] text-gray-400">Selecione uma loja para ver o cardápio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou cidade..."
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
            }`}
          />
        </div>

        {/* Store list */}
        <div className="mt-3 space-y-2 overflow-y-auto flex-1 pr-1">
          {filtered.map((tenant) => {
            const isSelected = currentTenant?.id === tenant.id;
            return (
              <div
                key={tenant.id}
                onClick={() => handleSelect(tenant.slug)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10'
                    : isDark
                    ? 'border-white/5 bg-white/5 hover:border-white/20'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl shrink-0">
                    {tenant.logo || '🍔'}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs">{tenant.nome}</h3>
                    <p className="text-[11px] text-gray-400 font-mono">/loja/{tenant.slug}</p>
                    {tenant.address && (
                      <p className="text-[10px] text-gray-500 truncate max-w-[200px]">
                        {tenant.address}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  {isSelected ? (
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-gray-400 text-xs">
              Nenhuma hamburgueria encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
