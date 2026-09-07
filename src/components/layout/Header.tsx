import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  CircleDollarSign,
  UserCheck,
  ChevronDown,
  LogOut,
  Menu,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCash } from '../../context/CashContext';
import { db } from '../../services/db';
import { StoreSettings } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
  onNavigate: (tab: string) => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onNavigate, onToggleMobileMenu }) => {
  const { currentUser, users, sellers, loginAs, loginAsSeller, logout } = useAuth();
  const { isCashOpen, summary, activeRegister } = useCash();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const settings: StoreSettings = db.getSettings();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>;
      case 'MANAGER':
        return <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">GERENTE</span>;
      case 'SELLER':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">VENDEDOR</span>;
      case 'CASHIER':
      default:
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">OPERADOR</span>;
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md text-stone-800 border-b border-stone-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left side: Hamburger & Store Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-base sm:text-lg tracking-wide text-stone-900 block leading-tight">
                {settings.storeName}
              </span>
              <span className="text-[10px] tracking-widest text-stone-400 font-medium uppercase hidden sm:block">
                Gestão &amp; PDV de Alta Perfumaria
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Trigger & Date/Time */}
        <div className="hidden lg:flex items-center space-x-4">
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 bg-stone-50 hover:bg-stone-100/80 text-stone-500 hover:text-stone-800 px-3.5 py-1.5 rounded-xl text-xs border border-stone-200 transition-all w-72 justify-between"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span>Buscar produto, venda, código...</span>
            </div>
            <kbd className="bg-white px-1.5 py-0.5 rounded border border-stone-200 text-[10px] text-stone-400 font-mono shadow-2xs">
              /
            </kbd>
          </button>

          <div className="flex items-center space-x-1.5 text-xs text-stone-500 font-mono bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/80">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} •{' '}
              {currentTime.toLocaleTimeString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Right: Cash Status & User Menu */}
        <div className="flex items-center space-x-3">
          {/* Quick Search on mobile/tablet */}
          <button
            onClick={onOpenSearch}
            className="lg:hidden p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl"
            title="Pesquisa rápida"
          >
            <Search className="w-5 h-5 text-amber-600" />
          </button>

          {/* Cash Status Pill */}
          <button
            onClick={() => onNavigate('cash')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isCashOpen
                ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70'
                : 'bg-rose-50/80 text-rose-800 border-rose-200/80 hover:bg-rose-100/70 animate-pulse'
            }`}
            title="Clique para ver o status do caixa"
          >
            <CircleDollarSign className={`w-4 h-4 ${isCashOpen ? 'text-emerald-600' : 'text-rose-600'}`} />
            <div className="text-left hidden sm:block">
              <div className="leading-tight flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${isCashOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="font-semibold">{isCashOpen ? 'Caixa Aberto' : 'Caixa Fechado'}</span>
              </div>
              {isCashOpen && (
                <div className="text-[10px] text-emerald-700 font-mono">
                  Gaveta: R$ {summary.expectedDrawerCash.toFixed(2)}
                </div>
              )}
            </div>
          </button>

          {/* User Profile & Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2.5 p-1.5 pl-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-amber-600 overflow-hidden border border-amber-300 flex items-center justify-center font-bold text-white text-xs shadow-2xs">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name.charAt(0)
                )}
              </div>
              <div className="text-left hidden md:block max-w-[120px]">
                <div className="text-xs font-semibold text-stone-800 truncate">{currentUser?.name.split(' ')[0]}</div>
                <div>{getRoleBadge(currentUser?.role || '')}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-xs">
                <div className="px-3.5 py-2 border-b border-stone-100">
                  <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Usuário Conectado</div>
                  <div className="font-bold text-stone-900 text-sm mt-0.5 truncate">{currentUser.name}</div>
                  <div className="text-stone-500 text-[11px] truncate">{currentUser.email}</div>
                  <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
                </div>

                {/* Switch User presets (ideal for testing all 4 roles!) */}
                <div className="px-3.5 py-2">
                  <div className="text-[11px] font-semibold text-amber-800 mb-1 flex items-center space-x-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Trocar de Usuário (Demonstração):</span>
                  </div>
                  <div className="space-y-1 mt-1.5 max-h-48 overflow-y-auto pr-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          loginAs(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200/80'
                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                        }`}
                      >
                        <span className="truncate">{u.name.split(' ')[0]}</span>
                        {getRoleBadge(u.role)}
                      </button>
                    ))}

                    {sellers.filter((s) => s.active).length > 0 && (
                      <>
                        <div className="pt-2 pb-1 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                          Vendedores Cadastrados
                        </div>
                        {sellers
                          .filter((s) => s.active)
                          .map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                loginAsSeller(s);
                                setShowUserDropdown(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                                currentUser.sellerId === s.id
                                  ? 'bg-purple-50 text-purple-900 font-semibold border border-purple-200/80'
                                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                              }`}
                            >
                              <span className="truncate">{s.name.split(' ')[0]} ({s.commissionPercentage}%)</span>
                              {getRoleBadge('SELLER')}
                            </button>
                          ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-1 px-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair do Sistema</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
