import React, { useMemo } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  XCircle,
  FileDown,
  Wallet,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  Plus,
  Sparkles,
  Receipt,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { db } from '../services/db';
import { useCash } from '../context/CashContext';
import { Sale, Product } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { isCashOpen, summary: cashSummary } = useCash();
  const products = db.getProducts();
  const sales = db.getSales().filter((s) => s.status === 'CONCLUIDA');
  const purchases = db.getPurchases();

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const stats = useMemo(() => {
    const todaySales = sales.filter((s) => s.date.startsWith(todayStr));
    const todayRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);
    const todayCount = todaySales.length;
    const avgTicket = todayCount > 0 ? todayRevenue / todayCount : 0;
    const totalRevenueAllTime = sales.reduce((acc, s) => acc + s.total, 0);

    const totalStockUnits = products.reduce((acc, p) => acc + (p.active ? p.currentStock : 0), 0);
    const lowStockItems = products.filter((p) => p.active && p.currentStock > 0 && p.currentStock <= p.minStock);
    const zeroStockItems = products.filter((p) => p.active && p.currentStock === 0);

    const totalPurchasesAmount = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

    // Payment methods total (All time & Today)
    const paymentTotals: Record<string, number> = {
      DINHEIRO: 0,
      PIX: 0,
      DEBITO: 0,
      CREDITO: 0,
      OUTROS: 0,
    };

    for (const sale of sales) {
      for (const p of sale.payments) {
        paymentTotals[p.method] = (paymentTotals[p.method] || 0) + p.amount;
      }
    }

    return {
      todayRevenue,
      todayCount,
      totalRevenueAllTime,
      avgTicket,
      totalStockUnits,
      lowStockCount: lowStockItems.length,
      zeroStockCount: zeroStockItems.length,
      totalPurchasesAmount,
      paymentTotals,
    };
  }, [sales, products, purchases, todayStr]);

  // Chart 1: Last 7 Days Sales
  const last7DaysData = useMemo(() => {
    const days: { date: string; label: string; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const daySales = sales.filter((s) => s.date.startsWith(dStr));
      const total = daySales.reduce((acc, s) => acc + s.total, 0);
      days.push({
        date: dStr,
        label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        total: Math.round(total * 100) / 100,
        count: daySales.length,
      });
    }
    return days;
  }, [sales]);

  // Chart 2: Payment Methods Pie
  const paymentChartData = useMemo(() => {
    return [
      { name: 'PIX', value: stats.paymentTotals.PIX || 0 },
      { name: 'Crédito', value: stats.paymentTotals.CREDITO || 0 },
      { name: 'Dinheiro', value: stats.paymentTotals.DINHEIRO || 0 },
      { name: 'Débito', value: stats.paymentTotals.DEBITO || 0 },
      { name: 'Outros', value: stats.paymentTotals.OUTROS || 0 },
    ].filter((item) => item.value > 0);
  }, [stats.paymentTotals]);

  // Chart 3: Top Selling Products
  const topSellingData = useMemo(() => {
    const productSoldMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const s of sales) {
      for (const item of s.items) {
        if (!productSoldMap[item.productId]) {
          productSoldMap[item.productId] = {
            name: item.productName.length > 18 ? item.productName.substring(0, 18) + '...' : item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSoldMap[item.productId].quantity += item.quantity;
        productSoldMap[item.productId].revenue += item.total;
      }
    }

    return Object.values(productSoldMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  // Stock Evolution / by Category
  const categoryStockData = useMemo(() => {
    const catMap: Record<string, number> = {};
    for (const p of products) {
      if (p.active) {
        catMap[p.category] = (catMap[p.category] || 0) + p.currentStock;
      }
    }
    return Object.entries(catMap).map(([category, stock]) => ({
      category,
      stock,
    }));
  }, [products]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome Card */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Painel Executivo da Perfumaria</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Visão Geral do Negócio
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5 max-w-xl">
            Acompanhe o faturamento, indicadores diários de vendas, saúde do estoque e movimentações financeiras.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Abrir PDV / Nova Venda</span>
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 font-medium text-xs sm:text-sm rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4 text-stone-500" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* 8 Modern KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Vendas do dia */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Vendas do Dia</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              R$ {stats.todayRevenue.toFixed(2)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-stone-500 mt-1.5">
              <span className="font-semibold text-emerald-700">R$ {stats.todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span>faturados hoje</span>
            </div>
          </div>
        </div>

        {/* 2. Quantidade de vendas */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Quantidade de Vendas</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              {stats.todayCount}
            </div>
            <div className="text-xs text-stone-500 mt-1.5">
              {stats.todayCount === 1 ? '1 atendimento hoje' : `${stats.todayCount} atendimentos hoje`}
            </div>
          </div>
        </div>

        {/* 3. Faturamento */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Faturamento Acumulado</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              R$ {stats.totalRevenueAllTime.toFixed(2)}
            </div>
            <div className="text-xs text-stone-500 mt-1.5">
              Total consolidado em vendas
            </div>
          </div>
        </div>

        {/* 4. Valor em caixa */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Valor em Caixa</span>
            <div className={`p-2 rounded-xl ${isCashOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              {isCashOpen ? `R$ ${cashSummary.expectedDrawerCash.toFixed(2)}` : 'R$ 0,00'}
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className={`inline-flex items-center space-x-1 font-medium ${isCashOpen ? 'text-emerald-700' : 'text-stone-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isCashOpen ? 'bg-emerald-600' : 'bg-stone-400'}`} />
                <span>{isCashOpen ? 'Caixa em operação' : 'Caixa fechado'}</span>
              </span>
              <button
                onClick={() => onNavigate('cash')}
                className="text-amber-700 hover:text-amber-800 text-[11px] font-semibold"
              >
                Detalhes &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* 5. Produtos em estoque */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Produtos em Estoque</span>
            <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              {stats.totalStockUnits}
            </div>
            <div className="text-xs text-stone-500 mt-1.5 flex items-center justify-between">
              <span>{products.length} perfumes cadastrados</span>
              <button
                onClick={() => onNavigate('stock')}
                className="text-amber-700 hover:text-amber-800 text-[11px] font-semibold"
              >
                Ver grade &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* 6. Estoque baixo */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Estoque Baixo</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-amber-900">
              {stats.lowStockCount}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-stone-500 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{stats.lowStockCount > 0 ? 'Exige reposição imediata' : 'Nenhum alerta crítico'}</span>
            </div>
          </div>
        </div>

        {/* 7. Produtos sem estoque */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Produtos Sem Estoque</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-rose-900">
              {stats.zeroStockCount}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-stone-500 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{stats.zeroStockCount > 0 ? 'Indisponíveis para venda' : 'Nenhum perfume zerado'}</span>
            </div>
          </div>
        </div>

        {/* 8. Ticket médio */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Ticket Médio</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              R$ {stats.avgTicket.toFixed(2)}
            </div>
            <div className="text-xs text-stone-500 mt-1.5">
              Média por atendimento hoje
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section 1: Sales Trend + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vendas dos Últimos 7 Dias */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-stone-900">Faturamento dos Últimos 7 Dias</h2>
              <p className="text-xs text-stone-500">Volume diário de vendas em Reais (R$)</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
            >
              <span>Relatório completo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="label" stroke="#78716c" fontSize={11} tickLine={false} />
                <YAxis stroke="#78716c" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  formatter={(val: number) => [`R$ ${Number(val).toFixed(2)}`, 'Vendas']}
                  labelFormatter={(label) => `Dia: ${label}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    color: '#1c1917',
                    border: '1px solid #e7e5e4',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Vendas por Forma de Pagamento */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-stone-900">Vendas por Forma de Pagamento</h2>
            <p className="text-xs text-stone-500 mb-2">Distribuição por método recebido</p>
          </div>

          <div className="h-48 w-full">
            {paymentChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                Nenhum pagamento registrado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`R$ ${Number(val).toFixed(2)}`, 'Total']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      color: '#1c1917',
                      border: '1px solid #e7e5e4',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-stone-100 pt-3">
            {paymentChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-stone-600 truncate">{item.name}:</span>
                <span className="font-semibold text-stone-900">R$ {item.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section 2: Top Selling Products + Stock by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fragrâncias Mais Vendidas */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-stone-900">Fragrâncias &amp; Produtos Mais Vendidos</h2>
              <p className="text-xs text-stone-500">Classificação por unidades vendidas</p>
            </div>
            <button
              onClick={() => onNavigate('stock')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Ver estoque &rarr;
            </button>
          </div>

          <div className="h-60 w-full">
            {topSellingData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                Nenhuma venda registrada ainda
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellingData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
                  <XAxis type="number" stroke="#78716c" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#78716c" fontSize={11} width={120} tickLine={false} />
                  <Tooltip
                    formatter={(val: number) => [`${val} unidades`, 'Qtd Vendida']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      color: '#1c1917',
                      border: '1px solid #e7e5e4',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="quantity" fill="#10b981" radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Estoque por Categoria */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-stone-900">Estoque Físico por Categoria</h2>
              <p className="text-xs text-stone-500">Unidades disponíveis em estoque ativo</p>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Catálogo &rarr;
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="category" stroke="#78716c" fontSize={10} interval={0} angle={-15} textAnchor="end" height={40} tickLine={false} />
                <YAxis stroke="#78716c" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${val} un`, 'Estoque Atual']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    color: '#1c1917',
                    border: '1px solid #e7e5e4',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="stock" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
