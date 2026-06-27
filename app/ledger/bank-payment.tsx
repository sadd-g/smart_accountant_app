import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';
import { formatNumber, genId } from '../../db/database';

export default function CashPaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { db, accounts, bankBoxes, refresh } = useDatabase() as any;
  const [tab, setTab] = useState<'new' | 'list'>('new');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCashBoxPicker, setShowCashBoxPicker] = useState(false);
  const [searchAccount, setSearchAccount] = useState('');

  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], bankBoxId: '', bankBoxName: '', accountId: '', accountName: '', amount: '', description: '', refNumber: '' });

  useEffect(() => { if (db) loadVouchers(); }, [db]);
  const loadVouchers = async () => { setLoading(true); try { setVouchers(await db.getAllAsync("SELECT * FROM vouchers WHERE type='payment' ORDER BY created_at DESC LIMIT 50") || []); } catch(e) {} finally { setLoading(false); } };

  const handleSave = async () => {
    if (!form.accountId) return Alert.alert('', 'اختر الحساب');
    if (!form.amount || parseFloat(form.amount) <= 0) return Alert.alert('', 'أدخل المبلغ');
    if (!db) return;
    setSaving(true);
    try {
      const num = 'PV-' + Date.now().toString().slice(-6);
      const amt = parseFloat(form.amount);
      await db.runAsync("INSERT INTO vouchers(id,number,type,date,account_id,account_name,amount,description,ref_id,payment_method) VALUES(?,?,?,?,?,?,?,?,?,?)", [genId(), num, 'payment', form.date, form.accountId, form.accountName, amt, form.description || 'سند صرف', form.refNumber, 'bank']);
      // تحديث رصيد البنك
      if (form.bankBoxId) { await db.runAsync("UPDATE bank_boxes SET current_balance = current_balance + ? WHERE id = ?", [amt, form.bankBoxId]); }
      // تحديث رصيد الحساب
      await db.runAsync("UPDATE accounts SET balance = balance + ? WHERE id = ?", [amt, form.accountId]);
      Alert.alert('✅', 'تم حفظ سند الصرف: ' + num);
      setForm({ date: new Date().toISOString().split('T')[0], bankBoxId: '', bankBoxName: '', accountId: '', accountName: '', amount: '', description: '', refNumber: '' });
      await loadVouchers(); setTab('list');
    } catch(e: any) { Alert.alert('❌', e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (v: any) => {
    Alert.alert('🗑️', 'حذف ' + v.number + '؟', [{ text: 'إلغاء', style: 'cancel' }, { text: 'حذف', style: 'destructive', onPress: async () => { if (db) { await db.runAsync("DELETE FROM vouchers WHERE id = ?", [v.id]); await loadVouchers(); } } }]);
  };

  const filteredAccounts = searchAccount ? accounts?.filter((a: any) => a.nameAr?.includes(searchAccount) || a.code?.includes(searchAccount)) : accounts;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '✅ سند صرف بنكي', headerStyle: { backgroundColor: '#C62828' }, headerTintColor: '#fff' }} />
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={[styles.tab, tab === 'new' && styles.tabActive]} onPress={() => setTab('new')}><Ionicons name="add-circle" size={18} color={tab === 'new' ? '#C62828' : colors.mutedForeground} /><Text style={[styles.tabText, { color: tab === 'new' ? '#C62828' : colors.mutedForeground }]}>سند جديد</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'list' && styles.tabActive]} onPress={() => setTab('list')}><Ionicons name="list" size={18} color={tab === 'list' ? '#C62828' : colors.mutedForeground} /><Text style={[styles.tabText, { color: tab === 'list' ? '#C62828' : colors.mutedForeground }]}>السجل ({vouchers.length})</Text></TouchableOpacity>
      </View>

      {tab === 'new' ? (
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>التاريخ</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground }]} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} textAlign="right" />
          
          <Text style={[styles.label, { color: colors.mutedForeground }]}>البنك</Text>
          <TouchableOpacity style={[styles.selectBtn, { backgroundColor: colors.card }]} onPress={() => setShowCashBoxPicker(!showCashBoxPicker)}>
            <Text style={{ color: form.bankBoxName ? colors.foreground : colors.mutedForeground, flex: 1, textAlign: 'right' }}>{form.bankBoxName || 'اختر البنك...'}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
          {showCashBoxPicker && (
            <View style={[styles.pickerList, { backgroundColor: colors.card }]}>
              {bankBoxes?.map((cb: any) => (
                <TouchableOpacity key={cb.id} style={styles.pickerItem} onPress={() => { setForm(f => ({ ...f, bankBoxId: cb.id, bankBoxName: cb.nameAr })); setShowCashBoxPicker(false); }}>
                  <Text style={{ color: colors.foreground }}>{cb.nameAr} - {formatNumber(cb.currentBalance || 0)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.label, { color: colors.mutedForeground }]}>الحساب الدائن *</Text>
          <TouchableOpacity style={[styles.selectBtn, { backgroundColor: colors.card }]} onPress={() => { setSearchAccount(''); setShowAccountPicker(true); }}>
            <Text style={{ color: form.accountName ? colors.foreground : colors.mutedForeground, flex: 1, textAlign: 'right' }}>{form.accountName || 'اختر الحساب...'}</Text>
            <Ionicons name="search" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>المبلغ *</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, fontSize: 24, fontWeight: '800', textAlign: 'center' }]} value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} placeholder="0" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>البيان</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, height: 60 }]} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} placeholder="وصف عملية الصرف" placeholderTextColor={colors.mutedForeground} multiline textAlign="right" />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>رقم المرجع</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground }]} value={form.refNumber} onChangeText={v => setForm(f => ({ ...f, refNumber: v }))} placeholder="رقم مرجعي" placeholderTextColor={colors.mutedForeground} textAlign="right" />

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#C62828' }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name="save" size={20} color="#fff" />}
            <Text style={styles.saveText}>{saving ? 'جاري الحفظ...' : 'حفظ سند الصرف'}</Text>
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      ) : (
        <FlatList data={vouchers} keyExtractor={v => v.id} contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="payment-outline" size={50} color="#ccc" /><Text style={{ color: '#888', marginTop: 12 }}>لا توجد سندات</Text></View>}
          renderItem={({ item }) => (
            <View style={[styles.vCard, { backgroundColor: colors.card, borderLeftColor: '#C62828' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={[styles.vNum, { color: '#C62828' }]}>{item.number}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{item.date}</Text>
              </View>
              <Text style={{ color: colors.foreground, textAlign: 'right', marginBottom: 4 }}>{item.description}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#C62828', fontSize: 18, fontWeight: '800' }}>{formatNumber(item.amount)}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={styles.actionBtn}><Ionicons name="print-outline" size={18} color="#2196F3" /></TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={18} color="#C62828" /></TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showAccountPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.foreground }]}>اختيار الحساب</Text><TouchableOpacity onPress={() => setShowAccountPicker(false)}><Ionicons name="close" size={24} color={colors.foreground} /></TouchableOpacity></View>
          <View style={[styles.searchBox, { backgroundColor: colors.card }]}><Ionicons name="search" size={18} color={colors.mutedForeground} /><TextInput style={{ flex: 1, fontSize: 14, color: colors.foreground }} value={searchAccount} onChangeText={setSearchAccount} placeholder="بحث..." placeholderTextColor={colors.mutedForeground} textAlign="right" /></View>
          <FlatList data={filteredAccounts} keyExtractor={(a: any) => a.id} style={{ maxHeight: 350 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.accItem, { borderBottomColor: colors.border }]} onPress={() => { setForm(f => ({ ...f, accountId: item.id, accountName: item.nameAr })); setShowAccountPicker(false); }}>
                <Text style={[styles.accCode, { color: '#C62828' }]}>{item.code}</Text>
                <Text style={{ flex: 1, color: colors.foreground, textAlign: 'right' }}>{item.nameAr}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{formatNumber(item.balance)}</Text>
              </TouchableOpacity>
            )} />
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#C62828' }, tabText: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6, marginTop: 14, textAlign: 'right' },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1.5, borderColor: '#e0e0e0' },
  selectBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, borderWidth: 1.5, borderColor: '#e0e0e0' },
  pickerList: { borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', marginTop: 6, maxHeight: 200 },
  pickerItem: { padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 10 }, saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  vCard: { borderRadius: 14, padding: 16, marginBottom: 10, borderLeftWidth: 5, elevation: 2 },
  vNum: { fontSize: 14, fontWeight: '700' },
  actionBtn: { padding: 8, backgroundColor: '#f0f0f0', borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', margin: 12, gap: 8, borderRadius: 10, paddingHorizontal: 12 },
  accItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, borderBottomWidth: 0.5 },
  accCode: { fontSize: 12, fontWeight: '700', backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
});
