import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

export default function AccountStatementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: accounts = [] } = useLocalTable('accounts');
  const { data: entries = [] } = useLocalTable('journalEntries');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const selected = (accounts || []).find((a: any) => a.id === selectedId);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>كشف حساب</Text>
        <View style={{ width: 36 }} />
      </View>
      <TextInput style={styles.searchInput} placeholder="🔍 بحث عن حساب..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
      <View style={styles.accountList}>
        {(accounts || []).filter((a: any) => a.name?.includes(searchQuery)).slice(0, 20).map((acc: any) => (
          <TouchableOpacity key={acc.id} style={[styles.chip, selectedId === acc.id && styles.chipActive]} onPress={() => setSelectedId(acc.id)}>
            <Text style={[styles.chipText, selectedId === acc.id && styles.chipTextActive]}>{acc.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selected ? (
        <View style={styles.card}>
          <Text style={styles.cardName}>{selected.name}</Text>
          <Text style={styles.cardCode}>كود: {selected.code} | {selected.type}</Text>
          <Text style={styles.cardBalance}>الرصيد: {(selected.balance || 0).toLocaleString()} ﷼</Text>
        </View>
      ) : (
        <View style={styles.empty}><Text style={styles.emptyIcon}>🔍</Text><Text style={styles.emptyText}>اختر حساباً لعرض كشف الحساب</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { fontSize: 24, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  searchInput: { marginHorizontal: 16, marginBottom: 12, padding: 12, backgroundColor: '#16213E', borderRadius: 10, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right' },
  accountList: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 6, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#16213E', borderWidth: 1, borderColor: '#2a3550' },
  chipActive: { backgroundColor: '#D4AF37' + '30', borderColor: '#D4AF37' },
  chipText: { color: '#94a3b8', fontSize: 12 },
  chipTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  card: { marginHorizontal: 16, padding: 16, backgroundColor: '#16213E', borderRadius: 14, borderWidth: 1, borderColor: '#2a3550' },
  cardName: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardCode: { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
  cardBalance: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#94a3b8', fontSize: 16 },
});
