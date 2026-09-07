import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Printer,
  Download,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  AlertCircle,
  FileText,
  Filter,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { db } from '../services/db';
import { Sale, Product, PaymentMethod, Seller, SellerCommission } from '../types';

type ReportTab = 'SALES' | 'PRODUCTS' | 'FINANCIAL' | 'STOCK' | 'SELLERS';

const COLORS = ['#d97706', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('SALES');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');

  const sales = db.getSales();
  const products = db.getProducts();
  const cashRegisters = db.getCashRegisters();

  // Filter Sales based on date
  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      const saleDate = new Date(s.createdAt);
      if (dateFilter === 'TODAY') {
        return saleDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'WEEK') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return saleDate >= weekAgo;
      } else if (dateFilter === 'MONTH') {
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        return saleDate >= monthAgo;
      }
      return true;
    });
  }, [sales, dateFilter]);

  // SALES METRICS
  const salesMetrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const totalDiscounts = filteredSales.reduce((acc, s) => acc + s.discountTotal, 0);
    const count = filteredSales.length;
    const avgTicket = count > 0 ? totalRevenue / count : 0;

    let totalCostOfGoods = 0;
    filteredSales.forEach((s) => {
      s.items.forEach((it) => {
        totalCostOfGoods += it.costPrice * it.quantity;
      });
    });

    const grossProfit = totalRevenue - totalCostOfGoods;
    const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Payment methods breakdown
    const methodsMap: Record<string, number> = {};
    filteredSales.forEach((s) => {
      s.payments.forEach((p) => {
        methodsMap[p.method] = (methodsMap[p.method] || 0) + p.amount;
      });
    });

    const paymentChartData = Object.entries(methodsMap).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      totalRevenue,
      totalDiscounts,
      count,
      avgTicket,
      totalCostOfGoods,
      grossProfit,
      margin,
      paymentChartData,
    };
  }, [filteredSales]);

  // PRODUCT RANKING
  const productRankings = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; cost: number }> = {};

    filteredSales.forEach((s) => {
      s.items.forEach((it) => {
        if (!map[it.productId]) {
          map[it.productId] = { name: it.productName, qty: 0, revenue: 0, cost: 0 };
        }
        map[it.productId].qty += it.quantity;
        map[it.productId].revenue += it.total;
        map[it.productId].cost += it.costPrice * it.quantity;
      });
    });

    const sortedByQty = Object.values(map).sort((a, b) => b.qty - a.qty);
    const sortedByRevenue = [...Object.values(map)].sort((a, b) => b.revenue - a.revenue);

    // Identify slow movers (products with zero sales in filtered period)
    const soldIds = new Set(filteredSales.flatMap((s) => s.items.map((i) => i.productId)));
    const slowMovingProducts = products.filter((p) => p.active && !soldIds.has(p.id));

    return {
      topSelling: sortedByQty.slice(0, 8),
      topRevenue: sortedByRevenue.slice(0, 8),
      slowMoving: slowMovingProducts.slice(0, 8),
    };
  }, [filteredSales, products]);

  // STOCK REPORT METRICS
  const stockMetrics = useMemo(() => {
    let costTotal = 0;
    let saleTotal = 0;
    let unitsTotal = 0;
    const lowStockList: Product[] = [];
    const zeroStockList: Product[] = [];

    products.forEach((p) => {
      if (p.active) {
        costTotal += p.currentStock * p.costPrice;
        saleTotal += p.currentStock * p.salePrice;
        unitsTotal += p.currentStock;
        if (p.currentStock === 0) zeroStockList.push(p);
        else if (p.currentStock <= p.minStock) lowStockList.push(p);
      }
    });

    return {
      costTotal,
      saleTotal,
      unitsTotal,
      lowStockList,
      zeroStockList,
    };
  }, [products]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-stone-700" />
            <span>Inteligência &amp; Desempenho Financeiro</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Relatórios Gerenciais
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Relatórios consolidados de faturamento, margem de contribuição (CMV), curva de perfumes e estoque.
          </p>
        </div>

        {/* Print / Export buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs rounded-xl transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Tabs & Period Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Main Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'SALES', label: 'Vendas & Faturamento', icon: TrendingUp },
            { id: 'PRODUCTS', label: 'Perfumes Mais Vendidos', icon: Package },
            { id: 'FINANCIAL', label: 'DRE & Lucratividade (CMV)', icon: DollarSign },
            { id: 'STOCK', label: 'Posição do Estoque', icon: FileText },
            { id: 'SELLERS', label: 'Vendedores & Comissões', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReportTab)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-50/60 hover:bg-stone-100 text-stone-600 border border-stone-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-1 bg-stone-100/80 p-1 rounded-xl text-xs font-medium">
          {[
            { id: 'TODAY', label: 'Hoje' },
            { id: 'WEEK', label: 'Últimos 7 dias' },
            { id: 'MONTH', label: 'Últimos 30 dias' },
            { id: 'ALL', label: 'Histórico Completo' },
          ].map((df) => (
            <button
              key={df.id}
              onClick={() => setDateFilter(df.id as any)}
              className={`px-3 py-1 rounded-lg transition-all ${
                dateFilter === df.id ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SALES & REVENUE */}
      {activeTab === 'SALES' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                Faturamento Total
              </span>
              <div className="text-2xl font-bold font-mono text-stone-900">
                R$ {salesMetrics.totalRevenue.toFixed(2)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">{salesMetrics.count} vendas realizadas</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                Ticket Médio
              </span>
              <div className="text-2xl font-bold font-mono text-stone-900">
                R$ {salesMetrics.avgTicket.toFixed(2)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Por cupom fiscal</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                Lucro Bruto Operacional
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                R$ {salesMetrics.grossProfit.toFixed(2)}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                Margem: {salesMetrics.margin.toFixed(1)}%
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                Descontos Aplicados
              </span>
              <div className="text-2xl font-bold font-mono text-stone-700">
                R$ {salesMetrics.totalDiscounts.toFixed(2)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Concedidos no caixa</span>
            </div>
          </div>

          {/* Sales by Payment Method Chart & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <h3 className="font-semibold text-stone-900 text-sm">Receita por Meio de Pagamento</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesMetrics.paymentChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f0ee" />
                    <XAxis dataKey="name" stroke="#a8a29e" fontSize={11} />
                    <YAxis stroke="#a8a29e" fontSize={11} tickFormatter={(val) => `R$ ${val}`} />
                    <Tooltip
                      formatter={(val: number) => [`R$ ${val.toFixed(2)}`, 'Valor']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4' }}
                    />
                    <Bar dataKey="value" fill="#78716c" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
              <h3 className="font-semibold text-stone-900 text-sm mb-4">Vendas Registradas no Período</h3>
              <div className="border border-stone-200/80 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50/80 text-stone-500 font-medium">
                    <tr>
                      <th className="py-2.5 px-3">Cupom</th>
                      <th className="py-2.5 px-2">Data</th>
                      <th className="py-2.5 px-2">Operador</th>
                      <th className="py-2.5 px-3 text-right">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredSales.slice(0, 10).map((s) => (
                      <tr key={s.id} className="hover:bg-stone-50/50">
                        <td className="py-2 px-3 font-mono font-medium text-stone-800">{s.saleNumber}</td>
                        <td className="py-2 px-2 text-stone-500">
                          {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2 px-2 text-stone-600">{s.cashierName}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">
                          R$ {s.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS RANKING */}
      {activeTab === 'PRODUCTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Volume */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-semibold text-stone-900 text-sm flex items-center space-x-1.5">
              <span>🏆 Perfumes Mais Vendidos (em unidades)</span>
            </h3>
            <div className="space-y-2.5">
              {productRankings.topSelling.length === 0 ? (
                <p className="text-xs text-stone-400 italic">Nenhum produto vendido no período.</p>
              ) : (
                productRankings.topSelling.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-stone-50/60 rounded-xl border border-stone-200/60">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-800 font-semibold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-medium text-stone-900 text-xs">{p.name}</div>
                        <div className="text-[11px] text-stone-500">
                          Receita gerada: R$ {p.revenue.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold font-mono text-sm text-stone-900">{p.qty} un</div>
                      <div className="text-[10px] text-stone-400">vendidas</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Slow Moving / No Sales */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-semibold text-stone-900 text-sm flex items-center space-x-1.5">
              <span>⚠️ Produtos Parados / Sem Venda no Período</span>
            </h3>
            <div className="space-y-2.5">
              {productRankings.slowMoving.length === 0 ? (
                <p className="text-xs text-stone-400 italic">Todos os produtos registraram saída recente.</p>
              ) : (
                productRankings.slowMoving.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-stone-50/60 rounded-xl border border-stone-200/60">
                    <div>
                      <div className="font-medium text-stone-900 text-xs">{p.name}</div>
                      <div className="text-[11px] text-stone-500">
                        {p.brand} • {p.volumeMl} • R$ {p.salePrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold font-mono text-xs text-amber-800">
                        {p.currentStock} {p.unit} em estoque
                      </div>
                      <div className="text-[10px] text-stone-400">Sem saída no período</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL & DRE */}
      {activeTab === 'FINANCIAL' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg">Demonstrativo Simplificado do Resultado (DRE)</h3>
            <p className="text-xs text-stone-500">Cálculo de CMV, faturamento líquido e lucratividade bruta</p>
          </div>

          <div className="max-w-xl mx-auto space-y-2.5 font-mono text-xs sm:text-sm">
            <div className="flex justify-between p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/60">
              <span className="font-medium text-stone-700">(+) Receita Bruta de Vendas</span>
              <span className="font-semibold text-stone-900">
                R$ {(salesMetrics.totalRevenue + salesMetrics.totalDiscounts).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/60 text-stone-600">
              <span className="font-medium">(-) Descontos Concedidos em Balcão</span>
              <span className="font-semibold text-rose-700">- R$ {salesMetrics.totalDiscounts.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-stone-100 rounded-xl border border-stone-200 font-semibold text-stone-900">
              <span>(=) Receita Líquida Real</span>
              <span>R$ {salesMetrics.totalRevenue.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/60 text-stone-600">
              <span className="font-medium">(-) Custo das Mercadorias Vendidas (CMV)</span>
              <span className="font-semibold text-rose-700">- R$ {salesMetrics.totalCostOfGoods.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 font-bold text-base text-emerald-900">
              <span>(=) LUCRO BRUTO DA PERFUMARIA</span>
              <span>R$ {salesMetrics.grossProfit.toFixed(2)}</span>
            </div>

            <div className="text-right text-xs text-stone-500 pt-1">
              Margem de Lucro Bruto Operacional:{' '}
              <strong className="text-emerald-700 font-semibold">{salesMetrics.margin.toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK POSITION */}
      {activeTab === 'STOCK' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                Patrimônio em Estoque (Preço de Custo)
              </span>
              <div className="text-2xl font-bold font-mono text-stone-900">
                R$ {stockMetrics.costTotal.toFixed(2)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Capital investido parado</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                Valor Total em Estoque (Preço de Venda)
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                R$ {stockMetrics.saleTotal.toFixed(2)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Potencial bruto de faturamento</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                Frascos / Unidades Físicas
              </span>
              <div className="text-2xl font-bold font-mono text-stone-900">
                {stockMetrics.unitsTotal} unidades
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Total no inventário ativo</span>
            </div>
          </div>

          {/* Reposição Urgente */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <h3 className="font-semibold text-stone-900 text-sm flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-stone-700" />
              <span>Lista de Compras / Sugestão de Reposição Urgente</span>
            </h3>

            <div className="border border-stone-200/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/80 text-stone-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Perfume</th>
                    <th className="py-2.5 px-2">Marca</th>
                    <th className="py-2.5 px-2 text-center">Estoque Atual</th>
                    <th className="py-2.5 px-2 text-center">Estoque Mínimo</th>
                    <th className="py-2.5 px-3 text-center">Sugestão de Pedido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {[...stockMetrics.zeroStockList, ...stockMetrics.lowStockList].map((p) => {
                    const suggestedOrder = Math.max(10, p.minStock * 2 - p.currentStock);
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 font-medium text-stone-800">{p.name}</td>
                        <td className="py-2.5 px-2 text-stone-500">{p.brand}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-semibold text-rose-700">
                          {p.currentStock} {p.unit}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-stone-500">
                          {p.minStock} {p.unit}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-mono font-medium text-[11px] border border-stone-200">
                            Pedir +{suggestedOrder} un
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* TAB 5: SELLERS & COMMISSIONS */}
      {activeTab === 'SELLERS' && (() => {
        const sellersList = db.getSellers();
        const allCommissions = db.getCommissions();
        const sellerReportData = sellersList.map((seller) => {
          const sellerSales = filteredSales.filter((s) => s.sellerId === seller.id);
          const count = sellerSales.length;
          const revenue = sellerSales.reduce((acc, s) => acc + s.total, 0);
          const avgTicket = count > 0 ? revenue / count : 0;
          const comms = allCommissions.filter((c) => c.sellerId === seller.id && c.status !== 'CANCELADA');
          const totalComm = comms.reduce((acc, c) => acc + c.commissionAmount, 0);
          const paidComm = comms.filter((c) => c.status === 'PAGA').reduce((acc, c) => acc + c.commissionAmount, 0);
          const pendingComm = comms.filter((c) => c.status === 'PENDENTE' || c.status === 'ATIVA').reduce((acc, c) => acc + c.commissionAmount, 0);

          return {
            id: seller.id,
            name: seller.name,
            rate: seller.commissionPercentage,
            active: seller.active,
            salesCount: count,
            revenue,
            avgTicket,
            totalComm,
            paidComm,
            pendingComm,
          };
        }).sort((a, b) => b.revenue - a.revenue);

        const totalSellerRevenue = sellerReportData.reduce((acc, s) => acc + s.revenue, 0);
        const totalSellerComm = sellerReportData.reduce((acc, s) => acc + s.totalComm, 0);
        const totalSellerPending = sellerReportData.reduce((acc, s) => acc + s.pendingComm, 0);

        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                  Vendas Vinculadas a Vendedores
                </span>
                <div className="text-2xl font-bold font-mono text-stone-900">
                  R$ {totalSellerRevenue.toFixed(2)}
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">No período selecionado</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                <span className="text-[11px] font-medium text-purple-600 uppercase tracking-wider block mb-1">
                  Total de Comissões
                </span>
                <div className="text-2xl font-bold font-mono text-purple-900">
                  R$ {totalSellerComm.toFixed(2)}
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">Geradas pela equipe</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider block mb-1">
                  Comissões Pendentes
                </span>
                <div className="text-2xl font-bold font-mono text-amber-700">
                  R$ {totalSellerPending.toFixed(2)}
                </div>
                <span className="text-[11px] text-amber-700 mt-1 block">Aguardando liquidação</span>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <h3 className="font-serif font-bold text-base text-stone-900 mb-4">
                Faturamento por Consultor / Vendedor (R$)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sellerReportData.slice(0, 8)} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip
                      formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-stone-900">
                  Detalhamento Individual por Vendedor
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Vendedor</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-center">% Comissão</th>
                      <th className="p-3.5 text-center">Vendas</th>
                      <th className="p-3.5 text-right">Faturamento Total</th>
                      <th className="p-3.5 text-right">Ticket Médio</th>
                      <th className="p-3.5 text-right">Comissões Geradas</th>
                      <th className="p-3.5 text-right">Pendente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {sellerReportData.map((s) => (
                      <tr key={s.id} className="hover:bg-stone-50/70 transition-colors font-sans">
                        <td className="p-3.5 font-semibold text-stone-900">{s.name}</td>
                        <td className="p-3.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {s.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono">{s.rate}%</td>
                        <td className="p-3.5 text-center font-mono font-bold text-stone-800">{s.salesCount}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-stone-900">R$ {s.revenue.toFixed(2)}</td>
                        <td className="p-3.5 text-right font-mono text-stone-600">R$ {s.avgTicket.toFixed(2)}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-purple-900">R$ {s.totalComm.toFixed(2)}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-amber-700">R$ {s.pendingComm.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
