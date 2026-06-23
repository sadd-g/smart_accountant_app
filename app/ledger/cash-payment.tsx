import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { processPaymentVoucher } from '../../db/accounting';
import { useColors } from '../../hooks/useColors';

type PaymentMethod = 'cash' | 'bank' | 'wallet';

export default function CashPaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useApp();
  const { accounts, vouchers, currencies, refresh, db } = useDatabase();
  const color = colors.section1;
  const [tab, setTab] = useState<'new' | 'list'>('new');
  const [saving, setSaving] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as PaymentMethod,
    accountId: '', accountName: '',
    currencyId: currencies[0]?.id || '1',
    exchangeRate: '1',
    amount: '',
    description: '',
    refNumber: '',
  });

  const paymentVouchers = vouchers.filter(v => v.type === 'payment').slice().reverse();

  const selectedCurrency = currencies.find(c => c.id === form.currencyId);
  const baseCurrency = currencies.find(c => c.isDefault) || currencies.find(c => c.rate === 1) || currencies[0];
  const isNonBase = selectedCurrency && baseCurrency && selectedCurrency.id !== baseCurrency.id;
  const amountInBase = isNonBase ? (parseFloat(form.amount) || 0) * (parseFloat(form.exchangeRate) || 1) : (parseFloat(form.amount) || 0);

  const methodOptions: { value: PaymentMethod; labelAr: string; labelEn: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { value: 'cash', labelAr: 'نقدي', labelEn: 'Cash', icon: 'cash-outline', color: colors.success },
    { value: 'bank', labelAr: 'بنكي', labelEn: 'Bank', icon: 'card-outline', color: colors.section1 },
    { value: 'wallet', labelAr: 'محفظة إلكترونية', labelEn: 'E-Wallet', icon: 'phone-portrait-outline', color: colors.section5 },
  ];

  const selectedMethod = methodOptions.find(m => m.value === form.paymentMethod)!;
  const selectedAccount = accounts.find(a => a.id === form.accountId);

  const handleSave = async () => {
    if (!form.accountId) return Alert.alert('', isRTL ? 'اختر الحساب المدين/الدائن' : 'Select an account');
    if (!form.amount || parseFloat(form.amount) <= 0) return Alert.alert('', isRTL ? 'أدخل المبلغ' : 'Enter amount');
    if (!db) return;
    setSaving(true);
    try {
      await processPaymentVoucher(db, {
        date: form.date,
        accountId: form.accountId,
        accountName: form.accountName,
        amount: amountInBase,
        description: form.description || (isRTL ? 'سند صرف' : 'Payment Voucher'),
        paymentMethod: form.paymentMethod,
        refId: form.refNumber,
      });
      await refresh();
      Alert.alert('✅', t.common.success);
      setForm(f => ({ ...f, accountId: '', accountName: '', amount: '', description: '', refNumber: '' }));
      setTab('list');
    } catch (e) {
      Alert.alert('⚠️', String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'سند صرف' : 'Payment Voucher', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['new', 'list'] as const).map(t2 => (
          <TouchableOpacity key={t2} style={[styles.tab, tab === t2 && { borderBottomColor: color, borderBottomWidth: 2 }]} onPress={() => setTab(t2)}>
            <Text style={[styles.tabText, { color: tab === t2 ? color : colors.mutedForeground }]}>
              {t2 === 'new' ? (isRTL ? 'سند جديد' : 'New Voucher') : (isRTL ? `السجل (${paymentVouchers.length})` : `List (${paymentVouchers.length})`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'new' ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}>
          <View style={[styles.autoNumCard, { backgroundColor: colors.destructive + '0E', borderColor: colors.destructive }]}>
            <Ionicons name="barcode-outline" size={16} color={colors.destructive} />
            <Text style={[styles.autoNumText, { color: colors.destructive }]}>
              {isRTL ? 'رقم السند: آلي عند الحفظ' : 'Voucher#: Auto-generated on save'}
            </Text>
          </View>

          <FormField label={isRTL ? 'التاريخ' : 'Date'} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} />

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{isRTL ? 'نوع العملية *' : 'Payment Type *'}</Text>
          <TouchableOpacity style={[styles.selectBtn, { borderColor: selectedMethod.color, backgroundColor: selectedMethod.color + '08' }]} onPress={() => setShowMethodPicker(!showMethodPicker)}>
            <View style={[styles.methodIcon, { backgroundColor: selectedMethod.color + '18' }]}>
              <Ionicons name={selectedMethod.icon} size={18} color={selectedMethod.color} />
            </View>
            <Text style={{ color: selectedMethod.color, flex: 1, fontWeight: '700', marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}>
              {isRTL ? selectedMethod.labelAr : selectedMethod.labelEn}
            </Text>
            <Ionicons name={showMethodPicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          {showMethodPicker && (
            <View style={[styles.pickerList, { borderColor: colors.border }]}>
              {methodOptions.map(m => (
                <TouchableOpacity key={m.value} style={[styles.pickerItem, { borderBottomColor: colors.border }, m.value === form.paymentMethod && { backgroundColor: m.color + '10' }]}
                  onPress={() => { setForm(f => ({ ...f, paymentMethod: m.value })); setShowMethodPicker(false); }}>
                  <Ionicons name={m.icon} size={18} color={m.color} />
                  <Text style={{ color: m.value === form.paymentMethod ? m.color : colors.foreground, marginLeft: 10, fontWeight: '500' }}>
                    {isRTL ? m.labelAr : m.labelEn}
                  </Text>
                  {m.value === form.paymentMethod && <Ionicons name="checkmark-circle" size={16} color={m.color} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[styles.rowGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{isRTL ? 'العملة' : 'Currency'}</Text>
              <TouchableOpacity style={[styles.selectBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}>
                <Text style={{ color: colors.foreground, flex: 1, fontSize: 13 }}>{selectedCurrency?.symbol || '—'} {selectedCurrency?.nameAr || ''}</Text>
                <Ionicons name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'} size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {isNonBase && (
              <View style={{ flex: 1, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}>
                <FormField label={isRTL ? 'سعر الصرف' : 'Exchange Rate'} value={form.exchangeRate} onChangeText={v => setForm(f => ({ ...f, exchangeRate: v }))} keyboardType="numeric" />
              </View>
            )}
          </View>
          {showCurrencyPicker && (
            <View style={[styles.pickerList, { borderColor: colors.border }]}>
              {currencies.map(c => (
                <TouchableOpacity key={c.id} style={[styles.pickerItem, { borderBottomColor: colors.border }, c.id === form.currencyId && { backgroundColor: color + '10' }]}
                  onPress={() => { setForm(f => ({ ...f, currencyId: c.id })); setShowCurrencyPicker(false); }}>
                  <Text style={{ color: colors.foreground, flex: 1 }}>{c.symbol} {isRTL ? c.nameAr : c.name}</Text>
                  {c.id === form.currencyId && <Ionicons name="checkmark" size={16} color={color} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{isRTL ? 'الحساب المدين/الدائن *' : 'Debit/Credit Account *'}</Text>
          <TouchableOpacity style={[styles.selectBtn, { borderColor: selectedAccount ? colors.destructive : colors.border, backgroundColor: colors.card }]} onPress={() => setShowAccountPicker(!showAccountPicker)}>
            <View style={{ flex: 1 }}>
              {selectedAccount ? (
                <Text style={{ color: colors.foreground, fontWeight: '600' }}>
                  {selectedAccount.code} — {isRTL ? selectedAccount.nameAr : selectedAccount.name}
                </Text>
              ) : (
                <Text style={{ color: colors.mutedForeground }}>{isRTL ? 'اختر الحساب...' : 'Select account...'}</Text>
              )}
            </View>
            <Ionicons name={showAccountPicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          {showAccountPicker && (
            <View style={[styles.pickerList, { borderColor: colors.border, maxHeight: 240 }]}>
              {accounts.filter(a => a.isActive).map(a => (
                <TouchableOpacity key={a.id} style={[styles.pickerItem, { borderBottomColor: colors.border }, a.id === form.accountId && { backgroundColor: colors.destructive + '10' }]}
                  onPress={() => { setForm(f => ({ ...f, accountId: a.id, accountName: isRTL ? a.nameAr : a.name })); setShowAccountPicker(false); }}>
                  <Text style={[styles.codeText, { color: colors.mutedForeground }]}>{a.code}</Text>
                  <Text style={{ color: a.id === form.accountId ? colors.destructive : colors.foreground, flex: 1 }}>{isRTL ? a.nameAr : a.name}</Text>
                  {a.id === form.accountId && <Ionicons name="checkmark" size={16} color={colors.destructive} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <FormField label={isRTL ? `المبلغ (${selectedCurrency?.symbol || ''}) *` : `Amount (${selectedCurrency?.symbol || ''}) *`}
            value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} keyboardType="numeric" required />

          {isNonBase && form.amount && (
            <View style={[styles.convertedCard, { backgroundColor: colors.info + '0E', borderColor: colors.info }]}>
              <Ionicons name="swap-horizontal" size={14} color={colors.info} />
              <Text style={[styles.convertedText, { color: colors.info }]}>
                {isRTL ? `المعادل: ${amountInBase.toLocaleString()} ${baseCurrency?.symbol || ''}` : `Equivalent: ${amountInBase.toLocaleString()} ${baseCurrency?.symbol || ''}`}
              </Text>
            </View>
          )}

          <FormField label={isRTL ? 'البيان' : 'Description'} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
          <FormField label={isRTL ? 'رقم المرجع' : 'Reference Number'} value={form.refNumber} onChangeText={v => setForm(f => ({ ...f, refNumber: v }))} />

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: saving ? colors.mutedForeground : colors.destructive }]} onPress={handleSave} disabled={saving}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ السند' : 'Save Voucher')}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={paymentVouchers}
          keyExtractor={v => v.id}
          contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 20 }}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="receipt-outline" size={48} color={colors.mutedForeground} /><Text style={{ color: colors.mutedForeground, marginTop: 12 }}>{t.common.noData}</Text></View>}
          renderItem={({ item }) => (
            <View style={[styles.voucherCard, { backgroundColor: colors.card, borderColor: colors.destructive }]}>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.vNum, { color: colors.destructive }]}>{item.number}</Text>
                <View style={[styles.methodTag, { backgroundColor: colors.destructive + '14', borderColor: colors.destructive }]}>
                  <Text style={{ color: colors.destructive, fontSize: 11, fontWeight: '700' }}>{isRTL ? 'صرف' : 'Payment'}</Text>
                </View>
                <Text style={[styles.vDate, { color: colors.mutedForeground }]}>{item.date}</Text>
              </View>
              <Text style={[styles.vAccount, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{item.accountName}</Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text style={[styles.vAmount, { color: colors.destructive }]}>{item.amount.toLocaleString()}</Text>
                {item.description ? <Text style={{ color: colors.mutedForeground, fontSize: 12 }} numberOfLines={1}>{item.description}</Text> : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 13, fontWeight: '600' },
  autoNumCard: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  autoNumText: { fontSize: 13, fontWeight: '600' },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 6 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 4 },
  methodIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pickerList: { borderWidth: 1, borderRadius: 12, marginBottom: 8, overflow: 'hidden' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderBottomWidth: 0.5 },
  rowGroup: { gap: 8 },
  convertedCard: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  convertedText: { fontSize: 13, fontWeight: '600' },
  codeText: { width: 52, fontSize: 12, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  voucherCard: { borderRadius: 12, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  vNum: { fontSize: 13, fontWeight: '700' },
  methodTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  vDate: { fontSize: 12 },
  vAccount: { fontSize: 14, fontWeight: '500', marginTop: 6 },
  vAmount: { fontSize: 16, fontWeight: '800' },
});
