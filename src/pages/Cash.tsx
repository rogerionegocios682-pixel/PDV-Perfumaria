import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  DollarSign,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { useCash } from '../context/CashContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { CashRegister, CashMovement } from '../types';

export const Cash: React.FC = () => {
  const { isCashOpen, activeRegister, drawerStats, openCash, closeCash, addMovement } = useCash();
  const { currentUser } = useAuth();
  const registers = db.getCashRegisters();
  const closings = db.getCashClosings();

  // Modals
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedHistoricalRegister, setSelectedHistoricalRegister] = useState<CashRegister | null>(null);

  // Open Form
  const [initialFund, setInitialFund] = useState<number>(150);
  const [openNotes, setOpenNotes] = useState('');

  // Movement Form
  const [movType, setMovType] = useState<'SUPRIMENTO' | 'SANGRIA'>('SANGRIA');
  const [movAmount, setMovAmount] = useState<number>(50);
  const [movReason, setMovReason] = useState('');

  // Close Form
  const [countedCash, setCountedCash] = useState<number>(drawerStats.expectedCash);
  const [closeNotes, setCloseNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Cash Opening
  const handleConfirmOpen = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialFund < 0) {
      setErrorMessage('O fundo inicial não pode ser negativo.');
      return;
    }
    const res = openCash(initialFund, openNotes);
    if (!res.success) {
      setErrorMessage(res.error || 'Erro ao abrir caixa.');
      return;
    }
    setSuccessMessage('Caixa aberto com sucesso! Boas vendas.');
    setTimeout(() => setSuccessMessage(''), 3500);
    setIsOpenModalOpen(false);
  };

  // Handle Sangria / Suprimento
  const handleConfirmMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (movAmount <= 0) {
      setErrorMessage('O valor deve ser maior que zero.');
      return;
    }
    if (!movReason.trim()) {
      setErrorMessage('Informe o motivo da movimentação.');
      return;
    }

    if (movType === 'SANGRIA' && movAmount > drawerStats.expectedCash) {
      setErrorMessage(
        `Sangria maior que o saldo em gaveta! Saldo em dinheiro disponível: R$ ${drawerStats.expectedCash.toFixed(2)}`
      );
      return;
    }

    const res = addMovement(movType, movAmount, movReason);
    if (!res.success) {
      setErrorMessage(res.error || 'Erro ao registrar movimentação.');
      return;
    }

    setSuccessMessage(`${movType === 'SANGRIA' ? 'Sangria' : 'Suprimento'} registrado com sucesso!`);
    setTimeout(() => setSuccessMessage(''), 3500);
    setIsMovementModalOpen(false);
    setMovReason('');
  };

  // Handle Close
  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    const res = closeCash(countedCash, closeNotes);
    if (!res.success) {
      setErrorMessage(res.error || 'Erro ao fechar caixa.');
      return;
    }

    setSuccessMessage('Caixa encerrado com sucesso. Comprovante arquivado.');
    setTimeout(() => setSuccessMessage(''), 4000);
    setIsCloseModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tesouraria &amp; Frente de Caixa</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Controle de Caixa &amp; Sangrias
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5 max-w-xl">
            Acompanhe o saldo físico da gaveta em tempo real, registre suprimentos, sangrias e efetue o fechamento de turno.
          </p>
        </div>

        {/* Action button based on state */}
        <div className="flex items-center space-x-2">
          {isCashOpen ? (
            <>
              <button
                onClick={() => {
                  setMovType('SANGRIA');
                  setIsMovementModalOpen(true);
                  setErrorMessage('');
                }}
                className="px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 font-medium text-xs rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <ArrowDownRight className="w-4 h-4 text-stone-600" />
                <span>Sangria / Suprimento</span>
              </button>

              <button
                onClick={() => {
                  setCountedCash(drawerStats.expectedCash);
                  setIsCloseModalOpen(true);
                  setErrorMessage('');
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Encerrar Caixa</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsOpenModalOpen(true);
                setErrorMessage('');
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center space-x-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Abrir Novo Caixa</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Status Bar */}
      {isCashOpen && activeRegister ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <span className="font-semibold text-stone-900 text-sm">CAIXA EM OPERAÇÃO</span>
                <span className="text-xs text-stone-400 ml-2 font-mono">
                  # {activeRegister.id.slice(-6)}
                </span>
              </div>
            </div>
            <div className="text-xs text-stone-500 flex items-center space-x-4">
              <span>
                Operador: <strong className="text-stone-800 font-semibold">{activeRegister.openedByName}</strong>
              </span>
              <span>
                Abertura:{' '}
                <strong className="text-stone-800 font-semibold">
                  {new Date(activeRegister.openedAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </span>
            </div>
          </div>

          {/* Money in Drawer Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
                💵 Saldo em Dinheiro na Gaveta
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-900">
                R$ {drawerStats.expectedCash.toFixed(2)}
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Fundo (R$ {drawerStats.initialFund.toFixed(2)}) + Vendas Dinheiro (R${' '}
                {drawerStats.salesCash.toFixed(2)}) - Sangrias
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                ⚡ Total Vendas Digitais
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900">
                R${' '}
                {(
                  drawerStats.salesPix +
                  drawerStats.salesDebit +
                  drawerStats.salesCredit +
                  drawerStats.salesOther
                ).toFixed(2)}
              </div>
              <div className="text-[11px] text-stone-500 mt-1.5 flex space-x-2">
                <span>PIX: R$ {drawerStats.salesPix.toFixed(2)}</span>
                <span>•</span>
                <span>Cartões: R$ {(drawerStats.salesDebit + drawerStats.salesCredit).toFixed(2)}</span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                🧾 Faturamento Geral da Sessão
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-900">
                R$ {drawerStats.totalSales.toFixed(2)}
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Total consolidado nesta abertura (todas as formas)
              </p>
            </div>
          </div>

          {/* Movements Timeline */}
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-stone-900 text-sm">Movimentações Avulsas de Caixa</h3>
            {activeRegister.movements.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Nenhuma sangria ou suprimento registrado nesta sessão.</p>
            ) : (
              <div className="space-y-2">
                {activeRegister.movements.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-stone-50/70 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`p-1.5 rounded-lg ${
                          m.type === 'SANGRIA' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {m.type === 'SANGRIA' ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </span>
                      <div>
                        <div className="font-semibold text-stone-800">
                          {m.type} • {m.reason}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {new Date(m.createdAt).toLocaleTimeString('pt-BR')} por {m.userName}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono font-bold text-sm text-stone-900">
                      {m.type === 'SANGRIA' ? '-' : '+'} R$ {m.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-10 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-stone-400 stroke-[1.75]" />
          </div>
          <h2 className="font-serif font-bold text-lg text-stone-900">Nenhum Caixa Aberto no Momento</h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Para iniciar os atendimentos no balcão e registrar vendas no PDV, abra uma nova sessão de caixa com fundo de troco.
          </p>
          <button
            onClick={() => setIsOpenModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Abrir Caixa Agora
          </button>
        </div>
      )}

      {/* Historical Registers */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900 text-sm">Histórico de Sessões de Caixa</h2>
          <span className="text-xs text-stone-400">Total: {registers.length} caixas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50/60 border-b border-stone-200/80 text-stone-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Abertura</th>
                <th className="py-3 px-3">Fechamento</th>
                <th className="py-3 px-3">Operador</th>
                <th className="py-3 px-3 text-right">Fundo Inicial</th>
                <th className="py-3 px-3 text-right">Vendas Totais</th>
                <th className="py-3 px-3 text-right">Dinheiro Esperado</th>
                <th className="py-3 px-3 text-right">Diferença</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {registers.map((r) => {
                const isCurrent = r.status === 'OPEN';
                const closing = closings.find((c) => c.cashRegisterId === r.id);
                const diff = closing ? closing.difference : 0;
                const totalVendas = closing ? closing.totalSales : (isCurrent ? drawerStats.totalSales : 0);
                const expectedCash = closing ? closing.expectedDrawerCash : (isCurrent ? drawerStats.expectedCash : 0);

                return (
                  <tr key={r.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4 text-stone-600 font-mono text-xs">
                      {new Date(r.openedAt).toLocaleDateString('pt-BR')}{' '}
                      {new Date(r.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-stone-600 font-mono text-xs">
                      {r.closedAt ? (
                        `${new Date(r.closedAt).toLocaleDateString('pt-BR')} ${new Date(r.closedAt).toLocaleTimeString(
                          'pt-BR',
                          { hour: '2-digit', minute: '2-digit' }
                        )}`
                      ) : (
                        <span className="text-emerald-700 font-medium">Em andamento</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-800">{r.openedByUserName}</td>
                    <td className="py-3 px-3 text-right font-mono text-stone-700">R$ {r.initialFund.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                      R$ {totalVendas.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-stone-700">
                      {expectedCash ? `R$ ${expectedCash.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {r.status === 'CLOSED' && closing ? (
                        <span
                          className={`font-semibold ${
                            Math.abs(diff) < 0.05
                              ? 'text-emerald-700'
                              : diff > 0
                              ? 'text-amber-700'
                              : 'text-rose-600'
                          }`}
                        >
                          {Math.abs(diff) < 0.05
                            ? 'R$ 0,00'
                            : diff > 0
                            ? `+ R$ ${diff.toFixed(2)}`
                            : `- R$ ${Math.abs(diff).toFixed(2)}`}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          isCurrent ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {isCurrent ? 'Aberto' : 'Encerrado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedHistoricalRegister(r)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Ver Comprovante de Caixa"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Open Cash */}
      {isOpenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Abertura de Caixa</h3>
                <p className="text-xs text-stone-500">Operador responsável: {currentUser.name}</p>
              </div>
              <button onClick={() => setIsOpenModalOpen(false)} className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmOpen} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Fundo de Troco / Saldo Inicial (R$) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={initialFund}
                  onChange={(e) => setInitialFund(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold text-base border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Observações de Abertura</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Turno da manhã, troco em moedas conferido..."
                  value={openNotes}
                  onChange={(e) => setOpenNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Confirmar Abertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sangria / Suprimento */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Movimentação de Gaveta</h3>
                <p className="text-xs text-stone-500">Sangria (retirada) ou Suprimento (aporte)</p>
              </div>
              <button onClick={() => setIsMovementModalOpen(false)} className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmMovement} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMovType('SANGRIA')}
                  className={`py-2 rounded-xl font-medium border transition-all ${
                    movType === 'SANGRIA'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  🔻 Sangria (Retirada)
                </button>
                <button
                  type="button"
                  onClick={() => setMovType('SUPRIMENTO')}
                  className={`py-2 rounded-xl font-medium border transition-all ${
                    movType === 'SUPRIMENTO'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  🔺 Suprimento (Entrada)
                </button>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Valor da Operação (R$) *</label>
                <input
                  type="number"
                  step="1"
                  min="0.5"
                  required
                  value={movAmount}
                  onChange={(e) => setMovAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold text-base border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Motivo Detalhado *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Recolhimento de excesso para cofre / Adição de moedas de 1 real"
                  value={movReason}
                  onChange={(e) => setMovReason(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Close Cash (Fechamento) */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Fechamento de Caixa</h3>
                <p className="text-xs text-stone-500">Conferência física e encerramento de turno</p>
              </div>
              <button onClick={() => setIsCloseModalOpen(false)} className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmClose} className="p-6 space-y-4 text-xs">
              {/* Summary table */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                <div className="font-semibold text-stone-800">Resumo da Sessão:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                  <div>Fundo Inicial: R$ {drawerStats.initialFund.toFixed(2)}</div>
                  <div>Vendas Dinheiro: R$ {drawerStats.salesCash.toFixed(2)}</div>
                  <div>Vendas PIX: R$ {drawerStats.salesPix.toFixed(2)}</div>
                  <div>Vendas Cartões: R$ {(drawerStats.salesDebit + drawerStats.salesCredit).toFixed(2)}</div>
                  <div>Sangrias Efetuadas: - R$ {drawerStats.totalSangrias.toFixed(2)}</div>
                  <div>Suprimentos: + R$ {drawerStats.totalSuprimentos.toFixed(2)}</div>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-xs text-stone-900">
                  <span>Dinheiro Esperado em Gaveta:</span>
                  <span className="font-mono text-emerald-700 text-sm">
                    R$ {drawerStats.expectedCash.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Physical Count */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Valor Contado Fisicamente pelo Operador (R$) *
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  required
                  value={countedCash}
                  onChange={(e) => setCountedCash(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold text-base border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Difference indication */}
              <div className="p-2.5 rounded-xl border border-stone-200/80 text-xs flex justify-between items-center bg-stone-50">
                <span className="font-medium text-stone-600">Diferença de Caixa:</span>
                <span
                  className={`font-mono font-bold ${
                    Math.abs(countedCash - drawerStats.expectedCash) < 0.05
                      ? 'text-emerald-700'
                      : countedCash > drawerStats.expectedCash
                      ? 'text-amber-700'
                      : 'text-rose-600'
                  }`}
                >
                  {Math.abs(countedCash - drawerStats.expectedCash) < 0.05
                    ? '✓ Caixa Perfeito (Sem diferença)'
                    : countedCash > drawerStats.expectedCash
                    ? `Sobra: + R$ ${(countedCash - drawerStats.expectedCash).toFixed(2)}`
                    : `Falta: - R$ ${(drawerStats.expectedCash - countedCash).toFixed(2)}`}
                </span>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Observações de Encerramento</label>
                <textarea
                  rows={2}
                  placeholder="Justificativa de sobras/faltas ou observações para o próximo turno..."
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  Confirmar e Fechar Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historical Register Receipt Modal */}
      {selectedHistoricalRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-amber-300">Comprovante de Caixa</h3>
                <p className="text-xs text-stone-400"># {selectedHistoricalRegister.id.slice(-6)}</p>
              </div>
              <button
                onClick={() => setSelectedHistoricalRegister(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {(() => {
              const closing = closings.find((c) => c.cashRegisterId === selectedHistoricalRegister.id);
              const diff = closing ? closing.difference : 0;
              const expCash = closing ? closing.expectedDrawerCash : drawerStats.expectedCash;
              const repCash = closing ? closing.reportedDrawerCash : drawerStats.expectedCash;

              return (
                <div className="p-6 space-y-3 text-xs font-mono">
                  <div className="text-center border-b pb-2">
                    <div className="font-bold text-sm">PERFUMARIA ELEGANCE</div>
                    <div className="text-[10px] text-stone-500">RELATÓRIO DE FECHAMENTO DE CAIXA</div>
                  </div>

                  <div className="space-y-1 text-stone-600">
                    <div>Operador: {selectedHistoricalRegister.openedByUserName}</div>
                    <div>Abertura: {new Date(selectedHistoricalRegister.openedAt).toLocaleString('pt-BR')}</div>
                    {selectedHistoricalRegister.closedAt && (
                      <div>Fechamento: {new Date(selectedHistoricalRegister.closedAt).toLocaleString('pt-BR')}</div>
                    )}
                    <div>Fundo Inicial: R$ {selectedHistoricalRegister.initialFund.toFixed(2)}</div>
                  </div>

                  <div className="border-t border-b py-2 space-y-1">
                    <div className="font-bold text-stone-800">Vendas por Forma:</div>
                    <div className="flex justify-between">
                      <span>Dinheiro:</span>
                      <span>R$ {(closing?.totalCashSales || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PIX:</span>
                      <span>R$ {(closing?.totalPixSales || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Débito:</span>
                      <span>R$ {(closing?.totalDebitSales || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crédito:</span>
                      <span>R$ {(closing?.totalCreditSales || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t">
                      <span>TOTAL VENDIDO:</span>
                      <span>R$ {(closing?.totalSales || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Dinheiro Esperado:</span>
                      <span>R$ {expCash.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dinheiro Contado:</span>
                      <span>R$ {repCash.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 pt-1 border-t">
                      <span>Diferença:</span>
                      <span>
                        {diff > 0 ? `+ R$ ${diff.toFixed(2)}` : diff < 0 ? `- R$ ${Math.abs(diff).toFixed(2)}` : 'R$ 0,00'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end space-x-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl flex items-center space-x-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>
                    <button
                      onClick={() => setSelectedHistoricalRegister(null)}
                      className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
