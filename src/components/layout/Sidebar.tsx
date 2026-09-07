import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  FileDown,
  Truck,
  Wallet,
  BarChart3,
  History,
  Users,
  UserCheck,
  Settings,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggleCollapse,
}) => {
  const { canAccess, currentUser } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed;
  const toggleCollapse = externalOnToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const products = db.getProducts();
  const lowStockCount = products.filter((p) => p.active && p.currentStock <= p.minStock).length;

  // Exact menu structure requested by user
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'PDV / Vendas', icon: ShoppingCart, highlight: true },
    { id: 'products', label: 'Produtos', icon: Package },
    {
      id: 'stock',
      label: 'Estoque',
      icon: Layers,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200',
    },
    { id: 'purchases', label: 'Entradas', icon: FileDown },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck },
    { id: 'cash', label: 'Caixa', icon: Wallet },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'sellers', label: 'Vendedores', icon: UserCheck },
    { id: 'audit', label: 'Histórico', icon: History },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleSelect = (tabId: string) => {
    if (!canAccess(tabId)) return;
    onSelectTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-stone-900/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 h-full md:h-[calc(100vh-4rem)] bg-white border-r border-stone-200/80 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-xs ${
          isOpenMobile
            ? 'w-64 translate-x-0'
            : isCollapsed
            ? 'w-20 -translate-x-full md:translate-x-0'
            : 'w-64 -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header / Desktop Collapse Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-stone-100">
          <div className={`flex items-center space-x-2 ${isCollapsed ? 'hidden md:hidden' : 'flex'}`}>
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Navegação</span>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg ml-auto"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Toggle Expand/Collapse */}
          <button
            onClick={toggleCollapse}
            className={`hidden md:flex items-center justify-center p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors ${
              isCollapsed ? 'mx-auto' : 'ml-auto'
            }`}
            title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu list */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {menuItems.map((item) => {
            const hasAccess = canAccess(item.id);
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleSelect(item.id)}
                  disabled={!hasAccess}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs font-medium transition-all ${
                    isCollapsed
                      ? 'justify-center p-2.5'
                      : 'justify-between px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-amber-600 text-white font-semibold shadow-sm shadow-amber-900/10'
                      : hasAccess
                      ? item.highlight
                        ? 'bg-amber-50 text-amber-900 hover:bg-amber-100/80 border border-amber-200/60 font-semibold'
                        : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900'
                      : 'text-stone-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-amber-700'
                          : hasAccess
                          ? 'text-stone-500 group-hover:text-amber-700'
                          : 'text-stone-300'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center space-x-1.5 ml-2">
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {!hasAccess && <Lock className="w-3.5 h-3.5 text-stone-300" />}
                    </div>
                  )}

                  {isCollapsed && item.badge !== undefined && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && (
                  <div className="fixed left-20 ml-2 px-2.5 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap flex items-center space-x-2">
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                    {!hasAccess && <Lock className="w-3 h-3 text-stone-400" />}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div className="p-3 border-t border-stone-100 bg-stone-50/70 text-xs text-stone-500">
          {!isCollapsed ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-stone-500">Acesso:</span>
                <span className="text-[10px] font-mono font-semibold uppercase bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                  {currentUser.role}
                </span>
              </div>
              {lowStockCount > 0 && (
                <button
                  onClick={() => handleSelect('stock')}
                  className="w-full flex items-center space-x-2 mt-2 p-2 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 text-left hover:bg-amber-100 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold">{lowStockCount} item(ns)</span> com estoque crítico.
                  </div>
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <span
                className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-mono font-bold text-stone-700"
                title={`Perfil: ${currentUser.role}`}
              >
                {currentUser.role.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

