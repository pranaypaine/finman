/**
 * Email Parser
 * Extracts transaction information from email content
 */

import {Category} from '@types';

export interface ParsedTransaction {
  amount: number;
  merchant: string;
  transactionDate: Date;
  category?: Category;
  description: string;
  emailId: string;
  subject: string;
}

/**
 * Decode base64 email body
 */
function decodeEmailBody(encodedBody: string): string {
  try {
    // Gmail API returns base64url encoded strings
    const base64 = encodedBody.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Error decoding email body:', error);
    return '';
  }
}

/**
 * Extract email body from message payload
 */
function extractEmailBody(payload: any): string {
  if (payload.body?.data) {
    return decodeEmailBody(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
        if (part.body?.data) {
          return decodeEmailBody(part.body.data);
        }
      }
      // Recursively check nested parts
      if (part.parts) {
        const nested = extractEmailBody(part);
        if (nested) return nested;
      }
    }
  }

  return '';
}

/**
 * Extract subject from message headers
 */
function extractSubject(headers: any[]): string {
  const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject');
  return subjectHeader?.value || '';
}

/**
 * Extract date from message headers
 */
function extractDate(headers: any[]): Date {
  const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date');
  if (dateHeader?.value) {
    return new Date(dateHeader.value);
  }
  return new Date();
}

/**
 * Extract amount from text
 * Supports formats: INR 1,234.56, Rs. 1234, ₹1234.50, $1234
 */
function extractAmount(text: string): number | null {
  // Patterns for different currency formats
  const patterns = [
    /(?:INR|Rs\.?|₹)\s?([0-9,]+\.?[0-9]*)/i,
    /(?:USD|US\$|\$)\s?([0-9,]+\.?[0-9]*)/i,
    /amount[:\s]+(?:INR|Rs\.?|₹)?\s?([0-9,]+\.?[0-9]*)/i,
    /debited[:\s]+(?:INR|Rs\.?|₹)?\s?([0-9,]+\.?[0-9]*)/i,
    /charged[:\s]+(?:INR|Rs\.?|₹)?\s?([0-9,]+\.?[0-9]*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Remove commas and convert to number
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        // Convert to cents
        return Math.round(amount * 100);
      }
    }
  }

  return null;
}

/**
 * Extract merchant name from text
 */
function extractMerchant(text: string, subject: string): string {
  // Common patterns in transaction emails
  const patterns = [
    /(?:at|@)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\s+on|\.|,|$)/,
    /(?:to|merchant)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\s+on|\.|,|$)/,
    /(?:spent at|paid to)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\s+on|\.|,|$)/,
    /(?:from|by)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\s+has been|\.|,|$)/,
  ];

  // Try to extract from email body
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Try to extract from subject as fallback
  const subjectPatterns = [
    /transaction at\s+([A-Z][A-Za-z0-9\s&'-]+)/i,
    /payment to\s+([A-Z][A-Za-z0-9\s&'-]+)/i,
    /spent at\s+([A-Z][A-Za-z0-9\s&'-]+)/i,
  ];

  for (const pattern of subjectPatterns) {
    const match = subject.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'Unknown Merchant';
}

/**
 * Auto-categorize based on merchant name
 */
function autoCategorizeMerchant(merchant: string): Category {
  const merchantLower = merchant.toLowerCase();

  // Food & Dining
  if (
    merchantLower.includes('restaurant') ||
    merchantLower.includes('cafe') ||
    merchantLower.includes('pizza') ||
    merchantLower.includes('dominos') ||
    merchantLower.includes('swiggy') ||
    merchantLower.includes('zomato') ||
    merchantLower.includes('uber eats') ||
    merchantLower.includes('starbucks') ||
    merchantLower.includes('mcdonald')
  ) {
    return Category.FOOD;
  }

  // Groceries
  if (
    merchantLower.includes('grocery') ||
    merchantLower.includes('supermarket') ||
    merchantLower.includes('bigbasket') ||
    merchantLower.includes('grofers') ||
    merchantLower.includes('blinkit') ||
    merchantLower.includes('dmart')
  ) {
    return Category.GROCERIES;
  }

  // Transportation
  if (
    merchantLower.includes('uber') ||
    merchantLower.includes('ola') ||
    merchantLower.includes('rapido') ||
    merchantLower.includes('metro') ||
    merchantLower.includes('petrol') ||
    merchantLower.includes('fuel')
  ) {
    return Category.TRANSPORT;
  }

  // Shopping
  if (
    merchantLower.includes('amazon') ||
    merchantLower.includes('flipkart') ||
    merchantLower.includes('myntra') ||
    merchantLower.includes('ajio') ||
    merchantLower.includes('mall') ||
    merchantLower.includes('store')
  ) {
    return Category.SHOPPING;
  }

  // Entertainment
  if (
    merchantLower.includes('netflix') ||
    merchantLower.includes('prime') ||
    merchantLower.includes('spotify') ||
    merchantLower.includes('hotstar') ||
    merchantLower.includes('cinema') ||
    merchantLower.includes('movie')
  ) {
    return Category.ENTERTAINMENT;
  }

  // Utilities
  if (
    merchantLower.includes('electricity') ||
    merchantLower.includes('water') ||
    merchantLower.includes('gas') ||
    merchantLower.includes('broadband') ||
    merchantLower.includes('internet')
  ) {
    return Category.BILLS;
  }

  // Healthcare
  if (
    merchantLower.includes('hospital') ||
    merchantLower.includes('pharmacy') ||
    merchantLower.includes('clinic') ||
    merchantLower.includes('doctor') ||
    merchantLower.includes('medical')
  ) {
    return Category.HEALTH;
  }

  return Category.OTHERS;
}

/**
 * Check if email contains transaction information
 */
function isTransactionEmail(subject: string, body: string): boolean {
  const keywords = [
    'debited',
    'spent',
    'charged',
    'transaction',
    'payment',
    'purchase',
    'withdrawal',
    'paid',
  ];

  const text = (subject + ' ' + body).toLowerCase();
  return keywords.some(keyword => text.includes(keyword));
}

/**
 * Parse Gmail message and extract transaction
 */
export function parseEmailTransaction(message: any): ParsedTransaction | null {
  try {
    const headers = message.payload?.headers || [];
    const subject = extractSubject(headers);
    const date = extractDate(headers);
    const body = extractEmailBody(message.payload);

    // Check if this is a transaction email
    if (!isTransactionEmail(subject, body)) {
      return null;
    }

    // Extract amount
    const amount = extractAmount(body) || extractAmount(subject);
    if (!amount) {
      return null; // No valid amount found
    }

    // Extract merchant
    const merchant = extractMerchant(body, subject);

    // Auto-categorize
    const category = autoCategorizeMerchant(merchant);

    return {
      amount,
      merchant,
      transactionDate: date,
      category,
      description: subject,
      emailId: message.id,
      subject,
    };
  } catch (error) {
    console.error('Error parsing email transaction:', error);
    return null;
  }
}

/**
 * Parse multiple emails and extract transactions
 */
export function parseEmailTransactions(messages: any[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  for (const message of messages) {
    const transaction = parseEmailTransaction(message);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  return transactions;
}
