import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';
import { formatNumber, genId } from '../../db/database';

export default function ItemsScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const { db } = useDatabase() as any;
  const [data, setData] = useState<any[]>([]);
  const color = '#FF9800';
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameAr: '', costPrice: '', salePrice: '', quantity: '', minQuantity: '' });

  useEffect(() => { if (db) { db.getAllAsync("SELECT * FROM items WHERE is_active=1 ORDER BY name_ar").then((r: any) => setData(r||[])); } }, [db]);
  const loadData = async () => { if (db) { const r = await db.getAllAsync("SELECT * FROM items WHERE is_active=1 ORDER BY name_ar"); setData(r||[]); } };
  const filtered = useMemo(() => { if (!search.trim()) return data; const q = search.trim().toLowerCase(); return data.filter((i: any) => i.nameAr?.includes(q) || i.code?.includes(q)); }, [data, search]);

  const openAdd = () => { setEditId(null); setForm({ name: '', nameAr: '', costPrice: '', salePrice: '', quantity: '', minQuantity: '' }); setModalVisible(true); };
  const openEdit = (i: any) => { setEditId(i.id); setForm({ name: i.name||'', nameAr: i.nameAr||'', costPrice: i.cost_price?.toString()||'', salePrice: i.sale_price?.toString()||'', quantity: i.quantity?.toString()||'', minQuantity: i.min_quantity?.toString()||'' }); setModalVisible(true); };

  const handleSave = async () => {
    if (!form.nameAr) return Alert.alert('', 'الاسم مطلوب');
    if (!db) return;
    try {
      if (editId) {
        await db.runAsync("UPDATE items SET name=?, name_ar=?, cost_price=?, sale_price=?, quantity=?, min_quantity=? WHERE id=?", [form.name, form.nameAr, parseFloat(form.costPrice)||0, parseFloat(form.salePrice)||0, parseFloat(form.quantity)||0, parseFloat(form.minQuantity)||0, editId]);
      } else {
        const count = await db.getAllAsync("SELECT COUNT(*) as c FROM items");
        const code = 'ITM-' + (((count[0] as any)?.c||0) + 1).toString().padStart(5, '0');
        await db.runAsync("INSERT INTO items(id,code,name,name_ar,cost_price,sale_price,quantity,min_quantity) VALUES(?,?,?,?,?,?,?,?)", [genId(), code, form.name, form.nameAr, parseFloat(form.costPrice)||0, parseFloat(form.salePrice)||0, parseFloat(form.quantity)||0, parseFloat(form.minQuantity)||0]);
      }
      setModalVisible(false); await loadData(); Alert.alert('✅', editId ? 'تم التعديل' : 'تم الإضافة');
    } catch(e: any) { Alert.alert('❌', e.message); }
  };

  const handleDelete = (i: any) => { Alert.alert('🗑️ حذف', `حذف "${i.nameAr}"؟`, [{ text: 'إلغاء', style: 'cancel' }, { text: 'حذف', style: 'destructive', onPress: async () => { if (db) { await db.runAsync('UPDATE items SET is_active=0 WHERE id=?', [i.id]); await loadData(); } } }]); };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '📦 الأصناف', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <View style={[styles.topBar, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={20} color={colors.mutedForeground} />
          <TextInput style={[styles.searchInput, { color: colors.foreground, textAlign: 'right' }]} placeholder="🔍 بحث..." placeholderTextColor={colors.mutedForeground} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add-circle" size={40} color={color} /></TouchableOpacity>
      </View>
      <FlatList data={filtered} keyExtractor={(i: any) => i.id} contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="cube-outline" size={60} color="#ccc" /><Text style={{ color: '#888', marginTop: 12 }}>لا توجد أصناف</Text></View>}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={() => openEdit(item)} activeOpacity={0.7}>
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: color + '20' }]}><Ionicons name="cube-outline" size={24} color={color} /></View>
              <View style={{ flex: 1 }}><Text style={styles.cardName}>{item.nameAr}</Text><Text style={styles.cardCode}>شراء: {formatNumber(item.cost_price)} | بيع: {formatNumber(item.sale_price)}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={[styles.qty, { color }]}>{formatNumber(item.quantity)}</Text><Text style={styles.qtyLabel}>المخزون</Text></View>
              <TouchableOpacity onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={20} color="#C62828" /></TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      <FormModal visible={modalVisible} title={editId ? '✏️ تعديل صنف' : '➕ إضافة صنف'} onClose={() => setModalVisible(false)} onSave={handleSave} accentColor={color}>
        <FormField label="الاسم *" value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label="سعر الشراء" value={form.costPrice} onChangeText={v => setForm(f => ({ ...f, costPrice: v }))} keyboardType="numeric" />
        <FormField label="سعر البيع" value={form.salePrice} onChangeText={v => setForm(f => ({ ...f, salePrice: v }))} keyboardType="numeric" />
        <FormField label="الكمية" value={form.quantity} onChangeText={v => setForm(f => ({ ...f, quantity: v }))} keyboardType="numeric" />
        <FormField label="الحد الأدنى" value={form.minQuantity} onChangeText={v => setForm(f => ({ ...f, minQuantity: v }))} keyboardType="numeric" />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, topBar: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15 }, addBtn: { padding: 4 }, empty: { alignItems: 'center', marginTop: 80 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 5, elevation: 3 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: '700', color: '#333', textAlign: 'right' },
  cardCode: { fontSize: 12, color: '#888', textAlign: 'right', marginTop: 2 },
  qty: { fontSize: 20, fontWeight: '800' }, qtyLabel: { fontSize: 10, color: '#888', marginTop: 2 },
});
