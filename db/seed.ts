import type { SQLiteDatabase } from 'expo-sqlite';
import { processPurchaseInvoice, processSalesInvoice } from './accounting';
import { CustomerRepo, ItemRepo, SupplierRepo } from './repositories';

export async function seedTestData(db: SQLiteDatabase): Promise<void> {
  // Check if already seeded
  const existing = await db.getFirstAsync<any>('SELECT id FROM customers LIMIT 1');
  if (existing) return;

  // ── CUSTOMERS ──────────────────────────────────
  const customers = [
    { nameAr: 'أحمد محمد علي', name: 'Ahmed Mohamed Ali', phone: '711111111', address: 'صنعاء - شارع هايل', creditLimit: 500000 },
    { nameAr: 'شركة النور للتجارة', name: 'Al-Nour Trading Co', phone: '733222222', address: 'صنعاء - السبعين', creditLimit: 1000000 },
    { nameAr: 'مؤسسة السلام', name: 'Al-Salam Est', phone: '777333333', address: 'عدن - المعلا', creditLimit: 750000 },
    { nameAr: 'محمد سالم الحامد', name: 'Mohamed Salem', phone: '712444444', address: 'تعز - الجمهورية', creditLimit: 300000 },
    { nameAr: 'شركة القمة للتجارة', name: 'Al-Qimma Trading', phone: '734555555', address: 'صنعاء - حدة', creditLimit: 2000000 },
  ];
  const customerIds: string[] = [];
  for (const c of customers) {
    const { id } = await CustomerRepo.create(db, { ...c, groupId: '', balance: 0, accountId: '', notes: '' });
    customerIds.push(id);
  }

  // ── SUPPLIERS ──────────────────────────────────
  const suppliers = [
    { nameAr: 'شركة الجزيرة للتوريدات', name: 'Al-Jazira Supplies', phone: '711666666', address: 'صنعاء - الصباحين', notes: '' },
    { nameAr: 'مؤسسة الفجر للمواد الغذائية', name: 'Al-Fajr Food', phone: '733777777', address: 'صنعاء - شعوب', notes: '' },
    { nameAr: 'شركة الرشيد للاستيراد', name: 'Al-Rashid Import', phone: '777888888', address: 'عدن - كريتر', notes: '' },
  ];
  const supplierIds: string[] = [];
  for (const s of suppliers) {
    const { id } = await SupplierRepo.create(db, { ...s, balance: 0, accountId: '' });
    supplierIds.push(id);
  }

  // ── ITEMS ──────────────────────────────────────
  const items = [
    { nameAr: 'اسمنت عيون 50 كجم', name: 'Uyoun Cement 50kg', unitId: 'u1', costPrice: 3200, salePrice: 3500, quantity: 500, minQuantity: 50, warehouseId: 'w1' },
    { nameAr: 'حديد تسليح 12ملم', name: 'Steel Rod 12mm', unitId: 'u2', costPrice: 8500, salePrice: 9200, quantity: 200, minQuantity: 20, warehouseId: 'w1' },
    { nameAr: 'دقيق المرجان 50كجم', name: 'Al-Marjan Flour 50kg', unitId: 'u1', costPrice: 6800, salePrice: 7200, quantity: 300, minQuantity: 30, warehouseId: 'w1' },
    { nameAr: 'سكر أبيض 50كجم', name: 'White Sugar 50kg', unitId: 'u1', costPrice: 12000, salePrice: 12800, quantity: 150, minQuantity: 20, warehouseId: 'w1' },
    { nameAr: 'زيت نخيل 20لتر', name: 'Palm Oil 20L', unitId: 'u5', costPrice: 9500, salePrice: 10200, quantity: 100, minQuantity: 10, warehouseId: 'w1' },
    { nameAr: 'شاي أحمر 500جم', name: 'Red Tea 500g', unitId: 'u2', costPrice: 1800, salePrice: 2100, quantity: 400, minQuantity: 40, warehouseId: 'w1' },
    { nameAr: 'بلاط سيراميك 60×60', name: 'Ceramic Tile 60x60', unitId: 'u3', costPrice: 4500, salePrice: 5200, quantity: 600, minQuantity: 50, warehouseId: 'w1' },
    { nameAr: 'مسحوق غسيل 3كجم', name: 'Washing Powder 3kg', unitId: 'u2', costPrice: 1500, salePrice: 1800, quantity: 250, minQuantity: 25, warehouseId: 'w1' },
  ];
  const itemIds: string[] = [];
  for (const item of items) {
    const { id } = await ItemRepo.create(db, { ...item, brandId: '', categoryId: 'cat4', accountId: '', notes: '', expiryDate: '' });
    // Set the initial quantity directly since updateCostPrice will add to 0
    await db.runAsync('UPDATE items SET quantity=? WHERE id=?', [item.quantity, id]);
    itemIds.push(id);
  }

  // ── PURCHASE INVOICES (3 invoices) ────────────
  const today = new Date();
  const minus30 = new Date(today); minus30.setDate(today.getDate() - 30);
  const minus15 = new Date(today); minus15.setDate(today.getDate() - 15);

  await processPurchaseInvoice(db, {
    date: minus30.toISOString().split('T')[0],
    supplierId: supplierIds[0], supplierName: 'شركة الجزيرة للتوريدات',
    subtotal: 160000, discount: 0, tax: 0, total: 160000, paid: 160000, remaining: 0,
    paymentType: 'cash', notes: '',
    items: [
      { itemId: itemIds[0], itemName: 'اسمنت', qty: 50, freeQty: 0, price: 3200, discount: 0, tax: 0, total: 160000, costPrice: 3200, notes: '' },
    ],
  });

  await processPurchaseInvoice(db, {
    date: minus15.toISOString().split('T')[0],
    supplierId: supplierIds[1], supplierName: 'مؤسسة الفجر',
    subtotal: 204000, discount: 4000, tax: 0, total: 200000, paid: 100000, remaining: 100000,
    paymentType: 'credit', notes: '',
    items: [
      { itemId: itemIds[2], itemName: 'دقيق', qty: 30, freeQty: 0, price: 6800, discount: 0, tax: 0, total: 204000, costPrice: 6800, notes: '' },
    ],
  });

  // ── SALES INVOICES (5 invoices) ────────────────
  await processSalesInvoice(db, {
    date: minus30.toISOString().split('T')[0],
    customerId: customerIds[0], customerName: 'أحمد محمد علي', repId: '',
    subtotal: 35000, discount: 0, tax: 0, total: 35000, paid: 35000, remaining: 0,
    paymentType: 'cash', notes: '',
    items: [{ itemId: itemIds[0], itemName: 'اسمنت', qty: 10, freeQty: 0, price: 3500, discount: 0, tax: 0, total: 35000, costPrice: 3200, notes: '' }],
  });

  await processSalesInvoice(db, {
    date: minus15.toISOString().split('T')[0],
    customerId: customerIds[1], customerName: 'شركة النور', repId: '',
    subtotal: 46000, discount: 1000, tax: 0, total: 45000, paid: 25000, remaining: 20000,
    paymentType: 'credit', notes: '',
    items: [
      { itemId: itemIds[1], itemName: 'حديد', qty: 5, freeQty: 0, price: 9200, discount: 0, tax: 0, total: 46000, costPrice: 8500, notes: '' },
    ],
  });

  await processSalesInvoice(db, {
    date: today.toISOString().split('T')[0],
    customerId: customerIds[2], customerName: 'مؤسسة السلام', repId: '',
    subtotal: 36000, discount: 0, tax: 0, total: 36000, paid: 36000, remaining: 0,
    paymentType: 'cash', notes: '',
    items: [{ itemId: itemIds[2], itemName: 'دقيق', qty: 5, freeQty: 0, price: 7200, discount: 0, tax: 0, total: 36000, costPrice: 6800, notes: '' }],
  });

  await processSalesInvoice(db, {
    date: today.toISOString().split('T')[0],
    customerId: customerIds[3], customerName: 'محمد سالم', repId: '',
    subtotal: 21000, discount: 0, tax: 0, total: 21000, paid: 0, remaining: 21000,
    paymentType: 'credit', notes: '',
    items: [{ itemId: itemIds[3], itemName: 'سكر', qty: 2, freeQty: 0, price: 12800, discount: 0, tax: 0, total: 25600, costPrice: 12000, notes: '' }],
  });
}
