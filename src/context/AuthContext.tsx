import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Seller, SellerPermissions, DEFAULT_SELLER_PERMISSIONS } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  currentUser: User;
  users: User[];
  sellers: Seller[];
  currentSeller: Seller | null;
  loginAs: (user: User) => void;
  loginAsSeller: (seller: Seller) => void;
  canAccess: (module: string) => boolean;
  hasPermission: (permissionKey: keyof SellerPermissions) => boolean;
  refreshUsers: () => void;
  refreshSellers: () => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => db.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [sellers, setSellers] = useState<Seller[]>(() => db.getSellers());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const refreshUsers = () => {
    setUsers(db.getUsers());
  };

  const refreshSellers = () => {
    setSellers(db.getSellers());
  };

  const currentSeller = currentUser?.sellerId ? db.getSellerById(currentUser.sellerId) || null : null;

  const loginAs = (user: User) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
    setIsLoggedIn(true);
    db.addAuditLog('LOGIN', 'Autenticação', user.id, `Usuário ${user.name} (${user.role}) efetuou login no sistema.`);
  };

  const loginAsSeller = (seller: Seller) => {
    const sellerUser: User = {
      id: 'usr_' + seller.id,
      name: seller.name,
      email: seller.email,
      role: 'SELLER',
      active: seller.active,
      avatar: seller.avatar,
      sellerId: seller.id,
      createdAt: seller.createdAt,
    };
    db.setCurrentUser(sellerUser);
    setCurrentUser(sellerUser);
    setIsLoggedIn(true);
    db.addAuditLog('LOGIN_VENDEDOR', 'Vendedores', seller.id, `Vendedor ${seller.name} efetuou login no PDV/Sistema.`);
  };

  const logout = () => {
    setIsLoggedIn(false);
    db.addAuditLog('LOGOUT', 'Autenticação', currentUser.id, `Usuário ${currentUser.name} efetuou logout.`);
  };

  const hasPermission = (permissionKey: keyof SellerPermissions): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'MANAGER') return true;

    if (currentUser.role === 'SELLER') {
      const seller = currentSeller || (currentUser.sellerId ? db.getSellerById(currentUser.sellerId) : null);
      if (!seller || !seller.active) return false;
      return !!seller.permissions?.[permissionKey];
    }

    // Cashier role
    if (currentUser.role === 'CASHIER') {
      if (permissionKey === 'pos_access' || permissionKey === 'pos_make_sales') return true;
      if (permissionKey === 'pos_apply_discount') return true;
      if (permissionKey === 'cash_view' || permissionKey === 'cash_open' || permissionKey === 'cash_close') return true;
      return false;
    }

    return false;
  };

  const canAccess = (module: string): boolean => {
    if (!currentUser) return false;
    const role: UserRole = currentUser.role;
    const mod = module.toLowerCase();

    if (role === 'ADMIN') return true;

    if (role === 'MANAGER') {
      // Manager has access to: Dashboard, Produtos, Estoque, Fornecedores, Vendas/PDV, Caixa, Relatórios, Auditoria/Histórico, Vendedores
      const allowed = ['dashboard', 'pos', 'products', 'stock', 'purchases', 'suppliers', 'cash', 'reports', 'audit', 'sellers'];
      return allowed.includes(mod);
    }

    if (role === 'CASHIER') {
      // Cashier has access only to: PDV/Vendas, Caixa (Abertura, Movimentações permitidas, Fechamento)
      const allowed = ['pos', 'cash'];
      return allowed.includes(mod);
    }

    if (role === 'SELLER') {
      const seller = currentSeller || (currentUser.sellerId ? db.getSellerById(currentUser.sellerId) : null);
      const perms = seller?.permissions || DEFAULT_SELLER_PERMISSIONS;

      if (mod === 'pos') return !!perms.pos_access;
      if (mod === 'products') return !!perms.products_view;
      if (mod === 'stock') return !!perms.stock_view;
      if (mod === 'purchases') return !!perms.stock_record_entry;
      if (mod === 'suppliers') return !!perms.cadastros_suppliers;
      if (mod === 'cash') return !!perms.cash_view;
      if (mod === 'reports') return !!(perms.reports_view || perms.reports_own_sales || perms.reports_commission);
      if (mod === 'sellers') return !!perms.cadastros_sellers;
      if (mod === 'users') return !!perms.users_view;
      if (mod === 'audit') return false;
      if (mod === 'settings') return false;
      if (mod === 'dashboard') return false;

      return false;
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        sellers,
        currentSeller,
        loginAs,
        loginAsSeller,
        canAccess,
        hasPermission,
        refreshUsers,
        refreshSellers,
        logout,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
