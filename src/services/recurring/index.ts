/**
 * Recurring Expenses Service
 * Detect and track recurring expenses and subscriptions
 */

import {getDb} from '@database/db';
import {
  recurringExpenses,
  transactions,
  type RecurringExpense,
  type NewRecurringExpense,
} from '@database/schema';
import * as TransactionService from '@services/transactions';
import {generateUUID} from '@utils';
import {desc, eq} from 'drizzle-orm';

/**
 * Get all recurring expenses
 */
export async function getAllRecurringExpenses(): Promise<RecurringExpense[]> {
  const db = getDb();
  return db.select().from(recurringExpenses).orderBy(desc(recurringExpenses.nextDueDate));
}

/**
 * Get recurring expense by ID
 */
export async function getRecurringExpenseById(id: string): Promise<RecurringExpense | null> {
  const db = getDb();
  const [expense] = await db.select().from(recurringExpenses).where(eq(recurringExpenses.id, id));
  return expense || null;
}

/**
 * Create recurring expense
 */
export async function createRecurringExpense(
  data: Omit<NewRecurringExpense, 'id' | 'createdAt'>,
): Promise<RecurringExpense> {
  const db = getDb();
  const id = generateUUID();

  const newExpense: NewRecurringExpense = {
    id,
    ...data,
    createdAt: new Date(),
  };

  await db.insert(recurringExpenses).values(newExpense);
  const [created] = await db.select().from(recurringExpenses).where(eq(recurringExpenses.id, id));
  return created;
}

/**
 * Update recurring expense
 */
export async function updateRecurringExpense(
  id: string,
  data: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>,
): Promise<RecurringExpense | null> {
  const db = getDb();
  await db.update(recurringExpenses).set(data).where(eq(recurringExpenses.id, id));
  const [updated] = await db.select().from(recurringExpenses).where(eq(recurringExpenses.id, id));
  return updated || null;
}

/**
 * Delete recurring expense
 */
export async function deleteRecurringExpense(id: string): Promise<void> {
  const db = getDb();
  await db.delete(recurringExpenses).where(eq(recurringExpenses.id, id));
}

/**
 * Detect recurring patterns from transactions
 */
export async function detectRecurringPatterns(): Promise<
  Array<{
    merchant: string;
    amount: number;
    category: string;
    frequency: string;
    transactions: number;
  }>
> {
  const patterns: Array<{
    merchant: string;
    amount: number;
    category: string;
    frequency: string;
    transactions: number;
  }> = [];

  try {
    // Get all transactions from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const allTransactions = await TransactionService.getTransactionsByDateRange(
      sixMonthsAgo,
      new Date(),
    );

    // Group by merchant
    const merchantGroups: Record<string, typeof allTransactions> = {};
    allTransactions.forEach(t => {
      if (!merchantGroups[t.merchant]) {
        merchantGroups[t.merchant] = [];
      }
      merchantGroups[t.merchant].push(t);
    });

    // Analyze each merchant group
    for (const [merchant, merchantTransactions] of Object.entries(merchantGroups)) {
      // Need at least 3 transactions to detect pattern
      if (merchantTransactions.length < 3) continue;

      // Sort by date
      merchantTransactions.sort(
        (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime(),
      );

      // Check if amounts are similar (within 20% variance)
      const amounts = merchantTransactions.map(t => t.amount);
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const maxVariance = avgAmount * 0.2;
      const isSimilarAmount = amounts.every(amt => Math.abs(amt - avgAmount) <= maxVariance);

      if (!isSimilarAmount) continue;

      // Calculate average days between transactions
      const daysBetween: number[] = [];
      for (let i = 1; i < merchantTransactions.length; i++) {
        const prevDate = new Date(merchantTransactions[i - 1].transactionDate);
        const currDate = new Date(merchantTransactions[i].transactionDate);
        const days = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        daysBetween.push(days);
      }

      const avgDays = daysBetween.reduce((sum, days) => sum + days, 0) / daysBetween.length;

      // Determine frequency
      let frequency = 'monthly';
      if (avgDays < 10) frequency = 'weekly';
      else if (avgDays >= 10 && avgDays <= 35) frequency = 'monthly';
      else if (avgDays >= 80 && avgDays <= 100) frequency = 'quarterly';
      else if (avgDays >= 350 && avgDays <= 380) frequency = 'yearly';
      else continue; // Not a clear pattern

      patterns.push({
        merchant,
        amount: Math.round(avgAmount),
        category: merchantTransactions[0].category,
        frequency,
        transactions: merchantTransactions.length,
      });
    }

    return patterns.sort((a, b) => b.transactions - a.transactions);
  } catch (error) {
    console.error('Error detecting recurring patterns:', error);
    return [];
  }
}

/**
 * Get upcoming recurring expenses (next 30 days)
 */
export async function getUpcomingExpenses(): Promise<RecurringExpense[]> {
  const db = getDb();
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  const allExpenses = await getAllRecurringExpenses();
  return allExpenses.filter(expense => {
    const dueDate = new Date(expense.nextDueDate);
    return dueDate >= now && dueDate <= thirtyDaysFromNow;
  });
}

/**
 * Update next due date after payment
 */
export async function markAsPaid(id: string): Promise<RecurringExpense | null> {
  const expense = await getRecurringExpenseById(id);
  if (!expense) return null;

  const currentDueDate = new Date(expense.nextDueDate);
  let nextDueDate = new Date(currentDueDate);

  switch (expense.frequency) {
    case 'weekly':
      nextDueDate.setDate(currentDueDate.getDate() + 7);
      break;
    case 'monthly':
      nextDueDate.setMonth(currentDueDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDueDate.setMonth(currentDueDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDueDate.setFullYear(currentDueDate.getFullYear() + 1);
      break;
  }

  return updateRecurringExpense(id, {nextDueDate});
}
