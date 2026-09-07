import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CashRegister, CashClosing } from '../types';
import { db } from '../services/db';

export interface CashSummary {
  initialFund: number;
  totalCashSales: number;
  totalPixSales: number;
  totalDebitSales: number;
  totalCreditSales: number;
  totalOtherSales: number;
  totalSales: number;
  totalSupplements: number;
  totalSangrias: number;
  totalExpenses: number;
  expectedDrawerCash: number;
}

interface CashContextType {
  activeRegister: CashRegister | undefined;
  isCashOpen: boolean;
  summary: CashSummary;
  refreshCash: () => void;
  openRegister: (initialFund: number, notes?: string) => { success: boolean; error?: string };
  closeRegister: (reportedCash: number, notes?: string) => { success: boolean; error?: string; closing?: CashClosing };
}

const defaultSummary: CashSummary = {
  initialFund: 0,
  totalCashSales: 0,
  totalPixSales: 0,
  totalDebitSales: 0,
  totalCreditSales: 0,
  totalOtherSales: 0,
  totalSales: 0,
  totalSupplements: 0,
  totalSangrias: 0,
  totalExpenses: 0,
  expectedDrawerCash: 0,
};

const CashContext = createContext<CashContextType | undefined>(undefined);

export const CashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRegister, setActiveRegister] = useState<CashRegister | undefined>(() => db.getActiveCashRegister());
  const [summary, setSummary] = useState<CashSummary>(defaultSummary);

  const calculateSummary = useCallback((register?: CashRegister) => {
    if (!register) {
      setSummary(defaultSummary);
      return;
    }

    const sales = db.getSales().filter((s) => s.cashRegisterId === register.id && s.status === 'CONCLUIDA');
    const movements = db.getCashMovements(register.id);

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

    const totalSales = totalCashSales + totalPixSales + totalDebitSales + totalCreditSales + totalOtherSales;
    const expectedDrawerCash = register.initialFund + totalCashSales + totalSupplements - totalSangrias - totalExpenses;

    setSummary({
      initialFund: register.initialFund,
      totalCashSales,
      totalPixSales,
      totalDebitSales,
      totalCreditSales,
      totalOtherSales,
      totalSales,
      totalSupplements,
      totalSangrias,
      totalExpenses,
      expectedDrawerCash,
    });
  }, []);

  const refreshCash = useCallback(() => {
    const reg = db.getActiveCashRegister();
    setActiveRegister(reg);
    calculateSummary(reg);
  }, [calculateSummary]);

  useEffect(() => {
    refreshCash();
  }, [refreshCash]);

  const openRegister = (initialFund: number, notes?: string) => {
    const res = db.openCashRegister(initialFund, notes);
    if (res.success) {
      refreshCash();
    }
    return res;
  };

  const closeRegister = (reportedCash: number, notes?: string) => {
    if (!activeRegister) {
      return { success: false, error: 'Nenhum caixa aberto.' };
    }
    const res = db.closeCashRegister(activeRegister.id, reportedCash, notes);
    if (res.success) {
      refreshCash();
    }
    return res;
  };

  return (
    <CashContext.Provider
      value={{
        activeRegister,
        isCashOpen: !!activeRegister,
        summary,
        refreshCash,
        openRegister,
        closeRegister,
      }}
    >
      {children}
    </CashContext.Provider>
  );
};

export const useCash = () => {
  const context = useContext(CashContext);
  if (!context) {
    throw new Error('useCash must be used within a CashProvider');
  }
  return context;
};
