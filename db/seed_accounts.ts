import { getDatabase } from './database';

export async function seedAccounts() {
  const db = await getDatabase();
  const accounts = [
    { id: 'acc1', code: '1101', name_ar: 'الصندوق الرئيسي', type: 'asset' },
    { id: 'acc2', code: '1102', name_ar: 'البنك التجاري', type: 'asset' },
    { id: 'acc3', code: '1201', name_ar: 'الذمم المدينة (عملاء)', type: 'asset' },
    { id: 'acc4', code: '2101', name_ar: 'الذمم الدائنة (موردون)', type: 'liability' },
    { id: 'acc5', code: '3101', name_ar: 'رأس المال', type: 'equity' },
    { id: 'acc6', code: '4101', name_ar: 'إيرادات المبيعات', type: 'income' },
    { id: 'acc7', code: '5101', name_ar: 'مصروفات الإيجار', type: 'expense' },
  ];

  for (const acc of accounts) {
    await db.runAsync(
      'INSERT OR IGNORE INTO accounts (id, code, name_ar, type) VALUES (?, ?, ?, ?)',
      [acc.id, acc.code, acc.name_ar, acc.type]
    );
  }
  console.log("تم تغذية دليل الحسابات بنجاح!");
}
