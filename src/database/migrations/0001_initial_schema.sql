-- Migration: Initial Schema
-- Created at: 2026-03-08
-- Description: Create all initial tables for FinTrack AI

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  last4 TEXT NOT NULL,
  credit_limit INTEGER,
  statement_day INTEGER,
  due_day INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  transaction_date INTEGER NOT NULL,
  source TEXT NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  monthly_limit INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Recurring expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT NOT NULL,
  next_due_date INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Processed emails table
CREATE TABLE IF NOT EXISTS processed_emails (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  processed_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON ai_insights(created_at);
