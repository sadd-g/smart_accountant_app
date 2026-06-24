import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';
import { genId, safeString } from '../../db/database';

export default function AccountGroupsScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const { db } = useDatabase() as any;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', name: '', nameAr: '', type: 'asset' });

  useEffect(() => { if (db) loadData(); }, [db]);

  const loadData = async () => {
    if (!db) return;
    try {
      const rows = await db.getAllAsync("SELECT * FROM account_groups WHERE is_active=1 ORDER BY code");
      setData(rows || []);
      console.log('✅ Groups loaded:', rows?.length);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter((g: any) => (g.code||'').includes(q) || (g.name_ar||'').includes(q));
  }, [data, search]);

  const openAdd = () => { setEditId(null); setForm({ code: '', name: '', nameAr: '', type: 'asset' }); setModalVisible(true); };
  const openEdit = (g: any) => { setEditId(g.id); setForm({ code: g.code, name: g.name, nameAr: g.name_ar, type: g.type }); setModalVisible(true); };

  const handleSave = async () => {
    if (!form.code || !form.nameAr) return Alert.alert('', 'الكود والاسم مطلوبان');
    if (!db) return Alert.alert('', 'قاعدة البيانات غير متصلة');
    
    try {
      if (editId) {
        await db.runAsync("UPDATE account_groups SET code=?, name=?, name_ar=?, type=? WHERE id=?", 
          [form.code, form.name, form.nameAr, form.type, editId]);
        Alert.alert('✅', 'تم تعديل المجموعة');
      } else {
        await db.runAsync("INSERT INTO account_groups(id,code,name,name_ar,type) VALUES(?,?,?,?,?)",
          [genId(), form.code, form.name, form.nameAr, form.type]);
        Alert.alert('✅', 'تم إضافة المجموعة');
      }
      setModalVisible(false);
      await loadData();
    } catch(e: any) {
      Alert.alert('❌', e.message || 'فشل الحفظ');
    }
  };

  const handleDelete = async (g: any) => {
    Alert.alert('🗑️ حذف', `حذف "${g.name_ar}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        if (db) { await db.runAsync("UPDATE account_groups SET is_active=0 WHERE id=?", [g.id]); await loadData(); }
      }},
    ]);
  };

  const types: any = { asset: { l: 'أصول', icon: 'trending-up', color: '#2196F3' }, liability: { l: 'خصوم', icon: 'trending-down', color: '#F44336' }, equity: { l: 'حقوق ملكية', icon: 'shield', color: '#4CAF50' }, income: { l: 'إيرادات', icon: 'cash', color: '#FF9800' }, expenses: { l: 'مصروفات', icon: 'cart', color: '#9C27B0' } };

  if (loading) return <View style={styles.loading}><Text style={{ color: '#666' }}>جاري التحميل...</Text></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '📁 مجموعات الحسابات', headerStyle: { backgroundColor: '#0f3460' }, headerTintColor: '#fff' }} />
      
      <View style={[styles.topBar, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.mutedForeground} />
          <TextInput style={[styles.searchInput, { color: colors.foreground }]} value={search} onChangeText={setSearch} placeholder="🔍 بحث..." placeholderTextColor={colors.mutedForeground} textAlign="right" />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add-circle" size={40} color="#0f3460" /></TouchableOpacity>
      </View>

      <FlatList data={filtered} keyExtractor={(g: any) => g.id} contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="folder-open-outline" size={50} color="#ccc" /><Text style={{ color: '#888', marginTop: 12 }}>لا توجد مجموعات</Text></View>}
        renderItem={({ item }) => {
          const t = types[item.type] || types.asset;
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderLeftColor: t.color }]}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => openEdit(item)} activeOpacity={0.7}>
                <View style={styles.cardRow}>
                  <View style={[styles.iconBox, { backgroundColor: t.color + '20' }]}>
                    <Ionicons name={t.icon as any} size={22} color={t.color} />
                  </View>
                  <View style={styles.codeBox}><Text style={[styles.codeText, { color: '#0f3460' }]}>{item.code}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardName, { color: colors.foreground }]}>{item.name_ar}</Text>
                    <Text style={[styles.cardType, { color: t.color }]}>{t.l}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                  <Ionicons name="create-outline" size={14} color="#fff" /><Text style={styles.actionText}>تعديل</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#C62828' }]} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={14} color="#fff" /><Text style={styles.actionText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ color: '#C62828', fontSize: 16 }}>إلغاء</Text></TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{editId ? '✏️ تعديل' : '➕ إضافة مجموعة'}</Text>
            <TouchableOpacity onPress={handleSave}><Text style={{ color: '#2E7D32', fontSize: 16, fontWeight: '700' }}>حفظ</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>الكود *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={form.code} onChangeText={v => setForm(f => ({ ...f, code: v }))} placeholder="1" placeholderTextColor={colors.mutedForeground} textAlign="right" />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>الاسم العربي *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} placeholder="الأصول" placeholderTextColor={colors.mutedForeground} textAlign="right" />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>الاسم الإنجليزي</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="Assets" placeholderTextColor={colors.mutedForeground} />
            <View style={{ height: 20 }} />
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
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  codeBox: { backgroundColor: '#E8EAF6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  codeText: { fontSize: 12, fontWeight: '800' },
  cardName: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  cardType: { fontSize: 12, textAlign: 'right', marginTop: 2 },
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
