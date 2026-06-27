import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getDatabase } from '../db/database';
import type { SQLiteDatabase } from 'expo-sqlite';

interface DatabaseContextType {
  db: SQLiteDatabase | null;
  loading: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({ db: null, loading: true });

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      const database = await getDatabase();
      setDb(database);
      setLoading(false);
    } catch (e) {
      console.log('DB init error (web fallback):', e);
      setError('وضع المتصفح - قاعدة بيانات مؤقتة');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1128' }}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={{ color: '#D4AF37', marginTop: 16, fontSize: 18 }}>جاري تحميل قاعدة البيانات...</Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ db, loading }}>
      {error && (
        <View style={{ backgroundColor: '#F59E0B20', padding: 8, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999 }}>
          <Text style={{ color: '#F59E0B', textAlign: 'center', fontSize: 12 }}>{error}</Text>
        </View>
      )}
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  return context;
}
