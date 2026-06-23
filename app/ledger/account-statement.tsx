import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

interface StatementLine {
  date: string;
  description: string;
  debit: number | null | undefined;
  credit: number | null | undefined;
  balance: number | null | undefined;
  refNumber?: string | null;
}

export default function AccountStatementScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useApp();
  const { accounts, getAccountStatement } = useDatabase();
  const color = colors.section1;

  const [accountId, setAccountId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<StatementLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const selectedAccount = accounts.find(a => a.id === accountId);

  const safeNum = (v: number | null | undefined): number => (v == null || isNaN(Number(v)) ? 0 : Number(v));
  const fmtNum = (v: number | null | undefined) => safeNum(v).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSearch = async () => {
    if (!accountId) return Alert.alert('', isRTL ? 'اختر حساباً أولاً' : 'Select an account first');
    setLoading(true);
    try {
      const data = await getAccountStatement(accountId, from || undefined, to || undefined);
      setRows((data || []) as StatementLine[]);
      setLoaded(true);
      setShowPicker(false);
    } catch (e) {
      Alert.alert('⚠️', String(e));
    } finally {
      setLoading(false);
    }
  };

  const totalDebit = rows.reduce((s, r) => s + safeNum(r.debit), 0);
  const totalCredit = rows.reduce((s, r) => s + safeNum(r.credit), 0);
  const finalBalance = safeNum(rows[rows.length - 1]?.balance);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{
        title: isRTL ? 'كشف حساب' : 'Account Statement',
        headerStyle: { backgroundColor: color },
        headerTintColor: '#fff',
      }} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}>

        {/* Account Picker */}
        <TouchableOpacity
          style={[styles.pickerBtn, { backgroundColor: colors.card, borderColor: selectedAccount ? color : colors.border }]}
          onPress={() => setShowPicker(!showPicker)}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.pickerLabel, { color: colors.mutedForeground }]}>{isRTL ? 'الحساب *' : 'Account *'}</Text>
            <Text style={[styles.pickerVal, { color: selectedAccount ? colors.foreground : colors.mutedForeground }]}>
              {selectedAccount
                ? `${selectedAccount.code} — ${isRTL ? selectedAccount.nameAr : selectedAccount.name}`
                : (isRTL ? 'اختر حساباً...' : 'Select account...')}
            </Text>
          </View>
          <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        {showPicker && (
          <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {accounts.filter(a => a.isActive).map(a => (
              <TouchableOpacity
                key={a.id}
                style={[styles.dropItem, { borderBottomColor: colors.border }, a.id === accountId && { backgroundColor: color + '14' }]}
                onPress={() => { setAccountId(a.id); setShowPicker(false); }}
              >
                <Text style={[styles.dropCode, { color: colors.mutedForeground }]}>{a.code}</Text>
                <Text style={[styles.dropName, { color: a.id === accountId ? color : colors.foreground }]}>
                  {isRTL ? a.nameAr : a.name}
                </Text>
                {a.id === accountId && <Ionicons name="checkmark-circle" size={16} color={color} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date Range */}
        <View style={[styles.dateRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={{ flex: 1 }}>
            <FormField label={isRTL ? 'من تاريخ' : 'From'} value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <FormField label={isRTL ? 'إلى تاريخ' : 'To'} value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" />
          </View>
        </View>

        {/* Search button */}
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: loading ? colors.mutedForeground : color }]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Ionicons name={loading ? 'refresh' : 'search'} size={18} color="#fff" />
          <Text style={styles.searchBtnText}>{loading ? (isRTL ? 'جاري البحث...' : 'Searching...') : (isRTL ? 'عرض الكشف' : 'View Statement')}</Text>
        </TouchableOpacity>

        {/* Totals Summary */}
        {loaded && rows.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: color + '10', borderColor: color }]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{isRTL ? 'مجموع المدين' : 'Total Debit'}</Text>
                <Text style={[styles.summaryValue, { color: colors.section3 }]}>{fmtNum(totalDebit)}</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{isRTL ? 'مجموع الدائن' : 'Total Credit'}</Text>
                <Text style={[styles.summaryValue, { color: colors.destructive }]}>{fmtNum(totalCredit)}</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{isRTL ? 'الرصيد' : 'Balance'}</Text>
                <Text style={[styles.summaryValue, { color: finalBalance >= 0 ? colors.success : colors.destructive }]}>{fmtNum(finalBalance)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Statement Table */}
        {loaded && rows.length > 0 && (
          <View style={[styles.tableWrap, { borderColor: colors.border }]}>
            {/* Header */}
            <View style={[styles.tableHeader, { backgroundColor: color, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.thDate]}>{isRTL ? 'التاريخ' : 'Date'}</Text>
              <Text style={[styles.thDesc]}>{isRTL ? 'البيان' : 'Description'}</Text>
              <Text style={[styles.thAmt]}>{isRTL ? 'مدين' : 'Debit'}</Text>
              <Text style={[styles.thAmt]}>{isRTL ? 'دائن' : 'Credit'}</Text>
              <Text style={[styles.thAmt]}>{isRTL ? 'الرصيد' : 'Balance'}</Text>
            </View>
            {rows.map((row, i) => {
              const d = safeNum(row.debit);
              const c = safeNum(row.credit);
              const b = safeNum(row.balance);
              return (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    { borderTopColor: colors.border, backgroundColor: i % 2 === 0 ? colors.background : colors.card, flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Text style={[styles.tdDate, { color: colors.mutedForeground }]}>{row.date || '—'}</Text>
                  <Text style={[styles.tdDesc, { color: colors.foreground }]} numberOfLines={2}>{row.description || '—'}</Text>
                  <Text style={[styles.tdAmt, { color: d > 0 ? colors.section3 : colors.mutedForeground }]}>
                    {d > 0 ? fmtNum(d) : '—'}
                  </Text>
                  <Text style={[styles.tdAmt, { color: c > 0 ? colors.destructive : colors.mutedForeground }]}>
                    {c > 0 ? fmtNum(c) : '—'}
                  </Text>
                  <Text style={[styles.tdAmt, { color: b >= 0 ? colors.success : colors.destructive, fontWeight: '700' }]}>
                    {fmtNum(b)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {loaded && rows.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="document-text-outline" size={48} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 15 }}>{t.common.noData}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 10 },
  pickerLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  pickerVal: { fontSize: 14, fontWeight: '500' },
  dropdown: { borderRadius: 12, borderWidth: 1, marginBottom: 10, overflow: 'hidden', maxHeight: 260 },
  dropItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, gap: 8 },
  dropCode: { width: 52, fontSize: 11, fontWeight: '600' },
  dropName: { flex: 1, fontSize: 13 },
  dateRow: { marginBottom: 4 },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginBottom: 14 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  summaryCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 36, marginHorizontal: 8 },
  summaryLabel: { fontSize: 10, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  summaryValue: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  tableWrap: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  tableHeader: { padding: 10, gap: 4 },
  thDate: { width: 72, color: '#fff', fontSize: 11, fontWeight: '700' },
  thDesc: { flex: 1, color: '#fff', fontSize: 11, fontWeight: '700' },
  thAmt: { width: 70, color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'right' },
  tableRow: { padding: 10, borderTopWidth: 0.5, gap: 4 },
  tdDate: { width: 72, fontSize: 11 },
  tdDesc: { flex: 1, fontSize: 12 },
  tdAmt: { width: 70, fontSize: 12, textAlign: 'right' },
  emptyCard: { borderRadius: 14, borderWidth: 1, padding: 48, alignItems: 'center' },
});
