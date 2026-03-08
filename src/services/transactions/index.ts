/**
 * Transaction Service
 * Handles CRUD operations for transactions
 */

import {eq, and, gte, lte, desc, sql} from 'drizzle-orm';
import {getDb} from '@database/db';
import {transactions, type Transaction, type NewTransaction} from '@database/schema';
import {generateUUID} from '@utils';
import {Category} from '@types';

/**
 * Create a new transaction
 */
export async function createTransaction(
  data: Omit<NewTransaction, 'id' | 'createdAt'>,
): Promise<Transaction> {
  const db = getDb();
  const id = generateUUID();

  const newTransaction: NewTransaction = {
    ...data,
    id,
    createdAt: new Date(),
  };

  await db.insert(transactions).values(newTransaction);

  const [created] = await db.select().from(transactions).where(eq(transactions.id, id));

  return created;
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(id: string): Promise<Transaction | null> {
  const db = getDb();
  const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
  return transaction || null;
}

/**
 * Get all transactions
 */
export async function getAllTransactions(limit?: number): Promise<Transaction[]> {
  const db = getDb();
  let query = db.select().from(transactions).orderBy(desc(transactions.transactionDate));

  if (limit) {
    query = query.limit(limit) as any;
  }

  return query;
}

/**
 * Get transactions by account
 */
export async function getTransactionsByAccount(
  accountId: string,
  limit?: number,
): Promise<Transaction[]> {
  const db = getDb();
  let query = db
    .select()
    .from(transactions)
    .where(eq(transactions.accountId, accountId))
    .orderBy(desc(transactions.transactionDate));

  if (limit) {
    query = query.limit(limit) as any;
  }

  return query;
}

/**
 * Get transactions by category
 */
export async function getTransactionsByCategory(
  category: Category,
  limit?: number,
): Promise<Transaction[]> {
  const db = getDb();
  let query = db
    .select()
    .from(transactions)
    .where(eq(transactions.category, category))
    .orderBy(desc(transactions.transactionDate));

  if (limit) {
    query = query.limit(limit) as any;
  }

  return query;
}

/**
 * Get transactions in date range
 */
export async function getTransactionsByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<Transaction[]> {
  const db = getDb();
  return db
    .select()
    .from(transactions)
    .where(
      and(
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate),
      ),
    )
    .orderBy(desc(transactions.transactionDate));
}

/**
 * Get transactions for current month
 */
export async function getCurrentMonthTransactions(): Promise<Transaction[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return getTransactionsByDateRange(startOfMonth, endOfMonth);
}

/**
 * Update transaction
 */
export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'createdAt'>>,
): Promise<Transaction> {
  const db = getDb();

  await db.update(transactions).set(data).where(eq(transactions.id, id));

  const [updated] = await db.select().from(transactions).where(eq(transactions.id, id));

  return updated;
}

/**
 * Delete transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
  const db = getDb();
  await db.delete(transactions).where(eq(transactions.id, id));
}

/**
 * Get total spent in date range
 */
export async function getTotalSpent(startDate: Date, endDate: Date): Promise<number> {
  const transactionsList = await getTransactionsByDateRange(startDate, endDate);
  return transactionsList.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Get spend by category in date range
 */
export async function getSpendByCategory(
  startDate: Date,
  endDate: Date,
): Promise<Record<Category, number>> {
  const transactionsList = await getTransactionsByDateRange(startDate, endDate);

  const spendByCategory: Record<string, number> = {};

  transactionsList.forEach(t => {
    spendByCategory[t.category] = (spendByCategory[t.category] || 0) + t.amount;
  });

  return spendByCategory as Record<Category, number>;
}

/**
 * Search transactions by merchant
 */
export async function searchTransactionsByMerchant(merchant: string): Promise<Transaction[]> {
  const db = getDb();
  const searchPattern = `%${merchant.toLowerCase()}%`;

  // Note: SQLite LIKE is case-insensitive by default
  return db
    .select()
    .from(transactions)
    .where(sql`lower(${transactions.merchant}) LIKE ${searchPattern}`)
    .orderBy(desc(transactions.transactionDate));
}
