import type { SQLiteDatabase } from 'expo-sqlite';
import { genId, nextSequence } from './database';

// ─────────────────────────────────────────────
// TYPES (shared with context)
// ─────────────────────────────────────────────
export interface Account {
  id: string; code: string; name: string; nameAr: string;
  groupId: string; type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  balance: number; currencyId: string; notes: string; isActive: boolean; createdAt: string;
}
export interface AccountGroup {
  id: string; code: string; name: string; nameAr: string; type: string;
}
export interface Currency {
  id: string; code: string; name: string; nameAr: string; symbol: string; rate: number; isDefault: boolean;
}
export interface Customer {
  id: string; code: string; name: string; nameAr: string; phone: string; address: string;
  groupId: string; balance: number; creditLimit: number; accountId: string; notes: string; createdAt: string;
}
export interface Supplier {
  id: string; code: string; name: string; nameAr: string; phone: string; address: string;
  balance: number; accountId: string; notes: string; createdAt: string;
}
export interface Item {
  id: string; code: string; name: string; nameAr: string; categoryId: string; unitId: string;
  brandId: string; costPrice: number; salePrice: number; quantity: number; minQuantity: number;
  warehouseId: string; expiryDate: string; accountId: string; notes: string; createdAt: string;
}
export interface Warehouse {
  id: string; code: string; name: string; nameAr: string; location: string;
}
export interface Unit { id: string; code: string; name: string; nameAr: string; }
export interface Category { id: string; code: string; name: string; nameAr: string; }
export interface Brand { id: string; name: string; nameAr: string; }
export interface SalesRep {
  id: string; code: string; name: string; nameAr: string; phone: string;
  monthlyTarget: number; yearlyTarget: number; collectionTarget: number;
  totalSales: number; totalCollection: number; createdAt: string;
}
export interface InvoiceItem {
  itemId: string; itemName: string; qty: number; freeQty: number; price: number;
  discount: number; tax: number; total: number; costPrice: number; notes: string;
}
export interface SalesInvoice {
  id: string; number: string; date: string; customerId: string; customerName: string; repId: string;
  subtotal: number; discount: number; tax: number; total: number; paid: number; remaining: number;
  paymentType: 'cash' | 'credit' | 'bank'; notes: string; journalId: string; items: InvoiceItem[]; createdAt: string;
}
export interface PurchaseInvoice {
  id: string; number: string; date: string; supplierId: string; supplierName: string;
  subtotal: number; discount: number; tax: number; total: number; paid: number; remaining: number;
  paymentType: 'cash' | 'credit' | 'bank'; notes: string; journalId: string; items: InvoiceItem[]; createdAt: string;
}
export interface JournalEntry {
  id: string; number: string; date: string; description: string; descriptionAr: string;
  totalDebit: number; totalCredit: number; isRecurring: boolean; refType: string; refId: string;
  lines: JournalLine[]; createdAt: string;
}
export interface JournalLine {
  id?: string; entryId?: string; accountId: string; accountName: string; debit: number; credit: number; notes: string;
}
export interface Voucher {
  id: string; number: string; type: 'receipt' | 'payment'; date: string; accountId: string;
  accountName: string; amount: number; description: string; refId: string; paymentMethod: string; createdAt: string;
}
export interface Notification {
  id: string; type: 'subscription' | 'expiry' | 'reminder' | 'system'; title: string; message: string; read: boolean; createdAt: string;
}

// ─────────────────────────────────────────────
// ACCOUNT GROUPS
// ─────────────────────────────────────────────
export const AccountGroupRepo = {
  async getAll(db: SQLiteDatabase): Promise<AccountGroup[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM account_groups ORDER BY code');
    return rows.map(r => ({ id: r.id, code: r.code, name: r.name, nameAr: r.name_ar, type: r.type }));
  },
  async upsert(db: SQLiteDatabase, g: Omit<AccountGroup, 'id'>): Promise<string> {
    const id = genId();
    await db.runAsync(
      'INSERT INTO account_groups (id,code,name,name_ar,type) VALUES (?,?,?,?,?)',
      [id, g.code, g.name, g.nameAr, g.type]
    );
    return id;
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM account_groups WHERE id=?', [id]);
  },
};

// ─────────────────────────────────────────────
// CURRENCIES
// ─────────────────────────────────────────────
export const CurrencyRepo = {
  async getAll(db: SQLiteDatabase): Promise<Currency[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM currencies ORDER BY is_default DESC, code');
    return rows.map(r => ({ id: r.id, code: r.code, name: r.name, nameAr: r.name_ar, symbol: r.symbol, rate: r.rate, isDefault: !!r.is_default }));
  },
  async upsert(db: SQLiteDatabase, c: Omit<Currency, 'id'>): Promise<string> {
    const id = genId();
    await db.runAsync(
      'INSERT INTO currencies (id,code,name,name_ar,symbol,rate,is_default) VALUES (?,?,?,?,?,?,?)',
      [id, c.code, c.name, c.nameAr, c.symbol, c.rate, c.isDefault ? 1 : 0]
    );
    return id;
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM currencies WHERE id=?', [id]);
  },
};

// ─────────────────────────────────────────────
// ACCOUNTS
// ─────────────────────────────────────────────
export const AccountRepo = {
  async getAll(db: SQLiteDatabase): Promise<Account[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM accounts WHERE is_active=1 ORDER BY code');
    return rows.map(mapAccount);
  },
  async getById(db: SQLiteDatabase, id: string): Promise<Account | null> {
    const row = await db.getFirstAsync<any>('SELECT * FROM accounts WHERE id=?', [id]);
    return row ? mapAccount(row) : null;
  },
  async create(db: SQLiteDatabase, a: Omit<Account, 'id' | 'createdAt' | 'code'>): Promise<{ id: string; code: string }> {
    const prefix = typeToPrefix(a.type);
    const seq = await nextSequence(db, 'account');
    const code = prefix + seq.toString().padStart(5, '0').slice(-5);
    const id = genId();
    await db.runAsync(
      'INSERT INTO accounts (id,code,name,name_ar,group_id,type,balance,currency_id,notes) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, code, a.name, a.nameAr, a.groupId, a.type, a.balance ?? 0, a.currencyId || 'c1', a.notes || '']
    );
    return { id, code };
  },
  async update(db: SQLiteDatabase, id: string, a: Partial<Account>): Promise<void> {
    const fields: string[] = [];
    const vals: any[] = [];
    if (a.name !== undefined) { fields.push('name=?'); vals.push(a.name); }
    if (a.nameAr !== undefined) { fields.push('name_ar=?'); vals.push(a.nameAr); }
    if (a.groupId !== undefined) { fields.push('group_id=?'); vals.push(a.groupId); }
    if (a.type !== undefined) { fields.push('type=?'); vals.push(a.type); }
    if (a.balance !== undefined) { fields.push('balance=?'); vals.push(a.balance); }
    if (a.currencyId !== undefined) { fields.push('currency_id=?'); vals.push(a.currencyId); }
    if (a.notes !== undefined) { fields.push('notes=?'); vals.push(a.notes); }
    if (fields.length === 0) return;
    await db.runAsync(`UPDATE accounts SET ${fields.join(',')} WHERE id=?`, [...vals, id]);
  },
  async updateBalance(db: SQLiteDatabase, id: string, delta: number): Promise<void> {
    await db.runAsync('UPDATE accounts SET balance=balance+? WHERE id=?', [delta, id]);
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('UPDATE accounts SET is_active=0 WHERE id=?', [id]);
  },
  async checkDuplicate(db: SQLiteDatabase, nameAr: string, name: string, excludeId?: string): Promise<boolean> {
    const row = await db.getFirstAsync<any>(
      'SELECT id FROM accounts WHERE (name_ar=? OR name=?) AND id!=? AND is_active=1',
      [nameAr, name, excludeId || '']
    );
    return !!row;
  },
  async getStatement(db: SQLiteDatabase, accountId: string, from?: string, to?: string): Promise<any[]> {
    let sql = `
      SELECT jl.*, je.date, je.number, je.description
      FROM journal_lines jl
      JOIN journal_entries je ON je.id=jl.entry_id
      WHERE jl.account_id=?`;
    const args: any[] = [accountId];
    if (from) { sql += ' AND je.date>=?'; args.push(from); }
    if (to) { sql += ' AND je.date<=?'; args.push(to); }
    sql += ' ORDER BY je.date, je.id';
    return db.getAllAsync<any>(sql, args);
  },
};

function typeToPrefix(type: string): string {
  switch (type) {
    case 'asset': return '1';
    case 'liability': return '2';
    case 'equity': return '3';
    case 'income': return '4';
    case 'expense': return '5';
    default: return '1';
  }
}

function mapAccount(r: any): Account {
  return {
    id: r.id, code: r.code, name: r.name, nameAr: r.name_ar,
    groupId: r.group_id, type: r.type, balance: r.balance ?? 0,
    currencyId: r.currency_id, notes: r.notes || '', isActive: !!r.is_active,
    createdAt: r.created_at,
  };
}

// ─────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────
export const CustomerRepo = {
  async getAll(db: SQLiteDatabase): Promise<Customer[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM customers WHERE is_active=1 ORDER BY name_ar');
    return rows.map(mapCustomer);
  },
  async create(db: SQLiteDatabase, c: Omit<Customer, 'id' | 'code' | 'createdAt'>): Promise<{ id: string; code: string }> {
    const seq = await nextSequence(db, 'customer');
    const code = '7' + seq.toString().padStart(5, '0').slice(-5);
    const id = genId();
    await db.runAsync(
      'INSERT INTO customers (id,code,name,name_ar,phone,address,group_id,balance,credit_limit,account_id,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, code, c.name || '', c.nameAr || '', c.phone || '', c.address || '', c.groupId || '', c.balance ?? 0, c.creditLimit ?? 0, c.accountId || '', c.notes || '']
    );
    return { id, code };
  },
  async update(db: SQLiteDatabase, id: string, c: Partial<Customer>): Promise<void> {
    const fields: string[] = []; const vals: any[] = [];
    if (c.name !== undefined) { fields.push('name=?'); vals.push(c.name); }
    if (c.nameAr !== undefined) { fields.push('name_ar=?'); vals.push(c.nameAr); }
    if (c.phone !== undefined) { fields.push('phone=?'); vals.push(c.phone); }
    if (c.address !== undefined) { fields.push('address=?'); vals.push(c.address); }
    if (c.balance !== undefined) { fields.push('balance=?'); vals.push(c.balance); }
    if (c.creditLimit !== undefined) { fields.push('credit_limit=?'); vals.push(c.creditLimit); }
    if (c.notes !== undefined) { fields.push('notes=?'); vals.push(c.notes); }
    if (!fields.length) return;
    await db.runAsync(`UPDATE customers SET ${fields.join(',')} WHERE id=?`, [...vals, id]);
  },
  async updateBalance(db: SQLiteDatabase, id: string, delta: number): Promise<void> {
    await db.runAsync('UPDATE customers SET balance=balance+? WHERE id=?', [delta, id]);
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('UPDATE customers SET is_active=0 WHERE id=?', [id]);
  },
  async checkDuplicate(db: SQLiteDatabase, nameAr: string, excludeId?: string): Promise<boolean> {
    const row = await db.getFirstAsync<any>('SELECT id FROM customers WHERE name_ar=? AND id!=? AND is_active=1', [nameAr, excludeId || '']);
    return !!row;
  },
};
function mapCustomer(r: any): Customer {
  return { id: r.id, code: r.code, name: r.name, nameAr: r.name_ar, phone: r.phone || '', address: r.address || '', groupId: r.group_id || '', balance: r.balance ?? 0, creditLimit: r.credit_limit ?? 0, accountId: r.account_id || '', notes: r.notes || '', createdAt: r.created_at };
}

// ─────────────────────────────────────────────
// SUPPLIERS
// ─────────────────────────────────────────────
export const SupplierRepo = {
  async getAll(db: SQLiteDatabase): Promise<Supplier[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM suppliers WHERE is_active=1 ORDER BY name_ar');
    return rows.map(mapSupplier);
  },
  async create(db: SQLiteDatabase, s: Omit<Supplier, 'id' | 'code' | 'createdAt'>): Promise<{ id: string; code: string }> {
    const seq = await nextSequence(db, 'supplier');
    const code = '8' + seq.toString().padStart(5, '0').slice(-5);
    const id = genId();
    await db.runAsync(
      'INSERT INTO suppliers (id,code,name,name_ar,phone,address,balance,account_id,notes) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, code, s.name || '', s.nameAr || '', s.phone || '', s.address || '', s.balance ?? 0, s.accountId || '', s.notes || '']
    );
    return { id, code };
  },
  async update(db: SQLiteDatabase, id: string, s: Partial<Supplier>): Promise<void> {
    const fields: string[] = []; const vals: any[] = [];
    if (s.name !== undefined) { fields.push('name=?'); vals.push(s.name); }
    if (s.nameAr !== undefined) { fields.push('name_ar=?'); vals.push(s.nameAr); }
    if (s.phone !== undefined) { fields.push('phone=?'); vals.push(s.phone); }
    if (s.address !== undefined) { fields.push('address=?'); vals.push(s.address); }
    if (s.balance !== undefined) { fields.push('balance=?'); vals.push(s.balance); }
    if (s.notes !== undefined) { fields.push('notes=?'); vals.push(s.notes); }
    if (!fields.length) return;
    await db.runAsync(`UPDATE suppliers SET ${fields.join(',')} WHERE id=?`, [...vals, id]);
  },
  async updateBalance(db: SQLiteDatabase, id: string, delta: number): Promise<void> {
    await db.runAsync('UPDATE suppliers SET balance=balance+? WHERE id=?', [delta, id]);
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('UPDATE suppliers SET is_active=0 WHERE id=?', [id]);
  },
  async checkDuplicate(db: SQLiteDatabase, nameAr: string, excludeId?: string): Promise<boolean> {
    const row = await db.getFirstAsync<any>('SELECT id FROM suppliers WHERE name_ar=? AND id!=? AND is_active=1', [nameAr, excludeId || '']);
    return !!row;
  },
};
function mapSupplier(r: any): Supplier {
  return { id: r.id, code: r.code, name: r.name, nameAr: r.name_ar, phone: r.phone || '', address: r.address || '', balance: r.balance ?? 0, accountId: r.account_id || '', notes: r.notes || '', createdAt: r.created_at };
}

// ─────────────────────────────────────────────
// ITEMS
// ─────────────────────────────────────────────
export const ItemRepo = {
  async getAll(db: SQLiteDatabase): Promise<Item[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM items WHERE is_active=1 ORDER BY name_ar');
    return rows.map(mapItem);
  },
  async getById(db: SQLiteDatabase, id: string): Promise<Item | null> {
    const row = await db.getFirstAsync<any>('SELECT * FROM items WHERE id=?', [id]);
    return row ? mapItem(row) : null;
  },
  async create(db: SQLiteDatabase, item: Omit<Item, 'id' | 'code' | 'createdAt'>): Promise<{ id: string; code: string }> {
    const seq = await nextSequence(db, 'item');
    const code = '6' + seq.toString().padStart(5, '0').slice(-5);
    const id = genId();
    await db.runAsync(
      'INSERT INTO items (id,code,name,name_ar,category_id,unit_id,brand_id,cost_price,sale_price,quantity,min_quantity,warehouse_id,expiry_date,account_id,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, code, item.name || '', item.nameAr || '', item.categoryId || '', item.unitId || '', item.brandId || '', item.costPrice ?? 0, item.salePrice ?? 0, item.quantity ?? 0, item.minQuantity ?? 0, item.warehouseId || 'w1', item.expiryDate || '', item.accountId || '', item.notes || '']
    );
    return { id, code };
  },
  async update(db: SQLiteDatabase, id: string, item: Partial<Item>): Promise<void> {
    const fields: string[] = []; const vals: any[] = [];
    const map: Record<string, string> = { name: 'name', nameAr: 'name_ar', categoryId: 'category_id', unitId: 'unit_id', brandId: 'brand_id', costPrice: 'cost_price', salePrice: 'sale_price', quantity: 'quantity', minQuantity: 'min_quantity', warehouseId: 'warehouse_id', expiryDate: 'expiry_date', notes: 'notes' };
    for (const [k, col] of Object.entries(map)) {
      if ((item as any)[k] !== undefined) { fields.push(`${col}=?`); vals.push((item as any)[k]); }
    }
    if (!fields.length) return;
    await db.runAsync(`UPDATE items SET ${fields.join(',')} WHERE id=?`, [...vals, id]);
  },
  async adjustQuantity(db: SQLiteDatabase, id: string, delta: number): Promise<void> {
    await db.runAsync('UPDATE items SET quantity=MAX(0,quantity+?) WHERE id=?', [delta, id]);
  },
  async updateCostPrice(db: SQLiteDatabase, id: string, newCost: number, newQty: number, addedQty: number): Promise<void> {
    // Weighted average cost
    const row = await db.getFirstAsync<any>('SELECT quantity, cost_price FROM items WHERE id=?', [id]);
    if (!row) return;
    const currentQty = row.quantity as number;
    const currentCost = row.cost_price as number;
    const totalCost = currentQty * currentCost + addedQty * newCost;
    const totalQty = currentQty + addedQty;
    const avgCost = totalQty > 0 ? totalCost / totalQty : newCost;
    await db.runAsync('UPDATE items SET cost_price=?, quantity=? WHERE id=?', [avgCost, totalQty, id]);
  },
  async checkDuplicate(db: SQLiteDatabase, nameAr: string, excludeId?: string): Promise<boolean> {
    const row = await db.getFirstAsync<any>('SELECT id FROM items WHERE name_ar=? AND id!=? AND is_active=1', [nameAr, excludeId || '']);
    return !!row;
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('UPDATE items SET is_active=0 WHERE id=?', [id]);
  },
};
function mapItem(r: any): Item {
  return { id: r.id, code: r.code, name: r.name, nameAr: r.name_ar, categoryId: r.category_id || '', unitId: r.unit_id || '', brandId: r.brand_id || '', costPrice: r.cost_price ?? 0, salePrice: r.sale_price ?? 0, quantity: r.quantity ?? 0, minQuantity: r.min_quantity ?? 0, warehouseId: r.warehouse_id || '', expiryDate: r.expiry_date || '', accountId: r.account_id || '', notes: r.notes || '', createdAt: r.created_at };
}

// ─────────────────────────────────────────────
// WAREHOUSES
// ─────────────────────────────────────────────
export const WarehouseRepo = {
  async getAll(db: SQLiteDatabase): Promise<Warehouse[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM warehouses WHERE is_active=1 ORDER BY name_ar');
    return rows.map(r => ({ id: r.id, code: r.code, name: r.name, nameAr: r.name_ar, location: r.location || '' }));
  },
  async create(db: SQLiteDatabase, w: Omit<Warehouse, 'id' | 'code'>): Promise<string> {
    const id = genId();
    const code = 'WH-' + Date.now().toString().slice(-4);
    await db.runAsync('INSERT INTO warehouses (id,code,name,name_ar,location) VALUES (?,?,?,?,?)', [id, code, w.name, w.nameAr, w.location || '']);
    return id;
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('UPDATE warehouses SET is_active=0 WHERE id=?', [id]);
  },
};

// ─────────────────────────────────────────────
// UNITS, CATEGORIES, BRANDS
// ─────────────────────────────────────────────
export const UnitRepo = {
  async getAll(db: SQLiteDatabase): Promise<Unit[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM units ORDER BY name_ar');
    return rows.map(r => ({ id: r.id, code: r.code, name: r.name, nameAr: r.name_ar }));
  },
  async create(db: SQLiteDatabase, u: Omit<Unit, 'id' | 'code'>): Promise<string> {
    const id = genId(); const code = u.name.toUpperCase().slice(0, 5);
    await db.runAsync('INSERT INTO units (id,code,name,name_ar) VALUES (?,?,?,?)', [id, code, u.name, u.nameAr]);
    return id;
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM units WHERE id=?', [id]);
  },
};
export const CategoryRepo = {
  async getAll(db: SQLiteDatabase): Promise<Category[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM categories ORDER BY name_ar');
    return rows.map(r => ({ id: r.id, code: r.code, name: r.name, nameAr: r.name_ar }));
  },
  async create(db: SQLiteDatabase, c: Omit<Category, 'id' | 'code'>): Promise<string> {
    const id = genId(); const code = c.name.toUpperCase().slice(0, 6);
    await db.runAsync('INSERT INTO categories (id,code,name,name_ar) VALUES (?,?,?,?)', [id, code, c.name, c.nameAr]);
    return id;
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM categories WHERE id=?', [id]);
  },
};
export const BrandRepo = {
  async getAll(db: SQLiteDatabase): Promise<Brand[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM brands ORDER BY name_ar');
    return rows.map(r => ({ id: r.id, name: r.name, nameAr: r.name_ar }));
  },
  async create(db: SQLiteDatabase, b: Omit<Brand, 'id'>): Promise<string> {
    const id = genId();
    await db.runAsync('INSERT INTO brands (id,name,name_ar) VALUES (?,?,?)', [id, b.name, b.nameAr]);
    return id;
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM brands WHERE id=?', [id]);
  },
};

// ─────────────────────────────────────────────
// SALES REPS
// ─────────────────────────────────────────────
export const SalesRepRepo = {
  async getAll(db: SQLiteDatabase): Promise<SalesRep[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM sales_reps ORDER BY name_ar');
    return rows.map(mapRep);
  },
  async create(db: SQLiteDatabase, r: Omit<SalesRep, 'id' | 'code' | 'createdAt'>): Promise<string> {
    const seq = await nextSequence(db, 'sales_rep'); const code = 'REP-' + seq.toString().padStart(3, '0');
    const id = genId();
    await db.runAsync('INSERT INTO sales_reps (id,code,name,name_ar,phone,monthly_target,yearly_target,collection_target,total_sales,total_collection) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, code, r.name || '', r.nameAr || '', r.phone || '', r.monthlyTarget ?? 0, r.yearlyTarget ?? 0, r.collectionTarget ?? 0, r.totalSales ?? 0, r.totalCollection ?? 0]);
    return id;
  },
  async update(db: SQLiteDatabase, id: string, r: Partial<SalesRep>): Promise<void> {
    const fields: string[] = []; const vals: any[] = [];
    if (r.name !== undefined) { fields.push('name=?'); vals.push(r.name); }
    if (r.nameAr !== undefined) { fields.push('name_ar=?'); vals.push(r.nameAr); }
    if (r.phone !== undefined) { fields.push('phone=?'); vals.push(r.phone); }
    if (r.monthlyTarget !== undefined) { fields.push('monthly_target=?'); vals.push(r.monthlyTarget); }
    if (r.yearlyTarget !== undefined) { fields.push('yearly_target=?'); vals.push(r.yearlyTarget); }
    if (r.collectionTarget !== undefined) { fields.push('collection_target=?'); vals.push(r.collectionTarget); }
    if (r.totalSales !== undefined) { fields.push('total_sales=?'); vals.push(r.totalSales); }
    if (!fields.length) return;
    await db.runAsync(`UPDATE sales_reps SET ${fields.join(',')} WHERE id=?`, [...vals, id]);
  },
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM sales_reps WHERE id=?', [id]);
  },
};
function mapRep(r: any): SalesRep {
  return { id: r.id, code: r.code || '', name: r.name, nameAr: r.name_ar, phone: r.phone || '', monthlyTarget: r.monthly_target ?? 0, yearlyTarget: r.yearly_target ?? 0, collectionTarget: r.collection_target ?? 0, totalSales: r.total_sales ?? 0, totalCollection: r.total_collection ?? 0, createdAt: r.created_at };
}

// ─────────────────────────────────────────────
// JOURNAL ENTRIES
// ─────────────────────────────────────────────
export const JournalRepo = {
  async getAll(db: SQLiteDatabase, filters?: { from?: string; to?: string; accountId?: string }): Promise<JournalEntry[]> {
    let sql = 'SELECT * FROM journal_entries';
    const args: any[] = [];
    const conds: string[] = [];
    if (filters?.from) { conds.push('date>=?'); args.push(filters.from); }
    if (filters?.to) { conds.push('date<=?'); args.push(filters.to); }
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY date DESC, number DESC';
    const entries = await db.getAllAsync<any>(sql, args);
    return Promise.all(entries.map(async e => {
      const lines = await db.getAllAsync<any>('SELECT * FROM journal_lines WHERE entry_id=?', [e.id]);
      return { ...mapJournal(e), lines: lines.map(mapLine) };
    }));
  },
  async create(db: SQLiteDatabase, entry: Omit<JournalEntry, 'id' | 'number' | 'createdAt'>): Promise<string> {
    const seq = await nextSequence(db, 'journal');
    const number = 'JV-' + seq.toString().padStart(6, '0');
    const id = genId();
    await db.runAsync(
      'INSERT INTO journal_entries (id,number,date,description,description_ar,total_debit,total_credit,is_recurring,ref_type,ref_id) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, number, entry.date, entry.description, entry.descriptionAr || '', entry.totalDebit, entry.totalCredit, entry.isRecurring ? 1 : 0, entry.refType || '', entry.refId || '']
    );
    for (const line of entry.lines) {
      const lineId = genId();
      await db.runAsync('INSERT INTO journal_lines (id,entry_id,account_id,account_name,debit,credit,notes) VALUES (?,?,?,?,?,?,?)',
        [lineId, id, line.accountId, line.accountName || '', line.debit, line.credit, line.notes || '']);
      // Update account balance
      const delta = line.debit - line.credit;
      await AccountRepo.updateBalance(db, line.accountId, delta);
    }
    return id;
  },
};
function mapJournal(r: any): Omit<JournalEntry, 'lines'> {
  return { id: r.id, number: r.number, date: r.date, description: r.description, descriptionAr: r.description_ar || '', totalDebit: r.total_debit ?? 0, totalCredit: r.total_credit ?? 0, isRecurring: !!r.is_recurring, refType: r.ref_type || '', refId: r.ref_id || '', createdAt: r.created_at };
}
function mapLine(r: any): JournalLine {
  return { id: r.id, entryId: r.entry_id, accountId: r.account_id, accountName: r.account_name || '', debit: r.debit ?? 0, credit: r.credit ?? 0, notes: r.notes || '' };
}

// ─────────────────────────────────────────────
// VOUCHERS
// ─────────────────────────────────────────────
export const VoucherRepo = {
  async getAll(db: SQLiteDatabase, type?: string): Promise<Voucher[]> {
    const rows = type
      ? await db.getAllAsync<any>('SELECT * FROM vouchers WHERE type=? ORDER BY date DESC', [type])
      : await db.getAllAsync<any>('SELECT * FROM vouchers ORDER BY date DESC');
    return rows.map(mapVoucher);
  },
  async create(db: SQLiteDatabase, v: Omit<Voucher, 'id' | 'number' | 'createdAt'>): Promise<string> {
    const seqName = v.type === 'receipt' ? 'receipt_voucher' : 'payment_voucher';
    const prefix = v.type === 'receipt' ? 'RV-' : 'PV-';
    const seq = await nextSequence(db, seqName);
    const number = prefix + seq.toString().padStart(6, '0');
    const id = genId();
    await db.runAsync('INSERT INTO vouchers (id,number,type,date,account_id,account_name,amount,description,ref_id,payment_method) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, number, v.type, v.date, v.accountId, v.accountName || '', v.amount, v.description || '', v.refId || '', v.paymentMethod || 'cash']);
    return id;
  },
};
function mapVoucher(r: any): Voucher {
  return { id: r.id, number: r.number, type: r.type, date: r.date, accountId: r.account_id, accountName: r.account_name || '', amount: r.amount ?? 0, description: r.description || '', refId: r.ref_id || '', paymentMethod: r.payment_method || 'cash', createdAt: r.created_at };
}

// ─────────────────────────────────────────────
// SALES INVOICES
// ─────────────────────────────────────────────
export const SalesInvoiceRepo = {
  async getAll(db: SQLiteDatabase, filters?: { from?: string; to?: string; customerId?: string }): Promise<SalesInvoice[]> {
    let sql = 'SELECT * FROM sales_invoices';
    const conds: string[] = []; const args: any[] = [];
    if (filters?.from) { conds.push('date>=?'); args.push(filters.from); }
    if (filters?.to) { conds.push('date<=?'); args.push(filters.to); }
    if (filters?.customerId) { conds.push('customer_id=?'); args.push(filters.customerId); }
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY date DESC, number DESC';
    const invoices = await db.getAllAsync<any>(sql, args);
    return Promise.all(invoices.map(async inv => {
      const items = await db.getAllAsync<any>('SELECT * FROM sales_invoice_items WHERE invoice_id=?', [inv.id]);
      return { ...mapSalesInvoice(inv), items: items.map(mapInvoiceItem) };
    }));
  },
  async create(db: SQLiteDatabase, inv: Omit<SalesInvoice, 'id' | 'number' | 'createdAt'>): Promise<string> {
    const seq = await nextSequence(db, 'sales_invoice');
    const number = 'SI-' + seq.toString().padStart(6, '0');
    const id = genId();
    await db.runAsync(
      'INSERT INTO sales_invoices (id,number,date,customer_id,customer_name,rep_id,subtotal,discount,tax,total,paid,remaining,payment_type,notes,journal_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, number, inv.date, inv.customerId || '', inv.customerName || '', inv.repId || '', inv.subtotal, inv.discount, inv.tax, inv.total, inv.paid, inv.remaining, inv.paymentType, inv.notes || '', inv.journalId || '']
    );
    for (const line of inv.items) {
      await db.runAsync('INSERT INTO sales_invoice_items (id,invoice_id,item_id,item_name,qty,free_qty,price,discount,tax,total,cost_price,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [genId(), id, line.itemId, line.itemName, line.qty, line.freeQty ?? 0, line.price, line.discount, line.tax, line.total, line.costPrice ?? 0, line.notes || '']);
    }
    return id;
  },
};
function mapSalesInvoice(r: any): Omit<SalesInvoice, 'items'> {
  return { id: r.id, number: r.number, date: r.date, customerId: r.customer_id || '', customerName: r.customer_name || '', repId: r.rep_id || '', subtotal: r.subtotal ?? 0, discount: r.discount ?? 0, tax: r.tax ?? 0, total: r.total ?? 0, paid: r.paid ?? 0, remaining: r.remaining ?? 0, paymentType: r.payment_type as any, notes: r.notes || '', journalId: r.journal_id || '', createdAt: r.created_at };
}

// ─────────────────────────────────────────────
// PURCHASE INVOICES
// ─────────────────────────────────────────────
export const PurchaseInvoiceRepo = {
  async getAll(db: SQLiteDatabase, filters?: { from?: string; to?: string; supplierId?: string }): Promise<PurchaseInvoice[]> {
    let sql = 'SELECT * FROM purchase_invoices';
    const conds: string[] = []; const args: any[] = [];
    if (filters?.from) { conds.push('date>=?'); args.push(filters.from); }
    if (filters?.to) { conds.push('date<=?'); args.push(filters.to); }
    if (filters?.supplierId) { conds.push('supplier_id=?'); args.push(filters.supplierId); }
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY date DESC, number DESC';
    const invoices = await db.getAllAsync<any>(sql, args);
    return Promise.all(invoices.map(async inv => {
      const items = await db.getAllAsync<any>('SELECT * FROM purchase_invoice_items WHERE invoice_id=?', [inv.id]);
      return { ...mapPurchaseInvoice(inv), items: items.map(mapInvoiceItem) };
    }));
  },
  async create(db: SQLiteDatabase, inv: Omit<PurchaseInvoice, 'id' | 'number' | 'createdAt'>): Promise<string> {
    const seq = await nextSequence(db, 'purchase_invoice');
    const number = 'PI-' + seq.toString().padStart(6, '0');
    const id = genId();
    await db.runAsync(
      'INSERT INTO purchase_invoices (id,number,date,supplier_id,supplier_name,subtotal,discount,tax,total,paid,remaining,payment_type,notes,journal_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, number, inv.date, inv.supplierId || '', inv.supplierName || '', inv.subtotal, inv.discount, inv.tax, inv.total, inv.paid, inv.remaining, inv.paymentType, inv.notes || '', inv.journalId || '']
    );
    for (const line of inv.items) {
      await db.runAsync('INSERT INTO purchase_invoice_items (id,invoice_id,item_id,item_name,qty,free_qty,price,discount,tax,total,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [genId(), id, line.itemId, line.itemName, line.qty, line.freeQty ?? 0, line.price, line.discount, line.tax, line.total, line.notes || '']);
    }
    return id;
  },
};
function mapPurchaseInvoice(r: any): Omit<PurchaseInvoice, 'items'> {
  return { id: r.id, number: r.number, date: r.date, supplierId: r.supplier_id || '', supplierName: r.supplier_name || '', subtotal: r.subtotal ?? 0, discount: r.discount ?? 0, tax: r.tax ?? 0, total: r.total ?? 0, paid: r.paid ?? 0, remaining: r.remaining ?? 0, paymentType: r.payment_type as any, notes: r.notes || '', journalId: r.journal_id || '', createdAt: r.created_at };
}

function mapInvoiceItem(r: any): InvoiceItem {
  return { itemId: r.item_id || '', itemName: r.item_name || '', qty: r.qty ?? 0, freeQty: r.free_qty ?? 0, price: r.price ?? 0, discount: r.discount ?? 0, tax: r.tax ?? 0, total: r.total ?? 0, costPrice: r.cost_price ?? 0, notes: r.notes || '' };
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
export const NotificationRepo = {
  async getAll(db: SQLiteDatabase): Promise<Notification[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100');
    return rows.map(r => ({ id: r.id, type: r.type, title: r.title, message: r.message, read: !!r.is_read, createdAt: r.created_at }));
  },
  async markRead(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('UPDATE notifications SET is_read=1 WHERE id=?', [id]);
  },
  async markAllRead(db: SQLiteDatabase): Promise<void> {
    await db.runAsync('UPDATE notifications SET is_read=1');
  },
  async add(db: SQLiteDatabase, n: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    await db.runAsync('INSERT INTO notifications (id,type,title,message,is_read) VALUES (?,?,?,?,?)',
      [genId(), n.type, n.title, n.message, n.read ? 1 : 0]);
  },
};

// ─────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────
export const ReportRepo = {
  async getTrialBalance(db: SQLiteDatabase): Promise<{ accountId: string; accountCode: string; accountName: string; accountNameAr: string; debit: number; credit: number; balance: number }[]> {
    const sql = `
      SELECT a.id as account_id, a.code as account_code, a.name as account_name, a.name_ar as account_name_ar,
        COALESCE(SUM(jl.debit),0) as total_debit,
        COALESCE(SUM(jl.credit),0) as total_credit,
        a.balance
      FROM accounts a
      LEFT JOIN journal_lines jl ON jl.account_id=a.id
      WHERE a.is_active=1
      GROUP BY a.id
      ORDER BY a.code`;
    const rows = await db.getAllAsync<any>(sql);
    return rows.map(r => ({ accountId: r.account_id, accountCode: r.account_code, accountName: r.account_name, accountNameAr: r.account_name_ar, debit: r.total_debit ?? 0, credit: r.total_credit ?? 0, balance: r.balance ?? 0 }));
  },
  async getSalesSummary(db: SQLiteDatabase, filters?: { from?: string; to?: string; customerId?: string; repId?: string }): Promise<any> {
    let sql = 'SELECT SUM(total) as total, SUM(paid) as paid, SUM(remaining) as remaining, COUNT(*) as count FROM sales_invoices WHERE 1=1';
    const args: any[] = [];
    if (filters?.from) { sql += ' AND date>=?'; args.push(filters.from); }
    if (filters?.to) { sql += ' AND date<=?'; args.push(filters.to); }
    if (filters?.customerId) { sql += ' AND customer_id=?'; args.push(filters.customerId); }
    if (filters?.repId) { sql += ' AND rep_id=?'; args.push(filters.repId); }
    return db.getFirstAsync<any>(sql, args);
  },
  async getPurchaseSummary(db: SQLiteDatabase, filters?: { from?: string; to?: string; supplierId?: string }): Promise<any> {
    let sql = 'SELECT SUM(total) as total, SUM(paid) as paid, SUM(remaining) as remaining, COUNT(*) as count FROM purchase_invoices WHERE 1=1';
    const args: any[] = [];
    if (filters?.from) { sql += ' AND date>=?'; args.push(filters.from); }
    if (filters?.to) { sql += ' AND date<=?'; args.push(filters.to); }
    if (filters?.supplierId) { sql += ' AND supplier_id=?'; args.push(filters.supplierId); }
    return db.getFirstAsync<any>(sql, args);
  },
  async getItemSalesReport(db: SQLiteDatabase, filters?: { from?: string; to?: string; itemId?: string }): Promise<any[]> {
    let sql = `
      SELECT sii.item_id, sii.item_name,
        SUM(sii.qty) as total_qty, SUM(sii.total) as total_value,
        SUM(sii.qty * sii.cost_price) as total_cost
      FROM sales_invoice_items sii
      JOIN sales_invoices si ON si.id=sii.invoice_id
      WHERE 1=1`;
    const args: any[] = [];
    if (filters?.from) { sql += ' AND si.date>=?'; args.push(filters.from); }
    if (filters?.to) { sql += ' AND si.date<=?'; args.push(filters.to); }
    if (filters?.itemId) { sql += ' AND sii.item_id=?'; args.push(filters.itemId); }
    sql += ' GROUP BY sii.item_id ORDER BY total_value DESC';
    return db.getAllAsync<any>(sql, args);
  },
  async getCustomerBalance(db: SQLiteDatabase): Promise<any[]> {
    return db.getAllAsync<any>('SELECT id, code, name, name_ar, phone, balance FROM customers WHERE is_active=1 ORDER BY balance DESC');
  },
  async getSupplierBalance(db: SQLiteDatabase): Promise<any[]> {
    return db.getAllAsync<any>('SELECT id, code, name, name_ar, phone, balance FROM suppliers WHERE is_active=1 ORDER BY balance DESC');
  },
  async getLowStockItems(db: SQLiteDatabase): Promise<Item[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM items WHERE quantity<=min_quantity AND is_active=1 ORDER BY quantity ASC');
    return rows.map(mapItem);
  },
  async getExpiredItems(db: SQLiteDatabase): Promise<Item[]> {
    const today = new Date().toISOString().split('T')[0];
    const rows = await db.getAllAsync<any>(`SELECT * FROM items WHERE expiry_date!='' AND expiry_date<? AND is_active=1`, [today]);
    return rows.map(mapItem);
  },
};
