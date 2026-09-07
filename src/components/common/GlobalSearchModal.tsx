import React, { useState, useMemo } from 'react';
import { Search, X, Package, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { db } from '../../services/db';
import { Product, Sale, Supplier } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const products = useMemo(() => db.getProducts(), [isOpen]);
  const sales = useMemo(() => db.getSales(), [isOpen]);
  const suppliers = useMemo(() => db.getSuppliers(), [isOpen]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return { products: [], sales: [], suppliers: [] };

    const matchedProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.barcode.includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.fragrance.toLowerCase().includes(term)
    ).slice(0, 5);

    const matchedSales = sales.filter(
      (s) =>
        String(s.saleNumber).includes(term) ||
        (s.customerName && s.customerName.toLowerCase().includes(term)) ||
        (s.customerDocument && s.customerDocument.includes(term))
    ).slice(0, 5);

    const matchedSuppliers = suppliers.filter(
      (sup) =>
        sup.name.toLowerCase().includes(term) ||
        sup.tradeName.toLowerCase().includes(term) ||
        sup.document.includes(term) ||
        sup.city.toLowerCase().includes(term)
    ).slice(0, 5);

    return {
      products: matchedProducts,
      sales: matchedSales,
      suppliers: matchedSuppliers,
    };
  }, [searchTerm, products, sales, suppliers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-stone-200 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-stone-200 bg-stone-50">
          <Search className="w-5 h-5 text-amber-600 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar por perfume, código, código de barras, nº da venda ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-stone-900 placeholder-stone-400 text-base focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-600 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-4">
          {!searchTerm.trim() ? (
            <div className="py-10 text-center text-stone-400">
              <Search className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-medium">Digite para buscar rapidamente em todo o sistema</p>
              <p className="text-xs text-stone-400 mt-1">Produtos, Código de barras, Vendas e Fornecedores</p>
            </div>
          ) : filtered.products.length === 0 && filtered.sales.length === 0 && filtered.suppliers.length === 0 ? (
            <div className="py-8 text-center text-stone-500">
              <p className="text-sm">Nenhum resultado encontrado para &quot;{searchTerm}&quot;</p>
            </div>
          ) : (
            <>
              {/* Products */}
              {filtered.products.length > 0 && (
                <div>
                  <div className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    <Package className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                    Produtos & Perfumes ({filtered.products.length})
                  </div>
                  <div className="space-y-1">
                    {filtered.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigate('products', p.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 cursor-pointer border border-transparent hover:border-amber-200 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0 flex items-center justify-center">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-stone-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-800 text-sm">{p.name}</div>
                            <div className="text-xs text-stone-500 flex items-center space-x-2">
                              <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">{p.code}</span>
                              <span>• {p.brand}</span>
                              <span>• {p.volumeMl}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-700 text-sm">R$ {p.salePrice.toFixed(2)}</div>
                          <div className="text-xs text-stone-500">
                            Estoque: <span className={p.currentStock <= p.minStock ? 'text-red-600 font-bold' : 'font-medium'}>{p.currentStock} {p.unit}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sales */}
              {filtered.sales.length > 0 && (
                <div>
                  <div className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Vendas ({filtered.sales.length})
                  </div>
                  <div className="space-y-1">
                    {filtered.sales.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigate('reports', s.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 cursor-pointer border border-transparent hover:border-emerald-200 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-stone-800 text-sm">
                            Venda #{s.saleNumber} {s.customerName ? `• ${s.customerName}` : '• Consumidor Final'}
                          </div>
                          <div className="text-xs text-stone-500">
                            {new Date(s.date).toLocaleDateString('pt-BR')} às {new Date(s.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {s.userName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700 text-sm">R$ {s.total.toFixed(2)}</div>
                          <div className="text-xs text-stone-500">{s.items.length} item(ns)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers */}
              {filtered.suppliers.length > 0 && (
                <div>
                  <div className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    <Truck className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    Fornecedores ({filtered.suppliers.length})
                  </div>
                  <div className="space-y-1">
                    {filtered.suppliers.map((sup) => (
                      <div
                        key={sup.id}
                        onClick={() => {
                          onNavigate('suppliers', sup.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 cursor-pointer border border-transparent hover:border-indigo-200 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-stone-800 text-sm">{sup.tradeName || sup.name}</div>
                          <div className="text-xs text-stone-500">
                            CNPJ: {sup.document} • {sup.city}/{sup.state}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
