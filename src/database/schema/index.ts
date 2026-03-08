/**
 * Drizzle ORM Schema for FinTrack AI
 * Defines all database tables and relationships
 */

import {sqliteTable, text, integer, real} from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';

// Accounts Table
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'bank' or 'credit_card'
  bankName: text('bank_name').notNull(),
  last4: text('last4').notNull(),
  creditLimit: integer('credit_limit'), // In cents, nullable for bank accounts
  statementDay: integer('statement_day'), // Day of month (1-31)
  dueDay: integer('due_day'), // Day of month (1-31)
  createdAt: integer('created_at', {mode: 'timestamp'})
    .notNull()
    .default(sql`(unixepoch())`),
});

// Transactions Table
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, {onDelete: 'cascade'}),
  amount: integer('amount').notNull(), // In cents
  merchant: text('merchant').notNull(),
  category: text('category').notNull(),
  transactionDate: integer('transaction_date', {mode: 'timestamp'}).notNull(),
  source: text('source').notNull(), // 'email' or 'manual'
  notes: text('notes'),
  createdAt: integer('created_at', {mode: 'timestamp'})
    .notNull()
    .default(sql`(unixepoch())`),
});

// Budgets Table
export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  category: text('category').notNull().unique(),
  monthlyLimit: integer('monthly_limit').notNull(), // In cents
  createdAt: integer('created_at', {mode: 'timestamp'})
    .notNull()
    .default(sql`(unixepoch())`),
});

// Recurring Expenses Table
export const recurringExpenses = sqliteTable('recurring_expenses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amount: integer('amount').notNull(), // In cents
  category: text('category').notNull(),
  frequency: text('frequency').notNull(), // 'weekly', 'monthly', 'quarterly', 'yearly'
  nextDueDate: integer('next_due_date', {mode: 'timestamp'}).notNull(),
  createdAt: integer('created_at', {mode: 'timestamp'})
    .notNull()
    .default(sql`(unixepoch())`),
});

// Processed Emails Table (to prevent duplicates)
export const processedEmails = sqliteTable('processed_emails', {
  id: text('id').primaryKey(), // Gmail message ID
  subject: text('subject').notNull(),
  processedAt: integer('processed_at', {mode: 'timestamp'})
    .notNull()
    .default(sql`(unixepoch())`),
});

// AI Insights Table
export const aiInsights = sqliteTable('ai_insights', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'spend_spike', 'budget_overrun', etc.
  message: text('message').notNull(),
  metadata: text('metadata'), // JSON string for additional data
  createdAt: integer('created_at', {mode: 'timestamp'})
    .notNull()
    .default(sql`(unixepoch())`),
});

// Export types inferred from schema
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type NewRecurringExpense = typeof recurringExpenses.$inferInsert;

export type ProcessedEmail = typeof processedEmails.$inferSelect;
export type NewProcessedEmail = typeof processedEmails.$inferInsert;

export type AIInsight = typeof aiInsights.$inferSelect;
export type NewAIInsight = typeof aiInsights.$inferInsert;
