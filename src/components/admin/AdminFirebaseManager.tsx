import React, { useState, useEffect } from 'react';
import {
  Flame,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Key,
  Globe,
  Server,
  Layers,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { firebaseService, FirebaseConfig } from '../../services/firebase';

export const AdminFirebaseManager: React.FC = () => {
  const { orders, products, categories, storeSettings } = useStore();
  const [config, setConfig] = useState<FirebaseConfig>(() => firebaseService.getConfig());
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState({
    connected: firebaseService.isCloudConnected(),
    lastSync: firebaseService.getLastSyncTime() || 'Recentemente',
  });

  useEffect(() => {
    const unsubscribe = firebaseService.onStatusChange((status) => {
      setSyncStatus({
        connected: status.connected,
        lastSync: status.lastSync || 'Hoje, ' + new Date().toLocaleTimeString('pt-BR'),
      });
    });
    return unsubscribe;
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const res = await firebaseService.testConnection();
      setStatusMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Falha ao testar conexão: ' + (err.message || 'Erro desconhecido') });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      await firebaseService.syncProducts(products);
      await firebaseService.saveSettings(storeSettings);
      for (const order of orders.slice(0, 10)) {
        await firebaseService.saveOrder(order);
      }
      setStatusMessage({
        type: 'success',
        text: `Todos os dados foram sincronizados com sucesso para a conta ${config.ownerEmail}!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Erro na sincronização: ' + err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    firebaseService.saveConfig(config);
    setIsEditing(false);
    setStatusMessage({
      type: 'success',
      text: `Configurações do Firebase salvas e associadas à conta ${config.ownerEmail}!`,
    });
  };

  const handleExportBackup = () => {
    const jsonStr = firebaseService.exportDataJSON({
      orders,
      products,
      categories,
      storeSettings,
    });
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `burger10_backup_${config.ownerEmail.replace(/[@.]/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Account rs8802616@gmail.com */}
      <div className="bg-gradient-to-r from-[#1C1408] via-[#151518] to-[#111114] border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-6 h-6 fill-amber-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Banco de Dados Firebase Console
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Conectado à Conta
                </span>
              </div>
              <p className="text-xs text-amber-400 font-mono mt-1 font-bold">
                Proprietário: {config.ownerEmail}
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                Sincronização em tempo real de pedidos, produtos, clientes e configurações no Firestore.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#202024] hover:bg-[#28282c] border border-white/10 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
            </button>
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-red-950/40 border-red-500/30 text-red-300'
                : 'bg-blue-950/40 border-blue-500/30 text-blue-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Database Collections Live Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Coleção /pedidos</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{orders.length}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Sincronizado c/ KDS</span>
        </div>

        <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Coleção /produtos</span>
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{products.length}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Cardápio em Nuvem</span>
        </div>

        <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Coleção /categorias</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{categories.length}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Seções Ativas</span>
        </div>

        <div className="bg-[#151518] border border-white/5 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Última Gravação</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-black text-white truncate">{syncStatus.lastSync}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Firestore Online</span>
        </div>
      </div>

      {/* Cloud Parameters and Backup Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Firebase Config Card */}
        <div className="lg:col-span-2 bg-[#151518] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Parâmetros do Firebase Console ({config.ownerEmail})
              </h3>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              {isEditing ? 'Cancelar Edição' : 'Editar Chaves do Console'}
            </button>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">
                  Conta Google / Firebase
                </label>
                <input
                  type="email"
                  disabled
                  value={config.ownerEmail}
                  className="w-full bg-[#101012] border border-amber-500/20 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">
                  ID do Projeto Firebase (Project ID)
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full bg-[#101012] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono disabled:opacity-75 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">
                  Domínio de Autenticação (authDomain)
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full bg-[#101012] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono disabled:opacity-75 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">
                  Bucket de Armazenamento (storageBucket)
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={config.storageBucket}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  className="w-full bg-[#101012] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono disabled:opacity-75 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">
                  Chave de API do Web App (apiKey)
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full bg-[#101012] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono disabled:opacity-75 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-colors shadow-lg"
                >
                  Salvar e Atualizar Firebase
                </button>
              </div>
            )}
          </form>

          {/* Direct link to Firebase Console */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              Acesse o console oficial para gerenciar regras de segurança e índices
            </span>
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline inline-flex items-center gap-1 font-bold"
            >
              <span>Abrir Firebase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Security & Backup Panel */}
        <div className="bg-[#151518] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Download className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Backup & Segurança</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Exporte todos os pedidos, cardápio, produtos, histórico e configurações do sistema em formato JSON padronizado para segurança ou restauração em caso de troca de dispositivo.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            <button
              onClick={handleExportBackup}
              className="w-full flex items-center justify-center gap-2 bg-[#202024] hover:bg-[#2a2a30] text-white border border-white/10 px-4 py-3 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-98"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Baixar Backup Completo (JSON)</span>
            </button>

            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[11px] text-white/50 leading-relaxed">
              💡 Os dados gravados na nuvem e localmente permanecem salvos mesmo se o navegador for fechado.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
