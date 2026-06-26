import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: accounts } = useLocalTable('accounts');
  const { data: customers } = useLocalTable('customers');
  const { data: invoices } = useLocalTable('salesInvoices');
  const { data: cashBoxes } = useLocalTable('cashBoxes');

  const totalSales = (invoices || []).reduce((s: number, i: any) => s + (i.total || 0), 0);
  const totalCash = (cashBoxes || []).reduce((s: number, c: any) => s + (c.balance || 0), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.welcome}>💎 دفتر المحاسب الذكي</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statVal}>💰 {totalSales.toLocaleString()}</Text><Text style={styles.statLbl}>المبيعات</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>📚 {accounts.length}</Text><Text style={styles.statLbl}>حسابات</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>👥 {customers.length}</Text><Text style={styles.statLbl}>عملاء</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>💵 {totalCash.toLocaleString()}</Text><Text style={styles.statLbl}>نقدية</Text></View>
        </View>

        <Text style={styles.secTitle}>⚡ إجراءات سريعة</Text>
        <View style={styles.quickRow}>
          {[
            { icon: '📄', label: 'فاتورة مبيعات', route: '/sales/sales-invoice' },
            { icon: '📋', label: 'فاتورة مشتريات', route: '/inventory/purchase-invoice' },
            { icon: '📝', label: 'قيد يومية', route: '/ledger/journal-entry' },
            { icon: '🧾', label: 'سند قبض/صرف', route: '/ledger/vouchers' },
          ].map((q, i) => (
            <TouchableOpacity key={i} style={styles.quickCard} onPress={() => router.push(q.route)}>
              <Text style={styles.quickIcon}>{q.icon}</Text>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.secTitle}>📊 الأقسام الرئيسية</Text>

        {/* قسم دفتر الأستاذ */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.sectionHead} onPress={() => router.push('/ledger/index')}>
            <Text style={styles.sectionIcon}>📚</Text>
            <Text style={styles.sectionName}>دفتر الأستاذ العام</Text>
            <Text style={styles.sectionArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.subGrid}>
            {[
              { icon: '📚', label: 'دليل الحسابات', route: '/ledger/accounts' },
              { icon: '📁', label: 'مجموعات الحسابات', route: '/ledger/account-groups' },
              { icon: '📝', label: 'القيود اليومية', route: '/ledger/journal-entry' },
              { icon: '🧾', label: 'سندات القبض والصرف', route: '/ledger/vouchers' },
              { icon: '💰', label: 'الصناديق', route: '/ledger/cash-boxes' },
              { icon: '🏦', label: 'البنوك والمحافظ', route: '/ledger/banks' },
              { icon: '💱', label: 'العملات', route: '/ledger/currencies' },
              { icon: '⚖️', label: 'ميزان المراجعة', route: '/ledger/trial-balance' },
              { icon: '📄', label: 'كشف حساب', route: '/ledger/account-statement' },
            ].map((item, j) => (
              <TouchableOpacity key={j} style={styles.subItem} onPress={() => router.push(item.route)}>
                <Text style={styles.subIcon}>{item.icon}</Text>
                <Text style={styles.subLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* قسم المخزون */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.sectionHead} onPress={() => router.push('/inventory/index')}>
            <Text style={styles.sectionIcon}>📦</Text>
            <Text style={styles.sectionName}>المخزون والمشتريات</Text>
            <Text style={styles.sectionArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.subGrid}>
            {[
              { icon: '🏪', label: 'الموردين', route: '/inventory/suppliers' },
              { icon: '🏭', label: 'المستودعات', route: '/inventory/warehouses' },
              { icon: '📦', label: 'الأصناف', route: '/inventory/items' },
              { icon: '📋', label: 'فاتورة مشتريات', route: '/inventory/purchase-invoice' },
              { icon: '📤', label: 'صرف مخزون', route: '/inventory/inventory-issue' },
              { icon: '📥', label: 'توريد مخزون', route: '/inventory/inventory-receipt' },
              { icon: '🔄', label: 'تحويل مخزني', route: '/inventory/warehouse-transfer' },
              { icon: '📐', label: 'وحدات القياس', route: '/inventory/units' },
              { icon: '🏷️', label: 'الفئات', route: '/inventory/categories' },
              { icon: '⭐', label: 'الماركات', route: '/inventory/brands' },
              { icon: '📊', label: 'حركة الأصناف', route: '/inventory/item-movement' },
            ].map((item, j) => (
              <TouchableOpacity key={j} style={styles.subItem} onPress={() => router.push(item.route)}>
                <Text style={styles.subIcon}>{item.icon}</Text>
                <Text style={styles.subLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* قسم المبيعات */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.sectionHead} onPress={() => router.push('/sales/index')}>
            <Text style={styles.sectionIcon}>💰</Text>
            <Text style={styles.sectionName}>المبيعات والعملاء</Text>
            <Text style={styles.sectionArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.subGrid}>
            {[
              { icon: '👥', label: 'العملاء', route: '/sales/customers' },
              { icon: '📄', label: 'فاتورة مبيعات', route: '/sales/sales-invoice' },
              { icon: '🔄', label: 'مرتجع مبيعات', route: '/sales/sales-return' },
              { icon: '👨‍💼', label: 'مندوبي المبيعات', route: '/sales/reps' },
              { icon: '📊', label: 'ملخص المبيعات', route: '/sales/summary' },
              { icon: '📋', label: 'عرض سعر', route: '/sales/quotation' },
            ].map((item, j) => (
              <TouchableOpacity key={j} style={styles.subItem} onPress={() => router.push(item.route)}>
                <Text style={styles.subIcon}>{item.icon}</Text>
                <Text style={styles.subLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* قسم التقارير */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.sectionHead} onPress={() => router.push('/reports/index')}>
            <Text style={styles.sectionIcon}>📊</Text>
            <Text style={styles.sectionName}>التقارير والتنبيهات</Text>
            <Text style={styles.sectionArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.subGrid}>
            {[
              { icon: '📊', label: 'جميع التقارير', route: '/reports/index' },
              { icon: '⚖️', label: 'ميزان المراجعة', route: '/ledger/trial-balance' },
              { icon: '📄', label: 'كشف حساب', route: '/ledger/account-statement' },
              { icon: '💱', label: 'تقارير العملات', route: '/ledger/currency-reports' },
            ].map((item, j) => (
              <TouchableOpacity key={j} style={styles.subItem} onPress={() => router.push(item.route)}>
                <Text style={styles.subIcon}>{item.icon}</Text>
                <Text style={styles.subLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.secTitle}>⚙️ النظام</Text>
        {[
          { icon: '⚙️', label: 'الإعدادات', route: '/settings' },
          { icon: '👑', label: 'لوحة تحكم المالك', route: '/owner' },
          { icon: '🎤', label: 'الأوامر الصوتية', route: '/voice' },
          { icon: '💾', label: 'النسخ الاحتياطي', route: '/backup' },
          { icon: 'ℹ️', label: 'حول التطبيق', route: '/about' },
          { icon: '🚪', label: 'تسجيل الخروج', route: '/login' },
        ].map((link, i) => (
          <TouchableOpacity key={i} style={styles.sysItem} onPress={() => router.push(link.route)}>
            <Text style={styles.sysIcon}>{link.icon}</Text>
            <Text style={styles.sysLabel}>{link.label}</Text>
            <Text style={styles.sectionArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  welcome: { fontSize: 19, fontWeight: 'bold', color: '#FFFFFF' },
  settingsIcon: { fontSize: 24 },
  scroll: { flex: 1, paddingHorizontal: 14 },
  stats: { flexDirection: 'row', gap: 6, marginBottom: 16, marginTop: 4 },
  stat: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  statVal: { fontSize: 12, fontWeight: 'bold', color: '#D4AF37', marginBottom: 3 },
  statLbl: { color: '#94a3b8', fontSize: 10 },
  secTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10, marginTop: 16 },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickCard: { flex: 1, alignItems: 'center' },
  quickIcon: { fontSize: 22, marginBottom: 4 },
  quickLabel: { color: '#FFFFFF', fontSize: 10, textAlign: 'center' },
  sectionCard: { backgroundColor: '#16213E', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a3550', overflow: 'hidden' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#1a2240' },
  sectionIcon: { fontSize: 24, marginRight: 10 },
  sectionName: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  sectionArrow: { fontSize: 22, color: '#D4AF37', fontWeight: 'bold' },
  subGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  subItem: { width: '33%', alignItems: 'center', paddingVertical: 10 },
  subIcon: { fontSize: 20, marginBottom: 3 },
  subLabel: { color: '#94a3b8', fontSize: 10, textAlign: 'center' },
  sysItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213E', borderRadius: 12, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: '#2a3550' },
  sysIcon: { fontSize: 18, marginRight: 10 },
  sysLabel: { color: '#FFFFFF', fontSize: 13, flex: 1 },
});
