export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS db_version (
  version INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sequences (
  name TEXT PRIMARY KEY,
  current INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS account_groups (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS currencies (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  symbol TEXT NOT NULL,
  rate REAL NOT NULL DEFAULT 1,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  group_id TEXT NOT NULL,
  type TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  currency_id TEXT NOT NULL DEFAULT 'c1',
  notes TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(group_id) REFERENCES account_groups(id),
  FOREIGN KEY(currency_id) REFERENCES currencies(id)
);
`;

export const SEED_SEQUENCES = [
  { name: 'account', current: 10000 },
  { name: 'customer', current: 70000 },
  { name: 'supplier', current: 80000 },
  { name: 'item', current: 60000 },
  { name: 'sales_invoice', current: 0 },
  { name: 'purchase_invoice', current: 0 },
  { name: 'journal', current: 0 },
];
