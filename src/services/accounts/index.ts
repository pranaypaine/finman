/**
 * Account Service
 * Handles CRUD operations for accounts
 */

import {eq} from 'drizzle-orm';
import {getDb} from '@database/db';
import {accounts, type Account, type NewAccount} from '@database/schema';
import {generateUUID} from '@utils';
import {AccountType} from '@types';

/**
 * Create a new account
 */
export async function createAccount(
  data: Omit<NewAccount, 'id' | 'createdAt'>,
): Promise<Account> {
  const db = getDb();
  const id = generateUUID();

  const newAccount: NewAccount = {
    ...data,
    id,
    createdAt: new Date(),
  };

  await db.insert(accounts).values(newAccount);

  const [created] = await db.select().from(accounts).where(eq(accounts.id, id));

  return created;
}

/**
 * Get account by ID
 */
export async function getAccountById(id: string): Promise<Account | null> {
  const db = getDb();
  const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
  return account || null;
}

/**
 * Get all accounts
 */
export async function getAllAccounts(): Promise<Account[]> {
  const db = getDb();
  return db.select().from(accounts);
}

/**
 * Get accounts by type
 */
export async function getAccountsByType(type: AccountType): Promise<Account[]> {
  const db = getDb();
  return db.select().from(accounts).where(eq(accounts.type, type));
}

/**
 * Get all credit card accounts
 */
export async function getCreditCardAccounts(): Promise<Account[]> {
  return getAccountsByType(AccountType.CREDIT_CARD);
}

/**
 * Get all bank accounts
 */
export async function getBankAccounts(): Promise<Account[]> {
  return getAccountsByType(AccountType.BANK);
}

/**
 * Update account
 */
export async function updateAccount(
  id: string,
  data: Partial<Omit<Account, 'id' | 'createdAt'>>,
): Promise<Account> {
  const db = getDb();

  await db.update(accounts).set(data).where(eq(accounts.id, id));

  const [updated] = await db.select().from(accounts).where(eq(accounts.id, id));

  return updated;
}

/**
 * Delete account
 */
export async function deleteAccount(id: string): Promise<void> {
  const db = getDb();
  await db.delete(accounts).where(eq(accounts.id, id));
}

/**
 * Get account count
 */
export async function getAccountCount(): Promise<number> {
  const db = getDb();
  const result = await db.select().from(accounts);
  return result.length;
}
/**
 * Calculate credit card utilization percentage for a specific card
 */
export async function getCreditCardUtilization(accountId: string): Promise<number> {
  const db = getDb();
  const account = await getAccountById(accountId);
  if (!account || account.type !== 'credit_card' || !account.creditLimit) {
    return 0;
  }

  const now = new Date();
  const statementDate = account.statementDay
    ? new Date(now.getFullYear(), now.getMonth(), account.statementDay)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  // If statement day hasn't occurred this month, use last month
  if (statementDate > now) {
    statementDate.setMonth(statementDate.getMonth() - 1);
  }

  // Import here to avoid circular dependency
  const {getTransactionsByAccount} = await import('@services/transactions');
  const allTransactions = await getTransactionsByAccount(accountId);
  const relevantTransactions = allTransactions.filter(
    (t: any) => new Date(t.transactionDate) >= statementDate,
  );

  const balance = relevantTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
  return Math.round((balance / account.creditLimit) * 100);
}