import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';
import { processPaymentVoucher } from '../../db/accounting';

export default function BankPaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useApp();
  const { accounts, vouchers, refresh, db } = useDatabase();
  const color = colors.section1;
  const [tab, setTab] = useState<'new' | 'list'>('new');
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], accountId: '', accountName: '', amount: '', refNumber: '', description: '' });
  const [saving, setSaving] = useState(false);

  const bankPayments = vouchers.filter(v => v.type === 'payment' && v.paymentMethod === 'bank');

  const handleSave = async () => {
    if (!form.accountId || !form.amount) return Alert.alert('', isRTL ? 'الحساب والمبلغ مطلوبان' : 'Account and amount required');
    if (!db) return;
    setSaving(true);
    try {
      await processPaymentVoucher(db, {
        date: form.date, accountId: form.accountId, accountName: form.accountName,
        amount: parseFloat(form.amount) || 0,
        description: form.description || (isRTL ? 'سند صرف بنكي' : 'Bank Payment'),
        paymentMethod: 'bank', refId: form.refNumber,
      });
      await refresh();
      Alert.alert('', t.common.success);
      setForm({ date: new Date().toISOString().split('T')[0], accountId: '', accountName: '', amount: '', refNumber: '', description: '' });
      setTab('list');
    } catch (e) { Alert.alert('', String(e)); }
    finally { setSaving(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'سند صرف بنكي' : 'Bank Payment', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['new', 'list'] as const).map(t2 => (
          <TouchableOpacity key={t2} style={[styles.tab, tab === t2 && { borderBottomColor: color, borderBottomWidth: 2 }]} onPress={() => setTab(t2)}>
            <Text style={[styles.tabText, { color: tab === t2 ? color : colors.mutedForeground }]}>
              {t2 === 'new' ? (isRTL ? 'سند جديد' : 'New') : (isRTL ? 'السجل' : 'List')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'new' ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}>
          <FormField label={isRTL ? 'التاريخ' : 'Date'} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} />
          <View style={[styles.pickerWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.pickerLabel, { color: colors.mutedForeground }]}>{isRTL ? 'الحساب *' : 'Account *'}</Text>
            {accounts.filter(a => a.isActive).map(a => (
              <TouchableOpacity key={a.id} style={[styles.accItem, form.accountId === a.id && { backgroundColor: color + '18' }, { borderColor: colors.border }]} onPress={() => setForm(f => ({ ...f, accountId: a.id, accountName: isRTL ? a.nameAr : a.name }))}>
                <Text style={[styles.accCode, { color: colors.mutedForeground }]}>{a.code}</Text>
                <Text style={[styles.accName, { color: form.accountId === a.id ? color : colors.foreground }]}>{isRTL ? a.nameAr : a.name}</Text>
                {form.accountId === a.id && <Ionicons name="checkmark-circle" size={18} color={color} />}
              </TouchableOpacity>
            ))}
          </View>
          <FormField label={isRTL ? 'المبلغ' : 'Amount'} value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} keyboardType="numeric" required />
          <FormField label={isRTL ? 'رقم المرجع' : 'Ref Number'} value={form.refNumber} onChangeText={v => setForm(f => ({ ...f, refNumber: v }))} />
          <FormField label={isRTL ? 'البيان' : 'Description'} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: saving ? colors.mutedForeground : colors.destructive }]} onPress={handleSave} disabled={saving}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : t.common.save}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList data={bankPayments.slice().reverse()} keyExtractor={v => v.id}
          contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 20 }}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="receipt-outline" size={40} color={colors.mutedForeground} /><Text style={{ color: colors.mutedForeground, marginTop: 8 }}>{t.common.noData}</Text></View>}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.destructive }]}>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.cardNum, { color: colors.destructive }]}>{item.number}</Text>
                <Text style={[styles.cardDate, { color: colors.mutedForeground }]}>{item.date}</Text>
              </View>
              <Text style={[styles.cardAccount, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{item.accountName}</Text>
              <Text style={[styles.cardAmount, { color: colors.destructive }]}>{item.amount.toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 }, tabText: { fontSize: 14, fontWeight: '600' },
  pickerWrap: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  pickerLabel: { fontSize: 12, fontWeight: '600', paddingHorizontal: 14, paddingTop: 10 },
  accItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 0.5, gap: 8 },
  accCode: { fontSize: 11, width: 48 }, accName: { flex: 1, fontSize: 13, fontWeight: '500' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  card: { borderRadius: 12, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  cardNum: { fontSize: 13, fontWeight: '700' }, cardDate: { fontSize: 12 },
  cardAccount: { fontSize: 14, fontWeight: '500', marginTop: 4 }, cardAmount: { fontSize: 16, fontWeight: '800', marginTop: 4 },
});
