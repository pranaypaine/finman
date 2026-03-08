/**
 * Custom Hooks for FinTrack AI
 */

import {useState, useEffect, useCallback} from 'react';
import * as AccountService from '@services/accounts';
import * as TransactionService from '@services/transactions';
import * as BudgetService from '@services/budgets';
import type {Account, Transaction, Budget, Category, BudgetProgress} from '@types';
import {getStartOfMonth, getEndOfMonth} from '@utils';

/**
 * Hook to fetch and manage accounts
 */
export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AccountService.getAllAccounts();
      setAccounts(data as Account[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {accounts, loading, error, refresh: loadAccounts};
}

/**
 * Hook to fetch transactions with optional filters
 */
export function useTransactions(limit?: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionService.getAllTransactions(limit);
      setTransactions(data as Transaction[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {transactions, loading, error, refresh: loadTransactions};
}

/**
 * Hook to get recent transactions (last 5)
 */
export function useRecentTransactions() {
  return useTransactions(5);
}

/**
 * Hook to calculate monthly spend
 */
export function useMonthlySpend() {
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateSpend = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const now = new Date();
      const startOfMonth = getStartOfMonth(now);
      const endOfMonth = getEndOfMonth(now);
      const total = await TransactionService.getTotalSpent(startOfMonth, endOfMonth);
      setTotalSpend(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate spend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateSpend();
  }, [calculateSpend]);

  return {totalSpend, loading, error, refresh: calculateSpend};
}

/**
 * Hook to get budget status
 */
export function useBudgetStatus() {
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [totalLimit, setTotalLimit] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudgetStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [progress, limit, spent] = await Promise.all([
        BudgetService.getAllBudgetProgress(),
        BudgetService.getTotalBudgetLimit(),
        BudgetService.getTotalSpentInBudgets(),
      ]);
      setBudgetProgress(progress);
      setTotalLimit(limit);
      setTotalSpent(spent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgetStatus();
  }, [loadBudgetStatus]);

  const remainingBudget = totalLimit - totalSpent;
  const percentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return {
    budgetProgress,
    totalLimit,
    totalSpent,
    remainingBudget,
    percentage,
    loading,
    error,
    refresh: loadBudgetStatus,
  };
}

/**
 * Hook to calculate credit card utilization
 */
export function useCardUtilization() {
  const [utilization, setUtilization] = useState(0);
  const [totalLimit, setTotalLimit] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateUtilization = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all credit card accounts
      const creditCards = await AccountService.getCreditCardAccounts();

      if (creditCards.length === 0) {
        setUtilization(0);
        setTotalLimit(0);
        setTotalSpent(0);
        setLoading(false);
        return;
      }

      // Calculate total credit limit
      const limit = creditCards.reduce((sum, card) => sum + (card.creditLimit || 0), 0);

      // Get current month transactions for credit cards
      const now = new Date();
      const startOfMonth = getStartOfMonth(now);
      const endOfMonth = getEndOfMonth(now);

      let spent = 0;
      for (const card of creditCards) {
        const cardTransactions = await TransactionService.getTransactionsByDateRange(
          startOfMonth,
          endOfMonth,
        );
        const cardSpend = cardTransactions
          .filter(t => t.accountId === card.id)
          .reduce((sum, t) => sum + t.amount, 0);
        spent += cardSpend;
      }

      setTotalLimit(limit);
      setTotalSpent(spent);
      setUtilization(limit > 0 ? Math.round((spent / limit) * 100) : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate utilization');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateUtilization();
  }, [calculateUtilization]);

  return {utilization, totalLimit, totalSpent, loading, error, refresh: calculateUtilization};
}

/**
 * Hook to fetch all budgets
 */
export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BudgetService.getAllBudgets();
      setBudgets(data as Budget[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return {budgets, loading, error, refresh: loadBudgets};
}

/**
 * Hook for form state management
 */
export function useForm<T>(initialState: T) {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({...prev, [field]: value}));
    // Clear error when field is changed
    setErrors(prev => ({...prev, [field]: undefined}));
  }, []);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({...prev, [field]: true}));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({...prev, [field]: error}));
  }, []);

  const reset = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldError,
    setValues,
    reset,
  };
}
