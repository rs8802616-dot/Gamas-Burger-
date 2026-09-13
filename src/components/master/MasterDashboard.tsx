import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Edit2,
  Power,
  PowerOff,
  ExternalLink,
  Users,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Building2,
  Smartphone,
  MapPin,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Tenant } from '../../types';
import { firebaseService } from '../../services/firebase';

interface TenantStatsItem {
  tenantId: string;
  nome: string;
  slug: string;
  status: 'ativo' | 'inativo';
  ordersCount: number;
  revenue: number;
  adminEmail: string;
  createdAt: string;
}

interface MasterStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalOrders: number;
  totalRevenue: number;
  tenantStats: TenantStatsItem[];
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'balcao';
  status: 'ativo' | 'inativo';
  tenant_id: string | null;
  tenantName: string;
  createdAt: string;
}

export const MasterDashboard: React.FC = () => {
  const {
    adminRole,
    adminLogout,
    setCurrentView,
    theme,
    selectStoreBySlug,
    setSuperAdminSelectedTenantId,
  } = useStore();

  const isDark = theme === 'dark';

  // Active view tab
  const [activeTab, setActiveTab] = useState<'tenants' | 'users' | 'metrics'>('tenants');

  // Data states
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<MasterStats | null>(null);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<Tenant | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states - Create
  const [formNome, setFormNome] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formEmailAdmin, setFormEmailAdmin] = useState('');
  const [formAdminPassword, setFormAdminPassword] = useState('admin123');
  const [formAdminName, setFormAdminName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLogo, setFormLogo] = useState('🍔');
  const [formTagline, setFormTagline] = useState('Hamburgueria Artesanal & Delivery');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Password Change Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<PlatformUser | null>(null);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Helper: auto-generate slug
  const handleNomeChange = (val: string) => {
    setFormNome(val);
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 35);
    setFormSlug(autoSlug);
  };

  const getAdminToken = () => {
    try {
      return localStorage.getItem('gamas_admin_token') || '';
    } catch {
      return '';
    }
  };

  // Fetch all tenants and stats from /api/master/*
  const fetchMasterData = async () => {
    setIsLoading(true);
    const token = getAdminToken();
    try {
      const [tenantsRes, statsRes, usersRes] = await Promise.all([
        fetch('/api/master/tenants', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/master/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/master/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (tenantsRes.ok) {
        const data = await tenantsRes.json();
        if (data && data.success && Array.isArray(data.tenants)) {
          setTenants(data.tenants);
        }
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data && data.success && data.stats) {
          setStats(data.stats);
        }
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        if (data && data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error('Failed to fetch master data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const showNotificationMsg = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Submit Create Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim() || !formEmailAdmin.trim()) {
      showNotificationMsg('error', 'Preencha o nome da hamburgueria e o e-mail do administrador.');
      return;
    }

    setIsSubmitting(true);
    const token = getAdminToken();

    try {
      const res = await fetch('/api/master/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: formNome.trim(),
          slug: formSlug.trim(),
          email_admin: formEmailAdmin.trim(),
          admin_password: formAdminPassword.trim() || 'admin123',
          admin_name: formAdminName.trim(),
          phone: formPhone.trim(),
          whatsapp: formWhatsapp.trim(),
          address: formAddress.trim(),
          logo: formLogo.trim(),
          tagline: formTagline.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotificationMsg('success', data.message || `Hamburgueria "${formNome}" cadastrada com sucesso!`);
        setIsCreateModalOpen(false);
        // Reset form
        setFormNome('');
        setFormSlug('');
        setFormEmailAdmin('');
        setFormAdminPassword('admin123');
        setFormAdminName('');
        setFormPhone('');
        setFormWhatsapp('');
        setFormAddress('');
        fetchMasterData();
      } else {
        showNotificationMsg('error', data.message || 'Erro ao cadastrar hamburgueria.');
      }
    } catch (err: any) {
      showNotificationMsg('error', err.message || 'Erro de conexão com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status (Ativar / Desativar)
  const handleToggleStatus = async (tenant: Tenant) => {
    const actionName = tenant.status === 'ativo' ? 'desativar' : 'ativar';
    if (!window.confirm(`Deseja realmente ${actionName} a hamburgueria "${tenant.nome}"?`)) {
      return;
    }

    const token = getAdminToken();
    try {
      const res = await fetch(`/api/master/tenants/${tenant.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: tenant.status === 'ativo' ? 'inativo' : 'ativo',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotificationMsg('success', data.message || `Status atualizado com sucesso!`);
        fetchMasterData();
      } else {
        showNotificationMsg('error', data.message || 'Erro ao alterar status da loja.');
      }
    } catch (err: any) {
      showNotificationMsg('error', err.message || 'Erro de comunicação com o servidor.');
    }
  };

  // Open Edit Modal
  const openEditModal = (tenant: Tenant) => {
    setSelectedTenantForEdit(tenant);
    setFormNome(tenant.nome);
    setFormSlug(tenant.slug);
    setFormEmailAdmin(tenant.email_admin);
    setFormPhone(tenant.phone || '');
    setFormWhatsapp(tenant.whatsapp || '');
    setFormAddress(tenant.address || '');
    setFormLogo(tenant.logo || '🍔');
    setFormTagline(tenant.tagline || '');
    setIsEditModalOpen(true);
  };

  // Submit Edit Tenant
  const handleEditTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForEdit) return;

    setIsSubmitting(true);
    const token = getAdminToken();

    try {
      const res = await fetch(`/api/master/tenants/${selectedTenantForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: formNome.trim(),
          slug: formSlug.trim(),
          email_admin: formEmailAdmin.trim(),
          phone: formPhone.trim(),
          whatsapp: formWhatsapp.trim(),
          address: formAddress.trim(),
          logo: formLogo.trim(),
          tagline: formTagline.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotificationMsg('success', 'Hamburgueria atualizada com sucesso!');
        setIsEditModalOpen(false);
        fetchMasterData();
      } else {
        showNotificationMsg('error', data.message || 'Erro ao atualizar dados da loja.');
      }
    } catch (err: any) {
      showNotificationMsg('error', err.message || 'Erro de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open password modal for user
  const openPasswordModal = (u: PlatformUser) => {
    setSelectedUserForPassword(u);
    setNewUserPassword('');
    setShowNewPassword(false);
    setIsPasswordModalOpen(true);
  };

  // Submit new password for user
  const handleUpdateUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;

    if (!newUserPassword || newUserPassword.trim().length < 4) {
      showNotificationMsg('error', 'A nova senha deve possuir no mínimo 4 caracteres.');
      return;
    }

    setIsSubmitting(true);
    const token = getAdminToken();

    try {
      // 1. Update on server
      const res = await fetch(`/api/master/users/${selectedUserForPassword.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: newUserPassword.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // 2. Persist directly to Firestore database
        try {
          await firebaseService.updateStaffPasswordInFirestore(
            selectedUserForPassword.email,
            newUserPassword.trim()
          );
        } catch (fErr) {
          console.warn('[Firestore] Sync password error:', fErr);
        }

        showNotificationMsg('success', data.message || 'Senha atualizada no banco de dados com sucesso!');
        setIsPasswordModalOpen(false);
        fetchMasterData();
      } else {
        showNotificationMsg('error', data.message || 'Erro ao atualizar a senha do usuário.');
      }
    } catch (err: any) {
      showNotificationMsg('error', err.message || 'Erro de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email_admin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action: Open Store as Client
  const handleOpenStoreMenu = (slug: string) => {
    selectStoreBySlug(slug);
    setCurrentView('client');
  };

  // Action: Manage Store as Admin
  const handleManageStoreAsAdmin = (tenant: Tenant) => {
    setSuperAdminSelectedTenantId(tenant.id);
    setCurrentView('admin');
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Platform Brand */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isDark
            ? 'bg-[#121215] border-white/10 text-white'
            : 'bg-white border-gray-200 text-gray-900 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Painel Master do Dono do App
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Super Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Gerenciamento Multi-Tenant de Hamburguerias (estilo Anota AI). Cadastre e controle todas as lojas da plataforma.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchMasterData}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Atualizar dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Hamburgueria</span>
            </button>

            <button
              onClick={adminLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Global Notifications Alert */}
        {notification && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Total de Lojas</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black">
            {stats?.totalTenants ?? tenants.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Hamburguerias na base</div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-500 font-medium">Lojas Ativas</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-500">
            {stats?.activeTenants ?? tenants.filter((t) => t.status === 'ativo').length}
          </div>
          <div className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">Recebendo pedidos</div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-500 font-medium">Lojas Inativas</span>
            <PowerOff className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-red-500">
            {stats?.inactiveTenants ?? tenants.filter((t) => t.status === 'inativo').length}
          </div>
          <div className="text-[11px] text-red-600/70 dark:text-red-400/70 mt-0.5">Cardápio pausado</div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-500 font-medium">Pedidos Globais</span>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black">
            {stats?.totalOrders ?? 0}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Em toda a plataforma</div>
        </div>

        <div
          className={`p-4 rounded-2xl border col-span-2 lg:col-span-1 ${
            isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-500 font-medium">Faturamento Total</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-500">
            R$ {(stats?.totalRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Volume transacionado</div>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tenants'
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Lojas & Hamburguerias ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários da Plataforma ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: Lojas / Hamburguerias CRUD */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar loja por nome, slug ou e-mail..."
                className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                  isDark
                    ? 'bg-[#121215] border-white/10 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    : isDark
                    ? 'bg-white/5 text-gray-400'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Todas ({tenants.length})
              </button>
              <button
                onClick={() => setStatusFilter('ativo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === 'ativo'
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                    : isDark
                    ? 'bg-white/5 text-gray-400'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Ativas ({tenants.filter((t) => t.status === 'ativo').length})
              </button>
              <button
                onClick={() => setStatusFilter('inativo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === 'inativo'
                    ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                    : isDark
                    ? 'bg-white/5 text-gray-400'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Inativas ({tenants.filter((t) => t.status === 'inativo').length})
              </button>
            </div>
          </div>

          {/* Tenants List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTenants.map((tenant) => {
              const isActive = tenant.status === 'ativo';
              const tenantStat = stats?.tenantStats?.find((s) => s.tenantId === tenant.id);
              const storeOrdersCount = tenantStat?.ordersCount ?? 0;
              const storeRevenue = tenantStat?.revenue ?? 0;

              return (
                <div
                  key={tenant.id}
                  className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                    isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-gray-200 shadow-sm'
                  } ${!isActive ? 'opacity-70 bg-gray-500/5' : ''}`}
                >
                  <div>
                    {/* Card Header: Logo, Name, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shrink-0">
                          {tenant.logo || '🍔'}
                        </div>
                        <div>
                          <h3 className="font-bold text-base leading-snug">{tenant.nome}</h3>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-mono">
                            <span>/loja/{tenant.slug}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-500 border border-red-500/30'
                        }`}
                      >
                        {isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>

                    {/* Metadata details */}
                    <div className="mt-4 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{tenant.email_admin}</span>
                      </div>
                      {tenant.phone && (
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{tenant.phone}</span>
                        </div>
                      )}
                      {tenant.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{tenant.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Metric pill */}
                    <div className="mt-4 p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Pedidos</span>
                        <span className="font-bold">{storeOrdersCount}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block text-[10px]">Faturamento</span>
                        <span className="font-bold text-amber-500">
                          R$ {storeRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenStoreMenu(tenant.slug)}
                        title="Ver cardápio como cliente"
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cardápio</span>
                      </button>

                      <button
                        onClick={() => handleManageStoreAsAdmin(tenant)}
                        title="Acessar painel admin desta loja"
                        className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Admin Loja</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(tenant)}
                        title="Editar dados da hamburgueria"
                        className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(tenant)}
                        title={isActive ? 'Desativar hamburgueria' : 'Ativar hamburgueria'}
                        className={`p-2 rounded-xl transition-colors ${
                          isActive
                            ? 'text-red-500 hover:bg-red-500/10'
                            : 'text-emerald-500 hover:bg-emerald-500/10'
                        }`}
                      >
                        {isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTenants.length === 0 && (
            <div
              className={`p-12 text-center rounded-2xl border ${
                isDark ? 'bg-[#121215] border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              <Store className="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-50" />
              <p className="font-bold text-sm">Nenhuma hamburgueria encontrada</p>
              <p className="text-xs mt-1">Tente ajustar o termo de busca ou filtro de status.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Usuários da Plataforma */}
      {activeTab === 'users' && (
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base">Usuários e Permissões</h2>
              <p className="text-xs text-gray-500">
                Lista de administradores e operadores vinculados a cada hamburgueria da plataforma.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-500">
              Total: {users.length} usuários
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-bold">Nome & E-mail</th>
                  <th className="py-3 px-4 font-bold">Perfil / Role</th>
                  <th className="py-3 px-4 font-bold">Hamburgueria (Tenant)</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Data de Cadastro</th>
                  <th className="py-3 px-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-[11px] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'super_admin'
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/30'
                            : u.role === 'admin'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                        }`}
                      >
                        {u.role === 'super_admin'
                          ? 'Super Admin (Plataforma)'
                          : u.role === 'admin'
                          ? 'Admin da Hamburgueria'
                          : 'Operador Balcão'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {u.tenantName || 'Plataforma Global'}
                      </span>
                      {u.tenant_id && (
                        <div className="text-[10px] text-gray-400 font-mono">{u.tenant_id}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          u.status === 'ativo' ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'ativo' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        {u.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openPasswordModal(u)}
                        title="Alterar senha do usuário"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[11px] transition-all cursor-pointer border border-amber-500/20"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Alterar Senha</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NOVA HAMBURGUERIA (CREATE) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-xl rounded-2xl border p-6 max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-[#121215] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  +
                </div>
                <div>
                  <h2 className="font-bold text-base">Cadastrar Nova Hamburgueria</h2>
                  <p className="text-xs text-gray-500">Criação de loja e geração automática do usuário admin</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Nome da Hamburgueria *</label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => handleNomeChange(e.target.value)}
                    placeholder="Ex: Burger King Artesanal, Smash Lab"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Ícone / Logo</label>
                  <input
                    type="text"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    placeholder="🍔"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border text-center text-lg ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Slug da Loja (Link público exclusivo) *
                </label>
                <div className="flex items-center rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 border-gray-200 dark:border-white/10">
                  <span className="px-3 py-2 text-xs bg-gray-100 dark:bg-white/5 text-gray-500 font-mono">
                    /loja/
                  </span>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="nome-da-loja"
                    className={`flex-1 px-3 py-2 text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-black/30 text-amber-400' : 'bg-gray-50 text-amber-600'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Os clientes acessarão o cardápio por este link. Deve conter apenas letras minúsculas, números e traços.
                </p>
              </div>

              {/* Seção Administrador Inicial */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Criação Automática do Usuário Administrador da Loja</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">E-mail do Administrador *</label>
                    <input
                      type="email"
                      required
                      value={formEmailAdmin}
                      onChange={(e) => setFormEmailAdmin(e.target.value)}
                      placeholder="admin@hamburgueria.com"
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Senha Inicial de Acesso *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formAdminPassword}
                        onChange={(e) => setFormAdminPassword(e.target.value)}
                        placeholder="admin123"
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 pr-9 ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Nome do Administrador (Opcional)</label>
                  <input
                    type="text"
                    value={formAdminName}
                    onChange={(e) => setFormAdminName(e.target.value)}
                    placeholder="Ex: Carlos Ferreira"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200'
                    }`}
                  />
                </div>
              </div>

              {/* Informações de Contato e Localização */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Telefone de Contato</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">WhatsApp (apenas dígitos com DDD)</label>
                  <input
                    type="text"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    placeholder="5511987654321"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Endereço da Loja</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Ex: Av. Principal, 500 - Bairro Centro"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Cadastrar Hamburgueria</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR HAMBURGUERIA (UPDATE) */}
      {isEditModalOpen && selectedTenantForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-[#121215] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-base">Editar Hamburgueria</h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditTenant} className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold mb-1">Nome da Loja</label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Logo</label>
                  <input
                    type="text"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border text-center text-lg ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Slug da URL</label>
                <div className="flex items-center rounded-xl border overflow-hidden border-gray-200 dark:border-white/10">
                  <span className="px-3 py-2 text-xs bg-gray-100 dark:bg-white/5 text-gray-500 font-mono">
                    /loja/
                  </span>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className={`flex-1 px-3 py-2 text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-black/30 text-amber-400' : 'bg-gray-50 text-amber-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">E-mail do Administrador</label>
                <input
                  type="email"
                  required
                  value={formEmailAdmin}
                  onChange={(e) => setFormEmailAdmin(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Endereço</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ALTERAR SENHA DO USUÁRIO */}
      {isPasswordModalOpen && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 ${
              isDark ? 'bg-[#121215] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Alterar Senha do Usuário</h3>
                  <p className="text-xs text-gray-500">
                    {selectedUserForPassword.name} ({selectedUserForPassword.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUserPassword} className="space-y-4 mt-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
                Esta ação atualizará a senha diretamente no banco de dados e no Firestore, permitindo acesso imediato com a nova credencial.
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Nova Senha *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Digite a nova senha..."
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border pr-10 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Atualizando...' : 'Atualizar Senha no Banco'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
