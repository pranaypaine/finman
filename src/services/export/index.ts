/**
 * Export Service
 * Export data to CSV and JSON formats
 */

import {Platform, PermissionsAndroid, Alert} from 'react-native';
import RNFS from 'react-native-fs';
import * as TransactionService from '@services/transactions';
import * as AccountService from '@services/accounts';
import * as BudgetService from '@services/budgets';
import {formatCurrency, formatDate} from '@utils';
import type {Transaction, Account, Budget} from '@types';

/**
 * Request storage permissions (Android only)
 */
async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'FinTrack AI needs access to your storage to save exported files.',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Error requesting storage permission:', err);
    return false;
  }
}

/**
 * Convert array to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',');
  const rows = data.map(row => {
    return headers
      .map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      })
      .join(',');
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Save file to device storage
 */
async function saveFile(filename: string, content: string): Promise<string> {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    throw new Error('Storage permission denied');
  }

  const path = Platform.select({
    ios: `${RNFS.DocumentDirectoryPath}/${filename}`,
    android: `${RNFS.DownloadDirectoryPath}/${filename}`,
  });

  if (!path) {
    throw new Error('Could not determine file path');
  }

  await RNFS.writeFile(path, content, 'utf8');
  return path;
}

/**
 * Export transactions to CSV
 */
export async function exportTransactionsCSV(): Promise<string> {
  try {
    const transactions = await TransactionService.getAllTransactions();

    if (transactions.length === 0) {
      throw new Error('No transactions to export');
    }

    const csvData = transactions.map(t => ({
      Date: formatDate(new Date(t.transactionDate)),
      Merchant: t.merchant,
      Amount: (t.amount / 100).toFixed(2),
      Category: t.category,
      'Account ID': t.accountId,
      Source: t.source,
      Notes: t.notes || '',
    }));

    const headers = ['Date', 'Merchant', 'Amount', 'Category', 'Account ID', 'Source', 'Notes'];
    const csv = arrayToCSV(csvData, headers);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `transactions_${timestamp}.csv`;
    const path = await saveFile(filename, csv);

    return path;
  } catch (error) {
    console.error('Error exporting transactions:', error);
    throw error;
  }
}

/**
 * Export accounts to CSV
 */
export async function exportAccountsCSV(): Promise<string> {
  try {
    const accounts = await AccountService.getAllAccounts();

    if (accounts.length === 0) {
      throw new Error('No accounts to export');
    }

    const csvData = accounts.map(a => ({
      Name: a.name,
      Type: a.type,
      'Bank Name': a.bankName,
      'Last 4': a.last4,
      'Credit Limit': a.creditLimit ? (a.creditLimit / 100).toFixed(2) : '',
      'Statement Day': a.statementDay || '',
      'Due Day': a.dueDay || '',
      'Created At': formatDate(new Date(a.createdAt)),
    }));

    const headers = [
      'Name',
      'Type',
      'Bank Name',
      'Last 4',
      'Credit Limit',
      'Statement Day',
      'Due Day',
      'Created At',
    ];
    const csv = arrayToCSV(csvData, headers);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `accounts_${timestamp}.csv`;
    const path = await saveFile(filename, csv);

    return path;
  } catch (error) {
    console.error('Error exporting accounts:', error);
    throw error;
  }
}

/**
 * Export budgets to CSV
 */
export async function exportBudgetsCSV(): Promise<string> {
  try {
    const budgets = await BudgetService.getAllBudgets();

    if (budgets.length === 0) {
      throw new Error('No budgets to export');
    }

    const csvData = budgets.map(b => ({
      Category: b.category,
      'Monthly Limit': (b.monthlyLimit / 100).toFixed(2),
      'Created At': formatDate(new Date(b.createdAt)),
    }));

    const headers = ['Category', 'Monthly Limit', 'Created At'];
    const csv = arrayToCSV(csvData, headers);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `budgets_${timestamp}.csv`;
    const path = await saveFile(filename, csv);

    return path;
  } catch (error) {
    console.error('Error exporting budgets:', error);
    throw error;
  }
}

/**
 * Export all data to JSON
 */
export async function exportAllDataJSON(): Promise<string> {
  try {
    const [transactions, accounts, budgets] = await Promise.all([
      TransactionService.getAllTransactions(),
      AccountService.getAllAccounts(),
      BudgetService.getAllBudgets(),
    ]);

    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      transactions,
      accounts,
      budgets,
    };

    const json = JSON.stringify(data, null, 2);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `fintrack_backup_${timestamp}.json`;
    const path = await saveFile(filename, json);

    return path;
  } catch (error) {
    console.error('Error exporting all data:', error);
    throw error;
  }
}

/**
 * Get export directory path
 */
export function getExportPath(): string {
  return Platform.select({
    ios: RNFS.DocumentDirectoryPath,
    android: RNFS.DownloadDirectoryPath,
  }) || RNFS.DocumentDirectoryPath;
}
