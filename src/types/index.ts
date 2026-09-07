export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'SELLER';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
  createdAt: string;
  sellerId?: string;
}

export interface SellerPermissions {
  // PDV
  pos_access: boolean;
  pos_make_sales: boolean;
  pos_apply_discount: boolean;
  pos_change_price: boolean;
  pos_cancel_sale: boolean;
  pos_view_other_sales: boolean;
  pos_change_seller: boolean;

  // Produtos
  products_view: boolean;
  products_search: boolean;
  products_create: boolean;
  products_edit: boolean;
  products_delete: boolean;

  // Estoque
  stock_view: boolean;
  stock_check_quantity: boolean;
  stock_record_entry: boolean;
  stock_adjust: boolean;

  // Caixa
  cash_view: boolean;
  cash_open: boolean;
  cash_sangria: boolean;
  cash_suprimento: boolean;
  cash_close: boolean;
  cash_view_other_closings: boolean;

  // Relatórios
  reports_view: boolean;
  reports_own_sales: boolean;
  reports_all_sales: boolean;
  reports_stock: boolean;
  reports_financial: boolean;
  reports_commission: boolean;

  // Cadastros
  cadastros_access: boolean;
  cadastros_customers: boolean;
  cadastros_products: boolean;
  cadastros_suppliers: boolean;
  cadastros_sellers: boolean;

  // Usuários
  users_view: boolean;
  users_create: boolean;
  users_edit: boolean;
  users_permissions: boolean;
}

export const DEFAULT_SELLER_PERMISSIONS: SellerPermissions = {
  // PDV (Padrão de menor privilégio: apenas acessa PDV e realiza vendas)
  pos_access: true,
  pos_make_sales: true,
  pos_apply_discount: true,
  pos_change_price: false,
  pos_cancel_sale: false,
  pos_view_other_sales: false,
  pos_change_seller: false,

  // Produtos
  products_view: false,
  products_search: false,
  products_create: false,
  products_edit: false,
  products_delete: false,

  // Estoque
  stock_view: false,
  stock_check_quantity: false,
  stock_record_entry: false,
  stock_adjust: false,

  // Caixa
  cash_view: false,
  cash_open: false,
  cash_sangria: false,
  cash_suprimento: false,
  cash_close: false,
  cash_view_other_closings: false,

  // Relatórios
  reports_view: false,
  reports_own_sales: true, // Vendedor pode visualizar o seu próprio perfil e comissões
  reports_all_sales: false,
  reports_stock: false,
  reports_financial: false,
  reports_commission: true,

  // Cadastros
  cadastros_access: false,
  cadastros_customers: false,
  cadastros_products: false,
  cadastros_suppliers: false,
  cadastros_sellers: false,

  // Usuários
  users_view: false,
  users_create: false,
  users_edit: false,
  users_permissions: false,
};

export interface Seller {
  id: string;
  storeId: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  cpf?: string;
  commissionPercentage: number; // e.g. 5 para 5%
  active: boolean;
  permissions: SellerPermissions;
  avatar?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SellerCommission {
  id: string;
  sellerId: string;
  sellerName: string;
  saleId: string;
  saleNumber: number;
  date: string;
  saleAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: 'PENDENTE' | 'PAGA' | 'CANCELADA' | 'ATIVA';
  paidAt?: string;
  storeId: string;
  createdAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export type AuditAction = string;

export type ProductCategory =
  | 'Perfumes'
  | 'Body Splash'
  | 'Hidratantes'
  | 'Desodorantes'
  | 'Kits'
  | 'Maquiagem'
  | 'Cosméticos'
  | 'Cabelos'
  | 'Acessórios'
  | 'Outros';

export type ProductType = 
  | 'Eau de Parfum (EDP)'
  | 'Eau de Toilette (EDT)'
  | 'Eau de Cologne (EDC)'
  | 'Parfum / Extrait'
  | 'Splash'
  | 'Creme / Loção'
  | 'Spray'
  | 'Outro';

export interface Product {
  id: string;
  code: string; // Internal code e.g. PERF-001
  barcode: string; // Barcode e.g. 7891234567890
  name: string;
  brand: string;
  category: ProductCategory;
  productType: ProductType;
  volumeMl: string; // e.g. 100ml, 50ml, 200ml
  fragrance: string; // Olfactory family / notes e.g. Amadeirado Especiado, Floral Doce
  supplierId: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  unit: string; // UN, KIT, CX
  createdAt: string;
  active: boolean;
  imageUrl?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string; // Razão Social
  tradeName: string; // Nome Fantasia
  document: string; // CNPJ ou CPF
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export type StockMovementType =
  | 'ENTRADA_COMPRA'
  | 'ENTRADA_MANUAL'
  | 'SAIDA_VENDA'
  | 'SAIDA_MANUAL'
  | 'AJUSTE_INVENTARIO'
  | 'CANCELAMENTO_VENDA';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: StockMovementType;
  previousStock: number;
  quantity: number; // positive or negative
  newStock: number;
  reason: string;
  userId: string;
  userName: string;
  referenceId?: string; // saleId or purchaseId
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface Purchase {
  id: string;
  invoiceNumber: string; // Número da NF
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export type PaymentMethod =
  | 'DINHEIRO'
  | 'PIX'
  | 'DEBITO'
  | 'CREDITO'
  | 'OUTROS';

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  code: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discount: number; // discount per item or line
  total: number;
}

export interface Sale {
  id: string;
  saleNumber: number;
  date: string;
  cashRegisterId: string;
  userId: string;
  userName: string;
  sellerId?: string;
  sellerName?: string;
  commissionPercentage?: number;
  commissionAmount?: number;
  storeId?: string;
  customerName?: string;
  customerDocument?: string;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  payments: PaymentSplit[];
  status: 'CONCLUIDA' | 'CANCELADA';
  cancelReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
}

export interface CashRegister {
  id: string;
  openedAt: string;
  openedByUserId: string;
  openedByUserName: string;
  initialFund: number;
  openingNotes?: string;
  status: 'OPEN' | 'CLOSED';
  closedAt?: string;
  closedByUserId?: string;
  closedByUserName?: string;
  closingId?: string;
}

export type CashMovementType =
  | 'SUPRIMENTO'
  | 'SANGRIA'
  | 'DESPESA'
  | 'VENDA'
  | 'ESTORNO_VENDA'
  | 'OUTRA_ENTRADA'
  | 'OUTRA_SAIDA';

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  type: CashMovementType;
  direction: 'IN' | 'OUT';
  amount: number;
  paymentMethod?: PaymentMethod;
  reason: string;
  userId: string;
  userName: string;
  referenceId?: string; // saleId if related
  createdAt: string;
}

export interface CashClosing {
  id: string;
  cashRegisterId: string;
  openedAt: string;
  closedAt: string;
  openedByUserName: string;
  closedByUserName: string;
  initialFund: number;
  totalCashSales: number;
  totalPixSales: number;
  totalDebitSales: number;
  totalCreditSales: number;
  totalOtherSales: number;
  totalSupplements: number; // Suprimentos
  totalSangrias: number; // Sangrias
  totalExpenses: number; // Despesas
  totalSales: number;
  expectedDrawerCash: number; // Saldo em dinheiro esperado no gaveteiro
  reportedDrawerCash: number; // Valor contado informado
  difference: number; // reported - expected
  status: 'CORRETO' | 'SOBRA' | 'FALTA';
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  cnpj: string;
  phone: string;
  whatsapp?: string;
  address: string;
  city?: string;
  state?: string;
  receiptFooterMessage: string;
  allowNegativeStock: boolean;
  lowStockThreshold: number;
  defaultMinStock?: number;
  maxDiscountPercent?: number;
}
