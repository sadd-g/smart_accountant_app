import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { processPurchaseInvoice, processSalesInvoice } from '../db/accounting';
import { getDatabase } from '../db/database';
import {
  Account, AccountGroup, AccountGroupRepo, AccountRepo, Brand, BrandRepo,
  Category, CategoryRepo, Currency, CurrencyRepo, Customer, CustomerRepo,
  Item, ItemRepo, JournalEntry, JournalRepo, Notification, NotificationRepo,
  PurchaseInvoice, PurchaseInvoiceRepo, ReportRepo, SalesInvoice,
  SalesInvoiceRepo, SalesRep, SalesRepRepo, Supplier, SupplierRepo,
  Unit, UnitRepo, Voucher, VoucherRepo, Warehouse, WarehouseRepo,
} from '../db/repositories';
import type { InvoiceItem } from '../db/repositories';
import { seedTestData } from '../db/seed';
import type { SQLiteDatabase } from 'expo-sqlite';

export type { Account, AccountGroup, Currency, Customer, Supplier, Item, SalesInvoice, PurchaseInvoice, JournalEntry, Notification, SalesRep, InvoiceItem, Warehouse, Unit, Category, Brand, Voucher };

interface ReportFilters {
  from?: string; to?: string; customerId?: string; supplierId?: string;
  itemId?: string; accountId?: string; repId?: string; warehouseId?: string;
}

interface DatabaseContextType {
  loading: boolean;
  db: SQLiteDatabase | null;
  // Masters
  accounts: Account[];
  accountGroups: AccountGroup[];
  currencies: Currency[];
  customers: Customer[];
  suppliers: Supplier[];
  items: Item[];
  warehouses: Warehouse[];
  units: Unit[];
  categories: Category[];
  brands: Brand[];
  salesReps: SalesRep[];
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  journalEntries: JournalEntry[];
  vouchers: Voucher[];
  notifications: Notification[];
  // Accounts
  addAccount: (a: Omit<Account, 'id' | 'code' | 'createdAt'>) => Promise<boolean>;
  updateAccount: (id: string, a: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  // Customers
  addCustomer: (c: Omit<Customer, 'id' | 'code' | 'createdAt'>) => Promise<boolean>;
  updateCustomer: (id: string, c: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  // Suppliers
  addSupplier: (s: Omit<Supplier, 'id' | 'code' | 'createdAt'>) => Promise<boolean>;
  updateSupplier: (id: string, s: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  // Items
  addItem: (i: Omit<Item, 'id' | 'code' | 'createdAt'>) => Promise<boolean>;
  updateItem: (id: string, i: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  // Warehouses
  addWarehouse: (w: Omit<Warehouse, 'id' | 'code'>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  // Units / Categories / Brands
  addUnit: (u: Omit<Unit, 'id' | 'code'>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  addCategory: (c: Omit<Category, 'id' | 'code'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBrand: (b: Omit<Brand, 'id'>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  // Sales Reps
  addSalesRep: (r: Omit<SalesRep, 'id' | 'code' | 'createdAt'>) => Promise<boolean>;
  updateSalesRep: (id: string, r: Partial<SalesRep>) => Promise<void>;
  deleteSalesRep: (id: string) => Promise<void>;
  // Invoices
  addSalesInvoice: (inv: Omit<SalesInvoice, 'id' | 'number' | 'createdAt' | 'journalId'>) => Promise<void>;
  addPurchaseInvoice: (inv: Omit<PurchaseInvoice, 'id' | 'number' | 'createdAt' | 'journalId'>) => Promise<void>;
  // Journal
  addJournalEntry: (e: Omit<JournalEntry, 'id' | 'number' | 'createdAt'>) => Promise<void>;
  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  getUnreadCount: () => number;
  // Reports
  getAccountStatement: (accountId: string, from?: string, to?: string) => Promise<any[]>;
  getTrialBalance: () => Promise<any[]>;
  getSalesSummary: (filters?: ReportFilters) => Promise<any>;
  getPurchaseSummary: (filters?: ReportFilters) => Promise<any>;
  getItemSalesReport: (filters?: ReportFilters) => Promise<any[]>;
  getCustomerBalances: () => Promise<any[]>;
  getSupplierBalances: () => Promise<any[]>;
  getLowStockItems: () => Promise<Item[]>;
  getExpiredItems: () => Promise<Item[]>;
  // Refresh
  refresh: () => Promise<void>;
  // Test data
  seedDemo: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dbRef = useRef<SQLiteDatabase | null>(null);

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      const database = await getDatabase();
      dbRef.current = database;
      setDb(database);
      await loadAll(database);
    } catch (e) {
      console.error('DB init error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadAll = useCallback(async (database?: SQLiteDatabase) => {
    const d = database || dbRef.current;
    if (!d) return;
    const [accs, groups, currs, custs, supps, itms, whs, uts, cats, brnds, reps, sinvs, pinvs, journals, vouch, notifs] = await Promise.all([
      AccountRepo.getAll(d),
      AccountGroupRepo.getAll(d),
      CurrencyRepo.getAll(d),
      CustomerRepo.getAll(d),
      SupplierRepo.getAll(d),
      ItemRepo.getAll(d),
      WarehouseRepo.getAll(d),
      UnitRepo.getAll(d),
      CategoryRepo.getAll(d),
      BrandRepo.getAll(d),
      SalesRepRepo.getAll(d),
      SalesInvoiceRepo.getAll(d),
      PurchaseInvoiceRepo.getAll(d),
      JournalRepo.getAll(d),
      VoucherRepo.getAll(d),
      NotificationRepo.getAll(d),
    ]);
    setAccounts(accs); setAccountGroups(groups); setCurrencies(currs);
    setCustomers(custs); setSuppliers(supps); setItems(itms);
    setWarehouses(whs); setUnits(uts); setCategories(cats); setBrands(brnds);
    setSalesReps(reps); setSalesInvoices(sinvs); setPurchaseInvoices(pinvs);
    setJournalEntries(journals); setVouchers(vouch); setNotifications(notifs);
  }, []);

  const refresh = useCallback(() => loadAll(), [loadAll]);

  const getDb = () => dbRef.current!;

  // ── ACCOUNTS ──────────────────────────────────
  const addAccount = useCallback(async (a: Omit<Account, 'id' | 'code' | 'createdAt'>): Promise<boolean> => {
    const d = getDb();
    const dup = await AccountRepo.checkDuplicate(d, a.nameAr, a.name);
    if (dup) return false;
    await AccountRepo.create(d, a);
    await loadAll();
    return true;
  }, [loadAll]);

  const updateAccount = useCallback(async (id: string, a: Partial<Account>) => {
    await AccountRepo.update(getDb(), id, a);
    await loadAll();
  }, [loadAll]);

  const deleteAccount = useCallback(async (id: string) => {
    await AccountRepo.delete(getDb(), id);
    await loadAll();
  }, [loadAll]);

  // ── CUSTOMERS ─────────────────────────────────
  const addCustomer = useCallback(async (c: Omit<Customer, 'id' | 'code' | 'createdAt'>): Promise<boolean> => {
    const d = getDb();
    const dup = await CustomerRepo.checkDuplicate(d, c.nameAr);
    if (dup) return false;
    await CustomerRepo.create(d, c);
    await loadAll();
    return true;
  }, [loadAll]);

  const updateCustomer = useCallback(async (id: string, c: Partial<Customer>) => {
    await CustomerRepo.update(getDb(), id, c);
    await loadAll();
  }, [loadAll]);

  const deleteCustomer = useCallback(async (id: string) => {
    await CustomerRepo.delete(getDb(), id);
    await loadAll();
  }, [loadAll]);

  // ── SUPPLIERS ─────────────────────────────────
  const addSupplier = useCallback(async (s: Omit<Supplier, 'id' | 'code' | 'createdAt'>): Promise<boolean> => {
    const d = getDb();
    const dup = await SupplierRepo.checkDuplicate(d, s.nameAr);
    if (dup) return false;
    await SupplierRepo.create(d, s);
    await loadAll();
    return true;
  }, [loadAll]);

  const updateSupplier = useCallback(async (id: string, s: Partial<Supplier>) => {
    await SupplierRepo.update(getDb(), id, s);
    await loadAll();
  }, [loadAll]);

  const deleteSupplier = useCallback(async (id: string) => {
    await SupplierRepo.delete(getDb(), id);
    await loadAll();
  }, [loadAll]);

  // ── ITEMS ─────────────────────────────────────
  const addItem = useCallback(async (i: Omit<Item, 'id' | 'code' | 'createdAt'>): Promise<boolean> => {
    const d = getDb();
    const dup = await ItemRepo.checkDuplicate(d, i.nameAr);
    if (dup) return false;
    await ItemRepo.create(d, i);
    await loadAll();
    return true;
  }, [loadAll]);

  const updateItem = useCallback(async (id: string, i: Partial<Item>) => {
    await ItemRepo.update(getDb(), id, i);
    await loadAll();
  }, [loadAll]);

  const deleteItem = useCallback(async (id: string) => {
    await ItemRepo.delete(getDb(), id);
    await loadAll();
  }, [loadAll]);

  // ── WAREHOUSES ────────────────────────────────
  const addWarehouse = useCallback(async (w: Omit<Warehouse, 'id' | 'code'>) => {
    await WarehouseRepo.create(getDb(), w);
    await loadAll();
  }, [loadAll]);

  const deleteWarehouse = useCallback(async (id: string) => {
    await WarehouseRepo.delete(getDb(), id);
    await loadAll();
  }, [loadAll]);

  // ── UNITS / CATEGORIES / BRANDS ───────────────
  const addUnit = useCallback(async (u: Omit<Unit, 'id' | 'code'>) => {
    await UnitRepo.create(getDb(), u);
    await loadAll();
  }, [loadAll]);
  const deleteUnit = useCallback(async (id: string) => { await UnitRepo.delete(getDb(), id); await loadAll(); }, [loadAll]);
  const addCategory = useCallback(async (c: Omit<Category, 'id' | 'code'>) => { await CategoryRepo.create(getDb(), c); await loadAll(); }, [loadAll]);
  const deleteCategory = useCallback(async (id: string) => { await CategoryRepo.delete(getDb(), id); await loadAll(); }, [loadAll]);
  const addBrand = useCallback(async (b: Omit<Brand, 'id'>) => { await BrandRepo.create(getDb(), b); await loadAll(); }, [loadAll]);
  const deleteBrand = useCallback(async (id: string) => { await BrandRepo.delete(getDb(), id); await loadAll(); }, [loadAll]);

  // ── SALES REPS ────────────────────────────────
  const addSalesRep = useCallback(async (r: Omit<SalesRep, 'id' | 'code' | 'createdAt'>): Promise<boolean> => {
    await SalesRepRepo.create(getDb(), r);
    await loadAll();
    return true;
  }, [loadAll]);

  const updateSalesRep = useCallback(async (id: string, r: Partial<SalesRep>) => {
    await SalesRepRepo.update(getDb(), id, r);
    await loadAll();
  }, [loadAll]);

  const deleteSalesRep = useCallback(async (id: string) => {
    await SalesRepRepo.delete(getDb(), id);
    await loadAll();
  }, [loadAll]);

  // ── INVOICES ──────────────────────────────────
  const addSalesInvoice = useCallback(async (inv: Omit<SalesInvoice, 'id' | 'number' | 'createdAt' | 'journalId'>) => {
    await processSalesInvoice(getDb(), inv);
    await loadAll();
  }, [loadAll]);

  const addPurchaseInvoice = useCallback(async (inv: Omit<PurchaseInvoice, 'id' | 'number' | 'createdAt' | 'journalId'>) => {
    await processPurchaseInvoice(getDb(), inv);
    await loadAll();
  }, [loadAll]);

  // ── JOURNAL ───────────────────────────────────
  const addJournalEntry = useCallback(async (e: Omit<JournalEntry, 'id' | 'number' | 'createdAt'>) => {
    await JournalRepo.create(getDb(), e);
    await loadAll();
  }, [loadAll]);

  // ── NOTIFICATIONS ─────────────────────────────
  const markNotificationRead = useCallback(async (id: string) => {
    await NotificationRepo.markRead(getDb(), id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await NotificationRepo.markAllRead(getDb());
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const getUnreadCount = useCallback(() => notifications.filter(n => !n.read).length, [notifications]);

  // ── REPORTS ───────────────────────────────────
  const getAccountStatement = useCallback((accountId: string, from?: string, to?: string) => AccountRepo.getStatement(getDb(), accountId, from, to), []);
  const getTrialBalance = useCallback(() => ReportRepo.getTrialBalance(getDb()), []);
  const getSalesSummary = useCallback((f?: ReportFilters) => ReportRepo.getSalesSummary(getDb(), f), []);
  const getPurchaseSummary = useCallback((f?: ReportFilters) => ReportRepo.getPurchaseSummary(getDb(), f), []);
  const getItemSalesReport = useCallback((f?: ReportFilters) => ReportRepo.getItemSalesReport(getDb(), f), []);
  const getCustomerBalances = useCallback(() => ReportRepo.getCustomerBalance(getDb()), []);
  const getSupplierBalances = useCallback(() => ReportRepo.getSupplierBalance(getDb()), []);
  const getLowStockItems = useCallback(() => ReportRepo.getLowStockItems(getDb()), []);
  const getExpiredItems = useCallback(() => ReportRepo.getExpiredItems(getDb()), []);

  const seedDemo = useCallback(async () => {
    await seedTestData(getDb());
    await loadAll();
  }, [loadAll]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{
      loading, db,
      accounts, accountGroups, currencies, customers, suppliers, items,
      warehouses, units, categories, brands, salesReps,
      salesInvoices, purchaseInvoices, journalEntries, vouchers, notifications,
      addAccount, updateAccount, deleteAccount,
      addCustomer, updateCustomer, deleteCustomer,
      addSupplier, updateSupplier, deleteSupplier,
      addItem, updateItem, deleteItem,
      addWarehouse, deleteWarehouse,
      addUnit, deleteUnit, addCategory, deleteCategory, addBrand, deleteBrand,
      addSalesRep, updateSalesRep, deleteSalesRep,
      addSalesInvoice, addPurchaseInvoice, addJournalEntry,
      markNotificationRead, markAllNotificationsRead, getUnreadCount,
      getAccountStatement, getTrialBalance, getSalesSummary, getPurchaseSummary,
      getItemSalesReport, getCustomerBalances, getSupplierBalances,
      getLowStockItems, getExpiredItems,
      refresh, seedDemo,
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within DatabaseProvider');
  return context;
}
