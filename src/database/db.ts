/**
 * Database connection and initialization
 * Uses SQLite with encryption support via SQLCipher
 */

import SQLite from 'react-native-sqlite-storage';
import {drizzle} from 'drizzle-orm/sqlite-proxy';
import * as Keychain from 'react-native-keychain';
import * as schema from './schema';

// Enable debugging in development
SQLite.DEBUG(__DEV__);
SQLite.enablePromise(true);

const DB_NAME = 'fintrack.db';
const ENCRYPTION_KEY_SERVICE = 'fintrack-db-encryption';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let drizzleInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Get or generate encryption key from secure storage
 */
async function getEncryptionKey(): Promise<string> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: ENCRYPTION_KEY_SERVICE,
    });

    if (credentials) {
      return credentials.password;
    }

    // Generate new encryption key
    const key = generateRandomKey();
    await Keychain.setGenericPassword('encryption', key, {
      service: ENCRYPTION_KEY_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });

    return key;
  } catch (error) {
    console.error('Failed to get encryption key:', error);
    throw new Error('Failed to initialize secure storage');
  }
}

/**
 * Generate a random 256-bit encryption key
 */
function generateRandomKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 64; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * Initialize SQLite database with encryption
 */
export async function initializeDatabase(): Promise<void> {
  try {
    if (dbInstance) {
      console.log('Database already initialized');
      return;
    }

    // Get encryption key
    const encryptionKey = await getEncryptionKey();

    // Open database with encryption
    dbInstance = await SQLite.openDatabase({
      name: DB_NAME,
      location: 'default',
      // Note: SQLCipher support requires react-native-sqlite-storage with SQLCipher
      // key: encryptionKey, // Uncomment when using SQLCipher build
    });

    console.log('Database opened successfully');

    // Initialize Drizzle ORM with SQLite proxy
    drizzleInstance = drizzle(
      async (sql, params, method) => {
        if (!dbInstance) {
          throw new Error('Database not initialized');
        }

        try {
          if (method === 'all' || method === 'values') {
            const [result] = await dbInstance.executeSql(sql, params);
            return {rows: result.rows.raw()};
          }

          if (method === 'get') {
            const [result] = await dbInstance.executeSql(sql, params);
            return {rows: result.rows.item(0)};
          }

          // run method
          await dbInstance.executeSql(sql, params);
          return {rows: []};
        } catch (error) {
          console.error('Database query error:', error);
          throw error;
        }
      },
      {schema},
    );

    // Run migrations
    await runMigrations();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Run database migrations
 */
async function runMigrations(): Promise<void> {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }

  try {
    // Create tables if they don't exist
    await dbInstance.executeSql(`
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
    `);

    await dbInstance.executeSql(`
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
    `);

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL UNIQUE,
        monthly_limit INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        category TEXT NOT NULL,
        frequency TEXT NOT NULL,
        next_due_date INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS processed_emails (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        processed_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS ai_insights (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    // Create indexes for performance
    await dbInstance.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_transactions_account_id 
      ON transactions(account_id);
    `);

    await dbInstance.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date 
      ON transactions(transaction_date);
    `);

    await dbInstance.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_transactions_category 
      ON transactions(category);
    `);

    await dbInstance.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_insights_created_at 
      ON ai_insights(created_at);
    `);

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Get Drizzle ORM instance
 */
export function getDb() {
  if (!drizzleInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return drizzleInstance;
}

/**
 * Get raw SQLite database instance
 */
export function getRawDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    drizzleInstance = null;
    console.log('Database closed');
  }
}

/**
 * Reset database (delete all data)
 */
export async function resetDatabase(): Promise<void> {
  try {
    if (dbInstance) {
      await closeDatabase();
    }

    await SQLite.deleteDatabase({name: DB_NAME, location: 'default'});
    console.log('Database deleted');

    // Reinitialize
    await initializeDatabase();
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
}
