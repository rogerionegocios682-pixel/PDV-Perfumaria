import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Package,
  Calendar,
  X,
  Edit2,
  CheckCircle,
} from 'lucide-react';
import { db } from '../services/db';
import { Supplier, Product, Purchase } from '../types';

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => db.getSuppliers());
  const products = db.getProducts();
  const purchases = db.getPurchases();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    tradeName: '',
    document: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    state: '',
    contactPerson: '',
    notes: '',
    active: true,
  });

  const refreshList = () => {
    setSuppliers(db.getSuppliers());
  };

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.tradeName.toLowerCase().includes(term) ||
        s.document.includes(term) ||
        s.city.toLowerCase().includes(term) ||
        s.state.toLowerCase().includes(term) ||
        s.contactPerson.toLowerCase().includes(term)
    );
  }, [suppliers, searchTerm]);

  // Handle open create
  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      tradeName: '',
      document: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: '',
      state: 'SP',
      contactPerson: '',
      notes: '',
      active: true,
    });
    setIsFormOpen(true);
  };

  // Handle open edit
  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({ ...sup });
    setIsFormOpen(true);
  };

  // Submit form
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.document?.trim()) return;

    const id = editingSupplier ? editingSupplier.id : 'sup_' + Date.now();
    const toSave: Supplier = {
      id,
      name: formData.name!.trim(),
      tradeName: formData.tradeName?.trim() || formData.name!.trim(),
      document: formData.document!.trim(),
      phone: formData.phone?.trim() || '',
      whatsapp: formData.whatsapp?.trim() || '',
      email: formData.email?.trim() || '',
      address: formData.address?.trim() || '',
      city: formData.city?.trim() || '',
      state: formData.state?.trim() || '',
      contactPerson: formData.contactPerson?.trim() || '',
      notes: formData.notes?.trim() || '',
      active: formData.active !== false,
      createdAt: editingSupplier ? editingSupplier.createdAt : new Date().toISOString(),
    };

    db.saveSupplier(toSave);
    refreshList();
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Truck className="w-3.5 h-3.5 text-stone-700" />
            <span>Cadeia de Suprimentos</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Fornecedores de Perfumaria
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Gestão de distribuidores, marcas parceiras, dados cadastrais e histórico de compras.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Fornecedor</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Pesquisar fornecedor por razão social, nome fantasia, CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Suppliers Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((sup) => {
          // Supplier Stats
          const supPurchases = purchases.filter((p) => p.supplierId === sup.id);
          const totalSpent = supPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
          const supProducts = products.filter((p) => p.supplierId === sup.id);

          return (
            <div
              key={sup.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-colors flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-stone-900 text-base leading-tight">
                      {sup.tradeName || sup.name}
                    </h3>
                    <div className="text-xs text-stone-500 mt-0.5">{sup.name}</div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                      sup.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {sup.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Document & Location */}
                <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-mono text-stone-700">{sup.document}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">
                      {sup.city} - {sup.state}
                    </span>
                  </div>
                  {sup.contactPerson && (
                    <div className="text-[11px] text-stone-500">
                      Contato: <span className="font-medium text-stone-800">{sup.contactPerson}</span>
                    </div>
                  )}
                </div>

                {/* Quick Contact Buttons */}
                <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-stone-100 text-xs">
                  {sup.whatsapp && (
                    <a
                      href={`https://wa.me/55${sup.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {sup.phone && (
                    <span className="flex items-center space-x-1 text-stone-500 text-[11px]">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{sup.phone}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="pt-3 border-t border-stone-100">
                <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-stone-50/60 p-2.5 rounded-xl border border-stone-200/60">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-medium">Produtos</span>
                    <span className="font-semibold text-stone-800 font-mono">{supProducts.length} itens</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block uppercase font-medium">Total Comprado</span>
                    <span className="font-semibold text-emerald-700 font-mono">R$ {totalSpent.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedSupplier(sup)}
                    className="text-xs font-medium text-stone-900 hover:text-amber-800 hover:underline transition-colors"
                  >
                    Ver compras &amp; produtos &rarr;
                  </button>

                  <button
                    onClick={() => handleOpenEdit(sup)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                    title="Editar fornecedor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {selectedSupplier.tradeName || selectedSupplier.name}
                </h3>
                <p className="text-xs text-stone-500">CNPJ: {selectedSupplier.document}</p>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Info block */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/80">
                <div>
                  <span className="font-medium text-stone-500 block">Endereço Completo:</span>
                  <span className="text-stone-800 font-medium">
                    {selectedSupplier.address} - {selectedSupplier.city}/{selectedSupplier.state}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-stone-500 block">Contato &amp; E-mail:</span>
                  <span className="text-stone-800 font-medium">
                    {selectedSupplier.contactPerson} ({selectedSupplier.email || 'N/D'})
                  </span>
                </div>
                {selectedSupplier.notes && (
                  <div className="col-span-2 pt-2 border-t border-stone-200/60">
                    <span className="font-medium text-stone-500 block">Observações:</span>
                    <span className="text-stone-700 italic">{selectedSupplier.notes}</span>
                  </div>
                )}
              </div>

              {/* Products Supplied */}
              <div>
                <h4 className="font-semibold text-stone-900 text-sm mb-2 flex items-center space-x-1.5">
                  <Package className="w-3.5 h-3.5 text-stone-600" />
                  <span>Produtos Fornecidos ({products.filter((p) => p.supplierId === selectedSupplier.id).length})</span>
                </h4>
                <div className="border border-stone-200/80 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50/80 text-stone-500 font-medium">
                      <tr>
                        <th className="py-2 px-3">Produto</th>
                        <th className="py-2 px-2">Código</th>
                        <th className="py-2 px-2 text-right">Preço Venda</th>
                        <th className="py-2 px-3 text-center">Estoque</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products
                        .filter((p) => p.supplierId === selectedSupplier.id)
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-stone-50/50">
                            <td className="py-2 px-3 font-medium text-stone-800">{p.name}</td>
                            <td className="py-2 px-2 font-mono text-stone-500">{p.code}</td>
                            <td className="py-2 px-2 text-right font-mono font-semibold text-stone-900">
                              R$ {p.salePrice.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-center font-mono">
                              {p.currentStock} {p.unit}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purchase history from this supplier */}
              <div>
                <h4 className="font-semibold text-stone-900 text-sm mb-2 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-stone-600" />
                  <span>Histórico de Entradas / Compras</span>
                </h4>
                <div className="border border-stone-200/80 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50/80 text-stone-500 font-medium">
                      <tr>
                        <th className="py-2 px-3">Data</th>
                        <th className="py-2 px-2">Nota Fiscal</th>
                        <th className="py-2 px-2 text-center">Itens</th>
                        <th className="py-2 px-3 text-right">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {purchases.filter((p) => p.supplierId === selectedSupplier.id).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-stone-400">
                            Nenhuma entrada registrada para este fornecedor.
                          </td>
                        </tr>
                      ) : (
                        purchases
                          .filter((p) => p.supplierId === selectedSupplier.id)
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-stone-50/50">
                              <td className="py-2 px-3 font-mono text-stone-600">
                                {new Date(p.date).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-2 px-2 font-mono font-semibold text-stone-800">{p.invoiceNumber}</td>
                              <td className="py-2 px-2 text-center font-mono text-stone-600">{p.items.length} itens</td>
                              <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">
                                R$ {p.totalAmount.toFixed(2)}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Supplier Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {editingSupplier ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formData.tradeName || ''}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">CNPJ / CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0001-00"
                    value={formData.document || ''}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    className="w-full px-3 py-2 font-mono bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Pessoa de Contato</label>
                  <input
                    type="text"
                    placeholder="Representante / Gerente de Conta"
                    value={formData.contactPerson || ''}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Telefone Fixo</label>
                  <input
                    type="text"
                    placeholder="(11) 3456-7890"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">WhatsApp Comercial</label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">E-mail Comercial</label>
                <input
                  type="email"
                  placeholder="pedidos@fornecedor.com.br"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 font-mono uppercase text-center bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Endereço</label>
                <input
                  type="text"
                  placeholder="Rua, Número, Bairro"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Salvar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
