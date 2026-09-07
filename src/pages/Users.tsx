import React, { useState } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Shield,
  CheckCircle,
  XCircle,
  Key,
  UserCheck,
  Edit2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { User, UserRole } from '../types';

export const Users: React.FC = () => {
  const { currentUser, switchUser } = useAuth();
  const [users, setUsers] = useState<User[]>(() => db.getUsers());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    username: '',
    email: '',
    role: 'CASHIER',
    active: true,
  });

  const refreshList = () => {
    setUsers(db.getUsers());
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      role: 'CASHIER',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.username?.trim()) return;

    const id = editingUser ? editingUser.id : 'usr_' + Date.now();
    const toSave: User = {
      id,
      name: formData.name!.trim(),
      username: formData.username!.trim().toLowerCase(),
      email: formData.email?.trim() || '',
      role: (formData.role as UserRole) || 'CASHIER',
      active: formData.active !== false,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
    };

    db.saveUser(toSave);
    refreshList();
    setIsModalOpen(false);
  };

  const handleToggleActive = (user: User) => {
    if (user.id === currentUser.id) {
      alert('Você não pode desativar seu próprio usuário ativo.');
      return;
    }
    const updated = { ...user, active: !user.active };
    db.saveUser(updated);
    refreshList();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <UsersIcon className="w-3.5 h-3.5 text-stone-700" />
            <span>Segurança &amp; Controle de Acesso (RBAC)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Usuários &amp; Permissões
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Cadastre operadores de caixa, gerentes de loja e administradores com níveis restritos de permissão.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Usuário</span>
        </button>
      </div>

      {/* User Switcher Banner for Testing */}
      <div className="p-4 bg-stone-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-stone-800 text-stone-200 border border-stone-700 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-stone-400">Usuário Conectado Atualmente:</div>
            <div className="font-semibold text-sm text-stone-100">
              {currentUser.name} <span className="text-xs font-normal text-stone-400">({currentUser.role === 'ADMIN' ? 'Administrador Geral' : currentUser.role === 'MANAGER' ? 'Gerente de Loja' : 'Operador de Caixa'})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-stone-400">Alternar sessão:</span>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              disabled={u.id === currentUser.id}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                u.id === currentUser.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700/50'
              }`}
            >
              {u.name.split(' ')[0]} ({u.role.slice(0, 3)})
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200/80 text-stone-500 font-medium text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Nome &amp; Login</th>
                <th className="py-3.5 px-3">E-mail</th>
                <th className="py-3.5 px-3">Nível de Permissão</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3">Data Cadastro</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => {
                const roleBadge =
                  u.role === 'ADMIN'
                    ? 'bg-stone-100 text-stone-800 border-stone-200'
                    : u.role === 'MANAGER'
                    ? 'bg-stone-100 text-stone-800 border-stone-200'
                    : 'bg-stone-100 text-stone-800 border-stone-200';

                return (
                  <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{u.name}</div>
                      <div className="text-xs text-stone-400 font-mono">@{u.username}</div>
                    </td>
                    <td className="py-3.5 px-3 text-stone-600">{u.email || '-'}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${roleBadge}`}>
                        {u.role === 'ADMIN'
                          ? '👑 Administrador'
                          : u.role === 'MANAGER'
                          ? '💼 Gerente'
                          : '🛒 Operador de Caixa'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-stone-500 font-mono text-xs">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Editar dados"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          disabled={u.id === currentUser.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.active
                              ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          } disabled:opacity-20`}
                          title={u.active ? 'Inativar usuário' : 'Ativar usuário'}
                        >
                          {u.active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Nome de Usuário / Login *</label>
                <input
                  type="text"
                  required
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 font-mono bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Perfil de Acesso (Papel) *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="CASHIER">🛒 Operador de Caixa (PDV e seu Caixa)</option>
                  <option value="MANAGER">💼 Gerente (Produtos, Estoque, Entradas, Fornecedores)</option>
                  <option value="ADMIN">👑 Administrador (Acesso Irrestrito Total)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded text-stone-900 focus:ring-stone-500"
                  />
                  <span className="font-medium text-stone-800">Usuário Ativo para Login</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
