import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  X,
} from 'lucide-react';
import { db } from '../services/db';
import { Product, ProductCategory, ProductType, Supplier } from '../types';

const CATEGORIES: ProductCategory[] = [
  'Perfumes',
  'Body Splash',
  'Hidratantes',
  'Desodorantes',
  'Kits',
  'Maquiagem',
  'Cosméticos',
  'Cabelos',
  'Acessórios',
  'Outros',
];

const PRODUCT_TYPES: ProductType[] = [
  'Eau de Parfum (EDP)',
  'Eau de Toilette (EDT)',
  'Eau de Cologne (EDC)',
  'Parfum / Extrait',
  'Splash',
  'Creme / Loção',
  'Spray',
  'Outro',
];

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const suppliers = useMemo(() => db.getSuppliers(), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    barcode: '',
    name: '',
    brand: '',
    category: 'Perfumes',
    productType: 'Eau de Parfum (EDP)',
    volumeMl: '100ml',
    fragrance: '',
    supplierId: suppliers[0]?.id || '',
    costPrice: 0,
    salePrice: 0,
    currentStock: 0,
    minStock: 5,
    unit: 'UN',
    active: true,
    imageUrl: '',
    notes: '',
  });

  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setProducts(db.getProducts());
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const term = searchTerm.trim().toLowerCase();
      const sup = suppliers.find((s) => s.id === p.supplierId);
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.barcode.includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.fragrance.toLowerCase().includes(term) ||
        (sup && (sup.name.toLowerCase().includes(term) || sup.tradeName.toLowerCase().includes(term)));

      // Category
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      // Stock / Status
      let matchesStock = true;
      if (stockFilter === 'IN_STOCK') matchesStock = p.currentStock > p.minStock && p.active;
      else if (stockFilter === 'LOW_STOCK') matchesStock = p.currentStock > 0 && p.currentStock <= p.minStock && p.active;
      else if (stockFilter === 'OUT_OF_STOCK') matchesStock = p.currentStock === 0 && p.active;
      else if (stockFilter === 'ACTIVE') matchesStock = p.active;
      else if (stockFilter === 'INACTIVE') matchesStock = !p.active;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter, suppliers]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextNum = products.length + 1;
    const generatedCode = `PERF-${String(nextNum).padStart(3, '0')}`;
    const generatedBarcode = `789100100${String(nextNum).padStart(4, '0')}`;

    setEditingProduct(null);
    setFormData({
      code: generatedCode,
      barcode: generatedBarcode,
      name: '',
      brand: '',
      category: 'Perfumes',
      productType: 'Eau de Parfum (EDP)',
      volumeMl: '100ml',
      fragrance: '',
      supplierId: suppliers[0]?.id || '',
      costPrice: 0,
      salePrice: 0,
      currentStock: 0,
      minStock: 5,
      unit: 'UN',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&auto=format&fit=crop&q=80',
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setFormError('');
    setIsModalOpen(true);
  };

  // Save Product
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setFormError('O nome do produto é obrigatório.');
      return;
    }
    if (!formData.code?.trim()) {
      setFormError('O código interno é obrigatório.');
      return;
    }
    if ((formData.salePrice || 0) <= 0) {
      setFormError('O preço de venda deve ser maior que zero.');
      return;
    }

    const id = editingProduct ? editingProduct.id : 'prod_' + Date.now();
    const productToSave: Product = {
      id,
      code: formData.code!.trim(),
      barcode: formData.barcode?.trim() || `789${Date.now().toString().slice(-10)}`,
      name: formData.name!.trim(),
      brand: formData.brand?.trim() || 'Importado',
      category: formData.category as ProductCategory,
      productType: formData.productType as ProductType,
      volumeMl: formData.volumeMl?.trim() || '100ml',
      fragrance: formData.fragrance?.trim() || 'Aromático',
      supplierId: formData.supplierId || suppliers[0]?.id || '',
      costPrice: Number(formData.costPrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      currentStock: Number(formData.currentStock) || 0,
      minStock: Number(formData.minStock) || 5,
      unit: formData.unit || 'UN',
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      active: formData.active !== false,
      imageUrl: formData.imageUrl?.trim() || '',
      notes: formData.notes?.trim() || '',
    };

    db.saveProduct(productToSave);
    refreshList();
    setIsModalOpen(false);
  };

  const handleToggleActive = (product: Product) => {
    const updated = { ...product, active: !product.active };
    db.saveProduct(updated);
    refreshList();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Package className="w-3.5 h-3.5 text-amber-600" />
            <span>Gerenciamento de Catálogo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Produtos &amp; Perfumes
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Cadastre fragrâncias, volumetrias, notas olfativas, preços e controle de estoque.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Perfume / Produto</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por nome, código, barras, marca ou notas olfativas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-52">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
            >
              <option value="ALL">Todas as Categorias</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status & Stock Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 text-xs">
          <span className="text-stone-400 font-medium mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3" />
            <span>Filtros:</span>
          </span>
          {[
            { id: 'ALL', label: `Todos (${products.length})` },
            {
              id: 'IN_STOCK',
              label: `Em Estoque (${products.filter((p) => p.active && p.currentStock > p.minStock).length})`,
            },
            {
              id: 'LOW_STOCK',
              label: `Estoque Baixo (${products.filter((p) => p.active && p.currentStock > 0 && p.currentStock <= p.minStock).length})`,
              color: 'text-amber-700 bg-amber-50 border-amber-200',
            },
            {
              id: 'OUT_OF_STOCK',
              label: `Sem Estoque (${products.filter((p) => p.active && p.currentStock === 0).length})`,
              color: 'text-rose-700 bg-rose-50 border-rose-200',
            },
            { id: 'ACTIVE', label: 'Ativos' },
            { id: 'INACTIVE', label: 'Inativos' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStockFilter(pill.id as any)}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                stockFilter === pill.id
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : pill.color || 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200/80'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50/60 border-b border-stone-200/80 text-stone-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Produto &amp; Fragrância</th>
                <th className="py-3 px-3">Código / Barras</th>
                <th className="py-3 px-3">Categoria &amp; Tipo</th>
                <th className="py-3 px-3 text-right">Custo / Venda</th>
                <th className="py-3 px-3 text-center">Estoque</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-stone-300 stroke-[1.5]" />
                    <p className="text-sm font-medium text-stone-600">Nenhum produto encontrado</p>
                    <p className="text-xs text-stone-400">Tente ajustar seus filtros de busca acima.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const supplier = suppliers.find((s) => s.id === p.supplierId);
                  const isLow = p.currentStock > 0 && p.currentStock <= p.minStock;
                  const isZero = p.currentStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      {/* Product Name & Visual */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-50 overflow-hidden border border-stone-150 flex-shrink-0 flex items-center justify-center">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-stone-300" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 text-xs sm:text-sm leading-tight flex items-center space-x-1.5">
                              <span>{p.name}</span>
                              <span className="font-mono text-[10px] text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                                {p.volumeMl}
                              </span>
                            </div>
                            <div className="text-[11px] text-amber-700 font-semibold">{p.brand}</div>
                            <div className="text-[11px] text-stone-500 italic truncate max-w-xs">{p.fragrance}</div>
                          </div>
                        </div>
                      </td>

                      {/* Code / Barcode */}
                      <td className="py-3 px-3 font-mono text-xs">
                        <div className="font-semibold text-stone-800">{p.code}</div>
                        <div className="text-[11px] text-stone-400">{p.barcode}</div>
                      </td>

                      {/* Category & Type */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px] mb-0.5">
                          {p.category}
                        </span>
                        <div className="text-[11px] text-stone-400">{p.productType}</div>
                      </td>

                      {/* Cost / Sale Price */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-semibold text-stone-900 font-mono text-xs sm:text-sm">R$ {p.salePrice.toFixed(2)}</div>
                        <div className="text-[11px] text-stone-400 font-mono">Custo: R$ {p.costPrice.toFixed(2)}</div>
                      </td>

                      {/* Stock Level */}
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
                          <span>
                            {p.currentStock} {p.unit}
                          </span>
                        </span>
                        <div className="text-[10px] text-stone-400 mt-0.5">Mín: {p.minStock}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            p.active ? 'bg-stone-100 text-stone-700' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {p.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Editar produto"
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(p)}
                            title={p.active ? 'Inativar produto' : 'Ativar produto'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.active ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {p.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {editingProduct ? 'Editar Perfume / Produto' : 'Novo Cadastro de Produto'}
                </h3>
                <p className="text-xs text-stone-500">Preencha os dados e parâmetros da fragrância</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center space-x-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Nome do Produto / Perfume *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bleu Intense Eau de Parfum"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Marca / Fabricante *</label>
                  <input
                    type="text"
                    placeholder="Ex: Chantal Prestige, Maison Noir"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Codes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Código Interno (SKU) *</label>
                  <input
                    type="text"
                    required
                    placeholder="PERF-001"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 font-mono border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Código de Barras (EAN) *</label>
                  <input
                    type="text"
                    placeholder="7891001002011"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 font-mono border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Category, Type, Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Tipo de Produto</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value as ProductType })}
                    className="w-full px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                  >
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Volume / Conteúdo</label>
                  <input
                    type="text"
                    placeholder="Ex: 100ml, 50ml, 200g"
                    value={formData.volumeMl || ''}
                    onChange={(e) => setFormData({ ...formData, volumeMl: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Fragrance / Olfactory Family */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">Notas Olfativas / Fragrância</label>
                <input
                  type="text"
                  placeholder="Ex: Amadeirado Especiado com notas de Cedro, Pimenta e Bergamota"
                  value={formData.fragrance || ''}
                  onChange={(e) => setFormData({ ...formData, fragrance: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">Fornecedor Preferencial</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tradeName || s.name} ({s.document})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/80">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Custo Compra (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice || ''}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 font-mono text-xs border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Preço Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.salePrice || ''}
                    onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 font-mono font-semibold text-amber-800 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Estoque Atual</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentStock ?? 0}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 font-mono text-xs border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock ?? 5}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 font-mono text-xs border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Image URL & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">URL da Imagem / Foto</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Unidade &amp; Status</label>
                  <div className="flex space-x-2">
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                    >
                      <option value="UN">Unidade (UN)</option>
                      <option value="KIT">Kit (KIT)</option>
                      <option value="CX">Caixa (CX)</option>
                    </select>
                    <label className="w-1/2 flex items-center space-x-2 px-3 py-2 border border-stone-200/80 rounded-xl bg-stone-50 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-medium text-stone-700">Produto Ativo</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Observações Gerais</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais, fixação, lote especial..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 flex justify-end space-x-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
