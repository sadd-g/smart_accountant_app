import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';
import { formatNumber, genId, safeString } from '../../db/database';

export default function AccountsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { db } = useDatabase() as any;
  const [accounts, setAccounts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameAr: '', groupId: 'ag1', type: 'asset', currencyId: 'c1', balance: '', notes: '' });

  useEffect(() => { loadAll(); }, [db]);

  const loadAll = async () => {
    if (!db) return;
    try {
      const [acc, grp, cur] = await Promise.all([
        db.getAllAsync("SELECT * FROM accounts WHERE is_active=1 ORDER BY code"),
        db.getAllAsync("SELECT * FROM account_groups WHERE is_active=1 ORDER BY code"),
        db.getAllAsync("SELECT * FROM currencies WHERE is_active=1"),
      ]);
      setAccounts(acc || []); setGroups(grp || []); setCurrencies(cur || []);
      console.log('✅ Loaded:', acc?.length, 'accounts |', grp?.length, 'groups |', cur?.length, 'currencies');
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.trim().toLowerCase();
    return accounts.filter((a: any) => (a.code||'').includes(q) || (a.name_ar||'').includes(q) || (a.name||'').toLowerCase().includes(q));
  }, [accounts, search]);

  const openAdd = () => { setEditId(null); setForm({ name: '', nameAr: '', groupId: 'ag1', type: 'asset', currencyId: 'c1', balance: '', notes: '' }); setModalVisible(true); };
  const openEdit = (a: any) => { setEditId(a.id); setForm({ name: a.name || '', nameAr: a.name_ar || '', groupId: a.group_id || 'ag1', type: a.type || 'asset', currencyId: a.currency_id || 'c1', balance: a.balance?.toString() || '', notes: a.notes || '' }); setModalVisible(true); };

  const handleSave = async () => {
    if (!form.nameAr.trim()) { Alert.alert('تنبيه', 'يرجى إدخال اسم الحساب'); return; }
    if (!db) return;
    try {
      const bal = parseFloat(form.balance) || 0;
      if (editId) {
        await db.runAsync("UPDATE accounts SET name=?, name_ar=?, group_id=?, type=?, currency_id=?, balance=?, notes=? WHERE id=?", 
          [form.name, form.nameAr, form.groupId, form.type, form.currencyId, bal, form.notes, editId]);
        Alert.alert('✅', 'تم تعديل الحساب');
      } else {
        const id = genId();
        const grp = groups.find((g: any) => g.id === form.groupId);
        const prefix = grp?.code || '0';
        const siblings = accounts.filter((a: any) => a.group_id === form.groupId);
        const code = prefix + (siblings.length + 1).toString().padStart(3, '0');
        await db.runAsync("INSERT INTO accounts(id,code,name,name_ar,group_id,type,currency_id,balance,notes) VALUES(?,?,?,?,?,?,?,?,?)",
          [id, code, form.name, form.nameAr, form.groupId, form.type, form.currencyId, bal, form.notes]);
        Alert.alert('✅', 'تم إضافة الحساب: ' + code);
      }
      setModalVisible(false); await loadAll();
    } catch(e: any) { Alert.alert('❌', e.message || 'فشل الحفظ'); }
  };

  const handleDelete = async (a: any) => {
    Alert.alert('🗑️ حذف', `حذف "${a.name_ar}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => { if (db) { await db.runAsync('UPDATE accounts SET is_active=0 WHERE id=?', [a.id]); await loadAll(); } } },
    ]);
  };

  const selGroup = groups.find((g: any) => g.id === form.groupId);
  const selCurrency = currencies.find((c: any) => c.id === form.currencyId);

  if (loading) return <View style={styles.loading}><Text style={{ color: '#666' }}>جاري التحميل...</Text></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '📋 دليل الحسابات', headerStyle: { backgroundColor: '#0f3460' }, headerTintColor: '#fff' }} />
      
      <View style={[styles.topBar, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.mutedForeground} />
          <TextInput style={[styles.searchInput, { color: colors.foreground }]} value={search} onChangeText={setSearch} placeholder="🔍 بحث..." placeholderTextColor={colors.mutedForeground} textAlign="right" />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add-circle" size={40} color="#0f3460" /></TouchableOpacity>
      </View>

      <View style={[styles.summaryBar, { backgroundColor: '#E8EAF6' }]}>
        <Text style={styles.summaryText}>📊 {filtered.length} حساب</Text>
        <Text style={styles.summaryText}>💰 {formatNumber(accounts.reduce((s: number, a: any) => s + (a.balance || 0), 0))}</Text>
      </View>

      <FlatList data={filtered} keyExtractor={(a: any) => a.id} contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 40 }}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="list-outline" size={50} color="#ccc" /><Text style={{ color: '#888', marginTop: 12 }}>لا توجد حسابات</Text></View>}
        renderItem={({ item }) => {
          const grp = groups.find((g: any) => g.id === item.group_id);
          const cur = currencies.find((c: any) => c.id === item.currency_id);
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderLeftColor: '#0f3460' }]}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => openEdit(item)} activeOpacity={0.7}>
                <View style={styles.cardRow}>
                  <View style={styles.codeBox}><Text style={styles.codeText}>{safeString(item.code)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardName, { color: colors.foreground }]}>{safeString(item.name_ar || item.name)}</Text>
                    <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{safeString(grp?.name_ar || '')} | {safeString(cur?.symbol || '')}</Text>
                  </View>
                  <Text style={[styles.balance, { color: (item.balance || 0) >= 0 ? '#2E7D32' : '#C62828' }]}>{formatNumber(item.balance)}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                  <Ionicons name="create-outline" size={16} color="#fff" />
                  <Text style={styles.actionText}>تعديل</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#C62828' }]} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={16} color="#fff" />
                  <Text style={styles.actionText}>حذف</Text>
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
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{editId ? '✏️ تعديل حساب' : '➕ إضافة حساب'}</Text>
            <TouchableOpacity onPress={handleSave}><Text style={{ color: '#2E7D32', fontSize: 16, fontWeight: '700' }}>حفظ</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>
            {editId && (
              <View style={styles.codePreview}>
                <Ionicons name="barcode-outline" size={18} color="#0f3460" />
                <Text style={{ color: '#0f3460', fontWeight: '700' }}>{safeString(accounts.find((a: any) => a.id === editId)?.code)}</Text>
              </View>
            )}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>اسم الحساب *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} placeholder="أدخل اسم الحساب" placeholderTextColor={colors.mutedForeground} textAlign="right" />
            
            <Text style={[styles.label, { color: colors.mutedForeground }]}>المجموعة</Text>
            <View style={[styles.pickerList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {groups.map((g: any) => (
                <TouchableOpacity key={g.id} style={[styles.pickerItem, g.id === form.groupId && { backgroundColor: '#E8EAF6' }]} onPress={() => setForm(f => ({ ...f, groupId: g.id }))}>
                  <Text style={{ color: colors.foreground, fontWeight: g.id === form.groupId ? '700' : '400' }}>{g.name_ar} ({g.code})</Text>
                  {g.id === form.groupId && <Ionicons name="checkmark" size={20} color="#0f3460" />}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.mutedForeground }]}>العملة</Text>
            <View style={[styles.pickerList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {currencies.map((c: any) => (
                <TouchableOpacity key={c.id} style={[styles.pickerItem, c.id === form.currencyId && { backgroundColor: '#E8EAF6' }]} onPress={() => setForm(f => ({ ...f, currencyId: c.id }))}>
                  <Text style={{ color: colors.foreground, fontWeight: c.id === form.currencyId ? '700' : '400' }}>{c.name_ar} ({c.symbol}) - {formatNumber(c.rate)}</Text>
                  {c.id === form.currencyId && <Ionicons name="checkmark" size={20} color="#0f3460" />}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.mutedForeground }]}>💰 الرصيد الافتتاحي</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, fontSize: 20, fontWeight: '700', textAlign: 'center' }]} value={form.balance} onChangeText={v => setForm(f => ({ ...f, balance: v }))} placeholder="0" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
            
            <Text style={[styles.label, { color: colors.mutedForeground }]}>ملاحظات</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, height: 60 }]} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} placeholder="ملاحظات..." placeholderTextColor={colors.mutedForeground} multiline textAlign="right" />
            <View style={{ height: 30 }} />
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
  summaryBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  summaryText: { fontSize: 14, fontWeight: '600', color: '#0f3460' },
  empty: { alignItems: 'center', marginTop: 60 },
  card: { borderRadius: 16, padding: 14, marginBottom: 10, borderLeftWidth: 5, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  codeBox: { backgroundColor: '#E8EAF6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  codeText: { fontSize: 12, fontWeight: '800', color: '#0f3460' },
  cardName: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  cardSub: { fontSize: 12, textAlign: 'right', marginTop: 2 },
  balance: { fontSize: 16, fontWeight: '800' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2196F3', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  actionText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6, marginTop: 14, textAlign: 'right' },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1.5 },
  pickerList: { borderRadius: 12, borderWidth: 1.5, marginBottom: 10, maxHeight: 200 },
  pickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0' },
  codePreview: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8EAF6', padding: 10, borderRadius: 8, marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 19, fontWeight: '700' },
});
