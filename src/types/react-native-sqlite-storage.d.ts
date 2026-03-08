/**
 * Type declarations for react-native-sqlite-storage
 */

declare module 'react-native-sqlite-storage' {
  export interface DatabaseParams {
    name: string;
    location?: string;
  }

  export interface SQLiteDatabase {
    executeSql(
      sql: string,
      params?: any[],
      callback?: (res: any) => void,
      errorCallback?: (error: any) => void,
    ): Promise<[any]>;
    transaction(fn: (tx: Transaction) => void): Promise<void>;
    close(): Promise<void>;
  }

  export interface Transaction {
    executeSql(
      sql: string,
      params?: any[],
      callback?: (tx: Transaction, res: any) => void,
      errorCallback?: (tx: Transaction, error: any) => void,
    ): void;
  }

  export function openDatabase(params: DatabaseParams): Promise<SQLiteDatabase>;
  export function deleteDatabase(params: DatabaseParams): Promise<void>;
  export function enablePromise(enable: boolean): void;

  export namespace SQLite {
    export type SQLiteDatabase = SQLiteDatabase;
  }

  const SQLite: {
    openDatabase: typeof openDatabase;
    deleteDatabase: typeof deleteDatabase;
    enablePromise: typeof enablePromise;
    DEBUG: (debug: boolean) => void;
  };

  export default SQLite;
}
