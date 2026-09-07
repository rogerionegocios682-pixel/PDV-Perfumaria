import {
  Product,
  Supplier,
  StockMovement,
  Purchase,
  Sale,
  CashRegister,
  CashMovement,
  CashClosing,
  AuditLog,
  User,
  StoreSettings,
  PaymentSplit,
  Seller,
  SellerPermissions,
  SellerCommission,
  DEFAULT_SELLER_PERMISSIONS,
} from '../types';

export function hashPassword(plain: string): string {
  if (!plain) return '';
  let hash = 0x811c9dc5;
  for (let i = 0; i < plain.length; i++) {
    hash ^= plain.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return 'hp_' + (hash >>> 0).toString(16).padStart(8, '0') + '_' + plain.length;
}

const STORAGE_KEYS = {
  PRODUCTS: 'perfumaria_products_v1',
  SUPPLIERS: 'perfumaria_suppliers_v1',
  STOCK_MOVEMENTS: 'perfumaria_stock_movements_v1',
  PURCHASES: 'perfumaria_purchases_v1',
  SALES: 'perfumaria_sales_v1',
  CASH_REGISTERS: 'perfumaria_cash_registers_v1',
  CASH_MOVEMENTS: 'perfumaria_cash_movements_v1',
  CASH_CLOSINGS: 'perfumaria_cash_closings_v1',
  AUDIT_LOGS: 'perfumaria_audit_logs_v1',
  USERS: 'perfumaria_users_v1',
  SETTINGS: 'perfumaria_settings_v1',
  CURRENT_USER: 'perfumaria_current_user_v1',
  SELLERS: 'perfumaria_sellers_v1',
  SELLER_COMMISSIONS: 'perfumaria_seller_commissions_v1',
  CURRENT_SELLER: 'perfumaria_current_seller_v1',
};

// Seed Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Carlos Oliveira (Administrador)',
    email: 'admin@elegance.com.br',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'usr_manager',
    name: 'Juliana Mendes (Gerente)',
    email: 'gerente@elegance.com.br',
    role: 'MANAGER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    active: true,
    createdAt: '2026-01-05T08:00:00.000Z',
  },
  {
    id: 'usr_cashier',
    name: 'Renata Souza (Operadora de Caixa)',
    email: 'caixa@elegance.com.br',
    role: 'CASHIER',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    active: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
];

// Seed Suppliers
const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Distribuidora Paris & Grasse Ltda',
    tradeName: 'Paris & Grasse Fragrâncias',
    document: '18.234.567/0001-89',
    phone: '(11) 3456-7890',
    whatsapp: '(11) 98765-4321',
    email: 'contato@parisegrasse.com.br',
    address: 'Av. Paulista, 1500 - Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    contactPerson: 'Pierre Dupont',
    notes: 'Fornecedor oficial de fragrâncias finas importadas e essências nobres.',
    active: true,
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'sup_2',
    name: 'Essência Brasil Cosméticos S/A',
    tradeName: 'Essência Brasil',
    document: '24.891.234/0001-45',
    phone: '(21) 2589-1122',
    whatsapp: '(21) 99887-1122',
    email: 'comercial@essenciabrasil.com.br',
    address: 'Rua das Camélias, 340 - Centro',
    city: 'Rio de Janeiro',
    state: 'RJ',
    contactPerson: 'Marina Albuquerque',
    notes: 'Especialista em body splashes, hidratantes, sabonetes e linhas botânicas.',
    active: true,
    createdAt: '2026-01-12T11:00:00.000Z',
  },
  {
    id: 'sup_3',
    name: 'L’Élégance Importadora e Distribuidora Ltda',
    tradeName: 'L’Élégance Imports',
    document: '32.781.902/0001-12',
    phone: '(41) 3322-8877',
    whatsapp: '(41) 98822-7744',
    email: 'pedidos@leleganceimports.com.br',
    address: 'Rodovia Curitiba-Joinville, km 12',
    city: 'Curitiba',
    state: 'PR',
    contactPerson: 'Lucas Silveira',
    notes: 'Kits especiais de presente, perfumes masculinos de alta fixação e nicho.',
    active: true,
    createdAt: '2026-01-15T09:30:00.000Z',
  },
];

// Seed Products
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    code: 'PERF-001',
    barcode: '7891001002011',
    name: 'Bleu Intense Eau de Parfum',
    brand: 'Chantal Prestige',
    category: 'Perfumes',
    productType: 'Eau de Parfum (EDP)',
    volumeMl: '100ml',
    fragrance: 'Amadeirado Aromático com notas de Cedro e Incenso',
    supplierId: 'sup_1',
    costPrice: 180.0,
    salePrice: 389.9,
    currentStock: 14,
    minStock: 5,
    unit: 'UN',
    createdAt: '2026-01-15T10:00:00.000Z',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&auto=format&fit=crop&q=80',
    notes: 'Best-seller masculino da linha luxo.',
  },
  {
    id: 'prod_2',
    code: 'PERF-002',
    barcode: '7891001002028',
    name: 'Sauvage Extreme Eau de Toilette',
    brand: 'Maison Noir',
    category: 'Perfumes',
    productType: 'Eau de Toilette (EDT)',
    volumeMl: '100ml',
    fragrance: 'Cítrico Especiado com Bergamota e Pimenta Sichuan',
    supplierId: 'sup_3',
    costPrice: 165.0,
    salePrice: 349.9,
    currentStock: 4, // Estoque baixo!
    minStock: 6,
    unit: 'UN',
    createdAt: '2026-01-15T11:00:00.000Z',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&auto=format&fit=crop&q=80',
    notes: 'Alta procura. Repor com urgência.',
  },
  {
    id: 'prod_3',
    code: 'PERF-003',
    barcode: '7891001002035',
    name: 'La Vie Belle & Pure Eau de Parfum',
    brand: 'Chantal Prestige',
    category: 'Perfumes',
    productType: 'Eau de Parfum (EDP)',
    volumeMl: '75ml',
    fragrance: 'Floral Gourmand Doce com Íris Pallida e Pralinê',
    supplierId: 'sup_1',
    costPrice: 210.0,
    salePrice: 459.9,
    currentStock: 8,
    minStock: 4,
    unit: 'UN',
    createdAt: '2026-01-16T14:00:00.000Z',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&auto=format&fit=crop&q=80',
    notes: 'Fragrância ícone feminina.',
  },
  {
    id: 'prod_4',
    code: 'PERF-004',
    barcode: '7891001002042',
    name: 'Golden Seduction Parfum Pour Femme',
    brand: 'Maison Royale',
    category: 'Perfumes',
    productType: 'Parfum / Extrait',
    volumeMl: '80ml',
    fragrance: 'Oriental Floral Ambarado com Jasmim Sambac e Fava Tonka',
    supplierId: 'sup_3',
    costPrice: 240.0,
    salePrice: 520.0,
    currentStock: 0, // Sem estoque!
    minStock: 3,
    unit: 'UN',
    createdAt: '2026-01-18T16:00:00.000Z',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400&auto=format&fit=crop&q=80',
    notes: 'Esgotado após o final de semana.',
  },
  {
    id: 'prod_5',
    code: 'BODY-001',
    barcode: '7891001002059',
    name: 'Body Splash Vanilla Orchid Velvet',
    brand: 'Essência Brasil',
    category: 'Body Splash',
    productType: 'Splash',
    volumeMl: '250ml',
    fragrance: 'Oriental Gourmand com Baunilha de Madagascar e Orquídea',
    supplierId: 'sup_2',
    costPrice: 32.0,
    salePrice: 79.9,
    currentStock: 22,
    minStock: 8,
    unit: 'UN',
    createdAt: '2026-01-20T09:00:00.000Z',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=400&auto=format&fit=crop&q=80',
    notes: 'Excelente margem e alto giro no dia a dia.',
  },
  {
    id: 'prod_6',
    code: 'HIDR-001',
    barcode: '7891001002066',
    name: 'Loção Hidratante Corporal Satin Rose',
    brand: 'Essência Brasil',
    category: 'Hidratantes',
    productType: 'Creme / Loção',
    volumeMl: '200ml',
    fragrance: 'Floral Suave com Manteiga de Karité e Rosas de Maio',
    supplierId: 'sup_2',
    costPrice: 28.0,
    salePrice: 68.0,
    currentStock: 19,
    minStock: 6,
    unit: 'UN',
    createdAt: '2026-01-22T10:00:00.000Z',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-2503612803b9?w=400&auto=format&fit=crop&q=80',
    notes: 'Textura acetinada, absorção rápida.',
  },
  {
    id: 'prod_7',
    code: 'KIT-001',
    barcode: '7891001002073',
    name: 'Kit Presente Luxo Elegance (EDP 50ml + Hidratante 100ml)',
    brand: 'Chantal Prestige',
    category: 'Kits',
    productType: 'Eau de Parfum (EDP)',
    volumeMl: 'Kit Duo',
    fragrance: 'Floral Frutado Sofisticado em caixa rígida para presente',
    supplierId: 'sup_3',
    costPrice: 190.0,
    salePrice: 399.0,
    currentStock: 3, // Estoque baixo!
    minStock: 5,
    unit: 'KIT',
    createdAt: '2026-01-25T11:30:00.000Z',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=400&auto=format&fit=crop&q=80',
    notes: 'Ideal para datas comemorativas e aniversários.',
  },
  {
    id: 'prod_8',
    code: 'DESO-001',
    barcode: '7891001002080',
    name: 'Desodorante Perfumado Silk & Protection Spray',
    brand: 'Essência Brasil',
    category: 'Desodorantes',
    productType: 'Spray',
    volumeMl: '150ml',
    fragrance: 'Floral Fresco sem álcool com proteção 48h',
    supplierId: 'sup_2',
    costPrice: 16.0,
    salePrice: 39.9,
    currentStock: 28,
    minStock: 10,
    unit: 'UN',
    createdAt: '2026-01-28T15:00:00.000Z',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=400&auto=format&fit=crop&q=80',
    notes: 'Item de conveniência complementar no caixa.',
  },
];

// Seed Settings
const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Perfumaria Elegance & Fragrâncias',
  cnpj: '12.345.678/0001-90',
  phone: '(11) 3210-9900',
  address: 'Rua Oscar Freire, 1024 - Jardins, São Paulo - SP',
  receiptFooterMessage: 'Agradecemos a sua preferência! Trocas em até 30 dias com o frasco lacrado.',
  allowNegativeStock: false,
  lowStockThreshold: 5,
};

// Seed Cash Register
const todayStr = new Date().toISOString().split('T')[0];
const INITIAL_CASH_REGISTERS: CashRegister[] = [
  {
    id: 'cr_active',
    openedAt: `${todayStr}T08:30:00.000Z`,
    openedByUserId: 'usr_cashier',
    openedByUserName: 'Renata Souza (Operadora de Caixa)',
    initialFund: 250.0,
    openingNotes: 'Abertura de caixa matutina com troco inicial em notas e moedas.',
    status: 'OPEN',
  },
];

const INITIAL_CASH_MOVEMENTS: CashMovement[] = [
  {
    id: 'cm_open_fund',
    cashRegisterId: 'cr_active',
    type: 'SUPRIMENTO',
    direction: 'IN',
    amount: 250.0,
    reason: 'Fundo inicial de troco para abertura',
    userId: 'usr_cashier',
    userName: 'Renata Souza',
    createdAt: `${todayStr}T08:30:05.000Z`,
  },
];

// Seed Sellers
const INITIAL_SELLERS: Seller[] = [
  {
    id: 'seller_1',
    storeId: 'loja_principal',
    name: 'João da Silva',
    email: 'joao@loja.com',
    passwordHash: hashPassword('123456'),
    phone: '(11) 98123-4567',
    cpf: '123.456.789-01',
    commissionPercentage: 5,
    active: true,
    permissions: { ...DEFAULT_SELLER_PERMISSIONS },
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'seller_2',
    storeId: 'loja_principal',
    name: 'Ana Beatriz Santos',
    email: 'ana@loja.com',
    passwordHash: hashPassword('123456'),
    phone: '(11) 97654-3210',
    cpf: '234.567.890-12',
    commissionPercentage: 7,
    active: true,
    permissions: { ...DEFAULT_SELLER_PERMISSIONS, pos_apply_discount: true },
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'seller_3',
    storeId: 'loja_principal',
    name: 'Marcos Vinícius Oliveira',
    email: 'marcos@loja.com',
    passwordHash: hashPassword('123456'),
    phone: '(11) 96543-2109',
    cpf: '345.678.901-23',
    commissionPercentage: 4,
    active: true,
    permissions: { ...DEFAULT_SELLER_PERMISSIONS },
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
];

// Initial Sales for rich reporting
const INITIAL_SALES: Sale[] = [
  {
    id: 'sale_101',
    saleNumber: 1001,
    date: `${todayStr}T09:45:00.000Z`,
    cashRegisterId: 'cr_active',
    userId: 'usr_cashier',
    userName: 'Renata Souza',
    sellerId: 'seller_1',
    sellerName: 'João da Silva',
    commissionPercentage: 5,
    commissionAmount: 19.5,
    storeId: 'loja_principal',
    customerName: 'Mariana Duarte',
    customerDocument: '123.456.789-00',
    items: [
      {
        productId: 'prod_1',
        productName: 'Bleu Intense Eau de Parfum',
        code: 'PERF-001',
        unitPrice: 389.9,
        costPrice: 180.0,
        quantity: 1,
        discount: 0,
        total: 389.9,
      },
    ],
    subtotal: 389.9,
    discountTotal: 0,
    total: 389.9,
    payments: [{ method: 'CREDITO', amount: 389.9 }],
    status: 'CONCLUIDA',
    createdAt: `${todayStr}T09:45:00.000Z`,
  },
  {
    id: 'sale_102',
    saleNumber: 1002,
    date: `${todayStr}T11:15:00.000Z`,
    cashRegisterId: 'cr_active',
    userId: 'usr_cashier',
    userName: 'Renata Souza',
    sellerId: 'seller_1',
    sellerName: 'João da Silva',
    commissionPercentage: 5,
    commissionAmount: 7.5,
    storeId: 'loja_principal',
    customerName: 'Rodrigo Fontes',
    items: [
      {
        productId: 'prod_5',
        productName: 'Body Splash Vanilla Orchid Velvet',
        code: 'BODY-001',
        unitPrice: 79.9,
        costPrice: 32.0,
        quantity: 2,
        discount: 9.8,
        total: 150.0,
      },
    ],
    subtotal: 159.8,
    discountTotal: 9.8,
    total: 150.0,
    payments: [
      { method: 'DINHEIRO', amount: 50.0 },
      { method: 'PIX', amount: 100.0 },
    ],
    status: 'CONCLUIDA',
    createdAt: `${todayStr}T11:15:00.000Z`,
  },
  {
    id: 'sale_103',
    saleNumber: 1003,
    date: `${todayStr}T14:20:00.000Z`,
    cashRegisterId: 'cr_active',
    userId: 'usr_cashier',
    userName: 'Renata Souza',
    sellerId: 'seller_2',
    sellerName: 'Ana Beatriz Santos',
    commissionPercentage: 7,
    commissionAmount: 35.55,
    storeId: 'loja_principal',
    customerName: 'Camila Vasconcelos',
    items: [
      {
        productId: 'prod_3',
        productName: 'La Vie Belle & Pure Eau de Parfum',
        code: 'PERF-003',
        unitPrice: 459.9,
        costPrice: 210.0,
        quantity: 1,
        discount: 20.0,
        total: 439.9,
      },
      {
        productId: 'prod_6',
        productName: 'Loção Hidratante Corporal Satin Rose',
        code: 'HIDR-001',
        unitPrice: 68.0,
        costPrice: 28.0,
        quantity: 1,
        discount: 0,
        total: 68.0,
      },
    ],
    subtotal: 527.9,
    discountTotal: 20.0,
    total: 507.9,
    payments: [{ method: 'PIX', amount: 507.9 }],
    status: 'CONCLUIDA',
    createdAt: `${todayStr}T14:20:00.000Z`,
  },
];

const INITIAL_SELLER_COMMISSIONS: SellerCommission[] = [
  {
    id: 'comm_1',
    sellerId: 'seller_1',
    sellerName: 'João da Silva',
    saleId: 'sale_101',
    saleNumber: 1001,
    date: `${todayStr}T09:45:00.000Z`,
    saleAmount: 389.9,
    commissionPercentage: 5,
    commissionAmount: 19.5,
    status: 'ATIVA',
    storeId: 'loja_principal',
    createdAt: `${todayStr}T09:45:00.000Z`,
  },
  {
    id: 'comm_2',
    sellerId: 'seller_1',
    sellerName: 'João da Silva',
    saleId: 'sale_102',
    saleNumber: 1002,
    date: `${todayStr}T11:15:00.000Z`,
    saleAmount: 150.0,
    commissionPercentage: 5,
    commissionAmount: 7.5,
    status: 'ATIVA',
    storeId: 'loja_principal',
    createdAt: `${todayStr}T11:15:00.000Z`,
  },
  {
    id: 'comm_3',
    sellerId: 'seller_2',
    sellerName: 'Ana Beatriz Santos',
    saleId: 'sale_103',
    saleNumber: 1003,
    date: `${todayStr}T14:20:00.000Z`,
    saleAmount: 507.9,
    commissionPercentage: 7,
    commissionAmount: 35.55,
    status: 'ATIVA',
    storeId: 'loja_principal',
    createdAt: `${todayStr}T14:20:00.000Z`,
  },
];

// Initial stock movements corresponding to the initial seed
const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm_init_1',
    productId: 'prod_1',
    productName: 'Bleu Intense Eau de Parfum',
    movementType: 'ENTRADA_COMPRA',
    previousStock: 0,
    quantity: 15,
    newStock: 15,
    reason: 'Entrada de compra inicial NF 45890',
    userId: 'usr_admin',
    userName: 'Carlos Oliveira',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'sm_sale_1',
    productId: 'prod_1',
    productName: 'Bleu Intense Eau de Parfum',
    movementType: 'SAIDA_VENDA',
    previousStock: 15,
    quantity: -1,
    newStock: 14,
    reason: 'Venda PDV #1001',
    userId: 'usr_cashier',
    userName: 'Renata Souza',
    referenceId: 'sale_101',
    createdAt: `${todayStr}T09:45:00.000Z`,
  },
  {
    id: 'sm_sale_2',
    productId: 'prod_5',
    productName: 'Body Splash Vanilla Orchid Velvet',
    movementType: 'SAIDA_VENDA',
    previousStock: 24,
    quantity: -2,
    newStock: 22,
    reason: 'Venda PDV #1002',
    userId: 'usr_cashier',
    userName: 'Renata Souza',
    referenceId: 'sale_102',
    createdAt: `${todayStr}T11:15:00.000Z`,
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    userId: 'usr_admin',
    userName: 'Carlos Oliveira (Administrador)',
    action: 'INICIALIZACAO_SISTEMA',
    entity: 'Sistema',
    details: 'Configuração inicial do catálogo de perfumaria e estoque base.',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'log_2',
    userId: 'usr_cashier',
    userName: 'Renata Souza (Operadora de Caixa)',
    action: 'ABERTURA_CAIXA',
    entity: 'Caixa',
    entityId: 'cr_active',
    details: 'Abertura com saldo inicial de R$ 250,00.',
    createdAt: `${todayStr}T08:30:00.000Z`,
  },
  {
    id: 'log_3',
    userId: 'usr_cashier',
    userName: 'Renata Souza (Operadora de Caixa)',
    action: 'VENDA_REALIZADA',
    entity: 'Vendas',
    entityId: 'sale_101',
    details: 'Venda #1001 no valor de R$ 389,90 (1x Crédito).',
    createdAt: `${todayStr}T09:45:00.000Z`,
  },
];

// Database Manager Helper
class DatabaseService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Erro ao carregar dados do storage ${key}:`, e);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Erro ao salvar dados no storage ${key}:`, e);
    }
  }

  public init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      this.set(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASH_REGISTERS)) {
      this.set(STORAGE_KEYS.CASH_REGISTERS, INITIAL_CASH_REGISTERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASH_MOVEMENTS)) {
      this.set(STORAGE_KEYS.CASH_MOVEMENTS, INITIAL_CASH_MOVEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      this.set(STORAGE_KEYS.SALES, INITIAL_SALES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS)) {
      this.set(STORAGE_KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.set(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.set(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SELLERS)) {
      this.set(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SELLER_COMMISSIONS)) {
      this.set(STORAGE_KEYS.SELLER_COMMISSIONS, INITIAL_SELLER_COMMISSIONS);
    }
  }

  // --- USERS & AUTH ---
  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.set(STORAGE_KEYS.USERS, users);
  }

  public getCurrentUser(): User {
    return this.get<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  public setCurrentUser(user: User): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  // --- SELLERS & COMMISSIONS ---
  public getSellers(storeId?: string): Seller[] {
    const list = this.get<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    if (storeId) {
      return list.filter((s) => s.storeId === storeId);
    }
    return list;
  }

  public getSellerById(id: string): Seller | undefined {
    return this.getSellers().find((s) => s.id === id);
  }

  public getSellerByEmail(email: string): Seller | undefined {
    const clean = email.trim().toLowerCase();
    return this.getSellers().find((s) => s.email.trim().toLowerCase() === clean);
  }

  public saveSeller(sellerData: Partial<Seller> & { name: string; email: string; password?: string }): {
    success: boolean;
    error?: string;
    seller?: Seller;
  } {
    const sellers = this.getSellers();
    const cleanEmail = sellerData.email.trim().toLowerCase();

    // Check email uniqueness
    const existingWithEmail = sellers.find(
      (s) => s.email.trim().toLowerCase() === cleanEmail && s.id !== sellerData.id
    );
    if (existingWithEmail) {
      return { success: false, error: 'Já existe um vendedor cadastrado com este e-mail.' };
    }

    const isNew = !sellerData.id;
    const id = sellerData.id || 'seller_' + Date.now();
    const existing = isNew ? null : sellers.find((s) => s.id === id);

    let passwordHash = existing ? existing.passwordHash : '';
    if (sellerData.password && sellerData.password.trim().length > 0) {
      passwordHash = hashPassword(sellerData.password.trim());
    } else if (isNew && !passwordHash) {
      passwordHash = hashPassword('123456');
    }

    const toSave: Seller = {
      id,
      storeId: sellerData.storeId || existing?.storeId || 'loja_principal',
      name: sellerData.name.trim(),
      email: cleanEmail,
      passwordHash,
      phone: sellerData.phone?.trim() || existing?.phone || '',
      cpf: sellerData.cpf?.trim() || existing?.cpf || '',
      commissionPercentage: Number(sellerData.commissionPercentage ?? existing?.commissionPercentage ?? 5),
      active: sellerData.active !== undefined ? sellerData.active : (existing ? existing.active : true),
      permissions: sellerData.permissions || existing?.permissions || { ...DEFAULT_SELLER_PERMISSIONS },
      avatar: sellerData.avatar || existing?.avatar,
      notes: sellerData.notes?.trim() || existing?.notes || '',
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isNew) {
      sellers.push(toSave);
      this.addAuditLog(
        'CADASTRO_VENDEDOR',
        'Vendedores',
        toSave.id,
        `Vendedor "${toSave.name}" cadastrado com comissão de ${toSave.commissionPercentage}%. Status: ${toSave.active ? 'Ativo' : 'Inativo'}.`
      );
    } else {
      const index = sellers.findIndex((s) => s.id === id);
      if (index >= 0) sellers[index] = toSave;
      this.addAuditLog(
        'ALTERACAO_VENDEDOR',
        'Vendedores',
        toSave.id,
        `Dados do vendedor "${toSave.name}" atualizados (Comissão: ${toSave.commissionPercentage}%, Status: ${toSave.active ? 'Ativo' : 'Inativo'}).`
      );
    }

    this.set(STORAGE_KEYS.SELLERS, sellers);
    return { success: true, seller: toSave };
  }

  public toggleSellerStatus(id: string): { success: boolean; error?: string } {
    const sellers = this.getSellers();
    const seller = sellers.find((s) => s.id === id);
    if (!seller) return { success: false, error: 'Vendedor não encontrado.' };

    seller.active = !seller.active;
    seller.updatedAt = new Date().toISOString();
    this.set(STORAGE_KEYS.SELLERS, sellers);

    this.addAuditLog(
      seller.active ? 'ATIVACAO_VENDEDOR' : 'INATIVACAO_VENDEDOR',
      'Vendedores',
      id,
      `Vendedor "${seller.name}" marcado como ${seller.active ? 'Ativo' : 'Inativo'}.`
    );
    return { success: true };
  }

  public changeSellerPassword(id: string, newPasswordPlain: string): { success: boolean; error?: string } {
    if (!newPasswordPlain || newPasswordPlain.trim().length < 4) {
      return { success: false, error: 'A senha deve conter no mínimo 4 caracteres.' };
    }

    const sellers = this.getSellers();
    const seller = sellers.find((s) => s.id === id);
    if (!seller) return { success: false, error: 'Vendedor não encontrado.' };

    seller.passwordHash = hashPassword(newPasswordPlain.trim());
    seller.updatedAt = new Date().toISOString();
    this.set(STORAGE_KEYS.SELLERS, sellers);

    this.addAuditLog(
      'ALTERACAO_SENHA_VENDEDOR',
      'Vendedores',
      id,
      `Senha do vendedor "${seller.name}" alterada com sucesso.`
    );
    return { success: true };
  }

  public updateSellerPermissions(id: string, permissions: SellerPermissions): { success: boolean; error?: string } {
    const sellers = this.getSellers();
    const seller = sellers.find((s) => s.id === id);
    if (!seller) return { success: false, error: 'Vendedor não encontrado.' };

    seller.permissions = permissions;
    seller.updatedAt = new Date().toISOString();
    this.set(STORAGE_KEYS.SELLERS, sellers);

    this.addAuditLog(
      'ALTERACAO_PERMISSOES_VENDEDOR',
      'Vendedores',
      id,
      `Permissões do vendedor "${seller.name}" atualizadas pelo administrador.`
    );
    return { success: true };
  }

  public deleteSeller(id: string): { success: boolean; error?: string } {
    const sellers = this.getSellers();
    const seller = sellers.find((s) => s.id === id);
    if (!seller) return { success: false, error: 'Vendedor não encontrado.' };

    const sales = this.getSales().filter((s) => s.sellerId === id);
    if (sales.length > 0) {
      return {
        success: false,
        error: `Não é possível excluir "${seller.name}" pois existem ${sales.length} vendas vinculadas a este vendedor. Sugerimos inativar o cadastro para preservar o histórico.`,
      };
    }

    const updated = sellers.filter((s) => s.id !== id);
    this.set(STORAGE_KEYS.SELLERS, updated);

    this.addAuditLog('EXCLUSAO_VENDEDOR', 'Vendedores', id, `Vendedor "${seller.name}" excluído do sistema.`);
    return { success: true };
  }

  public getCurrentSeller(): Seller | null {
    return this.get<Seller | null>(STORAGE_KEYS.CURRENT_SELLER, null);
  }

  public setCurrentSeller(seller: Seller | null): void {
    this.set(STORAGE_KEYS.CURRENT_SELLER, seller);
  }

  public getCommissions(sellerId?: string): SellerCommission[] {
    const list = this.get<SellerCommission[]>(STORAGE_KEYS.SELLER_COMMISSIONS, INITIAL_SELLER_COMMISSIONS);
    if (sellerId) {
      return list.filter((c) => c.sellerId === sellerId);
    }
    return list;
  }

  public recordCommission(params: {
    sellerId: string;
    sellerName: string;
    saleId: string;
    saleNumber: number;
    saleAmount: number;
    commissionPercentage: number;
    storeId: string;
    date?: string;
  }): SellerCommission {
    const commissionAmount = Math.round(((params.saleAmount * params.commissionPercentage) / 100) * 100) / 100;
    const newCommission: SellerCommission = {
      id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      saleId: params.saleId,
      saleNumber: params.saleNumber,
      date: params.date || new Date().toISOString(),
      saleAmount: params.saleAmount,
      commissionPercentage: params.commissionPercentage,
      commissionAmount,
      status: 'PENDENTE',
      storeId: params.storeId,
      createdAt: new Date().toISOString(),
    };

    const commissions = this.getCommissions();
    commissions.unshift(newCommission);
    this.set(STORAGE_KEYS.SELLER_COMMISSIONS, commissions);
    return newCommission;
  }

  public markCommissionPaid(commissionId: string): { success: boolean; error?: string } {
    const commissions = this.getCommissions();
    const commission = commissions.find((c) => c.id === commissionId);
    if (!commission) return { success: false, error: 'Comissão não encontrada.' };

    commission.status = 'PAGA';
    commission.paidAt = new Date().toISOString();
    this.set(STORAGE_KEYS.SELLER_COMMISSIONS, commissions);

    this.addAuditLog(
      'PAGAMENTO_COMISSAO',
      'Vendedores',
      commission.sellerId,
      `Comissão de R$ ${commission.commissionAmount.toFixed(2)} (venda #${commission.saleNumber}) para "${commission.sellerName}" marcada como paga.`
    );
    return { success: true };
  }

  public cancelCommission(saleId: string, cancelReason: string): void {
    const commissions = this.getCommissions();
    let updated = false;
    for (const c of commissions) {
      if (c.saleId === saleId && (c.status === 'ATIVA' || c.status === 'PENDENTE')) {
        c.status = 'CANCELADA';
        c.cancelledAt = new Date().toISOString();
        c.cancelReason = cancelReason;
        updated = true;
      }
    }
    if (updated) {
      this.set(STORAGE_KEYS.SELLER_COMMISSIONS, commissions);
    }
  }

  // --- SETTINGS ---
  public getSettings(): StoreSettings {
    return this.get<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public saveSettings(settings: StoreSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
    this.addAuditLog('ALTERACAO_CONFIGURACOES', 'Configurações', undefined, 'Atualização das configurações gerais da loja.');
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.get<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    const isNew = index < 0;

    if (isNew) {
      products.push(product);
      this.addAuditLog('CADASTRO_PRODUTO', 'Produtos', product.id, `Produto "${product.name}" (${product.code}) cadastrado.`);
    } else {
      const old = products[index];
      products[index] = product;
      let diffMsg = `Produto "${product.name}" atualizado.`;
      if (old.salePrice !== product.salePrice) {
        diffMsg += ` Preço de venda alterado de R$ ${old.salePrice.toFixed(2)} para R$ ${product.salePrice.toFixed(2)}.`;
        this.addAuditLog('ALTERACAO_PRECO', 'Produtos', product.id, diffMsg);
      } else {
        this.addAuditLog('ALTERACAO_PRODUTO', 'Produtos', product.id, diffMsg);
      }
    }
    this.set(STORAGE_KEYS.PRODUCTS, products);
  }

  public deleteProduct(id: string): void {
    const products = this.getProducts();
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    // Soft inactivate to preserve history
    prod.active = false;
    this.saveProduct(prod);
    this.addAuditLog('INATIVACAO_PRODUTO', 'Produtos', id, `Produto "${prod.name}" marcado como inativo.`);
  }

  // --- SUPPLIERS ---
  public getSuppliers(): Supplier[] {
    return this.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }

  public saveSupplier(supplier: Supplier): void {
    const list = this.getSuppliers();
    const index = list.findIndex((s) => s.id === supplier.id);
    if (index >= 0) {
      list[index] = supplier;
      this.addAuditLog('ALTERACAO_FORNECEDOR', 'Fornecedores', supplier.id, `Fornecedor "${supplier.name}" atualizado.`);
    } else {
      list.push(supplier);
      this.addAuditLog('CADASTRO_FORNECEDOR', 'Fornecedores', supplier.id, `Fornecedor "${supplier.name}" cadastrado.`);
    }
    this.set(STORAGE_KEYS.SUPPLIERS, list);
  }

  // --- STOCK & MOVEMENTS ---
  public getStockMovements(): StockMovement[] {
    return this.get<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
  }

  public adjustStock(params: {
    productId: string;
    movementType: StockMovement['movementType'];
    quantity: number; // For manual, quantity can be positive or delta
    newTargetStock?: number; // In case of inventory exact count
    reason: string;
    referenceId?: string;
  }): { success: boolean; error?: string } {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === params.productId);
    if (index < 0) return { success: false, error: 'Produto não encontrado.' };

    const product = products[index];
    const prevStock = product.currentStock;
    let computedNewStock = prevStock;
    let movementQty = params.quantity;

    if (params.movementType === 'AJUSTE_INVENTARIO' && params.newTargetStock !== undefined) {
      computedNewStock = params.newTargetStock;
      movementQty = computedNewStock - prevStock;
    } else {
      computedNewStock = prevStock + movementQty;
    }

    const settings = this.getSettings();
    if (computedNewStock < 0 && !settings.allowNegativeStock) {
      return {
        success: false,
        error: `Operação cancelada: Estoque não pode ficar negativo (Atual: ${prevStock}, Tentativa de saída: ${Math.abs(movementQty)}).`,
      };
    }

    product.currentStock = computedNewStock;
    products[index] = product;
    this.set(STORAGE_KEYS.PRODUCTS, products);

    const currentUser = this.getCurrentUser();
    const movement: StockMovement = {
      id: 'sm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      productId: product.id,
      productName: product.name,
      movementType: params.movementType,
      previousStock: prevStock,
      quantity: movementQty,
      newStock: computedNewStock,
      reason: params.reason,
      userId: currentUser.id,
      userName: currentUser.name,
      referenceId: params.referenceId,
      createdAt: new Date().toISOString(),
    };

    const movements = this.getStockMovements();
    movements.unshift(movement);
    this.set(STORAGE_KEYS.STOCK_MOVEMENTS, movements);

    this.addAuditLog(
      'ALTERACAO_ESTOQUE',
      'Estoque',
      product.id,
      `${params.movementType}: Produto "${product.name}" de ${prevStock} para ${computedNewStock} un (${params.reason}).`
    );

    return { success: true };
  }

  // --- PURCHASES (ENTRADAS DE MERCADORIA) ---
  public getPurchases(): Purchase[] {
    return this.get<Purchase[]>(STORAGE_KEYS.PURCHASES, []);
  }

  public recordPurchase(purchase: Omit<Purchase, 'id' | 'createdAt' | 'userId' | 'userName'>): {
    success: boolean;
    purchaseId?: string;
    error?: string;
  } {
    if (!purchase.items.length) {
      return { success: false, error: 'A entrada deve conter ao menos um produto.' };
    }

    const currentUser = this.getCurrentUser();
    const id = 'purch_' + Date.now();
    const newPurchase: Purchase = {
      ...purchase,
      id,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    const products = this.getProducts();

    // Process each item: update stock & update cost price
    for (const item of purchase.items) {
      const prodIndex = products.findIndex((p) => p.id === item.productId);
      if (prodIndex >= 0) {
        const prod = products[prodIndex];
        const oldStock = prod.currentStock;
        prod.currentStock = oldStock + item.quantity;
        // Update cost if provided
        if (item.unitCost > 0) {
          prod.costPrice = item.unitCost;
        }
        products[prodIndex] = prod;

        // Record stock movement
        const movement: StockMovement = {
          id: 'sm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          productId: prod.id,
          productName: prod.name,
          movementType: 'ENTRADA_COMPRA',
          previousStock: oldStock,
          quantity: item.quantity,
          newStock: prod.currentStock,
          reason: `Entrada de Mercadoria NF ${purchase.invoiceNumber} (${purchase.supplierName})`,
          userId: currentUser.id,
          userName: currentUser.name,
          referenceId: id,
          createdAt: new Date().toISOString(),
        };
        const movements = this.getStockMovements();
        movements.unshift(movement);
        this.set(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
      }
    }

    this.set(STORAGE_KEYS.PRODUCTS, products);

    const purchases = this.getPurchases();
    purchases.unshift(newPurchase);
    this.set(STORAGE_KEYS.PURCHASES, purchases);

    this.addAuditLog(
      'ENTRADA_ESTOQUE',
      'Compras / Entradas',
      id,
      `Entrada de mercadorias NF ${purchase.invoiceNumber} de ${purchase.supplierName}. Total: R$ ${purchase.totalAmount.toFixed(2)} (${purchase.items.length} itens).`
    );

    return { success: true, purchaseId: id };
  }

  // --- CASH REGISTERS (CAIXA) ---
  public getCashRegisters(): CashRegister[] {
    return this.get<CashRegister[]>(STORAGE_KEYS.CASH_REGISTERS, INITIAL_CASH_REGISTERS);
  }

  public getActiveCashRegister(): CashRegister | undefined {
    return this.getCashRegisters().find((cr) => cr.status === 'OPEN');
  }

  public openCashRegister(initialFund: number, notes?: string): { success: boolean; error?: string; register?: CashRegister } {
    const active = this.getActiveCashRegister();
    if (active) {
      return { success: false, error: 'Já existe um caixa aberto no momento. Feche o caixa atual antes de abrir um novo.' };
    }

    const currentUser = this.getCurrentUser();
    const id = 'cr_' + Date.now();
    const newRegister: CashRegister = {
      id,
      openedAt: new Date().toISOString(),
      openedByUserId: currentUser.id,
      openedByUserName: currentUser.name,
      initialFund,
      openingNotes: notes,
      status: 'OPEN',
    };

    const registers = this.getCashRegisters();
    registers.unshift(newRegister);
    this.set(STORAGE_KEYS.CASH_REGISTERS, registers);

    // Record initial fund movement
    this.recordCashMovement({
      cashRegisterId: id,
      type: 'SUPRIMENTO',
      direction: 'IN',
      amount: initialFund,
      reason: 'Fundo inicial de troco para abertura',
    });

    this.addAuditLog(
      'ABERTURA_CAIXA',
      'Caixa',
      id,
      `Caixa aberto por ${currentUser.name} com fundo de troco de R$ ${initialFund.toFixed(2)}.`
    );

    return { success: true, register: newRegister };
  }

  public getCashMovements(registerId?: string): CashMovement[] {
    const list = this.get<CashMovement[]>(STORAGE_KEYS.CASH_MOVEMENTS, INITIAL_CASH_MOVEMENTS);
    if (registerId) {
      return list.filter((m) => m.cashRegisterId === registerId);
    }
    return list;
  }

  public recordCashMovement(params: {
    cashRegisterId: string;
    type: CashMovement['type'];
    direction: 'IN' | 'OUT';
    amount: number;
    paymentMethod?: CashMovement['paymentMethod'];
    reason: string;
    referenceId?: string;
  }): { success: boolean; error?: string } {
    const active = this.getCashRegisters().find((c) => c.id === params.cashRegisterId);
    if (!active || active.status !== 'OPEN') {
      return { success: false, error: 'O caixa informado não está aberto.' };
    }

    const currentUser = this.getCurrentUser();
    const movement: CashMovement = {
      id: 'cm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      cashRegisterId: params.cashRegisterId,
      type: params.type,
      direction: params.direction,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      reason: params.reason,
      userId: currentUser.id,
      userName: currentUser.name,
      referenceId: params.referenceId,
      createdAt: new Date().toISOString(),
    };

    const list = this.getCashMovements();
    list.unshift(movement);
    this.set(STORAGE_KEYS.CASH_MOVEMENTS, list);

    this.addAuditLog(
      params.type,
      'Caixa',
      params.cashRegisterId,
      `Movimentação de caixa: ${params.type} (${params.direction === 'IN' ? '+' : '-'} R$ ${params.amount.toFixed(2)}). Motivo: ${params.reason}.`
    );

    return { success: true };
  }

  public closeCashRegister(registerId: string, reportedDrawerCash: number, notes?: string): {
    success: boolean;
    error?: string;
    closing?: CashClosing;
  } {
    const registers = this.getCashRegisters();
    const index = registers.findIndex((r) => r.id === registerId && r.status === 'OPEN');
    if (index < 0) {
      return { success: false, error: 'Caixa aberto não encontrado para fechamento.' };
    }

    const reg = registers[index];
    const currentUser = this.getCurrentUser();

    // Check permissions
    if (currentUser.role === 'CASHIER' && reg.openedByUserId !== currentUser.id) {
      // Cashier can only close their own register
      return { success: false, error: 'Operador só pode fechar o caixa aberto por ele próprio.' };
    }

    // Calculate totals for this cash register
    const sales = this.getSales().filter((s) => s.cashRegisterId === registerId && s.status === 'CONCLUIDA');
    const movements = this.getCashMovements(registerId);

    let totalCashSales = 0;
    let totalPixSales = 0;
    let totalDebitSales = 0;
    let totalCreditSales = 0;
    let totalOtherSales = 0;

    for (const sale of sales) {
      for (const p of sale.payments) {
        if (p.method === 'DINHEIRO') totalCashSales += p.amount;
        else if (p.method === 'PIX') totalPixSales += p.amount;
        else if (p.method === 'DEBITO') totalDebitSales += p.amount;
        else if (p.method === 'CREDITO') totalCreditSales += p.amount;
        else totalOtherSales += p.amount;
      }
    }

    let totalSupplements = 0;
    let totalSangrias = 0;
    let totalExpenses = 0;

    for (const m of movements) {
      if (m.type === 'SUPRIMENTO' && m.reason !== 'Fundo inicial de troco para abertura') {
        totalSupplements += m.amount;
      } else if (m.type === 'SANGRIA') {
        totalSangrias += m.amount;
      } else if (m.type === 'DESPESA' || m.type === 'OUTRA_SAIDA') {
        totalExpenses += m.amount;
      }
    }

    // Expected Drawer Cash in physical bills:
    // Initial Fund + Cash Sales + Supplements - Sangrias - Expenses
    const expectedDrawerCash = reg.initialFund + totalCashSales + totalSupplements - totalSangrias - totalExpenses;
    const difference = reportedDrawerCash - expectedDrawerCash;

    let status: CashClosing['status'] = 'CORRETO';
    if (Math.abs(difference) < 0.01) {
      status = 'CORRETO';
    } else if (difference > 0) {
      status = 'SOBRA';
    } else {
      status = 'FALTA';
    }

    const closingId = 'close_' + Date.now();
    const closing: CashClosing = {
      id: closingId,
      cashRegisterId: registerId,
      openedAt: reg.openedAt,
      closedAt: new Date().toISOString(),
      openedByUserName: reg.openedByUserName,
      closedByUserName: currentUser.name,
      initialFund: reg.initialFund,
      totalCashSales,
      totalPixSales,
      totalDebitSales,
      totalCreditSales,
      totalOtherSales,
      totalSupplements,
      totalSangrias,
      totalExpenses,
      totalSales: totalCashSales + totalPixSales + totalDebitSales + totalCreditSales + totalOtherSales,
      expectedDrawerCash,
      reportedDrawerCash,
      difference,
      status,
      notes,
      createdAt: new Date().toISOString(),
    };

    // Save closing
    const closings = this.getCashClosings();
    closings.unshift(closing);
    this.set(STORAGE_KEYS.CASH_CLOSINGS, closings);

    // Update register
    reg.status = 'CLOSED';
    reg.closedAt = closing.closedAt;
    reg.closedByUserId = currentUser.id;
    reg.closedByUserName = currentUser.name;
    reg.closingId = closingId;
    registers[index] = reg;
    this.set(STORAGE_KEYS.CASH_REGISTERS, registers);

    this.addAuditLog(
      'FECHAMENTO_CAIXA',
      'Caixa',
      registerId,
      `Fechamento de caixa por ${currentUser.name}. Esperado: R$ ${expectedDrawerCash.toFixed(2)}, Contado: R$ ${reportedDrawerCash.toFixed(2)} (Status: ${status}, Dif: R$ ${difference.toFixed(2)}).`
    );

    return { success: true, closing };
  }

  public getCashClosings(): CashClosing[] {
    return this.get<CashClosing[]>(STORAGE_KEYS.CASH_CLOSINGS, []);
  }

  // --- SALES & POS ---
  public getSales(): Sale[] {
    return this.get<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
  }

  public createSale(params: {
    items: Sale['items'];
    payments: PaymentSplit[];
    subtotal: number;
    discountTotal: number;
    total: number;
    customerName?: string;
    customerDocument?: string;
    sellerId?: string;
    sellerName?: string;
  }): { success: boolean; sale?: Sale; error?: string } {
    const activeRegister = this.getActiveCashRegister();
    if (!activeRegister) {
      return {
        success: false,
        error: 'O caixa está FECHADO. É obrigatório abrir o caixa antes de realizar qualquer venda!',
      };
    }

    if (!params.items.length) {
      return { success: false, error: 'O carrinho está vazio.' };
    }

    const totalPaid = params.payments.reduce((acc, p) => acc + p.amount, 0);
    if (Math.abs(totalPaid - params.total) > 0.05) {
      return {
        success: false,
        error: `O valor dos pagamentos (R$ ${totalPaid.toFixed(2)}) não coincide com o total da venda (R$ ${params.total.toFixed(2)}).`,
      };
    }

    // Verify stock availability
    const products = this.getProducts();
    const settings = this.getSettings();

    for (const item of params.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Produto "${item.productName}" não encontrado.` };
      }
      if (prod.currentStock < item.quantity && !settings.allowNegativeStock) {
        return {
          success: false,
          error: `Estoque insuficiente para "${prod.name}". Solicitado: ${item.quantity}, Disponível: ${prod.currentStock}.`,
        };
      }
    }

    // Decrement stock and write stock movements
    const currentUser = this.getCurrentUser();
    const saleId = 'sale_' + Date.now();
    const allSales = this.getSales();
    const nextSaleNum = allSales.length > 0 ? Math.max(...allSales.map((s) => s.saleNumber || 1000)) + 1 : 1001;

    for (const item of params.items) {
      const prodIndex = products.findIndex((p) => p.id === item.productId);
      const prod = products[prodIndex];
      const prevStock = prod.currentStock;
      prod.currentStock = prevStock - item.quantity;
      products[prodIndex] = prod;

      const movement: StockMovement = {
        id: 'sm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        productId: prod.id,
        productName: prod.name,
        movementType: 'SAIDA_VENDA',
        previousStock: prevStock,
        quantity: -item.quantity,
        newStock: prod.currentStock,
        reason: `Venda PDV #${nextSaleNum}`,
        userId: currentUser.id,
        userName: currentUser.name,
        referenceId: saleId,
        createdAt: new Date().toISOString(),
      };
      const movements = this.getStockMovements();
      movements.unshift(movement);
      this.set(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
    }
    this.set(STORAGE_KEYS.PRODUCTS, products);

    // Resolve seller & commission calculation
    let resolvedSellerId: string | undefined = undefined;
    let resolvedSellerName: string | undefined = undefined;
    let commissionPercentage: number | undefined = undefined;
    let commissionAmount: number | undefined = undefined;

    const targetSellerId = params.sellerId || (currentUser.sellerId ? currentUser.sellerId : undefined);
    if (targetSellerId) {
      const seller = this.getSellerById(targetSellerId);
      if (seller && seller.active) {
        resolvedSellerId = seller.id;
        resolvedSellerName = seller.name;
        commissionPercentage = seller.commissionPercentage;
        commissionAmount = Math.round(((params.total * seller.commissionPercentage) / 100) * 100) / 100;

        // Record individual commission
        this.recordCommission({
          sellerId: seller.id,
          sellerName: seller.name,
          saleId,
          saleNumber: nextSaleNum,
          saleAmount: params.total,
          commissionPercentage: seller.commissionPercentage,
          storeId: seller.storeId || 'loja_principal',
        });
      }
    }

    // Create Sale record
    const newSale: Sale = {
      id: saleId,
      saleNumber: nextSaleNum,
      date: new Date().toISOString(),
      cashRegisterId: activeRegister.id,
      userId: currentUser.id,
      userName: currentUser.name,
      sellerId: resolvedSellerId,
      sellerName: resolvedSellerName,
      commissionPercentage,
      commissionAmount,
      storeId: 'loja_principal',
      customerName: params.customerName?.trim() || undefined,
      customerDocument: params.customerDocument?.trim() || undefined,
      items: params.items,
      subtotal: params.subtotal,
      discountTotal: params.discountTotal,
      total: params.total,
      payments: params.payments,
      status: 'CONCLUIDA',
      createdAt: new Date().toISOString(),
    };

    allSales.unshift(newSale);
    this.set(STORAGE_KEYS.SALES, allSales);

    // Register cash movements for each payment
    for (const p of params.payments) {
      this.recordCashMovement({
        cashRegisterId: activeRegister.id,
        type: 'VENDA',
        direction: 'IN',
        amount: p.amount,
        paymentMethod: p.method,
        reason: `Venda #${nextSaleNum} (${p.method})`,
        referenceId: saleId,
      });
    }

    const sellerLogMsg = resolvedSellerName
      ? ` Vendedor: ${resolvedSellerName} (Comissão: R$ ${commissionAmount?.toFixed(2) || '0.00'} / ${commissionPercentage}%).`
      : '';

    this.addAuditLog(
      'VENDA_REALIZADA',
      'Vendas',
      saleId,
      `Venda #${nextSaleNum} finalizada com sucesso. Total: R$ ${params.total.toFixed(2)} (${params.items.length} itens). Operador: ${currentUser.name}.${sellerLogMsg}`
    );

    return { success: true, sale: newSale };
  }

  public cancelSale(saleId: string, reason: string): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (currentUser.role === 'CASHIER') {
      return { success: false, error: 'Apenas Administradores e Gerentes podem cancelar vendas.' };
    }

    const sales = this.getSales();
    const index = sales.findIndex((s) => s.id === saleId);
    if (index < 0) return { success: false, error: 'Venda não encontrada.' };

    const sale = sales[index];
    if (sale.status === 'CANCELADA') {
      return { success: false, error: 'Esta venda já foi cancelada anteriormente.' };
    }

    // Return items to stock
    const products = this.getProducts();
    for (const item of sale.items) {
      const prodIndex = products.findIndex((p) => p.id === item.productId);
      if (prodIndex >= 0) {
        const prod = products[prodIndex];
        const prevStock = prod.currentStock;
        prod.currentStock = prevStock + item.quantity;
        products[prodIndex] = prod;

        const movement: StockMovement = {
          id: 'sm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          productId: prod.id,
          productName: prod.name,
          movementType: 'CANCELAMENTO_VENDA',
          previousStock: prevStock,
          quantity: item.quantity,
          newStock: prod.currentStock,
          reason: `Estorno de venda #${sale.saleNumber} (${reason})`,
          userId: currentUser.id,
          userName: currentUser.name,
          referenceId: saleId,
          createdAt: new Date().toISOString(),
        };
        const movements = this.getStockMovements();
        movements.unshift(movement);
        this.set(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
      }
    }
    this.set(STORAGE_KEYS.PRODUCTS, products);

    // Cancel sale record
    sale.status = 'CANCELADA';
    sale.cancelReason = reason;
    sale.cancelledAt = new Date().toISOString();
    sale.cancelledBy = currentUser.name;
    sales[index] = sale;
    this.set(STORAGE_KEYS.SALES, sales);

    // Cancel associated commission to ensure cancelled sale does not generate commission
    this.cancelCommission(saleId, reason);

    // Record cash reversal movement if register is still open
    const activeReg = this.getActiveCashRegister();
    if (activeReg && activeReg.id === sale.cashRegisterId) {
      this.recordCashMovement({
        cashRegisterId: activeReg.id,
        type: 'ESTORNO_VENDA',
        direction: 'OUT',
        amount: sale.total,
        reason: `Cancelamento da Venda #${sale.saleNumber}: ${reason}`,
        referenceId: saleId,
      });
    }

    this.addAuditLog(
      'VENDA_CANCELADA',
      'Vendas',
      saleId,
      `Venda #${sale.saleNumber} cancelada por ${currentUser.name}. Motivo: ${reason}. Produtos devolvidos ao estoque e comissão estornada.`
    );

    return { success: true };
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  public addAuditLog(action: string, entity: string, entityId?: string, details: string = ''): void {
    const currentUser = this.getCurrentUser();
    const log: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      action,
      entity,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    const logs = this.getAuditLogs();
    logs.unshift(log);
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // --- BACKUP & RESTORE ---
  public exportBackup(): string {
    const backupData = {
      exportedAt: new Date().toISOString(),
      version: '1.1',
      products: this.getProducts(),
      suppliers: this.getSuppliers(),
      stockMovements: this.getStockMovements(),
      purchases: this.getPurchases(),
      sales: this.getSales(),
      cashRegisters: this.getCashRegisters(),
      cashMovements: this.getCashMovements(),
      cashClosings: this.getCashClosings(),
      auditLogs: this.getAuditLogs(),
      users: this.getUsers(),
      sellers: this.getSellers(),
      sellerCommissions: this.getCommissions(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  public importBackup(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.products || !data.sales) {
        return { success: false, error: 'Arquivo de backup inválido.' };
      }
      if (data.products) this.set(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.suppliers) this.set(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      if (data.stockMovements) this.set(STORAGE_KEYS.STOCK_MOVEMENTS, data.stockMovements);
      if (data.purchases) this.set(STORAGE_KEYS.PURCHASES, data.purchases);
      if (data.sales) this.set(STORAGE_KEYS.SALES, data.sales);
      if (data.cashRegisters) this.set(STORAGE_KEYS.CASH_REGISTERS, data.cashRegisters);
      if (data.cashMovements) this.set(STORAGE_KEYS.CASH_MOVEMENTS, data.cashMovements);
      if (data.cashClosings) this.set(STORAGE_KEYS.CASH_CLOSINGS, data.cashClosings);
      if (data.auditLogs) this.set(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
      if (data.users) this.set(STORAGE_KEYS.USERS, data.users);
      if (data.sellers) this.set(STORAGE_KEYS.SELLERS, data.sellers);
      if (data.sellerCommissions) this.set(STORAGE_KEYS.SELLER_COMMISSIONS, data.sellerCommissions);
      if (data.settings) this.set(STORAGE_KEYS.SETTINGS, data.settings);

      this.addAuditLog('RESTAURACAO_BACKUP', 'Sistema', undefined, 'Restauração de banco de dados a partir de arquivo de backup.');
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Erro ao processar arquivo JSON: ' + (e as Error).message };
    }
  }

  public resetToFactory(): void {
    localStorage.clear();
    this.init();
  }
}

export const db = new DatabaseService();
db.init();
