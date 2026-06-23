import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, SCHEMA_VERSION, SEED_SEQUENCES } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('accountant.db');
  await initDatabase(_db);
  return _db;
}

async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_TABLES_SQL);

  const version = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM db_version LIMIT 1'
  );

  if (!version) {
    await db.runAsync('INSERT INTO db_version (version) VALUES (?)', [SCHEMA_VERSION]);
    await seedInitialData(db);
  } else if (version.version < SCHEMA_VERSION) {
    await db.runAsync('UPDATE db_version SET version = ?', [SCHEMA_VERSION]);
    await runMigrations(db, version.version);
  }
}

async function runMigrations(db: SQLite.SQLiteDatabase, fromVersion: number): Promise<void> {
  // Future migrations go here
}

async function seedInitialData(db: SQLite.SQLiteDatabase): Promise<void> {
  // Sequences
  for (const seq of SEED_SEQUENCES) {
    await db.runAsync(
      'INSERT OR IGNORE INTO sequences (name, current) VALUES (?, ?)',
      [seq.name, seq.current]
    );
  }

  // Account groups
  const groups = [
    { id: 'ag1', code: '1', name: 'Assets', name_ar: 'الأصول', type: 'asset' },
    { id: 'ag2', code: '2', name: 'Liabilities', name_ar: 'الخصوم', type: 'liability' },
    { id: 'ag3', code: '3', name: 'Equity', name_ar: 'حقوق الملكية', type: 'equity' },
    { id: 'ag4', code: '4', name: 'Income', name_ar: 'الإيرادات', type: 'income' },
    { id: 'ag5', code: '5', name: 'Expenses', name_ar: 'المصروفات', type: 'expense' },
    { id: 'ag6', code: '6', name: 'Inventory', name_ar: 'المخزون', type: 'asset' },
    { id: 'ag7', code: '7', name: 'Customers', name_ar: 'العملاء', type: 'asset' },
    { id: 'ag8', code: '8', name: 'Suppliers', name_ar: 'الموردون', type: 'liability' },
  ];
  for (const g of groups) {
    await db.runAsync(
      'INSERT OR IGNORE INTO account_groups (id, code, name, name_ar, type) VALUES (?,?,?,?,?)',
      [g.id, g.code, g.name, g.name_ar, g.type]
    );
  }

  // Currencies
  const currencies = [
    { id: 'c1', code: 'YER', name: 'Yemeni Rial', name_ar: 'ريال يمني', symbol: 'ر.ي', rate: 1, is_default: 1 },
    { id: 'c2', code: 'USD', name: 'US Dollar', name_ar: 'دولار أمريكي', symbol: '$', rate: 530, is_default: 0 },
    { id: 'c3', code: 'SAR', name: 'Saudi Riyal', name_ar: 'ريال سعودي', symbol: 'ر.س', rate: 141, is_default: 0 },
  ];
  for (const c of currencies) {
    await db.runAsync(
      'INSERT OR IGNORE INTO currencies (id,code,name,name_ar,symbol,rate,is_default) VALUES (?,?,?,?,?,?,?)',
      [c.id, c.code, c.name, c.name_ar, c.symbol, c.rate, c.is_default]
    );
  }

  // System accounts
  const accounts = [
    { id: 'acc1', code: '10001', name: 'Cash', name_ar: 'الصندوق النقدي', group_id: 'ag1', type: 'asset', balance: 0, currency_id: 'c1' },
    { id: 'acc2', code: '10002', name: 'Bank', name_ar: 'البنك', group_id: 'ag1', type: 'asset', balance: 0, currency_id: 'c1' },
    { id: 'acc3', code: '10003', name: 'Accounts Receivable', name_ar: 'حسابات القبض', group_id: 'ag7', type: 'asset', balance: 0, currency_id: 'c1' },
    { id: 'acc4', code: '20001', name: 'Accounts Payable', name_ar: 'حسابات الدفع', group_id: 'ag8', type: 'liability', balance: 0, currency_id: 'c1' },
    { id: 'acc5', code: '30001', name: 'Owner Equity', name_ar: 'حقوق الملكية', group_id: 'ag3', type: 'equity', balance: 0, currency_id: 'c1' },
    { id: 'acc6', code: '40001', name: 'Sales Revenue', name_ar: 'إيرادات المبيعات', group_id: 'ag4', type: 'income', balance: 0, currency_id: 'c1' },
    { id: 'acc7', code: '50001', name: 'Cost of Goods Sold', name_ar: 'تكلفة البضاعة المباعة', group_id: 'ag5', type: 'expense', balance: 0, currency_id: 'c1' },
    { id: 'acc8', code: '50002', name: 'General Expenses', name_ar: 'المصروفات العامة', group_id: 'ag5', type: 'expense', balance: 0, currency_id: 'c1' },
    { id: 'acc9', code: '60001', name: 'Inventory', name_ar: 'المخزون', group_id: 'ag6', type: 'asset', balance: 0, currency_id: 'c1' },
  ];
  for (const a of accounts) {
    await db.runAsync(
      'INSERT OR IGNORE INTO accounts (id,code,name,name_ar,group_id,type,balance,currency_id) VALUES (?,?,?,?,?,?,?,?)',
      [a.id, a.code, a.name, a.name_ar, a.group_id, a.type, a.balance, a.currency_id]
    );
  }

  // Warehouses
  await db.runAsync(
    'INSERT OR IGNORE INTO warehouses (id,code,name,name_ar,location) VALUES (?,?,?,?,?)',
    ['w1', 'WH-001', 'Main Warehouse', 'المستودع الرئيسي', 'Central']
  );

  // Units
  const units = [
    { id: 'u1', code: 'KG', name: 'Kilogram', name_ar: 'كيلوجرام' },
    { id: 'u2', code: 'PCS', name: 'Piece', name_ar: 'قطعة' },
    { id: 'u3', code: 'BOX', name: 'Box', name_ar: 'صندوق' },
    { id: 'u4', code: 'CTN', name: 'Carton', name_ar: 'كرتون' },
    { id: 'u5', code: 'LTR', name: 'Liter', name_ar: 'لتر' },
  ];
  for (const u of units) {
    await db.runAsync('INSERT OR IGNORE INTO units (id,code,name,name_ar) VALUES (?,?,?,?)', [u.id, u.code, u.name, u.name_ar]);
  }

  // Categories
  const cats = [
    { id: 'cat1', code: 'FOOD', name: 'Food', name_ar: 'غذاء' },
    { id: 'cat2', code: 'ELECT', name: 'Electronics', name_ar: 'إلكترونيات' },
    { id: 'cat3', code: 'CLOTH', name: 'Clothing', name_ar: 'ملابس' },
    { id: 'cat4', code: 'BLDG', name: 'Building', name_ar: 'مواد بناء' },
  ];
  for (const c of cats) {
    await db.runAsync('INSERT OR IGNORE INTO categories (id,code,name,name_ar) VALUES (?,?,?,?)', [c.id, c.code, c.name, c.name_ar]);
  }

  // Welcome notification
  await db.runAsync(
    'INSERT OR IGNORE INTO notifications (id,type,title,message) VALUES (?,?,?,?)',
    ['notif1', 'system', 'مرحباً بك', 'تم تثبيت دفتر المحاسب الذكي بنجاح. النسخة التجريبية 90 يوم']
  );
}

export async function nextSequence(db: SQLite.SQLiteDatabase, name: string): Promise<number> {
  await db.runAsync(
    'UPDATE sequences SET current = current + 1 WHERE name = ?',
    [name]
  );
  const row = await db.getFirstAsync<{ current: number }>(
    'SELECT current FROM sequences WHERE name = ?',
    [name]
  );
  return row?.current ?? 1;
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}
