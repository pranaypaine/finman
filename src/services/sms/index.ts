/**
 * SMS Reader Service (Android only)
 * Reads SMS messages for transaction notifications
 */

import {Platform, PermissionsAndroid} from 'react-native';
import SmsAndroid from 'react-native-sms-android';
import {Category, TransactionSource} from '@types';
import * as TransactionService from '../transactions';
import {getDb} from '@database/db';
import {processedEmails} from '@database/schema'; // Reusing for SMS tracking
import {eq} from 'drizzle-orm';

export interface ParsedSmsTransaction {
  amount: number;
  merchant: string;
  transactionDate: Date;
  category?: Category;
  description: string;
  smsId: string;
  sender: string;
}

/**
 * Request SMS read permission (Android only)
 */
export async function requestSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message: 'FinTrack needs access to read transaction SMS messages from your bank',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('Error requesting SMS permission:', error);
    return false;
  }
}

/**
 * Check if SMS permission is granted
 */
export async function hasSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    );
    return granted;
  } catch (error) {
    return false;
  }
}

/**
 * Extract amount from SMS text
 */
function extractSmsAmount(text: string): number | null {
  // Patterns for different formats
  const patterns = [
    /(?:INR|Rs\.?|₹)\s?([0-9,]+\.?[0-9]*)/i,
    /(?:USD|US\$|\$)\s?([0-9,]+\.?[0-9]*)/i,
    /amount[:\s]+(?:INR|Rs\.?|₹)?\s?([0-9,]+\.?[0-9]*)/i,
    /debited[:\s]+(?:INR|Rs\.?|₹)?\s?([0-9,]+\.?[0-9]*)/i,
    /spent[:\s]+(?:INR|Rs\.?|₹)?\s?([0-9,]+\.?[0-9]*)/i,
    /withdrawn[:\s]+(?:INR|Rs\.?|₹)?\s?([0-9,]+\.?[0-9]*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        return Math.round(amount * 100); // Convert to cents
      }
    }
  }

  return null;
}

/**
 * Extract merchant from SMS text
 */
function extractSmsMerchant(text: string): string {
  const patterns = [
    /(?:at|@)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\s+on|\.|$)/,
    /(?:to|merchant)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\s+on|\.|$)/,
    /(?:spent at|paid to)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\s+on|\.|$)/,
    /(?:POS|UPI)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\s+on|\.|$)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'Unknown Merchant';
}

/**
 * Auto-categorize based on merchant name
 */
function autoCategorizeSms(merchant: string): Category {
  const merchantLower = merchant.toLowerCase();

  if (
    merchantLower.includes('restaurant') ||
    merchantLower.includes('cafe') ||
    merchantLower.includes('swiggy') ||
    merchantLower.includes('zomato')
  ) {
    return Category.FOOD;
  }

  if (
    merchantLower.includes('grocery') ||
    merchantLower.includes('supermarket') ||
    merchantLower.includes('bigbasket')
  ) {
    return Category.GROCERIES;
  }

  if (
    merchantLower.includes('uber') ||
    merchantLower.includes('ola') ||
    merchantLower.includes('petrol') ||
    merchantLower.includes('fuel')
  ) {
    return Category.TRANSPORT;
  }

  if (
    merchantLower.includes('amazon') ||
    merchantLower.includes('flipkart') ||
    merchantLower.includes('myntra')
  ) {
    return Category.SHOPPING;
  }

  return Category.OTHERS;
}

/**
 * Check if SMS is a transaction message
 */
function isTransactionSms(text: string, sender: string): boolean {
  // Common bank sender IDs
  const bankSenders = ['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'PAYTM', 'GPAY', 'PHONEPE'];
  const senderMatch = bankSenders.some(bank => sender.toUpperCase().includes(bank));

  // Transaction keywords
  const keywords = ['debited', 'spent', 'withdrawn', 'paid', 'transaction', 'purchase'];
  const keywordMatch = keywords.some(keyword => text.toLowerCase().includes(keyword));

  return senderMatch && keywordMatch;
}

/**
 * Parse SMS message for transaction
 */
function parseSmsTransaction(sms: any): ParsedSmsTransaction | null {
  try {
    const text = sms.body || '';
    const sender = sms.address || '';
    const date = new Date(parseInt(sms.date, 10));

    // Check if this is a transaction SMS
    if (!isTransactionSms(text, sender)) {
      return null;
    }

    // Extract amount
    const amount = extractSmsAmount(text);
    if (!amount) {
      return null;
    }

    // Extract merchant
    const merchant = extractSmsMerchant(text);

    // Auto-categorize
    const category = autoCategorizeSms(merchant);

    return {
      amount,
      merchant,
      transactionDate: date,
      category,
      description: text.substring(0, 200), // Limit description length
      smsId: sms._id,
      sender,
    };
  } catch (error) {
    console.error('Error parsing SMS transaction:', error);
    return null;
  }
}

/**
 * Check if SMS has been processed
 */
async function isSmsProcessed(smsId: string): Promise<boolean> {
  const db = getDb();
  const [result] = await db
    .select()
    .from(processedEmails) // Reusing table
    .where(eq(processedEmails.id, `sms_${smsId}`))
    .limit(1);
  return !!result;
}

/**
 * Mark SMS as processed
 */
async function markSmsAsProcessed(
  smsId: string,
  sender: string,
): Promise<void> {
  const db = getDb();
  await db.insert(processedEmails).values({
    id: `sms_${smsId}`,
    subject: `SMS from ${sender}`,
    processedAt: new Date(),
  });
}

/**
 * Read SMS messages from inbox
 */
async function readSmsMessages(daysBack: number = 30): Promise<any[]> {
  if (Platform.OS !== 'android') {
    return [];
  }

  return new Promise((resolve, reject) => {
    const minDate = Date.now() - daysBack * 24 * 60 * 60 * 1000;

    const filter = {
      box: 'inbox',
      minDate,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: any) => {
        console.error('Failed to read SMS:', fail);
        resolve([]);
      },
      (count: number, smsList: string) => {
        try {
          const messages = JSON.parse(smsList);
          resolve(messages);
        } catch (error) {
          console.error('Error parsing SMS list:', error);
          resolve([]);
        }
      },
    );
  });
}

/**
 * Import single parsed SMS transaction
 */
async function importParsedSmsTransaction(
  parsed: ParsedSmsTransaction,
  accountId: string,
): Promise<string | null> {
  try {
    // Check if already processed
    const processed = await isSmsProcessed(parsed.smsId);
    if (processed) {
      return null;
    }

    // Create transaction
    const transaction = await TransactionService.createTransaction({
      accountId,
      amount: parsed.amount,
      merchant: parsed.merchant,
      category: parsed.category!,
      transactionDate: parsed.transactionDate,
      notes: parsed.description,
      source: TransactionSource.SMS,
    });

    if (transaction) {
      await markSmsAsProcessed(parsed.smsId, parsed.sender);
      return transaction.id;
    }

    return null;
  } catch (error) {
    console.error('Error importing SMS transaction:', error);
    return null;
  }
}

/**
 * Sync transactions from SMS
 */
export async function syncTransactionsFromSms(
  accountId: string,
  daysBack: number = 30,
): Promise<{success: boolean; imported: number; skipped: number; error?: string}> {
  try {
    if (Platform.OS !== 'android') {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        error: 'SMS reading is only available on Android',
      };
    }

    // Check permission
    const hasPermission = await hasSmsPermission();
    if (!hasPermission) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        error: 'SMS permission not granted',
      };
    }

    // Read SMS messages
    console.log('Reading SMS messages...');
    const messages = await readSmsMessages(daysBack);
    console.log(`Read ${messages.length} SMS messages`);

    // Parse SMS messages
    const parsed: ParsedSmsTransaction[] = [];
    for (const sms of messages) {
      const transaction = parseSmsTransaction(sms);
      if (transaction) {
        parsed.push(transaction);
      }
    }
    console.log(`Parsed ${parsed.length} valid transactions from SMS`);

    // Import transactions
    let imported = 0;
    let skipped = 0;

    for (const transaction of parsed) {
      const transactionId = await importParsedSmsTransaction(transaction, accountId);
      if (transactionId) {
        imported++;
      } else {
        skipped++;
      }
    }

    return {success: true, imported, skipped};
  } catch (error: any) {
    console.error('Error syncing transactions from SMS:', error);
    return {success: false, imported: 0, skipped: 0, error: error.message};
  }
}
