import { useState, useEffect } from 'react';

// دليل الحسابات اليمني القياسي
export const YEMENI_CHART_OF_ACCOUNTS = {
  groups: [
    { code: '1', name: 'الأصول', type: 'أصل' },
    { code: '2', name: 'الخصوم', type: 'خصم' },
    { code: '3', name: 'حقوق الملكية', type: 'ملكية' },
    { code: '4', name: 'الإيرادات', type: 'إيراد' },
    { code: '5', name: 'المصروفات', type: 'مصروف' },
  ],
  defaultAccounts: [
    // الأصول
    { code: '101', name: 'الصندوق', type: 'أصل' },
    { code: '102', name: 'البنوك - حسابات جارية', type: 'أصل' },
    { code: '103', name: 'العملاء (المدينون)', type: 'أصل' },
    { code: '104', name: 'المخزون السلعي', type: 'أصل' },
    { code: '105', name: 'الأصول الثابتة', type: 'أصل' },
    { code: '106', name: 'مخصص إهلاك الأصول', type: 'أصل' },
    // الخصوم
    { code: '201', name: 'الموردين (الدائنون)', type: 'خصم' },
    { code: '202', name: 'الضرائب المستحقة', type: 'خصم' },
    { code: '203', name: 'الزكاة المستحقة', type: 'خصم' },
    { code: '204', name: 'قروض طويلة الأجل', type: 'خصم' },
    // حقوق الملكية
    { code: '301', name: 'رأس المال', type: 'ملكية' },
    { code: '302', name: 'الأرباح المحتجزة', type: 'ملكية' },
    { code: '303', name: 'المسحوبات الشخصية', type: 'ملكية' },
    // الإيرادات
    { code: '401', name: 'إيرادات المبيعات', type: 'إيراد' },
    { code: '402', name: 'إيرادات خدمات', type: 'إيراد' },
    { code: '403', name: 'إيرادات استثمارات', type: 'إيراد' },
    // المصروفات
    { code: '501', name: 'تكلفة البضاعة المباعة', type: 'مصروف' },
    { code: '502', name: 'الرواتب والأجور', type: 'مصروف' },
    { code: '503', name: 'الإيجارات', type: 'مصروف' },
    { code: '504', name: 'الكهرباء والمياه', type: 'مصروف' },
    { code: '505', name: 'مصروفات تسويقية', type: 'مصروف' },
    { code: '506', name: 'مصروفات إدارية', type: 'مصروف' },
    { code: '507', name: 'إهلاك الأصول', type: 'مصروف' },
  ]
};

class LocalStore {
  private static instance: LocalStore;
  private data: Map<string, any[]> = new Map();
  private listeners: Map<string, Function[]> = new Map();
  private initialized = false;

  static getInstance(): LocalStore {
    if (!LocalStore.instance) {
      LocalStore.instance = new LocalStore();
    }
    return LocalStore.instance;
  }

  async init() {
    if (this.initialized) return;
    
    // تهيئة الحسابات الافتراضية حسب النظام اليمني
    const existingAccounts = this.data.get('accounts') || [];
    if (existingAccounts.length === 0) {
      const accounts = YEMENI_CHART_OF_ACCOUNTS.defaultAccounts.map((acc, index) => ({
        id: `acc${index + 1}`,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        balance: 0,
        createdAt: new Date().toISOString()
      }));
      this.data.set('accounts', accounts);
    }
    
    // تهيئة المجموعات
    const existingGroups = this.data.get('accountGroups') || [];
    if (existingGroups.length === 0) {
      const groups = YEMENI_CHART_OF_ACCOUNTS.groups.map((g, index) => ({
        id: `grp${index + 1}`,
        code: g.code,
        name: g.name,
        type: g.type,
        accountsCount: 0,
        createdAt: new Date().toISOString()
      }));
      this.data.set('accountGroups', groups);
    }
    
    // تهيئة العملات
    const existingCurrencies = this.data.get('currencies') || [];
    if (existingCurrencies.length === 0) {
      this.data.set('currencies', [
        { id: 'cur1', code: 'YER', name: 'ريال يمني', symbol: '﷼', rate: 1, isDefault: true },
        { id: 'cur2', code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 530, isDefault: false },
        { id: 'cur3', code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 141, isDefault: false },
      ]);
    }
    
    this.initialized = true;
  }

  async getAll(table: string): Promise<any[]> {
    await this.init();
    return this.data.get(table) || [];
  }

  async add(table: string, item: any): Promise<string> {
    await this.init();
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    const newItem = { ...item, id, createdAt: new Date().toISOString() };
    const items = this.data.get(table) || [];
    items.push(newItem);
    this.data.set(table, items);
    this.notify(table);
    return id;
  }

  async remove(table: string, id: string): Promise<void> {
    const items = (this.data.get(table) || []).filter((i: any) => i.id !== id);
    this.data.set(table, items);
    this.notify(table);
  }

  async update(table: string, id: string, updates: any): Promise<void> {
    const items = (this.data.get(table) || []).map((i: any) => 
      i.id === id ? { ...i, ...updates } : i
    );
    this.data.set(table, items);
    this.notify(table);
  }

  subscribe(table: string, callback: Function) {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, []);
    }
    this.listeners.get(table)!.push(callback);
    return () => {
      const listeners = this.listeners.get(table);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      }
    };
  }

  private notify(table: string) {
    const listeners = this.listeners.get(table) || [];
    listeners.forEach(cb => cb());
  }
}

export function useLocalTable<T>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const store = LocalStore.getInstance();

  const loadAll = async () => {
    const items = await store.getAll(tableName);
    setData(items);
  };

  const add = async (item: Partial<T>): Promise<string> => {
    const id = await store.add(tableName, item);
    await loadAll();
    return id;
  };

  const remove = async (id: string): Promise<void> => {
    await store.remove(tableName, id);
    await loadAll();
  };

  const update = async (id: string, updates: Partial<T>): Promise<void> => {
    await store.update(tableName, id, updates);
    await loadAll();
  };

  useEffect(() => {
    loadAll();
    const unsubscribe = store.subscribe(tableName, () => loadAll());
    return unsubscribe;
  }, [tableName]);

  return { data, loading: false, add, remove, update, reload: loadAll };
}

export default LocalStore;

// إدارة اللغة
let currentLanguage: 'ar' | 'en' = 'ar';
let languageListeners: Function[] = [];

export function getLanguage(): 'ar' | 'en' {
  return currentLanguage;
}

export function setLanguage(lang: 'ar' | 'en') {
  currentLanguage = lang;
  languageListeners.forEach(cb => cb(lang));
}

export function onLanguageChange(callback: Function) {
  languageListeners.push(callback);
  return () => {
    languageListeners = languageListeners.filter(cb => cb !== callback);
  };
}
