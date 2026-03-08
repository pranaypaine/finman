/**
 * Insights Service
 * Generates AI-powered financial insights and recommendations
 */

import {getDb} from '@database/db';
import {aiInsights, type AIInsight, type NewAIInsight} from '@database/schema';
import {InsightType, Category} from '@types';
import * as TransactionService from '@services/transactions';
import * as BudgetService from '@services/budgets';
import * as AccountService from '@services/accounts';
import {generateUUID, getStartOfMonth, getEndOfMonth} from '@utils';
import {desc, eq, lt} from 'drizzle-orm';

export interface GeneratedInsight {
  type: InsightType;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Generate all insights based on current data
 */
export async function generateAllInsights(): Promise<AIInsight[]> {
  const insights: GeneratedInsight[] = [];

  // Run all insight generators in parallel
  const [
    spendSpikeInsights,
    budgetInsights,
    utilizationInsights,
    subscriptionInsights,
    forecastInsights,
  ] = await Promise.all([
    detectSpendSpike(),
    detectBudgetIssues(),
    detectHighUtilization(),
    detectSubscriptions(),
    generateSpendForecast(),
  ]);

  insights.push(...spendSpikeInsights);
  insights.push(...budgetInsights);
  insights.push(...utilizationInsights);
  insights.push(...subscriptionInsights);
  insights.push(...forecastInsights);

  // Save insights to database
  const savedInsights: AIInsight[] = [];
  for (const insight of insights) {
    const saved = await createInsight(insight);
    savedInsights.push(saved);
  }

  return savedInsights;
}

/**
 * Get all insights
 */
export async function getAllInsights(): Promise<AIInsight[]> {
  const db = getDb();
  const results = await db.select().from(aiInsights).orderBy(desc(aiInsights.createdAt));
  
  // Parse metadata and type for each insight
  return results.map(r => ({
    ...r,
    type: r.type as InsightType,
    metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
  })) as AIInsight[];
}

/**
 * Create a new insight
 */
export async function createInsight(data: GeneratedInsight): Promise<AIInsight> {
  const db = getDb();
  const id = generateUUID();

  const newInsight: NewAIInsight = {
    id,
    type: data.type,
    message: data.message,
    metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    createdAt: new Date(),
  };

  await db.insert(aiInsights).values(newInsight);
  const [created] = await db.select().from(aiInsights).where(eq(aiInsights.id, id));

  // Parse metadata back to object
  return {
    ...created,
    type: created.type as InsightType,
    metadata: created.metadata ? JSON.parse(created.metadata) : undefined,
  } as AIInsight;
}

/**
 * Detect spending spike compared to previous months
 */
async function detectSpendSpike(): Promise<GeneratedInsight[]> {
  const insights: GeneratedInsight[] = [];

  try {
    const now = new Date();
    
    // Current month
    const currentStart = getStartOfMonth(now);
    const currentEnd = getEndOfMonth(now);
    const currentSpend = await TransactionService.getTotalSpent(currentStart, currentEnd);

    // Previous 3 months
    const monthsToCheck = 3;
    let totalPreviousSpend = 0;
    
    for (let i = 1; i <= monthsToCheck; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = getStartOfMonth(date);
      const end = getEndOfMonth(date);
      const spend = await TransactionService.getTotalSpent(start, end);
      totalPreviousSpend += spend;
    }

    const avgPreviousSpend = totalPreviousSpend / monthsToCheck;

    // Check for spike (30% increase)
    if (avgPreviousSpend > 0 && currentSpend > avgPreviousSpend * 1.3) {
      const percentIncrease = Math.round(((currentSpend - avgPreviousSpend) / avgPreviousSpend) * 100);
      
      insights.push({
        type: InsightType.SPEND_SPIKE,
        message: `You've spent ${percentIncrease}% more this month compared to your average. Current: ₹${(currentSpend / 100).toFixed(0)}, Average: ₹${(avgPreviousSpend / 100).toFixed(0)}`,
        metadata: {
          currentSpend,
          avgPreviousSpend,
          percentIncrease,
        },
      });
    }

    // Check category-wise spikes
    const currentSpentByCategory = await TransactionService.getSpendByCategory(currentStart, currentEnd);
    
    for (const [category, currentAmount] of Object.entries(currentSpentByCategory)) {
      let totalPrevious = 0;
      
      for (let i = 1; i <= monthsToCheck; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = getStartOfMonth(date);
        const end = getEndOfMonth(date);
        const spendByCategory = await TransactionService.getSpendByCategory(start, end);
        totalPrevious += spendByCategory[category as Category] || 0;
      }
      
      const avgPrevious = totalPrevious / monthsToCheck;
      
      if (avgPrevious > 0 && currentAmount > avgPrevious * 1.5) {
        const percentIncrease = Math.round(((currentAmount - avgPrevious) / avgPrevious) * 100);
        
        insights.push({
          type: InsightType.SPEND_SPIKE,
          message: `Your ${category} spending is up ${percentIncrease}% this month. You spent ₹${(currentAmount / 100).toFixed(0)} compared to usual ₹${(avgPrevious / 100).toFixed(0)}`,
          metadata: {
            category,
            currentAmount,
            avgPrevious,
            percentIncrease,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error detecting spend spike:', error);
  }

  return insights;
}

/**
 * Detect budget issues (overruns and warnings)
 */
async function detectBudgetIssues(): Promise<GeneratedInsight[]> {
  const insights: GeneratedInsight[] = [];

  try {
    const budgetProgress = await BudgetService.getAllBudgetProgress();

    for (const progress of budgetProgress) {
      const {budget, spent, percentage} = progress;

      // Budget exceeded
      if (percentage >= 100) {
        const overspent = spent - budget.monthlyLimit;
        insights.push({
          type: InsightType.BUDGET_OVERRUN,
          message: `You've exceeded your ${budget.category} budget by ₹${(overspent / 100).toFixed(0)}. Consider adjusting your spending.`,
          metadata: {
            category: budget.category,
            spent,
            limit: budget.monthlyLimit,
            overspent,
          },
        });
      }
      // Budget warning (80-99%)
      else if (percentage >= 80) {
        const remaining = budget.monthlyLimit - spent;
        insights.push({
          type: InsightType.BUDGET_OVERRUN,
          message: `You're at ${percentage}% of your ${budget.category} budget. Only ₹${(remaining / 100).toFixed(0)} left for this month.`,
          metadata: {
            category: budget.category,
            spent,
            limit: budget.monthlyLimit,
            percentage,
            remaining,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error detecting budget issues:', error);
  }

  return insights;
}

/**
 * Detect high credit card utilization
 */
async function detectHighUtilization(): Promise<GeneratedInsight[]> {
  const insights: GeneratedInsight[] = [];

  try {
    const creditCards = await AccountService.getCreditCardAccounts();

    if (creditCards.length === 0) {
      return insights;
    }

    const now = new Date();
    const startOfMonth = getStartOfMonth(now);
    const endOfMonth = getEndOfMonth(now);

    for (const card of creditCards) {
      if (!card.creditLimit) continue;

      // Get card transactions for current month
      const cardTransactions = await TransactionService.getTransactionsByAccount(card.id);
      const currentMonthTransactions = cardTransactions.filter(t => {
        const date = new Date(t.transactionDate);
        return date >= startOfMonth && date <= endOfMonth;
      });

      const spent = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const utilization = Math.round((spent / card.creditLimit) * 100);

      // High utilization warning (>70%)
      if (utilization >= 70) {
        insights.push({
          type: InsightType.CREDIT_UTILIZATION,
          message: `Your ${card.name} utilization is at ${utilization}%. High utilization can impact your credit score. Current: ₹${(spent / 100).toFixed(0)} of ₹${(card.creditLimit / 100).toFixed(0)} limit.`,
          metadata: {
            cardName: card.name,
            spent,
            limit: card.creditLimit,
            utilization,
          },
        });
      }
    }

    // Overall utilization
    const totalLimit = creditCards.reduce((sum, c) => sum + (c.creditLimit || 0), 0);
    let totalSpent = 0;

    for (const card of creditCards) {
      const cardTransactions = await TransactionService.getTransactionsByAccount(card.id);
      const currentMonthTransactions = cardTransactions.filter(t => {
        const date = new Date(t.transactionDate);
        return date >= startOfMonth && date <= endOfMonth;
      });
      totalSpent += currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    }

    const overallUtilization = Math.round((totalSpent / totalLimit) * 100);

    if (overallUtilization >= 70) {
      insights.push({
        type: InsightType.CREDIT_UTILIZATION,
        message: `Your overall credit utilization is ${overallUtilization}%. Experts recommend keeping it below 30% for optimal credit health.`,
        metadata: {
          totalSpent,
          totalLimit,
          utilization: overallUtilization,
        },
      });
    }
  } catch (error) {
    console.error('Error detecting high utilization:', error);
  }

  return insights;
}

/**
 * Detect recurring subscriptions
 */
async function detectSubscriptions(): Promise<GeneratedInsight[]> {
  const insights: GeneratedInsight[] = [];

  try {
    // Get all transactions
    const allTransactions = await TransactionService.getAllTransactions();

    // Group by merchant
    const merchantMap = new Map<string, typeof allTransactions>();
    
    for (const transaction of allTransactions) {
      const merchant = transaction.merchant.toLowerCase().trim();
      if (!merchantMap.has(merchant)) {
        merchantMap.set(merchant, []);
      }
      merchantMap.get(merchant)!.push(transaction);
    }

    // Detect recurring patterns
    const subscriptions: Array<{merchant: string; amount: number; count: number}> = [];

    for (const [merchant, transactions] of merchantMap.entries()) {
      // Need at least 3 transactions to detect pattern
      if (transactions.length < 3) continue;

      // Check if amounts are similar (within 10% variance)
      const amounts = transactions.map(t => t.amount);
      const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
      const variance = amounts.every(a => Math.abs(a - avgAmount) / avgAmount <= 0.1);

      if (variance) {
        subscriptions.push({
          merchant: transactions[0].merchant,
          amount: avgAmount,
          count: transactions.length,
        });
      }
    }

    if (subscriptions.length > 0) {
      const totalSubscriptionCost = subscriptions.reduce((sum, s) => sum + s.amount, 0);
      
      insights.push({
        type: InsightType.SUBSCRIPTION_DETECTED,
        message: `You have ${subscriptions.length} recurring subscription${subscriptions.length > 1 ? 's' : ''} costing ~₹${(totalSubscriptionCost / 100).toFixed(0)}/month. Review them: ${subscriptions.map(s => s.merchant).join(', ')}.`,
        metadata: {
          subscriptions,
          totalCost: totalSubscriptionCost,
          count: subscriptions.length,
        },
      });
    }
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
  }

  return insights;
}

/**
 * Generate spend forecast for end of month
 */
async function generateSpendForecast(): Promise<GeneratedInsight[]> {
  const insights: GeneratedInsight[] = [];

  try {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    // Only forecast if we're at least 7 days into the month and not at the end
    if (currentDay < 7 || currentDay >= daysInMonth - 2) {
      return insights;
    }

    // Get spending so far this month
    const monthStart = getStartOfMonth(now);
    const currentSpent = await TransactionService.getTotalSpent(monthStart, now);

    // Calculate daily average
    const dailyAverage = currentSpent / currentDay;

    // Forecast for end of month
    const forecastedTotal = dailyAverage * daysInMonth;

    // Get previous 3 months average
    let previousMonthsTotal = 0;
    for (let i = 1; i <= 3; i++) {
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prevStart = getStartOfMonth(prevMonthDate);
      const prevEnd = getEndOfMonth(prevMonthDate);
      const prevSpent = await TransactionService.getTotalSpent(prevStart, prevEnd);
      previousMonthsTotal += prevSpent;
    }
    const previousAverage = previousMonthsTotal / 3;

    // Check if forecast exceeds previous average by 20%
    const increaseThreshold = previousAverage * 1.2;
    if (forecastedTotal > increaseThreshold) {
      const percentageIncrease = ((forecastedTotal - previousAverage) / previousAverage) * 100;
      insights.push({
        type: InsightType.SPEND_SPIKE,
        message: `Based on your current spending, you're on track to spend ₹${(forecastedTotal / 100).toFixed(0)} this month - ${percentageIncrease.toFixed(0)}% more than your 3-month average of ₹${(previousAverage / 100).toFixed(0)}.`,
        metadata: {
          currentSpent,
          forecastedTotal,
          previousAverage,
          percentageIncrease,
          daysRemaining: daysInMonth - currentDay,
        },
      });
    }

    // Check against budgets
    const budgets = await BudgetService.getAllBudgets();
    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

    if (totalBudget > 0 && forecastedTotal > totalBudget) {
      const overBudget = forecastedTotal - totalBudget;
      insights.push({
        type: InsightType.BUDGET_OVERRUN,
        message: `Your forecasted spending of ₹${(forecastedTotal / 100).toFixed(0)} will exceed your total monthly budget by ₹${(overBudget / 100).toFixed(0)}. Consider reducing expenses in the next ${daysInMonth - currentDay} days.`,
        metadata: {
          forecastedTotal,
          totalBudget,
          overBudget,
          daysRemaining: daysInMonth - currentDay,
        },
      });
    }

    // Positive insight if spending is below average
    if (forecastedTotal < previousAverage * 0.8) {
      const savingsAmount = previousAverage - forecastedTotal;
      insights.push({
        type: InsightType.SAVING_OPPORTUNITY,
        message: `Great job! You're on track to spend ₹${(savingsAmount / 100).toFixed(0)} less than your usual monthly spending. Keep it up!`,
        metadata: {
          forecastedTotal,
          previousAverage,
          savingsAmount,
        },
      });
    }
  } catch (error) {
    console.error('Error generating forecast:', error);
  }

  return insights;
}

/**
 * Clear all old insights
 */
export async function clearOldInsights(daysOld: number = 30): Promise<void> {
  const db = getDb();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  await db.delete(aiInsights).where(lt(aiInsights.createdAt, cutoffDate));
}
