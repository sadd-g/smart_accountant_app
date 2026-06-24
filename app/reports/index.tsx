import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

const { width } = Dimensions.get('window');

export default function ReportsIndex() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { db } = useDatabase() as any;
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (db) { loadStats(); } else { setLoading(false); }
  }, [db]);

  const loadStats = async () => {
    try {
      const [acc, cust, supp, item, sales, purchase, entries] = await Promise.all([
        db.getAllAsync("SELECT COUNT(*) as c FROM accounts WHERE is_active=1"),
        db.getAllAsync("SELECT COUNT(*) as c FROM customers WHERE is_active=1"),
        db.getAllAsync("SELECT COUNT(*) as c FROM suppliers WHERE is_active=1"),
        db.getAllAsync("SELECT COUNT(*) as c FROM items WHERE is_active=1"),
        db.getAllAsync("SELECT COALESCE(SUM(total),0) as t FROM sales_invoices"),
        db.getAllAsync("SELECT COALESCE(SUM(total),0) as t FROM purchase_invoices"),
        db.getAllAsync("SELECT COUNT(*) as c FROM journal_entries"),
      ]);
      setStats({
        accounts: (acc[0] as any)?.c || 0, customers: (cust[0] as any)?.c || 0,
        suppliers: (supp[0] as any)?.c || 0, items: (item[0] as any)?.c || 0,
        sales: (sales[0] as any)?.t || 0, purchase: (purchase[0] as any)?.t || 0,
        entries: (entries[0] as any)?.c || 0,
      });
    } catch(e) {} finally { setLoading(false); }
  };

  const reports = [
    { t: 'ميزان المراجعة', i: 'scale-outline', r: '/ledger/trial-balance', c: '#1B5E20' },
    { t: 'الأستاذ العام', i: 'book-outline', r: '/ledger/general-ledger', c: '#0D47A1' },
    { t: 'كشف حساب', i: 'document-text-outline', r: '/ledger/account-statement', c: '#2196F3' },
    { t: 'تقارير العملات', i: 'cash-outline', r: '/ledger/currency-reports', c: '#E65100' },
    { t: 'مبيعات العملاء', i: 'people-outline', r: '/sales/customer-sales', c: '#E91E63' },
    { t: 'مبيعات الأصناف', i: 'cube-outline', r: '/sales/item-sales', c: '#FF9800' },
    { t: 'ملخص المبيعات', i: 'pie-chart-outline', r: '/sales/summary', c: '#9C27B0' },
    { t: 'أداء المندوبين', i: 'trophy-outline', r: '/sales/rep-performance', c: '#F44336' },
    { t: 'تقرير الكميات', i: 'stats-chart-outline', r: '/inventory/qty-report', c: '#009688' },
    { t: 'حركة الأصناف', i: 'git-compare-outline', r: '/inventory/item-movement', c: '#795548' },
    { t: 'بطيئة الحركة', i: 'hourglass-outline', r: '/inventory/slow-moving', c: '#FF6F00' },
    { t: 'منتهية الصلاحية', i: 'warning-outline', r: '/inventory/expired', c: '#C62828' },
  ];

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#0f3460" /></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '📊 التقارير', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 20 }}>
        <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}><Text style={[styles.statVal, { color: colors.primary }]}>{stats.accounts}</Text><Text style={[styles.statLbl, { color: colors.mutedForeground }]}>حسابات</Text></View>
          <View style={styles.statItem}><Text style={[styles.statVal, { color: colors.primary }]}>{stats.customers}</Text><Text style={[styles.statLbl, { color: colors.mutedForeground }]}>عملاء</Text></View>
          <View style={styles.statItem}><Text style={[styles.statVal, { color: colors.primary }]}>{stats.items}</Text><Text style={[styles.statLbl, { color: colors.mutedForeground }]}>أصناف</Text></View>
          <View style={styles.statItem}><Text style={[styles.statVal, { color: colors.primary }]}>{stats.entries}</Text><Text style={[styles.statLbl, { color: colors.mutedForeground }]}>قيود</Text></View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📈 التقارير المالية</Text>
        <View style={styles.grid}>
          {reports.map((r, i) => (
            <TouchableOpacity key={i} style={[styles.card, { backgroundColor: colors.card, borderLeftColor: r.c }]} onPress={() => router.push(r.r as any)} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: r.c + '20' }]}><Ionicons name={r.i as any} size={26} color={r.c} /></View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{r.t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: { flexDirection: 'row', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '800' },
  statLbl: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 10, textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { width: (width - 40) / 2, borderRadius: 16, padding: 16, alignItems: 'center', borderLeftWidth: 5, elevation: 3 },
  iconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
