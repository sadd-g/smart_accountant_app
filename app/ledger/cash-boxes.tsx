import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';
import { formatNumber, genId } from '../../db/database';

export default function CashBoxesScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const { db } = useDatabase() as any;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameAr: '', code: '', currencyId: 'c1', openingBalance: '' });

  useEffect(() => { if (db) loadData(); }, [db]);

  const loadData = async () => {
    if (!db) return;
    try { const rows = await db.getAllAsync("SELECT * FROM cash_boxes WHERE is_active=1 ORDER BY code"); setData(rows || []); } catch(e) {} finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter((cb: any) => (cb.code||'').includes(q) || (cb.name_ar||'').includes(q));
  }, [data, search]);

  const openAdd = () => { setEditId(null); setForm({ name: '', nameAr: '', code: '', currencyId: 'c1', openingBalance: '' }); setModalVisible(true); };
  const openEdit = (cb: any) => { setEditId(cb.id); setForm({ name: cb.name, nameAr: cb.name_ar, code: cb.code, currencyId: cb.currency_id||'c1', openingBalance: cb.opening_balance?.toString() || '' }); setModalVisible(true); };

  const handleSave = async () => {
    if (!form.nameAr) return Alert.alert('', 'الاسم مطلوب');
    if (!db) return;
    try {
      const ob = parseFloat(form.openingBalance) || 0;
      const code = form.code || 'CASH-' + (data.length + 1).toString().padStart(3, '0');
      if (editId) {
        await db.runAsync("UPDATE cash_boxes SET name=?, name_ar=?, code=?, currency_id=?, opening_balance=? WHERE id=?", [form.name, form.nameAr, code, form.currencyId, ob, editId]);
        Alert.alert('✅', 'تم التعديل');
      } else {
        await db.runAsync("INSERT INTO cash_boxes(id,code,name,name_ar,account_id,currency_id,opening_balance,current_balance) VALUES(?,?,?,?,?,?,?,?)", [genId(), code, form.name, form.nameAr, 'a1', form.currencyId, ob, ob]);
        Alert.alert('✅', 'تم الإضافة');
      }
      setModalVisible(false); await loadData();
    } catch(e: any) { Alert.alert('❌', e.message); }
  };

  const handleDelete = async (cb: any) => {
    Alert.alert('🗑️', `حذف "${cb.name_ar}"؟`, [{ text: 'إلغاء', style: 'cancel' }, { text: 'حذف', style: 'destructive', onPress: async () => { if (db) { await db.runAsync("UPDATE cash_boxes SET is_active=0 WHERE id=?", [cb.id]); await loadData(); } } }]);
  };

  if (loading) return <View style={styles.loading}><Text style={{ color: '#666' }}>جاري التحميل...</Text></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '🏦 الصناديق', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }} />
      <View style={[styles.topBar, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.mutedForeground} />
          <TextInput style={[styles.searchInput, { color: colors.foreground }]} value={search} onChangeText={setSearch} placeholder="🔍 بحث..." placeholderTextColor={colors.mutedForeground} textAlign="right" />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add-circle" size={40} color="#4CAF50" /></TouchableOpacity>
      </View>
      <FlatList data={filtered} keyExtractor={(cb: any) => cb.id} contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="briefcase-outline" size={50} color="#ccc" /><Text style={{ color: '#888', marginTop: 12 }}>لا توجد صناديق</Text></View>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderLeftColor: '#4CAF50' }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openEdit(item)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="cash-outline" size={22} color="#4CAF50" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardName, { color: colors.foreground }]}>{item.name_ar}</Text>
                  <Text style={[styles.cardCode, { color: colors.mutedForeground }]}>{item.code}</Text>
                </View>
                <Text style={[styles.balance, { color: '#4CAF50' }]}>{formatNumber(item.current_balance || item.opening_balance || 0)}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}><Ionicons name="create-outline" size={14} color="#fff" /><Text style={styles.actionText}>تعديل</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#C62828' }]} onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={14} color="#fff" /><Text style={styles.actionText}>حذف</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}><TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ color: '#C62828', fontSize: 16 }}>إلغاء</Text></TouchableOpacity><Text style={[styles.modalTitle, { color: colors.foreground }]}>{editId ? '✏️ تعديل' : '➕ إضافة صندوق'}</Text><TouchableOpacity onPress={handleSave}><Text style={{ color: '#2E7D32', fontSize: 16, fontWeight: '700' }}>حفظ</Text></TouchableOpacity></View>
          <ScrollView style={{ padding: 16 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>الاسم *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} placeholder="اسم الصندوق" placeholderTextColor={colors.mutedForeground} textAlign="right" />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>الكود</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={form.code} onChangeText={v => setForm(f => ({ ...f, code: v }))} placeholder="CASH-001" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>💰 الرصيد الافتتاحي</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, fontSize: 20, fontWeight: '700', textAlign: 'center' }]} value={form.openingBalance} onChangeText={v => setForm(f => ({ ...f, openingBalance: v }))} placeholder="0" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
          </ScrollView>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15 }, addBtn: { padding: 4 },
  empty: { alignItems: 'center', marginTop: 60 },
  card: { borderRadius: 16, padding: 14, marginBottom: 10, borderLeftWidth: 5, elevation: 2 },
  cardName: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  cardCode: { fontSize: 12, textAlign: 'right', marginTop: 2 },
  balance: { fontSize: 18, fontWeight: '800' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2196F3', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  actionText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6, marginTop: 14, textAlign: 'right' },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 19, fontWeight: '700' },
});
