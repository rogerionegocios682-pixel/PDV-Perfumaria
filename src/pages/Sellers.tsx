import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Key,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  Filter,
  Shield,
  ShieldCheck,
  FileText,
  Clock,
  Eye,
  X,
  AlertCircle,
  Check,
  ChevronRight,
  User,
  Phone,
  Mail,
  Receipt,
  Download,
  Percent,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { Seller, SellerPermissions, SellerCommission, DEFAULT_SELLER_PERMISSIONS } from '../types';

export const Sellers: React.FC = () => {
  const { currentUser, loginAsSeller, refreshSellers } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>(() => db.getSellers());
  const [commissions, setCommissions] = useState<SellerCommission[]>(() => db.getCommissions());
  const [activeSubTab, setActiveSubTab] = useState<'sellers' | 'commissions' | 'ranking'>('sellers');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Commission Filters
  const [commSellerFilter, setCommSellerFilter] = useState<string>('ALL');
  const [commStatusFilter, setCommStatusFilter] = useState<'ALL' | 'PENDENTE' | 'PAGA' | 'CANCELADA'>('ALL');
  const [commPeriodFilter, setCommPeriodFilter] = useState<'ALL' | 'TODAY' | '7DAYS' | 'MONTH'>('ALL');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  // Notifications / Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Seller Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cpf: '',
    commissionPercentage: 5,
    active: true,
    notes: '',
    permissions: { ...DEFAULT_SELLER_PERMISSIONS },
  });

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const refreshData = () => {
    setSellers(db.getSellers());
    setCommissions(db.getCommissions());
    refreshSellers();
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filtered sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.cpf && s.cpf.includes(searchQuery)) ||
        (s.phone && s.phone.includes(searchQuery));

      if (!matchSearch) return false;
      if (statusFilter === 'ACTIVE') return s.active;
      if (statusFilter === 'INACTIVE') return !s.active;
      return true;
    });
  }, [sellers, searchQuery, statusFilter]);

  // Performance calculations per seller
  const sellerStats = useMemo(() => {
    const stats: Record<string, { totalSalesCount: number; totalRevenue: number; totalCommission: number; pendingCommission: number }> = {};
    const sales = db.getSales().filter((s) => s.status === 'CONCLUIDA');

    sellers.forEach((seller) => {
      stats[seller.id] = { totalSalesCount: 0, totalRevenue: 0, totalCommission: 0, pendingCommission: 0 };
    });

    sales.forEach((sale) => {
      if (sale.sellerId && stats[sale.sellerId]) {
        stats[sale.sellerId].totalSalesCount += 1;
        stats[sale.sellerId].totalRevenue += sale.total;
      }
    });

    commissions.forEach((c) => {
      if (stats[c.sellerId]) {
        if (c.status !== 'CANCELADA') {
          stats[c.sellerId].totalCommission += c.commissionAmount;
        }
        if (c.status === 'PENDENTE' || c.status === 'ATIVA') {
          stats[c.sellerId].pendingCommission += c.commissionAmount;
        }
      }
    });

    return stats;
  }, [sellers, commissions]);

  // Commission list filtered
  const filteredCommissions = useMemo(() => {
    return commissions.filter((c) => {
      if (commSellerFilter !== 'ALL' && c.sellerId !== commSellerFilter) return false;
      if (commStatusFilter !== 'ALL') {
        if (commStatusFilter === 'PENDENTE' && c.status !== 'PENDENTE' && c.status !== 'ATIVA') return false;
        if (commStatusFilter === 'PAGA' && c.status !== 'PAGA') return false;
        if (commStatusFilter === 'CANCELADA' && c.status !== 'CANCELADA') return false;
      }

      if (commPeriodFilter !== 'ALL') {
        const date = new Date(c.createdAt);
        const now = new Date();
        if (commPeriodFilter === 'TODAY') {
          if (date.toDateString() !== now.toDateString()) return false;
        } else if (commPeriodFilter === '7DAYS') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (date < sevenDaysAgo) return false;
        } else if (commPeriodFilter === 'MONTH') {
          if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }, [commissions, commSellerFilter, commStatusFilter, commPeriodFilter]);

  // Ranking list sorted by total revenue
  const rankingList = useMemo(() => {
    return sellers
      .map((s) => ({
        seller: s,
        stats: sellerStats[s.id] || { totalSalesCount: 0, totalRevenue: 0, totalCommission: 0, pendingCommission: 0 },
        avgTicket:
          (sellerStats[s.id]?.totalSalesCount || 0) > 0
            ? (sellerStats[s.id]?.totalRevenue || 0) / (sellerStats[s.id]?.totalSalesCount || 1)
            : 0,
      }))
      .sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue);
  }, [sellers, sellerStats]);

  // Open Create Form
  const handleOpenCreate = () => {
    setSelectedSeller(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      cpf: '',
      commissionPercentage: 5,
      active: true,
      notes: '',
      permissions: { ...DEFAULT_SELLER_PERMISSIONS },
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (seller: Seller) => {
    setSelectedSeller(seller);
    setFormData({
      name: seller.name,
      email: seller.email,
      password: '',
      confirmPassword: '',
      phone: seller.phone || '',
      cpf: seller.cpf || '',
      commissionPercentage: seller.commissionPercentage,
      active: seller.active,
      notes: seller.notes || '',
      permissions: { ...seller.permissions },
    });
    setIsFormModalOpen(true);
  };

  // Save Seller
  const handleSaveSeller = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showNotification('error', 'O nome completo do vendedor é obrigatório.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      showNotification('error', 'Informe um e-mail válido.');
      return;
    }

    if (!selectedSeller) {
      // New seller: password is mandatory
      if (!formData.password) {
        showNotification('error', 'A senha de acesso é obrigatória para o novo vendedor.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showNotification('error', 'A confirmação de senha não confere com a senha digitada.');
        return;
      }
    } else if (formData.password) {
      // Editing and typed password
      if (formData.password !== formData.confirmPassword) {
        showNotification('error', 'A confirmação de senha não confere com a senha digitada.');
        return;
      }
    }

    if (formData.commissionPercentage < 0 || isNaN(formData.commissionPercentage)) {
      showNotification('error', 'O percentual de comissão deve ser maior ou igual a zero.');
      return;
    }

    const res = db.saveSeller({
      id: selectedSeller?.id,
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password || undefined,
      phone: formData.phone.trim(),
      cpf: formData.cpf.trim(),
      commissionPercentage: Number(formData.commissionPercentage),
      active: formData.active,
      notes: formData.notes.trim(),
      permissions: formData.permissions,
    });

    if (!res.success) {
      showNotification('error', res.error || 'Erro ao salvar vendedor.');
      return;
    }

    showNotification('success', selectedSeller ? 'Vendedor atualizado com sucesso!' : 'Vendedor cadastrado com sucesso!');
    setIsFormModalOpen(false);
    refreshData();
  };

  // Toggle Active/Inactive
  const handleToggleStatus = (seller: Seller) => {
    const res = db.toggleSellerStatus(seller.id);
    if (!res.success) {
      showNotification('error', res.error || 'Erro ao alterar status.');
      return;
    }
    showNotification('success', `Vendedor ${seller.name} ${seller.active ? 'inativado' : 'ativado'} com sucesso.`);
    refreshData();
  };

  // Delete Seller
  const handleDeleteSeller = (seller: Seller) => {
    if (!confirm(`Deseja realmente excluir o cadastro de ${seller.name}?`)) return;

    const res = db.deleteSeller(seller.id);
    if (!res.success) {
      showNotification('error', res.error || 'Não foi possível excluir o vendedor.');
      return;
    }
    showNotification('success', 'Vendedor excluído com sucesso.');
    refreshData();
  };

  // Open Password Modal
  const handleOpenPasswordModal = (seller: Seller) => {
    setSelectedSeller(seller);
    setNewPassword('');
    setConfirmNewPassword('');
    setIsPasswordModalOpen(true);
  };

  // Submit Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller) return;

    if (!newPassword) {
      showNotification('error', 'A nova senha não pode ser vazia.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showNotification('error', 'As senhas digitadas não coincidem.');
      return;
    }

    const res = db.changeSellerPassword(selectedSeller.id, newPassword);
    if (!res.success) {
      showNotification('error', res.error || 'Erro ao redefinir senha.');
      return;
    }

    showNotification('success', `Senha do vendedor ${selectedSeller.name} redefinida com sucesso.`);
    setIsPasswordModalOpen(false);
  };

  // Mark Commission Paid
  const handleMarkCommissionPaid = (commissionId: string) => {
    const res = db.markCommissionPaid(commissionId);
    if (!res.success) {
      showNotification('error', res.error || 'Erro ao atualizar comissão.');
      return;
    }
    showNotification('success', 'Comissão marcada como paga.');
    refreshData();
  };

  // Mark All Pending for Seller as Paid
  const handlePayAllPending = (sellerId: string) => {
    const pending = commissions.filter((c) => c.sellerId === sellerId && (c.status === 'PENDENTE' || c.status === 'ATIVA'));
    if (pending.length === 0) {
      showNotification('error', 'Não há comissões pendentes para este vendedor.');
      return;
    }

    if (!confirm(`Confirmar o pagamento de ${pending.length} comissões pendentes?`)) return;

    pending.forEach((c) => {
      db.markCommissionPaid(c.id);
    });

    showNotification('success', `${pending.length} comissões marcadas como pagas com sucesso!`);
    refreshData();
  };

  // Permission Presets
  const applyPreset = (type: 'DEFAULT' | 'SENIOR' | 'SALES_ONLY') => {
    if (type === 'DEFAULT') {
      setFormData((prev) => ({
        ...prev,
        permissions: { ...DEFAULT_SELLER_PERMISSIONS },
      }));
    } else if (type === 'SENIOR') {
      setFormData((prev) => ({
        ...prev,
        permissions: {
          ...DEFAULT_SELLER_PERMISSIONS,
          pos_apply_discount: true,
          pos_change_price: false,
          pos_cancel_sale: true,
          pos_change_seller: true,
          reports_view: true,
          cash_view: true,
        },
      }));
    } else if (type === 'SALES_ONLY') {
      setFormData((prev) => ({
        ...prev,
        permissions: {
          pos_access: true,
          pos_make_sales: true,
          pos_apply_discount: false,
          pos_change_price: false,
          pos_cancel_sale: false,
          pos_change_seller: false,
          products_view: true,
          stock_view: false,
          stock_record_entry: false,
          cash_view: false,
          cash_open: false,
          cash_close: false,
          reports_view: false,
          reports_own_sales: true,
          reports_commission: true,
          cadastros_suppliers: false,
          cadastros_sellers: false,
          users_view: false,
        },
      }));
    }
  };

  // Quick Switch Seller / Login
  const handleFastLoginAsSeller = (seller: Seller) => {
    loginAsSeller(seller);
    showNotification('success', `Sessão alternada para o vendedor: ${seller.name}`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm font-semibold transition-all ${
            feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <UserCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Módulo Comercial &amp; Vendedores</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Gestão de Vendedores &amp; Comissões
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Cadastre consultores de perfumaria, configure comissões por venda e controle permissões restritas no PDV.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Vendedor</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-stone-200 bg-white px-6 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveSubTab('sellers')}
          className={`py-3.5 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'sellers'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Equipe de Vendedores ({sellers.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('commissions')}
          className={`py-3.5 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'commissions'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Extrato de Comissões ({commissions.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ranking')}
          className={`py-3.5 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'ranking'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Ranking de Desempenho</span>
        </button>
      </div>

      {/* TAB 1: SELLERS LIST */}
      {activeSubTab === 'sellers' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail, CPF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-xs text-stone-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="ALL">Todos os Vendedores</option>
                <option value="ACTIVE">Apenas Ativos</option>
                <option value="INACTIVE">Apenas Inativos</option>
              </select>
            </div>
          </div>

          {/* Sellers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSellers.map((seller) => {
              const stats = sellerStats[seller.id] || { totalSalesCount: 0, totalRevenue: 0, totalCommission: 0, pendingCommission: 0 };
              const isCurrentlyLogged = currentUser.sellerId === seller.id;

              return (
                <div
                  key={seller.id}
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between relative ${
                    isCurrentlyLogged
                      ? 'border-purple-400 ring-2 ring-purple-100'
                      : seller.active
                      ? 'border-stone-200/80 hover:border-stone-300'
                      : 'border-stone-200 bg-stone-50/70 opacity-75'
                  }`}
                >
                  {/* Top line with Avatar and Status */}
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm shadow-xs">
                          {seller.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 text-sm">{seller.name}</h3>
                          <div className="text-xs text-stone-500 truncate max-w-[170px]">{seller.email}</div>
                          {seller.phone && <div className="text-[11px] text-stone-400 font-mono">{seller.phone}</div>}
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            seller.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {seller.active ? 'Ativo' : 'Inativo'}
                        </span>
                        {isCurrentlyLogged && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-600 text-white rounded-md uppercase tracking-wider">
                            Sessão Ativa
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Commission Tag */}
                    <div className="mt-4 p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 text-purple-900">
                        <Percent className="w-3.5 h-3.5 text-purple-600" />
                        <span className="font-medium">Comissão Fixa:</span>
                      </div>
                      <span className="font-mono font-bold text-purple-900 text-sm">
                        {seller.commissionPercentage}%
                      </span>
                    </div>

                    {/* Sales Metrics Cards */}
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                        <div className="text-[10px] text-stone-400 uppercase font-medium">Vendas Concluídas</div>
                        <div className="font-bold font-mono text-stone-800 text-sm mt-0.5">
                          {stats.totalSalesCount}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          R$ {stats.totalRevenue.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                        <div className="text-[10px] text-stone-400 uppercase font-medium">Comissão Total</div>
                        <div className="font-bold font-mono text-emerald-700 text-sm mt-0.5">
                          R$ {stats.totalCommission.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-amber-600 font-mono">
                          Pendente: R$ {stats.pendingCommission.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Permissions Preview Badges */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {seller.permissions.pos_access && (
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">PDV</span>
                      )}
                      {seller.permissions.pos_apply_discount && (
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">Desconto</span>
                      )}
                      {seller.permissions.reports_commission && (
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">Extrato</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(seller)}
                        className="p-1.5 text-stone-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Editar vendedor e permissões"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenPasswordModal(seller)}
                        className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Redefinir senha de acesso"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSeller(seller);
                          setIsDetailsModalOpen(true);
                        }}
                        className="p-1.5 text-stone-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Ver histórico de vendas e comissões"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(seller)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          seller.active
                            ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-stone-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={seller.active ? 'Inativar vendedor' : 'Ativar vendedor'}
                      >
                        {seller.active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteSeller(seller)}
                        className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir cadastro (apenas sem vendas)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {seller.active && !isCurrentlyLogged && (
                      <button
                        onClick={() => handleFastLoginAsSeller(seller)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg font-medium text-[11px] transition-colors"
                        title="Simular ou iniciar sessão como este vendedor"
                      >
                        Conectar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMMISSIONS STATEMENT */}
      {activeSubTab === 'commissions' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Filter by Seller */}
              <div className="flex items-center space-x-1.5">
                <span className="text-stone-500">Vendedor:</span>
                <select
                  value={commSellerFilter}
                  onChange={(e) => setCommSellerFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                >
                  <option value="ALL">Todos os Vendedores</option>
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div className="flex items-center space-x-1.5">
                <span className="text-stone-500">Status:</span>
                <select
                  value={commStatusFilter}
                  onChange={(e) => setCommStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGA">Paga</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              {/* Filter by Period */}
              <div className="flex items-center space-x-1.5">
                <span className="text-stone-500">Período:</span>
                <select
                  value={commPeriodFilter}
                  onChange={(e) => setCommPeriodFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                >
                  <option value="ALL">Todo o Histórico</option>
                  <option value="TODAY">Hoje</option>
                  <option value="7DAYS">Últimos 7 Dias</option>
                  <option value="MONTH">Mês Atual</option>
                </select>
              </div>
            </div>

            {commSellerFilter !== 'ALL' && (
              <button
                onClick={() => handlePayAllPending(commSellerFilter)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pagar Todas as Pendentes</span>
              </button>
            )}
          </div>

          {/* Commissions Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="text-xs text-stone-500 font-medium">Total Comissões Geradas</div>
              <div className="text-xl font-serif font-bold text-stone-900 mt-1">
                R${' '}
                {filteredCommissions
                  .filter((c) => c.status !== 'CANCELADA')
                  .reduce((acc, c) => acc + c.commissionAmount, 0)
                  .toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="text-xs text-emerald-600 font-medium">Comissões Já Pagas</div>
              <div className="text-xl font-serif font-bold text-emerald-700 mt-1">
                R${' '}
                {filteredCommissions
                  .filter((c) => c.status === 'PAGA')
                  .reduce((acc, c) => acc + c.commissionAmount, 0)
                  .toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="text-xs text-amber-600 font-medium">Comissões Pendentes</div>
              <div className="text-xl font-serif font-bold text-amber-700 mt-1">
                R${' '}
                {filteredCommissions
                  .filter((c) => c.status === 'PENDENTE' || c.status === 'ATIVA')
                  .reduce((acc, c) => acc + c.commissionAmount, 0)
                  .toFixed(2)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Data / Hora</th>
                  <th className="p-3.5">Vendedor</th>
                  <th className="p-3.5">Venda Nº</th>
                  <th className="p-3.5 text-right">Valor Venda</th>
                  <th className="p-3.5 text-center">% Comissão</th>
                  <th className="p-3.5 text-right">Valor Comissão</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-stone-400">
                      Nenhum registro de comissão encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredCommissions.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3.5 font-mono">
                        {new Date(c.createdAt).toLocaleDateString('pt-BR')} {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5 font-semibold text-stone-900">{c.sellerName}</td>
                      <td className="p-3.5 font-mono font-bold text-stone-700">#{c.saleNumber}</td>
                      <td className="p-3.5 text-right font-mono text-stone-800">R$ {c.saleAmount.toFixed(2)}</td>
                      <td className="p-3.5 text-center font-mono">{c.commissionPercentage}%</td>
                      <td className="p-3.5 text-right font-mono font-bold text-purple-900">
                        R$ {c.commissionAmount.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            c.status === 'PAGA'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.status === 'CANCELADA'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {c.status === 'PAGA' ? 'Paga' : c.status === 'CANCELADA' ? 'Cancelada' : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {(c.status === 'PENDENTE' || c.status === 'ATIVA') && (
                          <button
                            onClick={() => handleMarkCommissionPaid(c.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            Marcar Paga
                          </button>
                        )}
                        {c.status === 'PAGA' && (
                          <span className="text-[10px] text-stone-400 font-mono">
                            {c.paidAt ? new Date(c.paidAt).toLocaleDateString('pt-BR') : 'Pago'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RANKING & PERFORMANCE */}
      {activeSubTab === 'ranking' && (
        <div className="space-y-6">
          {/* Top 1 Spotlight */}
          {rankingList.length > 0 && rankingList[0].stats.totalRevenue > 0 && (
            <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 z-10 text-center md:text-left">
                <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>VENDEDOR(A) DESTAQUE DA LOJA</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {rankingList[0].seller.name}
                </h2>
                <p className="text-stone-300 text-xs sm:text-sm max-w-lg">
                  Liderando o faturamento com excelência e atendimento personalizado em alta perfumaria.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="bg-white/10 rounded-xl px-3.5 py-2 backdrop-blur-xs">
                    <div className="text-[10px] uppercase text-stone-300 font-semibold">Total Faturado</div>
                    <div className="text-lg font-bold font-mono text-amber-300">
                      R$ {rankingList[0].stats.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-3.5 py-2 backdrop-blur-xs">
                    <div className="text-[10px] uppercase text-stone-300 font-semibold">Vendas Concluídas</div>
                    <div className="text-lg font-bold font-mono text-white">
                      {rankingList[0].stats.totalSalesCount}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-3.5 py-2 backdrop-blur-xs">
                    <div className="text-[10px] uppercase text-stone-300 font-semibold">Ticket Médio</div>
                    <div className="text-lg font-bold font-mono text-white">
                      R$ {rankingList[0].avgTicket.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-28 h-28 rounded-full bg-amber-400/20 border-4 border-amber-400/50 flex items-center justify-center text-4xl font-serif font-bold text-amber-300 shadow-2xl shrink-0 z-10">
                #1
              </div>
            </div>
          )}

          {/* Full Ranking Table & Visual Bars */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Classificação Geral por Desempenho
              </h3>
              <span className="text-xs text-stone-500">Ordenado por volume total de vendas</span>
            </div>

            <div className="space-y-4">
              {rankingList.map((item, index) => {
                const maxRevenue = rankingList[0]?.stats.totalRevenue || 1;
                const percentageOfMax = Math.min(100, Math.round((item.stats.totalRevenue / (maxRevenue || 1)) * 100));

                return (
                  <div
                    key={item.seller.id}
                    className="p-4 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-stone-50 transition-all space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                            index === 0
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : index === 1
                              ? 'bg-stone-200 text-stone-800'
                              : index === 2
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <div>
                          <span className="font-bold text-stone-900 text-sm">{item.seller.name}</span>
                          <span className="text-stone-400 text-xs ml-2">({item.seller.commissionPercentage}% comissão)</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 font-mono text-xs text-stone-600">
                        <div>
                          Vendas: <strong className="text-stone-900">{item.stats.totalSalesCount}</strong>
                        </div>
                        <div>
                          Ticket Médio: <strong className="text-stone-900">R$ {item.avgTicket.toFixed(2)}</strong>
                        </div>
                        <div>
                          Comissão: <strong className="text-emerald-700">R$ {item.stats.totalCommission.toFixed(2)}</strong>
                        </div>
                        <div className="text-right">
                          <strong className="text-sm font-bold text-stone-900">
                            R$ {item.stats.totalRevenue.toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, percentageOfMax)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT SELLER */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 my-8">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    {selectedSeller ? 'Editar Vendedor' : 'Novo Cadastro de Vendedor'}
                  </h3>
                  <p className="text-[11px] text-stone-500">Dados pessoais, comissionamento e permissões no PDV</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSeller} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Basic Fields */}
              <div className="space-y-4">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] border-b pb-1">
                  1. Dados do Vendedor
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Beatriz Albuquerque"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">E-mail de Login *</label>
                    <input
                      type="email"
                      required
                      placeholder="beatriz@perfumaria.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">% Comissão *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        required
                        value={formData.commissionPercentage}
                        onChange={(e) => setFormData({ ...formData, commissionPercentage: Number(e.target.value) })}
                        className="w-full pl-3 pr-7 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white"
                      />
                      <span className="absolute right-3 top-2 text-stone-400 font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Password fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      {selectedSeller ? 'Nova Senha (deixe em branco p/ manter)' : 'Senha de Acesso *'}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Confirmar Senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="sellerActive"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-stone-300 focus:ring-purple-500"
                  />
                  <label htmlFor="sellerActive" className="text-stone-700 font-medium cursor-pointer">
                    Vendedor ativo para realizar vendas no PDV
                  </label>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-1">
                  <div>
                    <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                      2. Permissões de Acesso (Menor Privilégio)
                    </h4>
                    <span className="text-[10px] text-stone-500">Configure rigorosamente o que este vendedor pode operar</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-stone-400">Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyPreset('DEFAULT')}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] text-stone-700"
                    >
                      Padrão
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('SENIOR')}
                      className="px-2 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-[10px] text-purple-800 font-semibold"
                    >
                      Sênior
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('SALES_ONLY')}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] text-stone-700"
                    >
                      Apenas Vendas
                    </button>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PDV Perms */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                    <div className="font-bold text-stone-800 text-[11px] flex items-center space-x-1 text-purple-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>PDV (Frente de Caixa)</span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.pos_access}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, pos_access: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Acessar o PDV</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.pos_make_sales}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, pos_make_sales: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Finalizar Vendas</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.pos_apply_discount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, pos_apply_discount: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Aplicar Descontos</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.pos_change_price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, pos_change_price: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Alterar Preço do Produto</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.pos_cancel_sale}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, pos_cancel_sale: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Cancelar Vendas</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.pos_change_seller}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, pos_change_seller: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Alterar Vendedor da Venda</span>
                      </label>
                    </div>
                  </div>

                  {/* Stock & Products */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                    <div className="font-bold text-stone-800 text-[11px] flex items-center space-x-1 text-purple-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Produtos, Estoque &amp; Caixa</span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.products_view}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, products_view: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Visualizar Catálogo de Produtos</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.stock_view}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, stock_view: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Consultar Níveis de Estoque</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.stock_record_entry}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, stock_record_entry: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Registrar Entradas de Mercadoria</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.cash_view}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, cash_view: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Visualizar Movimento de Caixa</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.cash_open}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, cash_open: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Abrir Caixa</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.cash_close}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, cash_close: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Fechar Caixa</span>
                      </label>
                    </div>
                  </div>

                  {/* Reports & Registers */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 sm:col-span-2">
                    <div className="font-bold text-stone-800 text-[11px] flex items-center space-x-1 text-purple-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Relatórios &amp; Cadastros Complementares</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.reports_own_sales}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, reports_own_sales: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Ver Relatório de Próprias Vendas</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.reports_commission}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, reports_commission: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Ver Extrato de Próprias Comissões</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.reports_view}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, reports_view: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Ver Relatórios Gerais da Loja</span>
                      </label>
                      <label className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.cadastros_suppliers}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, cadastros_suppliers: e.target.checked },
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Cadastrar Fornecedores</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">Observações Internas (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Anotações sobre turnos, especialidades de fragrâncias, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {selectedSeller ? 'Salvar Alterações' : 'Cadastrar Vendedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {isPasswordModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Redefinir Senha
                </h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4 text-xs">
              <p className="text-stone-600">
                Redefinindo senha de acesso para <strong>{selectedSeller.name}</strong> ({selectedSeller.email}).
              </p>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Nova Senha</label>
                <input
                  type="password"
                  required
                  placeholder="Nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  required
                  placeholder="Repita a nova senha"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SELLER DETAILS & SALES */}
      {isDetailsModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  {selectedSeller.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">{selectedSeller.name}</h3>
                  <p className="text-[11px] text-stone-500">Histórico de vendas e comissões associadas</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-500 text-[10px] uppercase font-semibold">Total em Vendas</span>
                  <div className="text-base font-bold font-mono text-stone-900 mt-0.5">
                    R$ {(sellerStats[selectedSeller.id]?.totalRevenue || 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-500 text-[10px] uppercase font-semibold">Total Comissões</span>
                  <div className="text-base font-bold font-mono text-purple-900 mt-0.5">
                    R$ {(sellerStats[selectedSeller.id]?.totalCommission || 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-500 text-[10px] uppercase font-semibold">Pendente de Pagamento</span>
                  <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
                    R$ {(sellerStats[selectedSeller.id]?.pendingCommission || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Commissions Table for this seller */}
              <h4 className="font-semibold text-stone-900 text-xs pt-2">Comissões Recentes do Vendedor:</h4>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-stone-50 text-[10px] uppercase font-semibold text-stone-500 border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">Data</th>
                      <th className="p-2.5">Venda Nº</th>
                      <th className="p-2.5 text-right">Valor Venda</th>
                      <th className="p-2.5 text-right">Comissão</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                    {commissions
                      .filter((c) => c.sellerId === selectedSeller.id)
                      .map((c) => (
                        <tr key={c.id}>
                          <td className="p-2.5">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</td>
                          <td className="p-2.5 font-bold">#{c.saleNumber}</td>
                          <td className="p-2.5 text-right">R$ {c.saleAmount.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-bold text-purple-900">
                            R$ {c.commissionAmount.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                                c.status === 'PAGA'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : c.status === 'CANCELADA'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {c.status === 'PAGA' ? 'Paga' : c.status === 'CANCELADA' ? 'Cancelada' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
