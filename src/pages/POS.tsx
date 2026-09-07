import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  DollarSign,
  CreditCard,
  QrCode,
  Tag,
  AlertCircle,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Split,
} from 'lucide-react';
import { db } from '../services/db';
import { useCash } from '../context/CashContext';
import { useAuth } from '../context/AuthContext';
import { Product, SaleItem, PaymentMethod, PaymentSplit, Sale, Seller } from '../types';
import { ReceiptModal } from '../components/common/ReceiptModal';
import { UserCheck } from 'lucide-react';

interface POSProps {
  onNavigate: (tab: string) => void;
}

export const POS: React.FC<POSProps> = ({ onNavigate }) => {
  const { isCashOpen, activeRegister } = useCash();
  const { currentUser, hasPermission } = useAuth();
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [sellers, setSellers] = useState<Seller[]>(() => db.getSellers().filter((s) => s.active));

  // Permissions
  const canApplyDiscount = hasPermission('pos_apply_discount');
  const canChangeSeller =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MANAGER' ||
    currentUser.role === 'CASHIER' ||
    hasPermission('pos_change_seller');

  // Selected Seller for Sale
  const [selectedSellerId, setSelectedSellerId] = useState<string>(() => {
    if (currentUser.sellerId) return currentUser.sellerId;
    const all = db.getSellers().filter((s) => s.active);
    return all.length > 0 ? all[0].id : '';
  });

  useEffect(() => {
    if (currentUser.sellerId) {
      setSelectedSellerId(currentUser.sellerId);
    }
  }, [currentUser]);

  // Search & Barcode
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Cart
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);

  // Payment State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([
    { method: 'PIX', amount: 0 },
  ]);
  const [tenderCashGiven, setTenderCashGiven] = useState<number>(0);

  // Feedback & Receipt
  const [errorMessage, setErrorMessage] = useState('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Refresh products list
  const refreshProducts = () => {
    setProducts(db.getProducts());
    setSellers(db.getSellers().filter((s) => s.active));
  };

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - globalDiscount);
  }, [subtotal, globalDiscount]);

  const selectedSeller = useMemo(() => {
    return sellers.find((s) => s.id === selectedSellerId);
  }, [sellers, selectedSellerId]);

  const estimatedCommission = useMemo(() => {
    if (!selectedSeller) return 0;
    return (total * selectedSeller.commissionPercentage) / 100;
  }, [selectedSeller, total]);

  // Filtered product suggestions
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products.filter((p) => p.active).slice(0, 12);
    return products
      .filter(
        (p) =>
          p.active &&
          (p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.barcode.includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.fragrance.toLowerCase().includes(q))
      )
      .slice(0, 12);
  }, [searchQuery, products]);

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      setErrorMessage(`O produto "${product.name}" está sem estoque!`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.currentStock) {
          setErrorMessage(`Estoque máximo atingido para "${product.name}" (${product.currentStock} un).`);
          setTimeout(() => setErrorMessage(''), 3000);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice - item.discount,
              }
            : item
        );
      } else {
        const newItem: SaleItem = {
          productId: product.id,
          productName: product.name,
          code: product.code,
          unitPrice: product.salePrice,
          costPrice: product.costPrice,
          quantity: 1,
          discount: 0,
          total: product.salePrice,
        };
        return [...prev, newItem];
      }
    });
  };

  // Handle Barcode Scan / Enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const matched = products.find((p) => p.active && (p.barcode === code || p.code.toLowerCase() === code.toLowerCase()));
    if (matched) {
      addToCart(matched);
      setBarcodeInput('');
    } else {
      setErrorMessage(`Código "${code}" não encontrado no catálogo de perfumes.`);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  // Update Cart Quantity
  const updateQuantity = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (prod && newQty > prod.currentStock) {
              setErrorMessage(`Estoque máximo disponível: ${prod.currentStock} unidades.`);
              setTimeout(() => setErrorMessage(''), 3000);
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unitPrice - item.discount,
            };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Open Checkout
  const handleOpenCheckout = () => {
    if (!cart.length) return;
    // Pre-populate with exact total in single PIX or Dinheiro
    setPaymentSplits([{ method: 'PIX', amount: Math.round(total * 100) / 100 }]);
    setTenderCashGiven(Math.round(total * 100) / 100);
    setIsCheckoutModalOpen(true);
  };

  // Add a new split payment row
  const addSplitRow = (method: PaymentMethod = 'DINHEIRO') => {
    const currentSum = paymentSplits.reduce((acc, p) => acc + p.amount, 0);
    const remaining = Math.max(0, total - currentSum);
    setPaymentSplits((prev) => [...prev, { method, amount: Math.round(remaining * 100) / 100 }]);
  };

  const updateSplit = (index: number, field: 'method' | 'amount', value: any) => {
    setPaymentSplits((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeSplit = (index: number) => {
    if (paymentSplits.length <= 1) return;
    setPaymentSplits((prev) => prev.filter((_, i) => i !== index));
  };

  // Total paid across all splits
  const totalPaidInSplits = useMemo(() => {
    return paymentSplits.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [paymentSplits]);

  const remainingOrChange = total - totalPaidInSplits;

  // Confirm Sale
  const handleConfirmSale = () => {
    if (Math.abs(remainingOrChange) > 0.05) {
      setErrorMessage(`O valor dos pagamentos deve somar exatamente R$ ${total.toFixed(2)}.`);
      return;
    }

    const res = db.createSale({
      items: cart,
      payments: paymentSplits,
      subtotal,
      discountTotal: globalDiscount,
      total,
      customerName,
      customerDocument,
      sellerId: selectedSellerId || undefined,
      sellerName: selectedSeller?.name || undefined,
    });

    if (!res.success || !res.sale) {
      setErrorMessage(res.error || 'Erro ao processar venda.');
      return;
    }

    // Success!
    setCompletedSale(res.sale);
    setIsCheckoutModalOpen(false);
    setIsReceiptOpen(true);
    setCart([]);
    setGlobalDiscount(0);
    setCustomerName('');
    setCustomerDocument('');
    refreshProducts();
  };

  // If cash is closed, lock POS and show message
  if (!isCashOpen) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">Caixa Fechado</h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            O terminal de vendas (PDV) está bloqueado porque não há nenhum caixa aberto no momento.
            Para realizar vendas com segurança e rastreamento fiscal, efetue a abertura do caixa com o fundo de troco.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('cash')}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <span>Ir para Abertura de Caixa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Alert */}
      {errorMessage && (
        <div className="fixed top-20 right-4 z-50 bg-rose-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* POS Top Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-lg text-stone-900 leading-tight">Frente de Caixa (PDV)</h1>
            <div className="text-xs text-stone-500 flex items-center space-x-2 mt-0.5">
              <span>Operador: <strong className="text-stone-700 font-semibold">{currentUser.name}</strong></span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Caixa #{activeRegister?.id.slice(-4)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Seller Selector & Estimated Commission in Top Bar */}
        <div className="flex items-center space-x-2 bg-stone-50 border border-stone-200/90 px-3 py-1.5 rounded-xl text-xs">
          <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <div className="flex items-center space-x-1.5">
            <span className="text-stone-500 font-medium">Vendedor:</span>
            {canChangeSeller ? (
              <select
                value={selectedSellerId}
                onChange={(e) => setSelectedSellerId(e.target.value)}
                className="bg-transparent font-semibold text-stone-900 focus:outline-none cursor-pointer py-0.5 text-xs"
              >
                <option value="">Sem Vendedor Vinculado</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.commissionPercentage}%)
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-semibold text-purple-900 inline-flex items-center space-x-1">
                <span>{selectedSeller?.name || currentUser.name}</span>
                <Lock className="w-3 h-3 text-stone-400" title="Vendedor fixo pelo login" />
              </span>
            )}
          </div>
          {selectedSeller && (
            <span className="hidden sm:inline-block bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-md font-mono">
              Comissão: R$ {estimatedCommission.toFixed(2)}
            </span>
          )}
        </div>

        {/* Barcode Fast Input */}
        <form onSubmit={handleBarcodeSubmit} className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Barcode className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Código de barras + Enter"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium shrink-0 transition-colors"
          >
            Adicionar
          </button>
        </form>
      </div>

      {/* Main Grid: Catalog Left (60%), Cart Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Product Search & Visual Cards */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por fragrância, perfume, marca ou código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const inStock = p.currentStock > 0;
              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className={`bg-white rounded-2xl border p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xs group ${
                    inStock ? 'border-stone-200/80 hover:border-amber-400' : 'border-rose-200/70 opacity-60'
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-50 mb-2 border border-stone-100">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Sparkles className="w-7 h-7" />
                      </div>
                    )}
                    <span className="absolute top-1.5 right-1.5 bg-stone-900/75 backdrop-blur-xs text-stone-100 font-mono text-[10px] px-1.5 py-0.5 rounded">
                      {p.volumeMl}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider truncate">{p.brand}</div>
                    <div className="font-semibold text-stone-900 text-xs line-clamp-2 leading-tight h-8 mb-1">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate mb-2">{p.fragrance}</div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div>
                      <div className="font-bold text-stone-900 text-sm font-mono">R$ {p.salePrice.toFixed(2)}</div>
                      <div className={`text-[10px] ${p.currentStock <= p.minStock ? 'text-rose-600 font-semibold' : 'text-stone-400'}`}>
                        {inStock ? `${p.currentStock} ${p.unit}` : 'Esgotado'}
                      </div>
                    </div>
                    <button
                      disabled={!inStock}
                      className="p-1.5 rounded-lg bg-amber-50 group-hover:bg-amber-600 text-amber-700 group-hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Cart & Checkout */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col h-[660px]">
          {/* Cart Header */}
          <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 rounded-t-2xl">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-stone-800 text-sm">Itens da Venda</span>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors"
              >
                Limpar carrinho
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2">
                <ShoppingCart className="w-10 h-10 text-stone-300 stroke-[1.5]" />
                <p className="text-sm font-medium text-stone-600">Nenhum item selecionado</p>
                <p className="text-xs text-stone-400 text-center max-w-[220px]">
                  Bipe o código de barras ou selecione os perfumes ao lado para iniciar.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-2.5 rounded-xl border border-stone-150 bg-stone-50/30 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 text-xs truncate">{item.productName}</div>
                    <div className="text-[11px] text-stone-500 font-mono">
                      R$ {item.unitPrice.toFixed(2)} un
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center space-x-1.5 bg-white border border-stone-200 rounded-lg p-0.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-stone-100 rounded text-stone-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-xs px-1 font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-stone-100 rounded text-stone-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total & Delete */}
                  <div className="text-right shrink-0 pl-2">
                    <div className="font-semibold text-xs text-stone-900 font-mono">
                      R$ {item.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-stone-300 hover:text-rose-500 p-0.5 transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer: Discount & Totals */}
          <div className="p-4 border-t border-stone-100 bg-stone-50/50 rounded-b-2xl space-y-3">
            {/* Customer Identification (Optional) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Cliente (opcional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <input
                type="text"
                placeholder="CPF (opcional)"
                value={customerDocument}
                onChange={(e) => setCustomerDocument(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Seller Commission Badge in Cart */}
            {selectedSeller && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-purple-50/70 border border-purple-200/60 text-xs">
                <span className="flex items-center space-x-1.5 text-purple-900 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Comissão ({selectedSeller.name.split(' ')[0]} - {selectedSeller.commissionPercentage}%):</span>
                </span>
                <span className="font-mono font-bold text-purple-900">R$ {estimatedCommission.toFixed(2)}</span>
              </div>
            )}

            {/* Discount Input */}
            <div className="flex items-center justify-between text-xs text-stone-600 pt-0.5">
              <span className="flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Desconto Total (R$):</span>
                {!canApplyDiscount && (
                  <span className="text-[10px] text-rose-500 font-semibold">(Bloqueado)</span>
                )}
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                disabled={!canApplyDiscount}
                value={globalDiscount || ''}
                onChange={(e) => setGlobalDiscount(Math.max(0, Number(e.target.value)))}
                placeholder={canApplyDiscount ? '0.00' : 'Bloqueado'}
                className={`w-24 text-right px-2 py-1 rounded-lg font-mono text-xs focus:outline-none ${
                  canApplyDiscount
                    ? 'bg-white border border-stone-200 focus:ring-1 focus:ring-amber-500 text-stone-900'
                    : 'bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Subtotal & Total */}
            <div className="space-y-1 text-xs border-t border-stone-200/60 pt-2">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal:</span>
                <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
              </div>
              {globalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Desconto aplicado:</span>
                  <span className="font-mono">- R$ {globalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-semibold text-xs text-stone-700 uppercase tracking-wider">Total a Pagar</span>
                <span className="text-2xl font-bold font-mono text-stone-900">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button - Large Visual Prominence */}
            <button
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 tracking-wide"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>FINALIZAR VENDA (F8)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout & Multi-Payment Split Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-stone-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Recebimento &amp; Pagamento</h3>
                <p className="text-xs text-stone-500">Valor a liquidar: <strong className="text-stone-900 font-mono">R$ {total.toFixed(2)}</strong></p>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Payment Split Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
                  <span>Formas de Pagamento</span>
                  <button
                    type="button"
                    onClick={() => addSplitRow()}
                    className="text-amber-700 hover:text-amber-800 font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Método</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {paymentSplits.map((split, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-stone-50/70 p-2.5 rounded-xl border border-stone-200/80">
                      {/* Method Selector */}
                      <select
                        value={split.method}
                        onChange={(e) => updateSplit(idx, 'method', e.target.value as PaymentMethod)}
                        className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="DINHEIRO">💵 Dinheiro</option>
                        <option value="PIX">⚡ PIX</option>
                        <option value="DEBITO">💳 Cartão Débito</option>
                        <option value="CREDITO">💳 Cartão Crédito</option>
                        <option value="OUTROS">🎁 Outros</option>
                      </select>

                      {/* Amount Input */}
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1.5 text-stone-400 text-xs font-mono">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={split.amount || ''}
                          onChange={(e) => updateSplit(idx, 'amount', Number(e.target.value))}
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
                        />
                      </div>

                      {/* Remove Button if multiple */}
                      {paymentSplits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSplit(idx)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status summary */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Total da Venda:</span>
                  <span className="font-semibold font-mono text-stone-900">R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Total Informado:</span>
                  <span className="font-semibold font-mono text-emerald-700">R$ {totalPaidInSplits.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1.5 border-t border-stone-200">
                  <span>Situação:</span>
                  <span
                    className={`font-mono ${
                      Math.abs(remainingOrChange) < 0.05
                        ? 'text-emerald-700'
                        : remainingOrChange > 0
                        ? 'text-rose-600'
                        : 'text-amber-700'
                    }`}
                  >
                    {Math.abs(remainingOrChange) < 0.05
                      ? '✓ Valor Exato'
                      : remainingOrChange > 0
                      ? `Faltam R$ ${remainingOrChange.toFixed(2)}`
                      : `Troco: R$ ${Math.abs(remainingOrChange).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Quick Fill Buttons */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentSplits([{ method: 'PIX', amount: Math.round(total * 100) / 100 }])}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                >
                  Tudo no PIX
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentSplits([{ method: 'CREDITO', amount: Math.round(total * 100) / 100 }])}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                >
                  Tudo no Crédito
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentSplits([{ method: 'DINHEIRO', amount: Math.round(total * 100) / 100 }])}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                >
                  Tudo em Dinheiro
                </button>
              </div>

              {/* Confirm / Cancel */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="w-1/3 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSale}
                  disabled={Math.abs(remainingOrChange) > 0.05}
                  className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Emitir Cupom</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        sale={completedSale}
        onClose={() => {
          setIsReceiptOpen(false);
          setCompletedSale(null);
        }}
      />
    </div>
  );
};
