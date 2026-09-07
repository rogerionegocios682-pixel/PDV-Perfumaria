import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  FileSpreadsheet,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { db } from '../services/db';
import { AuditLog, AuditAction } from '../types';

export const Audit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(() => db.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<string>('ALL');

  // Distinct users in logs
  const userList = useMemo(() => {
    const set = new Set(logs.map((l) => l.userName));
    return Array.from(set);
  }, [logs]);

  // Distinct action types
  const actionList: AuditAction[] = [
    'VENDA_CRIADA',
    'VENDA_CANCELADA',
    'CAIXA_ABERTO',
    'CAIXA_FECHADO',
    'SANGRIA_REALIZADA',
    'SUPRIMENTO_REALIZADO',
    'PRODUTO_CRIADO',
    'PRODUTO_ATUALIZADO',
    'ESTOQUE_AJUSTADO',
    'ENTRADA_MERCADORIA',
    'FORNECEDOR_CRIADO',
    'USUARIO_CRIADO',
  ];

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        log.details.toLowerCase().includes(term) ||
        log.userName.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        (log.entityId && log.entityId.toLowerCase().includes(term));

      const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
      const matchesUser = selectedUser === 'ALL' || log.userName === selectedUser;

      return matchesSearch && matchesAction && matchesUser;
    });
  }, [logs, searchTerm, selectedAction, selectedUser]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
            <span>Conformidade &amp; Rastreabilidade</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Trilha de Auditoria &amp; Histórico
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Registro imutável de todas as ações de operadores, cancelamentos, suprimentos e alterações de estoque.
          </p>
        </div>

        <div className="text-right">
          <div className="font-mono font-bold text-xl text-stone-900">{logs.length}</div>
          <div className="text-[11px] text-stone-400">Eventos auditados no sistema</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Pesquisar por detalhe, ID de produto ou cupom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full py-2 px-3 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors text-stone-700"
          >
            <option value="ALL">Todas as Ações Auditadas</option>
            {actionList.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full py-2 px-3 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors text-stone-700"
          >
            <option value="ALL">Todos os Usuários</option>
            {userList.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200/80 text-stone-500 font-medium text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-3">Usuário</th>
                <th className="py-3.5 px-3">Ação</th>
                <th className="py-3.5 px-4">Descrição da Operação</th>
                <th className="py-3.5 px-3 text-right">Referência ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400 font-sans">
                    Nenhum registro encontrado com os critérios fornecidos.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let badgeColor = 'bg-stone-100 text-stone-700 border-stone-200';
                  if (log.action.includes('VENDA')) badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  else if (log.action.includes('SANGRIA') || log.action.includes('CANCELADA'))
                    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
                  else if (log.action.includes('CAIXA')) badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                  else if (log.action.includes('ESTOQUE')) badgeColor = 'bg-stone-100 text-stone-800 border-stone-200';

                  return (
                    <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString('pt-BR')}{' '}
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 font-sans font-medium text-stone-900 whitespace-nowrap">
                        {log.userName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${badgeColor}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-stone-700 leading-relaxed max-w-md">
                        {log.details}
                      </td>
                      <td className="py-3 px-3 text-right text-stone-400 text-[11px]">
                        {log.entityId ? `#${log.entityId.slice(-8)}` : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
