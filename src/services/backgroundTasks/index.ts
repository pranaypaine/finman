/**
 * Background Tasks Service
 * Periodic sync and insight generation
 */

import BackgroundFetch from 'react-native-background-fetch';
import * as EmailService from '@services/email';
import * as SmsService from '@services/sms';
import * as InsightsService from '@services/insights';
import * as NotificationService from '@services/notifications';
import * as AccountService from '@services/accounts';

const TASK_ID = 'com.fintrack.background.sync';

/**
 * Configure background fetch
 */
export async function configureBackgroundTasks(): Promise<boolean> {
  try {
    const status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: 360, // 6 hours (in minutes)
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        requiresCharging: false,
        requiresDeviceIdle: false,
        requiresBatteryNotLow: false,
        requiresStorageNotLow: false,
      },
      async (taskId) => {
        console.log('[BackgroundFetch] Task started:', taskId);
        await performBackgroundSync();
        BackgroundFetch.finish(taskId);
      },
      async (taskId) => {
        console.log('[BackgroundFetch] Task timeout:', taskId);
        BackgroundFetch.finish(taskId);
      },
    );

    console.log('[BackgroundFetch] Configuration status:', status);
    
    // Schedule the task
    await BackgroundFetch.scheduleTask({
      taskId: TASK_ID,
      delay: 0, // Start immediately
      periodic: true,
      forceAlarmManager: true,
    });

    return true;
  } catch (error) {
    console.error('[BackgroundFetch] Configuration failed:', error);
    return false;
  }
}

/**
 * Stop background tasks
 */
export async function stopBackgroundTasks(): Promise<void> {
  try {
    await BackgroundFetch.stop(TASK_ID);
    console.log('[BackgroundFetch] Tasks stopped');
  } catch (error) {
    console.error('[BackgroundFetch] Error stopping tasks:', error);
  }
}

/**
 * Perform background sync operations
 */
async function performBackgroundSync(): Promise<void> {
  try {
    console.log('[BackgroundSync] Starting background operations...');

    // 1. Check if email is connected
    const isGmailConnected = await EmailService.isSignedIn();
    
    if (isGmailConnected) {
      console.log('[BackgroundSync] Checking for new emails...');
      // Get default account (or first account) for auto-sync
      const accounts = await AccountService.getAllAccounts();
      if (accounts.length > 0) {
        try {
          await EmailService.syncTransactionsFromGmail(accounts[0].id, 7);
          console.log('[BackgroundSync] Email sync completed');
        } catch (error) {
          console.error('[BackgroundSync] Email sync failed:', error);
        }
      }
    }

    // 2. Check SMS permissions (Android only)
    const hasSmsPermission = await SmsService.hasSmsPermission();
    
    if (hasSmsPermission) {
      console.log('[BackgroundSync] Checking for new SMS...');
      const accounts = await AccountService.getAllAccounts();
      if (accounts.length > 0) {
        try {
          await SmsService.syncTransactionsFromSms(accounts[0].id, 7);
          console.log('[BackgroundSync] SMS sync completed');
        } catch (error) {
          console.error('[BackgroundSync] SMS sync failed:', error);
        }
      }
    }

    // 3. Generate new insights
    console.log('[BackgroundSync] Generating insights...');
    try {
      await InsightsService.generateAllInsights();
      console.log('[BackgroundSync] Insights generated');
    } catch (error) {
      console.error('[BackgroundSync] Insight generation failed:', error);
    }

    // 4. Check for alerts
    console.log('[BackgroundSync] Checking alerts...');
    try {
      await NotificationService.checkAllAlerts();
      console.log('[BackgroundSync] Alert check completed');
    } catch (error) {
      console.error('[BackgroundSync] Alert check failed:', error);
    }

    // 5. Clean up old insights
    try {
      await InsightsService.clearOldInsights(30);
      console.log('[BackgroundSync] Old insights cleared');
    } catch (error) {
      console.error('[BackgroundSync] Cleanup failed:', error);
    }

    console.log('[BackgroundSync] Background operations completed successfully');
  } catch (error) {
    console.error('[BackgroundSync] Background sync failed:', error);
  }
}

/**
 * Manually trigger background sync (for testing)
 */
export async function triggerManualSync(): Promise<void> {
  await performBackgroundSync();
}

/**
 * Get background fetch status
 */
export async function getBackgroundFetchStatus(): Promise<number> {
  try {
    return await BackgroundFetch.status();
  } catch (error) {
    console.error('[BackgroundFetch] Error getting status:', error);
    return -1;
  }
}

/**
 * Check if background fetch is available
 */
export async function isBackgroundFetchAvailable(): Promise<boolean> {
  try {
    const status = await BackgroundFetch.status();
    // Status codes: 0 = Restricted, 1 = Denied, 2 = Available
    return status === 2;
  } catch (error) {
    return false;
  }
}
