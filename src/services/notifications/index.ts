/**
 * Notification Service
 * Local notifications for budget alerts, payment reminders, and insights
 */

import PushNotification, {Importance} from 'react-native-push-notification';
import {Platform} from 'react-native';
import * as BudgetService from '@services/budgets';
import * as AccountService from '@services/accounts';
import * as InsightsService from '@services/insights';

// Initialize notification channel (Android)
export function configureNotifications() {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });

  // Create notification channel for Android
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'fintrack-alerts',
        channelName: 'FinTrack Alerts',
        channelDescription: 'Budget and payment alerts from FinTrack AI',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`Notification channel created: ${created}`),
    );
  }
}

/**
 * Request notification permissions
 */
export function requestNotificationPermissions(): Promise<boolean> {
  return new Promise((resolve) => {
    PushNotification.checkPermissions((permissions) => {
      if (permissions.alert && permissions.badge && permissions.sound) {
        resolve(true);
      } else {
        PushNotification.requestPermissions().then(() => {
          resolve(true);
        }).catch(() => {
          resolve(false);
        });
      }
    });
  });
}

/**
 * Send a local notification
 */
function sendNotification(title: string, message: string, data?: any) {
  PushNotification.localNotification({
    channelId: 'fintrack-alerts',
    title,
    message,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    vibrate: true,
    vibration: 300,
    userInfo: data,
  });
}

/**
 * Check and send budget alerts
 */
export async function checkBudgetAlerts() {
  try {
    const budgets = await BudgetService.getAllBudgetProgress();

    for (const budget of budgets) {
      const percentage = budget.percentage;

      // Alert at 80% and 100%
      if (percentage >= 100) {
        sendNotification(
          'Budget Exceeded! 🚨',
          `You've exceeded your ${budget.budget.category} budget by $${((budget.spent - budget.budget.monthlyLimit) / 100).toFixed(2)}`,
          {type: 'budget_exceeded', budgetId: budget.budget.id},
        );
      } else if (percentage >= 80 && percentage < 100) {
        sendNotification(
          'Budget Warning ⚠️',
          `You've used ${percentage.toFixed(0)}% of your ${budget.budget.category} budget`,
          {type: 'budget_warning', budgetId: budget.budget.id},
        );
      }
    }
  } catch (error) {
    console.error('Error checking budget alerts:', error);
  }
}

/**
 * Check and send credit utilization alerts
 */
export async function checkCreditUtilizationAlerts() {
  try {
    const accounts = await AccountService.getCreditCardAccounts();

    for (const account of accounts) {
      if (account.creditLimit) {
        const utilization = await AccountService.getCreditCardUtilization(account.id);

        if (utilization >= 70) {
          sendNotification(
            'High Credit Utilization 💳',
            `Your ${account.name} is at ${utilization.toFixed(0)}% utilization. Consider paying down the balance.`,
            {type: 'credit_utilization', accountId: account.id},
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking credit utilization:', error);
  }
}

/**
 * Check for payment due dates and send reminders
 */
export async function checkPaymentReminders() {
  try {
    const accounts = await AccountService.getCreditCardAccounts();
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    for (const account of accounts) {
      if (account.dueDay) {
        const dueDate = new Date(today.getFullYear(), today.getMonth(), account.dueDay);

        // If due date has passed this month, check next month
        if (dueDate < today) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }

        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue === 3) {
          sendNotification(
            'Payment Due Soon 📅',
            `Your ${account.name} payment is due in 3 days (${dueDate.toLocaleDateString()})`,
            {type: 'payment_reminder', accountId: account.id},
          );
        } else if (daysUntilDue === 1) {
          sendNotification(
            'Payment Due Tomorrow! ⏰',
            `Your ${account.name} payment is due tomorrow!`,
            {type: 'payment_reminder_urgent', accountId: account.id},
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking payment reminders:', error);
  }
}

/**
 * Send notification for new insights
 */
export async function notifyNewInsights() {
  try {
    const insights = await InsightsService.getAllInsights();

    // Check if there are insights from the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentInsights = insights.filter(
      insight => new Date(insight.createdAt) > oneHourAgo
    );

    if (recentInsights.length > 0) {
      const insight = recentInsights[0]; // Show most recent
      let emoji = '💡';
      if (insight.type === 'SPEND_SPIKE') emoji = '📈';
      if (insight.type === 'BUDGET_OVERRUN') emoji = '⚠️';
      if (insight.type === 'CREDIT_UTILIZATION') emoji = '💳';
      if (insight.type === 'SUBSCRIPTION_DETECTED') emoji = '🔄';

      sendNotification(
        `New Insight ${emoji}`,
        insight.message,
        {type: 'new_insight', insightId: insight.id},
      );
    }
  } catch (error) {
    console.error('Error notifying insights:', error);
  }
}

/**
 * Run all alert checks
 */
export async function checkAllAlerts() {
  await checkBudgetAlerts();
  await checkCreditUtilizationAlerts();
  await checkPaymentReminders();
}

/**
 * Cancel all notifications
 */
export function cancelAllNotifications() {
  PushNotification.cancelAllLocalNotifications();
}

/**
 * Schedule daily alert checks (to be called on app start)
 */
export function scheduleDailyAlerts() {
  // Check alerts daily at 9 AM
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(9, 0, 0, 0);

  // If 9 AM has passed today, schedule for tomorrow
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  setTimeout(() => {
    checkAllAlerts();
    // Schedule next check in 24 hours
    setInterval(checkAllAlerts, 24 * 60 * 60 * 1000);
  }, delay);
}
