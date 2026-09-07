import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CashProvider } from './context/CashContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Products } from './pages/Products';
import { Stock } from './pages/Stock';
import { Purchases } from './pages/Purchases';
import { Suppliers } from './pages/Suppliers';
import { Cash } from './pages/Cash';
import { Reports } from './pages/Reports';
import { Audit } from './pages/Audit';
import { Users } from './pages/Users';
import { Sellers } from './pages/Sellers';
import { Settings } from './pages/Settings';

import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AppContent: React.FC = () => {
  const { canAccess, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Keyboard Shortcuts (e.g., '/' for search, 'F2' for POS, 'Escape' to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (canAccess('pos')) setActiveTab('pos');
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (canAccess('products')) setActiveTab('products');
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, canAccess]);

  const renderCurrentView = () => {
    // Check RBAC permission for the active tab
    if (!canAccess(activeTab)) {
      return (
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">Acesso Restrito</h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              O seu perfil de acesso atual (<strong className="font-semibold text-stone-900">{currentUser.role}</strong>)
              não possui permissão para acessar o módulo <strong>{activeTab.toUpperCase()}</strong>.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'pos':
        return <POS onNavigate={setActiveTab} />;
      case 'products':
        return <Products />;
      case 'stock':
        return <Stock />;
      case 'purchases':
        return <Purchases />;
      case 'suppliers':
        return <Suppliers />;
      case 'cash':
        return <Cash />;
      case 'reports':
        return <Reports />;
      case 'audit':
        return <Audit />;
      case 'users':
        return <Users />;
      case 'sellers':
        return <Sellers />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigate={setActiveTab}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CashProvider>
        <AppContent />
      </CashProvider>
    </AuthProvider>
  );
}
