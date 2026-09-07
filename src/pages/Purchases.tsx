import React, { useState, useMemo } from 'react';
import {
  FileDown,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Truck,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import { db } from '../services/db';
import { Product, Supplier, Purchase, PurchaseItem } from '../types';

export const Purchases: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const suppliers = useMemo(() => db.getSuppliers(), []);
  const [purchases, setPurchases] = useState<Purchase[]>(() => db.getPurchases());

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Items in current receipt
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemUnitCost, setItemUnitCost] = useState(0);

  // Detail Modal
  const [selectedPurchaseDetail, setSelectedPurchaseDetail] = useState<Purchase | null>(null);

  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const refreshData = () => {
    setProducts(db.getProducts());
    setPurchases(db.getPurchases());
  };

  // When product is selected in dropdown, auto-fill its current cost
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setItemUnitCost(prod.costPrice);
    }
  };

  // Add Item to Purchase list
  const handleAddItem = () => {
    if (!selectedProductId) {
      setFormError('Selecione um produto para adicionar.');
      return;
    }
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (itemQty <= 0) {
      setFormError('A quantidade deve ser maior que zero.');
      return;
    }
    if (itemUnitCost < 0) {
      setFormError('O custo unitário não pode ser negativo.');
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: itemQty,
        unitCost: itemUnitCost,
        totalCost: itemQty * itemUnitCost,
      },
    ]);

    // Reset inputs
    setSelectedProductId('');
    setItemQty(1);
    setItemUnitCost(0);
    setFormError('');
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalPurchaseAmount = useMemo(() => {
    return items.reduce((acc, it) => acc + it.totalCost, 0);
  }, [items]);

  // Submit Purchase
  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      setFormError('Informe o número da Nota Fiscal (NF).');
      return;
    }
    if (items.length === 0) {
      setFormError('Adicione pelo menos um produto à nota de entrada.');
      return;
    }

    const sup = suppliers.find((s) => s.id === selectedSupplierId);

    const res = db.recordPurchase({
      invoiceNumber: invoiceNumber.trim(),
      supplierId: selectedSupplierId,
      supplierName: sup ? (sup.tradeName || sup.name) : 'Fornecedor',
      date: purchaseDate,
      items,
      totalAmount: totalPurchaseAmount,
      notes: notes.trim(),
    });

    if (!res.success) {
      setFormError(res.error || 'Erro ao registrar entrada.');
      return;
    }

    setSuccessMsg(`Entrada NF ${invoiceNumber} registrada com sucesso! Estoque e custos atualizados.`);
    setTimeout(() => setSuccessMsg(''), 4000);

    // Reset Form
    setIsFormOpen(false);
    setInvoiceNumber('');
    setNotes('');
    setItems([]);
    refreshData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileDown className="w-3.5 h-3.5 text-stone-700" />
            <span>Recepção de Mercadorias &amp; Notas Fiscais</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Entrada de Mercadorias
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Dê entrada em lotes de compras, atualize custos de reposição e alimente o estoque automaticamente.
          </p>
        </div>

        <button
          onClick={() => {
            setIsFormOpen(true);
            setFormError('');
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nova Entrada (NF)</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* New Entry Modal / Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Entrada de Mercadoria / Compra</h3>
                <p className="text-xs text-stone-500">Atualização automática de estoque e recálculo de custo</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchase} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center space-x-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Invoice & Supplier Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Fornecedor *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.tradeName || s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Número da Nota Fiscal (NF) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: NF-58492"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Data da Entrada</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Add Items Box */}
              <div className="p-4 bg-stone-50/70 rounded-xl border border-stone-200/70 space-y-3">
                <div className="font-semibold text-stone-800 flex items-center space-x-1.5 text-xs">
                  <Package className="w-3.5 h-3.5 text-stone-600" />
                  <span>Adicionar Produtos da Nota</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">Produto / Perfume</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200/80 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">Selecione o produto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code}) - Estoque atual: {p.currentStock} un
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">Qtd</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(Math.max(1, Number(e.target.value)))}
                      className="w-full px-2.5 py-2 bg-white border border-stone-200/80 rounded-xl font-mono text-center font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">Custo Un (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemUnitCost || ''}
                      onChange={(e) => setItemUnitCost(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-stone-200/80 rounded-xl font-mono text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Inserir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-medium text-stone-700">Produtos a Receber ({items.length})</span>
                  <span className="font-semibold text-stone-900 font-mono">
                    Total NF: R$ {totalPurchaseAmount.toFixed(2)}
                  </span>
                </div>

                <div className="border border-stone-200/80 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50/80 text-stone-500 font-medium text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Produto</th>
                        <th className="py-2 px-2 text-center">Qtd</th>
                        <th className="py-2 px-2 text-right">Custo Un.</th>
                        <th className="py-2 px-2 text-right">Total Item</th>
                        <th className="py-2 px-2 text-center">Remover</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-stone-400">
                            Nenhum item adicionado ainda.
                          </td>
                        </tr>
                      ) : (
                        items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-stone-50/50">
                            <td className="py-2 px-3 font-medium text-stone-800">{it.productName}</td>
                            <td className="py-2 px-2 text-center font-mono font-semibold text-stone-900">+{it.quantity}</td>
                            <td className="py-2 px-2 text-right font-mono text-stone-600">R$ {it.unitCost.toFixed(2)}</td>
                            <td className="py-2 px-2 text-right font-mono font-semibold text-stone-900">
                              R$ {it.totalCost.toFixed(2)}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-stone-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">Observações da Compra</label>
                <textarea
                  rows={2}
                  placeholder="Lote recebido, condições de entrega, transportadora..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Footer */}
              <div className="pt-2 flex justify-end space-x-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Atualizar Estoque</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History of Purchases */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900 text-sm">Histórico de Entradas Registradas</h2>
          <span className="text-xs text-stone-400">Total: {purchases.length} nota(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50/60 border-b border-stone-200/80 text-stone-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Data Entrada</th>
                <th className="py-3 px-3">Nota Fiscal (NF)</th>
                <th className="py-3 px-3">Fornecedor</th>
                <th className="py-3 px-3 text-center">Itens Recebidos</th>
                <th className="py-3 px-3 text-right">Valor Total</th>
                <th className="py-3 px-3">Responsável</th>
                <th className="py-3 px-4 text-center">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <FileDown className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    Nenhuma entrada de mercadoria registrada até o momento.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4 text-stone-600 font-mono text-xs">
                      {new Date(p.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-stone-900">{p.invoiceNumber}</td>
                    <td className="py-3 px-3 font-medium text-stone-900">{p.supplierName}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-medium text-xs font-mono">
                        {p.items.reduce((acc, it) => acc + it.quantity, 0)} un ({p.items.length} itens)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                      R$ {p.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-stone-600 text-xs">{p.userName}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedPurchaseDetail(p)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Ver itens da NF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Detail Modal */}
      {selectedPurchaseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Detalhes da Nota Fiscal {selectedPurchaseDetail.invoiceNumber}
                </h3>
                <p className="text-xs text-stone-500">Fornecedor: {selectedPurchaseDetail.supplierName}</p>
              </div>
              <button
                onClick={() => setSelectedPurchaseDetail(null)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/80 text-stone-600">
                <div>
                  <span className="font-medium text-stone-700">Data:</span> {new Date(selectedPurchaseDetail.date).toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium text-stone-700">Registrado por:</span> {selectedPurchaseDetail.userName}
                </div>
                {selectedPurchaseDetail.notes && (
                  <div className="col-span-2 pt-1.5 border-t border-stone-200/60">
                    <span className="font-medium text-stone-700">Obs:</span> {selectedPurchaseDetail.notes}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="font-medium text-stone-800">Itens Recebidos:</div>
                <div className="border border-stone-200/80 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50/80 text-stone-500 font-medium">
                      <tr>
                        <th className="py-2 px-3">Produto</th>
                        <th className="py-2 px-2 text-center">Qtd</th>
                        <th className="py-2 px-2 text-right">Custo Un</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedPurchaseDetail.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-medium text-stone-800">{it.productName}</td>
                          <td className="py-2 px-2 text-center font-mono font-semibold text-stone-900">+{it.quantity}</td>
                          <td className="py-2 px-2 text-right font-mono text-stone-600">R$ {it.unitCost.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-stone-900">
                            R$ {it.totalCost.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-stone-200/80 font-medium text-sm">
                <span className="text-stone-700">Total da Nota:</span>
                <span className="text-base text-emerald-700 font-mono font-semibold">
                  R$ {selectedPurchaseDetail.totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedPurchaseDetail(null)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
