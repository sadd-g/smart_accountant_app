import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('accountant.db');
  await initDatabase(_db);
  return _db;
}

async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS account_groups (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      accounts_count INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS banks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      account_number TEXT DEFAULT '',
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS cash_boxes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      currency TEXT DEFAULT 'YER',
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS e_wallets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS currencies (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      rate REAL DEFAULT 1,
      is_default INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      location TEXT DEFAULT '',
      items_count INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      unit TEXT DEFAULT '',
      quantity REAL DEFAULT 0,
      cost_price REAL DEFAULT 0,
      sale_price REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      total_debit REAL DEFAULT 0,
      total_credit REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS journal_lines (
      id TEXT PRIMARY KEY,
      entry_id TEXT NOT NULL,
      account_name TEXT NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS sales_invoices (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      remaining REAL DEFAULT 0,
      payment_type TEXT DEFAULT 'cash',
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS purchase_invoices (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      remaining REAL DEFAULT 0,
      payment_type TEXT DEFAULT 'cash',
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}
