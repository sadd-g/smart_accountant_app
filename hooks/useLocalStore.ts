import { useState, useEffect } from 'react';

class LocalStore {
  private static instance: LocalStore;
  private data: Map<string, any[]> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): LocalStore {
    if (!LocalStore.instance) LocalStore.instance = new LocalStore();
    return LocalStore.instance;
  }

  async getAll(table: string): Promise<any[]> {
    return this.data.get(table) || [];
  }

  async add(table: string, item: any): Promise<string> {
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
    const items = (this.data.get(table) || []).map((i: any) => i.id === id ? { ...i, ...updates } : i);
    this.data.set(table, items);
    this.notify(table);
  }

  subscribe(table: string, callback: Function) {
    if (!this.listeners.has(table)) this.listeners.set(table, []);
    this.listeners.get(table)!.push(callback);
    return () => {
      const arr = this.listeners.get(table) || [];
      this.listeners.set(table, arr.filter(cb => cb !== callback));
    };
  }

  private notify(table: string) {
    (this.listeners.get(table) || []).forEach(cb => cb());
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

  useEffect(() => { loadAll(); const unsub = store.subscribe(tableName, loadAll); return unsub; }, [tableName]);

  return { data, loading: false, add, remove, update, reload: loadAll };
}

export default LocalStore;
