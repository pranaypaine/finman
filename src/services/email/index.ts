/**
 * Email Service
 * Main service for email-based transaction import
 */

import * as GmailClient from './gmailClient';
import {parseEmailTransactions, ParsedTransaction} from './emailParser';
import * as TransactionService from '../transactions';
import {getDb} from '@database/db';
import {processedEmails} from '@database/schema';
import {eq, inArray} from 'drizzle-orm';
import {TransactionSource} from '@types';

export {configureGoogleSignIn, signInToGmail, signOutFromGmail, isSignedIn, getCurrentUser} from './gmailClient';

/**
 * Check if email has already been processed
 */
async function isEmailProcessed(emailId: string): Promise<boolean> {
  const db = getDb();
  const [result] = await db
    .select()
    .from(processedEmails)
    .where(eq(processedEmails.id, emailId))
    .limit(1);
  return !!result;
}

/**
 * Mark email as processed
 */
async function markEmailAsProcessed(
  emailId: string,
  subject: string,
): Promise<void> {
  const db = getDb();
  await db.insert(processedEmails).values({
    id: emailId,
    subject,
    processedAt: new Date(),
  });
}

/**
 * Import single parsed transaction
 */
async function importParsedTransaction(
  parsed: ParsedTransaction,
  accountId: string,
): Promise<string | null> {
  try {
    // Check if already processed
    const processed = await isEmailProcessed(parsed.emailId);
    if (processed) {
      console.log(`Email ${parsed.emailId} already processed, skipping`);
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
      source: TransactionSource.EMAIL,
    });

    if (transaction) {
      // Mark email as processed
      await markEmailAsProcessed(parsed.emailId, parsed.subject);
      return transaction.id;
    }

    return null;
  } catch (error) {
    console.error('Error importing transaction:', error);
    return null;
  }
}

/**
 * Sync transactions from Gmail
 * Fetches recent emails and imports new transactions
 */
export async function syncTransactionsFromGmail(
  accountId: string,
  daysBack: number = 30,
): Promise<{success: boolean; imported: number; skipped: number; error?: string}> {
  try {
    // Check if user is signed in
    const signedIn = await GmailClient.isSignedIn();
    if (!signedIn) {
      return {success: false, imported: 0, skipped: 0, error: 'Not signed in to Gmail'};
    }

    // Calculate date range
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    // Fetch transaction emails
    console.log('Fetching transaction emails from Gmail...');
    const messages = await GmailClient.fetchTransactionEmails(since);
    console.log(`Fetched ${messages.length} potential transaction emails`);

    // Parse emails
    const parsed = parseEmailTransactions(messages);
    console.log(`Parsed ${parsed.length} valid transactions from emails`);

    // Import transactions
    let imported = 0;
    let skipped = 0;

    for (const transaction of parsed) {
      const transactionId = await importParsedTransaction(transaction, accountId);
      if (transactionId) {
        imported++;
      } else {
        skipped++;
      }
    }

    return {success: true, imported, skipped};
  } catch (error: any) {
    console.error('Error syncing transactions from Gmail:', error);
    return {success: false, imported: 0, skipped: 0, error: error.message};
  }
}

/**
 * Get list of processed emails
 */
export async function getProcessedEmails(limit: number = 100) {
  const db = getDb();
  return db
    .select()
    .from(processedEmails)
    .orderBy(processedEmails.processedAt)
    .limit(limit);
}

/**
 * Clear all processed emails history
 * (Use with caution - may cause duplicate imports)
 */
export async function clearProcessedEmails(): Promise<void> {
  const db = getDb();
  await db.delete(processedEmails);
}
