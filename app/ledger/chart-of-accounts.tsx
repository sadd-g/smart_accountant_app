import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getDatabase } from '../../db/database';

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      const db = await getDatabase();
      // سحب الحسابات من قاعدة البيانات
      const allRows = await db.getAllAsync('SELECT * FROM accounts ORDER BY id ASC');
      setAccounts(allRows);
      setLoading(false);
    }
    loadAccounts();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{marginTop: 50}} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>دليل الحسابات المعتمد</Text>
      <FlatList 
        data={accounts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.accountItem}>
            <Text style={styles.accountText}>{item.name_ar}</Text>
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1A2A6C', textAlign: 'center' },
  accountItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8, elevation: 2 },
  accountText: { fontSize: 16, fontWeight: '600' },
  codeText: { color: '#888' }
});
