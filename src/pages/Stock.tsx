import React, { useState, useMemo } from 'react';
import {
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  ClipboardList,
  AlertTriangle,
  History,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  Package,
} from 'lucide-react';
import { db } from '../services/db';
import { Product, StockMovement, StockMovementType } from '../types';

export const Stock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [movements, setMovements] = useState<StockMovement[]>(() => db.getStockMovements());

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY'>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'NORMAL' | 'LOW' | 'OUT'>('ALL');

  // Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjType, setAdjType] = useState<StockMovementType>('ENTRADA_MANUAL');
  const [adjQuantity, setAdjQuantity] = useState<number>(1);
  const [inventoryTarget, setInventoryTarget] = useState<number>(0);
  const [adjReason, setAdjReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const refreshData = () => {
    setProducts(db.getProducts());
    setMovements(db.getStockMovements());
  };

  // Stock Financial Totals
  const stockFinancials = useMemo(() => {
    let totalCostVal = 0;
    let totalSaleVal = 0;
    let totalUnits = 0;
    let lowCount = 0;
    let zeroCount = 0;

    for (const p of products) {
      if (p.active) {
        totalCostVal += p.currentStock * p.costPrice;
        totalSaleVal += p.currentStock * p.salePrice;
        totalUnits += p.currentStock;
        if (p.currentStock === 0) zeroCount++;
        else if (p.currentStock <= p.minStock) lowCount++;
      }
    }

    return {
      totalCostVal,
      totalSaleVal,
      totalUnits,
      lowCount,
      zeroCount,
      estimatedProfit: totalSaleVal - totalCostVal,
    };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term);

      let matchesAlert = true;
      if (alertFilter === 'NORMAL') matchesAlert = p.currentStock > p.minStock && p.active;
      else if (alertFilter === 'LOW') matchesAlert = p.currentStock > 0 && p.currentStock <= p.minStock && p.active;
      else if (alertFilter === 'OUT') matchesAlert = p.currentStock === 0 && p.active;

      return matchesSearch && matchesAlert;
    });
  }, [products, searchTerm, alertFilter]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return movements;
    return movements.filter(
      (m) =>
        m.productName.toLowerCase().includes(term) ||
        m.reason.toLowerCase().includes(term) ||
        m.userName.toLowerCase().includes(term) ||
        m.movementType.toLowerCase().includes(term)
    );
  }, [movements, searchTerm]);

  // Open Adjust Modal
  const handleOpenAdjust = (prod: Product, defaultType: StockMovementType = 'ENTRADA_MANUAL') => {
    setSelectedProduct(prod);
    setAdjType(defaultType);
    setAdjQuantity(1);
    setInventoryTarget(prod.currentStock);
    setAdjReason('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Submit Stock Adjustment
  const handleConfirmAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!adjReason.trim()) {
      setErrorMsg('Informe o motivo detalhado para esta alteração de estoque.');
      return;
    }

    let qtyDelta = adjQuantity;
    if (adjType === 'SAIDA_MANUAL') {
      qtyDelta = -Math.abs(adjQuantity);
    } else if (adjType === 'ENTRADA_MANUAL') {
      qtyDelta = Math.abs(adjQuantity);
    }

    const res = db.adjustStock({
      productId: selectedProduct.id,
      movementType: adjType,
      quantity: qtyDelta,
      newTargetStock: adjType === 'AJUSTE_INVENTARIO' ? inventoryTarget : undefined,
      reason: adjReason.trim(),
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Erro ao atualizar estoque.');
      return;
    }

    setSuccessMsg(`Estoque de "${selectedProduct.name}" atualizado com sucesso!`);
    setTimeout(() => setSuccessMsg(''), 3500);
    setIsModalOpen(false);
    refreshData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Financial Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Controle de Armazém &amp; Prateleira</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Gestão de Estoque
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Monitore níveis de estoque físico, valor do patrimônio e histórico completo de rastreabilidade.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'OVERVIEW'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              Tabela de Estoque
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'HISTORY'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Histórico de Movimentações</span>
            </button>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
          <div className="p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/60">
            <div className="text-[11px] text-stone-500 font-medium">Valor em Estoque (Custo)</div>
            <div className="text-base sm:text-lg font-semibold font-mono text-stone-900 mt-0.5">
              R$ {stockFinancials.totalCostVal.toFixed(2)}
            </div>
          </div>
          <div className="p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/60">
            <div className="text-[11px] text-stone-500 font-medium">Valor em Estoque (Venda)</div>
            <div className="text-base sm:text-lg font-semibold font-mono text-emerald-700 mt-0.5">
              R$ {stockFinancials.totalSaleVal.toFixed(2)}
            </div>
          </div>
          <div className="p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/60">
            <div className="text-[11px] text-stone-500 font-medium">Margem Potencial Bruta</div>
            <div className="text-base sm:text-lg font-semibold font-mono text-amber-800 mt-0.5">
              R$ {stockFinancials.estimatedProfit.toFixed(2)}
            </div>
          </div>
          <div className="p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/60">
            <div className="text-[11px] text-stone-500 font-medium">Alertas Críticos</div>
            <div className="flex items-center space-x-2 text-xs mt-1">
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                {stockFinancials.lowCount} baixos
              </span>
              <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[10px]">
                {stockFinancials.zeroCount} zerados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Pesquisar produto ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
          />
        </div>

        {activeTab === 'OVERVIEW' && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs w-full sm:w-auto">
            <button
              onClick={() => setAlertFilter('ALL')}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                alertFilter === 'ALL'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200/80'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setAlertFilter('NORMAL')}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                alertFilter === 'NORMAL'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 border-emerald-200'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setAlertFilter('LOW')}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                alertFilter === 'LOW'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100/70 text-amber-800 border-amber-200'
              }`}
            >
              Baixo ({stockFinancials.lowCount})
            </button>
            <button
              onClick={() => setAlertFilter('OUT')}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                alertFilter === 'OUT'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100/70 text-rose-800 border-rose-200'
              }`}
            >
              Sem Estoque ({stockFinancials.zeroCount})
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Overview Table */}
      {activeTab === 'OVERVIEW' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-stone-50/60 border-b border-stone-200/80 text-stone-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-3 text-center">Status Estoque</th>
                  <th className="py-3 px-3 text-center">Mínimo</th>
                  <th className="py-3 px-3 text-right">Custo Unit.</th>
                  <th className="py-3 px-3 text-right">Venda Unit.</th>
                  <th className="py-3 px-3 text-right">Valor em Estoque (Venda)</th>
                  <th className="py-3 px-4 text-center">Ajustes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => {
                  const isZero = p.currentStock === 0;
                  const isLow = p.currentStock > 0 && p.currentStock <= p.minStock;
                  const stockValue = p.currentStock * p.salePrice;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-stone-900">
                        <div className="font-semibold text-xs sm:text-sm">{p.name}</div>
                        <div className="text-[11px] text-stone-400 font-normal">{p.brand} • {p.volumeMl}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-stone-600">{p.code}</td>
                      <td className="py-3 px-3 text-stone-600">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isZero
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isZero ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span>{isZero ? 'Sem estoque' : isLow ? 'Estoque baixo' : 'Normal'}</span>
                          <span className="font-mono text-[11px]">({p.currentStock} {p.unit})</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-stone-600 font-mono text-xs">{p.minStock} {p.unit}</td>
                      <td className="py-3 px-3 text-right font-mono text-stone-600">R$ {p.costPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-stone-900">R$ {p.salePrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                        R$ {stockValue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenAdjust(p, 'ENTRADA_MANUAL')}
                            title="Entrada manual de estoque"
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(p, 'SAIDA_MANUAL')}
                            title="Saída manual (quebra, avaria, teste)"
                            className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(p, 'AJUSTE_INVENTARIO')}
                            title="Balanço / Inventário exato"
                            className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
                          >
                            <ClipboardList className="w-4 h-4" />
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
      )}

      {/* Tab 2: Movement History */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-semibold text-stone-900 text-sm">Histórico Detalhado de Movimentações</h3>
            <span className="text-xs text-stone-400">Total: {filteredMovements.length} registro(s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-stone-50/60 border-b border-stone-200/80 text-stone-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-3">Produto</th>
                  <th className="py-3 px-3">Tipo Movimentação</th>
                  <th className="py-3 px-3 text-center">Anterior</th>
                  <th className="py-3 px-3 text-center">Movimentada</th>
                  <th className="py-3 px-3 text-center">Posterior</th>
                  <th className="py-3 px-3">Motivo / Detalhes</th>
                  <th className="py-3 px-4">Usuário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMovements.map((m) => {
                  const isPositive = m.quantity > 0;
                  return (
                    <tr key={m.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4 text-stone-500 text-xs font-mono">
                        {new Date(m.createdAt).toLocaleDateString('pt-BR')}{' '}
                        {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 font-medium text-stone-900">{m.productName}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            m.movementType.startsWith('ENTRADA')
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : m.movementType.startsWith('SAIDA')
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-stone-100 text-stone-800 border border-stone-200'
                          }`}
                        >
                          {m.movementType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-stone-600">{m.previousStock}</td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">
                        <span className={isPositive ? 'text-emerald-700' : 'text-rose-600'}>
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-stone-900">{m.newStock}</td>
                      <td className="py-3 px-3 text-stone-600 max-w-xs truncate text-xs">{m.reason}</td>
                      <td className="py-3 px-4 text-stone-700 font-medium text-xs">{m.userName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Adjust / Movement */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Ajuste Manual de Estoque</h3>
                <p className="text-xs text-stone-500">{selectedProduct.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAdjustment} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="p-3 bg-stone-50/60 rounded-xl border border-stone-200/80 flex justify-between items-center text-xs">
                <span className="text-stone-600">Estoque Atual Registrado:</span>
                <span className="font-bold font-mono text-sm text-stone-900">
                  {selectedProduct.currentStock} {selectedProduct.unit}
                </span>
              </div>

              {/* Movement Type */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">Tipo de Ajuste</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as StockMovementType)}
                  className="w-full px-3 py-2 border border-stone-200/80 rounded-xl font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                >
                  <option value="ENTRADA_MANUAL">📥 Entrada Manual (+)</option>
                  <option value="SAIDA_MANUAL">📤 Saída Manual (-) (Avaria, Teste, Brinde)</option>
                  <option value="AJUSTE_INVENTARIO">📋 Balanço / Inventário (Contagem Real)</option>
                </select>
              </div>

              {/* Quantity or Target */}
              {adjType === 'AJUSTE_INVENTARIO' ? (
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Nova Quantidade Contada no Armazém</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={inventoryTarget}
                    onChange={(e) => setInventoryTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono font-bold text-sm border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="text-[11px] text-stone-500 mt-1">
                    Diferença:{' '}
                    <span className="font-semibold font-mono">
                      {inventoryTarget - selectedProduct.currentStock >= 0 ? '+' : ''}
                      {inventoryTarget - selectedProduct.currentStock} un
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Quantidade a {adjType === 'ENTRADA_MANUAL' ? 'Acrescentar' : 'Subtrair'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjQuantity}
                    onChange={(e) => setAdjQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono font-bold text-sm border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">Motivo do Ajuste (Obrigatório) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Frasco quebrado em prateleira / Amostra para cliente / Contagem de auditoria"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
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
                  Registrar Alteração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
