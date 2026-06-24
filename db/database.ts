import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('accountant.db');
    await _db.execAsync(CREATE_TABLES_SQL);
    // تأكد من تهيئة الحسابات الرئيسية
    await _db.execAsync(`
      INSERT OR IGNORE INTO account_groups (id, name_ar, group_type) VALUES 
      ('g1', 'الأصول', 'assets'),
      ('g2', 'الخصوم', 'liabilities'),
      ('g3', 'حقوق الملكية', 'equity'),
      ('g4', 'الإيرادات', 'income'),
      ('g5', 'المصروفات', 'expenses');
    `);
  }
  return _db;
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

export function formatNumber(num: number): string {
  return num.toLocaleString('ar-YE', { minimumFractionDigits: 2 });
}
