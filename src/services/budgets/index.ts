/**
 * Budget Service
 * Handles budget CRUD and progress calculations
 */

import {eq} from 'drizzle-orm';
import {getDb} from '@database/db';
import {budgets, type Budget, type NewBudget} from '@database/schema';
import {generateUUID, getStartOfMonth, getEndOfMonth} from '@utils';
import {Category} from '@types';
import {getCurrentMonthTransactions, getTransactionsByCategory} from '@services/transactions';
import type {BudgetProgress} from '@types';

/**
 * Create a new budget
 */
export async function createBudget(
  data: Omit<NewBudget, 'id' | 'createdAt'>,
): Promise<Budget> {
  const db = getDb();
  const id = generateUUID();

  const newBudget: NewBudget = {
    ...data,
    id,
    createdAt: new Date(),
  };

  await db.insert(budgets).values(newBudget);

  const [created] = await db.select().from(budgets).where(eq(budgets.id, id));

  return created;
}

/**
 * Get budget by ID
 */
export async function getBudgetById(id: string): Promise<Budget | null> {
  const db = getDb();
  const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
  return budget || null;
}

/**
 * Get budget by category
 */
export async function getBudgetByCategory(category: Category): Promise<Budget | null> {
  const db = getDb();
  const [budget] = await db.select().from(budgets).where(eq(budgets.category, category));
  return budget || null;
}

/**
 * Get all budgets
 */
export async function getAllBudgets(): Promise<Budget[]> {
  const db = getDb();
  return db.select().from(budgets);
}

/**
 * Update budget
 */
export async function updateBudget(
  id: string,
  data: Partial<Omit<Budget, 'id' | 'createdAt'>>,
): Promise<Budget> {
  const db = getDb();

  await db.update(budgets).set(data).where(eq(budgets.id, id));

  const [updated] = await db.select().from(budgets).where(eq(budgets.id, id));

  return updated;
}

/**
 * Delete budget
 */
export async function deleteBudget(id: string): Promise<void> {
  const db = getDb();
  await db.delete(budgets).where(eq(budgets.id, id));
}

/**
 * Calculate budget progress for a category
 */
export async function getBudgetProgress(category: Category): Promise<BudgetProgress | null> {
  const budget = await getBudgetByCategory(category);
  if (!budget) return null;

  const now = new Date();
  const startOfMonth = getStartOfMonth(now);
  const endOfMonth = getEndOfMonth(now);

  const categoryTransactions = await getTransactionsByCategory(category);
  const monthTransactions = categoryTransactions.filter(t => {
    const tDate = new Date(t.transactionDate);
    return tDate >= startOfMonth && tDate <= endOfMonth;
  });

  const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = Math.max(0, budget.monthlyLimit - spent);
  const percentage = Math.min(100, Math.round((spent / budget.monthlyLimit) * 100));

  return {
    budget,
    spent,
    remaining,
    percentage,
  };
}

/**
 * Get progress for all budgets
 */
export async function getAllBudgetProgress(): Promise<BudgetProgress[]> {
  const allBudgets = await getAllBudgets();

  const progressList: BudgetProgress[] = [];

  for (const budget of allBudgets) {
    const progress = await getBudgetProgress(budget.category as Category);
    if (progress) {
      progressList.push(progress);
    }
  }

  return progressList;
}

/**
 * Check if budget is exceeded
 */
export async function isBudgetExceeded(category: Category): Promise<boolean> {
  const progress = await getBudgetProgress(category);
  if (!progress) return false;

  return progress.spent >= progress.budget.monthlyLimit;
}

/**
 * Get budgets that are close to limit (>= 80%)
 */
export async function getBudgetsNearLimit(): Promise<BudgetProgress[]> {
  const allProgress = await getAllBudgetProgress();
  return allProgress.filter(p => p.percentage >= 80);
}

/**
 * Get total budget limit for all categories
 */
export async function getTotalBudgetLimit(): Promise<number> {
  const allBudgets = await getAllBudgets();
  return allBudgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
}

/**
 * Get total spent across all budgeted categories
 */
export async function getTotalSpentInBudgets(): Promise<number> {
  const allProgress = await getAllBudgetProgress();
  return allProgress.reduce((sum, p) => sum + p.spent, 0);
}
