import type { SQLiteDatabase } from 'expo-sqlite';
import { AccountRepo, CustomerRepo, InvoiceItem, JournalRepo, SalesInvoiceRepo, PurchaseInvoiceRepo, SupplierRepo, VoucherRepo } from './repositories';
import { ItemRepo } from './repositories';

const CASH_ACCOUNT_ID = 'acc1';
const BANK_ACCOUNT_ID = 'acc2';
const AR_ACCOUNT_ID = 'acc3';    // Accounts Receivable
const AP_ACCOUNT_ID = 'acc4';    // Accounts Payable
const SALES_ACCOUNT_ID = 'acc6'; // Sales Revenue
const COGS_ACCOUNT_ID = 'acc7';  // Cost of Goods Sold
const INVENTORY_ACCOUNT_ID = 'acc9'; // Inventory

/**
 * Creates a complete sales invoice with:
 * 1. Inventory reduction
 * 2. Customer balance update
 * 3. Automatic journal entry (debit Cash/AR, credit Sales)
 * 4. COGS entry (debit COGS, credit Inventory)
 */
export async function processSalesInvoice(
  db: SQLiteDatabase,
  inv: {
    date: string; customerId: string; customerName: string; repId: string;
    subtotal: number; discount: number; tax: number; total: number;
    paid: number; remaining: number; paymentType: 'cash' | 'credit' | 'bank';
    notes: string; items: InvoiceItem[];
  }
): Promise<string> {
  // 1. Get cost of goods for COGS entry
  let totalCogs = 0;
  for (const line of inv.items) {
    const item = line.itemId ? await ItemRepo.getById(db, line.itemId) : null;
    if (item) {
      totalCogs += item.costPrice * line.qty;
      // Reduce inventory quantity
      await ItemRepo.adjustQuantity(db, item.id, -line.qty);
    }
  }

  // 2. Determine debit account (cash/bank/receivable)
  const debitAccId = inv.paymentType === 'cash' ? CASH_ACCOUNT_ID
    : inv.paymentType === 'bank' ? BANK_ACCOUNT_ID
    : AR_ACCOUNT_ID;
  const debitAccRow = await AccountRepo.getById(db, debitAccId);
  const salesAccRow = await AccountRepo.getById(db, SALES_ACCOUNT_ID);

  // 3. Create accounting journal entry for sales
  const journalLines: any[] = [];
  if (inv.total > 0) {
    journalLines.push({ accountId: debitAccId, accountName: debitAccRow?.nameAr || '', debit: inv.total, credit: 0, notes: '' });
    journalLines.push({ accountId: SALES_ACCOUNT_ID, accountName: salesAccRow?.nameAr || '', debit: 0, credit: inv.total, notes: '' });
  }
  // COGS entry
  if (totalCogs > 0) {
    const cogsAcc = await AccountRepo.getById(db, COGS_ACCOUNT_ID);
    const invAcc = await AccountRepo.getById(db, INVENTORY_ACCOUNT_ID);
    journalLines.push({ accountId: COGS_ACCOUNT_ID, accountName: cogsAcc?.nameAr || '', debit: totalCogs, credit: 0, notes: '' });
    journalLines.push({ accountId: INVENTORY_ACCOUNT_ID, accountName: invAcc?.nameAr || '', debit: 0, credit: totalCogs, notes: '' });
  }

  let journalId = '';
  if (journalLines.length > 0) {
    journalId = await JournalRepo.create(db, {
      date: inv.date,
      description: `Sales Invoice - ${inv.customerName}`,
      descriptionAr: `فاتورة مبيعات - ${inv.customerName}`,
      totalDebit: inv.total + totalCogs,
      totalCredit: inv.total + totalCogs,
      isRecurring: false,
      refType: 'sales_invoice',
      refId: '',
      lines: journalLines,
    });
  }

  // 4. Update customer balance (credit sales = increase AR)
  if (inv.remaining > 0 && inv.customerId) {
    await CustomerRepo.updateBalance(db, inv.customerId, inv.remaining);
  }

  // 5. Create sales invoice record
  const invoiceId = await SalesInvoiceRepo.create(db, { ...inv, journalId });
  return invoiceId;
}

/**
 * Creates a complete purchase invoice with:
 * 1. Inventory increase (weighted average cost)
 * 2. Supplier balance update
 * 3. Automatic journal entry (debit Inventory, credit Cash/AP)
 */
export async function processPurchaseInvoice(
  db: SQLiteDatabase,
  inv: {
    date: string; supplierId: string; supplierName: string;
    subtotal: number; discount: number; tax: number; total: number;
    paid: number; remaining: number; paymentType: 'cash' | 'credit' | 'bank';
    notes: string; items: InvoiceItem[];
  }
): Promise<string> {
  // 1. Update inventory (weighted average cost)
  for (const line of inv.items) {
    if (line.itemId) {
      await ItemRepo.updateCostPrice(db, line.itemId, line.price, 0, line.qty);
    }
  }

  // 2. Determine credit account (cash/bank/payable)
  const creditAccId = inv.paymentType === 'cash' ? CASH_ACCOUNT_ID
    : inv.paymentType === 'bank' ? BANK_ACCOUNT_ID
    : AP_ACCOUNT_ID;
  const creditAccRow = await AccountRepo.getById(db, creditAccId);
  const invAcc = await AccountRepo.getById(db, INVENTORY_ACCOUNT_ID);

  // 3. Create journal entry
  const journalLines: any[] = [];
  if (inv.total > 0) {
    journalLines.push({ accountId: INVENTORY_ACCOUNT_ID, accountName: invAcc?.nameAr || '', debit: inv.total, credit: 0, notes: '' });
    journalLines.push({ accountId: creditAccId, accountName: creditAccRow?.nameAr || '', debit: 0, credit: inv.total, notes: '' });
  }

  let journalId = '';
  if (journalLines.length > 0) {
    journalId = await JournalRepo.create(db, {
      date: inv.date,
      description: `Purchase Invoice - ${inv.supplierName}`,
      descriptionAr: `فاتورة مشتريات - ${inv.supplierName}`,
      totalDebit: inv.total,
      totalCredit: inv.total,
      isRecurring: false,
      refType: 'purchase_invoice',
      refId: '',
      lines: journalLines,
    });
  }

  // 4. Update supplier balance
  if (inv.remaining > 0 && inv.supplierId) {
    await SupplierRepo.updateBalance(db, inv.supplierId, inv.remaining);
  }

  // 5. Create purchase invoice record
  const invoiceId = await PurchaseInvoiceRepo.create(db, { ...inv, journalId });
  return invoiceId;
}

/**
 * Creates a cash receipt voucher with journal entry
 */
export async function processReceiptVoucher(
  db: SQLiteDatabase,
  v: { date: string; accountId: string; accountName: string; amount: number; description: string; paymentMethod: string; refId?: string }
): Promise<string> {
  // Journal: Debit Cash, Credit Account
  const cashAccId = v.paymentMethod === 'bank' ? BANK_ACCOUNT_ID : CASH_ACCOUNT_ID;
  const cashAcc = await AccountRepo.getById(db, cashAccId);
  const targetAcc = await AccountRepo.getById(db, v.accountId);

  await JournalRepo.create(db, {
    date: v.date,
    description: v.description,
    descriptionAr: v.description,
    totalDebit: v.amount,
    totalCredit: v.amount,
    isRecurring: false,
    refType: 'receipt_voucher',
    refId: v.refId || '',
    lines: [
      { accountId: cashAccId, accountName: cashAcc?.nameAr || '', debit: v.amount, credit: 0, notes: '' },
      { accountId: v.accountId, accountName: targetAcc?.nameAr || '', debit: 0, credit: v.amount, notes: '' },
    ],
  });

  // Update customer/supplier balance
  await CustomerRepo.updateBalance(db, v.accountId, -v.amount).catch(() => {});

  return VoucherRepo.create(db, { date: v.date, accountId: v.accountId, accountName: v.accountName, amount: v.amount, description: v.description, paymentMethod: v.paymentMethod, type: 'receipt', refId: v.refId || '' });
}

/**
 * Creates a cash payment voucher with journal entry
 */
export async function processPaymentVoucher(
  db: SQLiteDatabase,
  v: { date: string; accountId: string; accountName: string; amount: number; description: string; paymentMethod: string; refId?: string }
): Promise<string> {
  const cashAccId = v.paymentMethod === 'bank' ? BANK_ACCOUNT_ID : CASH_ACCOUNT_ID;
  const cashAcc = await AccountRepo.getById(db, cashAccId);
  const targetAcc = await AccountRepo.getById(db, v.accountId);

  await JournalRepo.create(db, {
    date: v.date,
    description: v.description,
    descriptionAr: v.description,
    totalDebit: v.amount,
    totalCredit: v.amount,
    isRecurring: false,
    refType: 'payment_voucher',
    refId: v.refId || '',
    lines: [
      { accountId: v.accountId, accountName: targetAcc?.nameAr || '', debit: v.amount, credit: 0, notes: '' },
      { accountId: cashAccId, accountName: cashAcc?.nameAr || '', debit: 0, credit: v.amount, notes: '' },
    ],
  });

  await SupplierRepo.updateBalance(db, v.accountId, -v.amount).catch(() => {});

  return VoucherRepo.create(db, { date: v.date, accountId: v.accountId, accountName: v.accountName, amount: v.amount, description: v.description, paymentMethod: v.paymentMethod, type: 'payment', refId: v.refId || '' });
}
