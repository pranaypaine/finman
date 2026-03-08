// Core domain types for FinTrack AI

export type UUID = string;

export enum AccountType {
  BANK = 'bank',
  CREDIT_CARD = 'credit_card',
}

export enum TransactionSource {
  EMAIL = 'email',
  MANUAL = 'manual',
  SMS = 'sms',
}

export enum RecurringFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum InsightType {
  SPEND_SPIKE = 'spend_spike',
  BUDGET_OVERRUN = 'budget_overrun',
  CREDIT_UTILIZATION = 'credit_utilization',
  SUBSCRIPTION_DETECTED = 'subscription_detected',
  SAVING_OPPORTUNITY = 'saving_opportunity',
}

export enum Category {
  FOOD = 'food',
  TRANSPORT = 'transport',
  SHOPPING = 'shopping',
  BILLS = 'bills',
  ENTERTAINMENT = 'entertainment',
  HEALTH = 'health',
  EDUCATION = 'education',
  TRAVEL = 'travel',
  GROCERIES = 'groceries',
  OTHERS = 'others',
  UNCATEGORIZED = 'uncategorized',
}

export interface Account {
  id: UUID;
  name: string;
  type: AccountType;
  bankName: string;
  last4: string;
  creditLimit?: number; // Only for credit cards
  statementDay?: number; // Day of month (1-31)
  dueDay?: number; // Day of month (1-31)
  createdAt: Date;
}

export interface Transaction {
  id: UUID;
  accountId: UUID;
  amount: number; // In cents to avoid floating point issues
  merchant: string;
  category: Category;
  transactionDate: Date;
  source: TransactionSource;
  notes?: string;
  createdAt: Date;
}

export interface Budget {
  id: UUID;
  category: Category;
  monthlyLimit: number; // In cents
  createdAt: Date;
}

export interface RecurringExpense {
  id: UUID;
  name: string;
  amount: number; // In cents
  category: Category;
  frequency: RecurringFrequency;
  nextDueDate: Date;
  createdAt: Date;
}

export interface ProcessedEmail {
  id: string; // Email ID from Gmail API
  subject: string;
  processedAt: Date;
}

export interface AIInsight {
  id: UUID;
  type: InsightType;
  message: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// UI/Service types

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface CreditCardStatus {
  account: Account;
  currentSpend: number;
  availableCredit: number;
  utilizationPercentage: number;
  daysUntilDue: number;
}

export interface MonthlySpendSummary {
  totalSpend: number;
  categorizedSpend: Record<Category, number>;
  transactionCount: number;
  averageTransaction: number;
}

export interface ParsedEmailTransaction {
  amount: number;
  merchant: string;
  date: Date;
  accountLast4?: string;
}

export interface MerchantRule {
  merchantPattern: string;
  category: Category;
}

export interface EmailFilter {
  keywords: string[];
  senderDomains?: string[];
  excludeKeywords?: string[];
}
