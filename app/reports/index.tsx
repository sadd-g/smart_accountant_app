import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function ReportsIndex() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { notifications, markNotificationRead, markAllNotificationsRead, salesInvoices, purchaseInvoices, customers, suppliers, items, journalEntries, vouchers } = useDatabase();
  const color = colors.section4;
  const [tab, setTab] = useState<'reports' | 'notifications'>('reports');
  const [search, setSearch] = useState('');

  const unread = notifications.filter(n => !n.read).length;

  const totalSales = salesInvoices.reduce((s, i) => s + i.total, 0);
  const totalPurchases = purchaseInvoices.reduce((s, i) => s + i.total, 0);
  const netProfit = totalSales - totalPurchases;
  const lowStock = items.filter(i => i.quantity <= i.minQuantity).length;
  const expired = items.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date()).length;

  type ReportLink = { label: string; icon: keyof typeof Ionicons.glyphMap; route: string; value?: string };

  interface ReportGroup {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    reports: ReportLink[];
  }

  const reportGroups: ReportGroup[] = [
    {
      title: isRTL ? '📊 الأستاذ العام' : '📊 General Ledger',
      icon: 'book-outline',
      color: colors.section1,
      reports: [
        { label: isRTL ? 'ميزان المراجعة' : 'Trial Balance', icon: 'scale-outline', route: '/ledger/trial-balance', value: accounts_count(journalEntries.length) },
        { label: isRTL ? 'كشف حساب' : 'Account Statement', icon: 'document-text-outline', route: '/ledger/account-statement' },
        { label: isRTL ? 'الأستاذ العام' : 'General Ledger', icon: 'book-outline', route: '/ledger/general-ledger' },
        { label: isRTL ? 'تقارير العملات' : 'Currency Reports', icon: 'cash-outline', route: '/ledger/currency-reports' },
      ],
    },
    {
      title: isRTL ? '🛒 المبيعات والعملاء' : '🛒 Sales & Customers',
      icon: 'cart-outline',
      color: colors.section3,
      reports: [
        { label: isRTL ? 'ملخص المبيعات' : 'Sales Summary', icon: 'bar-chart-outline', route: '/sales/summary', value: totalSales.toLocaleString() },
        { label: isRTL ? 'كشف حساب عميل' : 'Customer Statement', icon: 'person-outline', route: '/ledger/account-statement' },
        { label: isRTL ? 'مبيعات حسب الصنف' : 'Sales by Item', icon: 'cube-outline', route: '/sales/item-sales' },
        { label: isRTL ? 'أداء المندوبين' : 'Rep Performance', icon: 'person-outline', route: '/sales/rep-performance' },
        { label: isRTL ? '🏆 هدف المبيعات' : '🏆 Sales Target', icon: 'trophy-outline', route: '/reports/sales-target' },
        { label: isRTL ? 'مبيعات العملاء' : 'Customer Sales', icon: 'people-outline', route: '/sales/customer-sales' },
      ],
    },
    {
      title: isRTL ? '📦 المشتريات والموردين' : '📦 Purchases & Suppliers',
      icon: 'cube-outline',
      color: colors.section2,
      reports: [
        { label: isRTL ? 'إجمالي المشتريات' : 'Total Purchases', icon: 'bar-chart-outline', route: '/inventory/purchase-invoice', value: totalPurchases.toLocaleString() },
        { label: isRTL ? 'كشف حساب مورد' : 'Supplier Statement', icon: 'business-outline', route: '/ledger/account-statement' },
        { label: isRTL ? 'مشتريات حسب الصنف' : 'Purchases by Item', icon: 'cube-outline', route: '/inventory/supplier-movement' },
      ],
    },
    {
      title: isRTL ? '🏭 المخازن' : '🏭 Warehouses',
      icon: 'archive-outline',
      color: colors.section5,
      reports: [
        { label: isRTL ? 'رصيد المخزون' : 'Stock Balance', icon: 'stats-chart-outline', route: '/inventory/qty-report', value: items.length.toString() },
        { label: isRTL ? 'حركة صنف' : 'Item Movement', icon: 'move-outline', route: '/inventory/item-movement' },
        { label: isRTL ? 'جرد المخزن' : 'Stock Count', icon: 'calculator-outline', route: '/inventory/stock-count' },
        { label: isRTL ? 'تحويلات بين مخازن' : 'Warehouse Transfers', icon: 'swap-horizontal-outline', route: '/inventory/warehouse-transfer' },
        { label: isRTL ? `أصناف منخفضة (${lowStock})` : `Low Stock (${lowStock})`, icon: 'alert-circle-outline', route: '/inventory/slow-moving' },
        { label: isRTL ? `أصناف منتهية (${expired})` : `Expired (${expired})`, icon: 'time-outline', route: '/inventory/expired' },
        { label: isRTL ? 'تقرير التكلفة' : 'Cost Report', icon: 'cash-outline', route: '/inventory/cost-report' },
      ],
    },
  ];

  const filteredGroups = search.trim()
    ? reportGroups.map(g => ({ ...g, reports: g.reports.filter(r => r.label.toLowerCase().includes(search.toLowerCase())) })).filter(g => g.reports.length > 0)
    : reportGroups;

  const exportAlert = (format: string) => Alert.alert(format, isRTL ? 'جاري تصدير التقرير...' : 'Exporting...');

  const notifIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    subscription: 'card-outline', expiry: 'warning-outline', reminder: 'alarm-outline', system: 'information-circle-outline',
  };
  const notifColorMap: Record<string, string> = {
    subscription: colors.section3, expiry: colors.warning, reminder: colors.info, system: colors.section1,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'مركز التقارير' : 'Reports Center', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.tab, tab === 'reports' && { borderBottomColor: color, borderBottomWidth: 2 }]} onPress={() => setTab('reports')}>
          <Text style={[styles.tabText, { color: tab === 'reports' ? color : colors.mutedForeground }]}>{isRTL ? 'التقارير' : 'Reports'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'notifications' && { borderBottomColor: color, borderBottomWidth: 2 }]} onPress={() => setTab('notifications')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.tabText, { color: tab === 'notifications' ? color : colors.mutedForeground }]}>{isRTL ? 'الإشعارات' : 'Notifications'}</Text>
            {unread > 0 && <View style={[styles.badge, { backgroundColor: colors.destructive }]}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View>}
          </View>
        </TouchableOpacity>
      </View>

      {tab === 'reports' ? (
        <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}>
          {/* Key metrics strip */}
          <View style={[styles.metricsStrip, { backgroundColor: color + '10', borderColor: color }]}>
            {[
              { label: isRTL ? 'المبيعات' : 'Sales', value: totalSales.toLocaleString(), color: colors.success },
              { label: isRTL ? 'المشتريات' : 'Purchases', value: totalPurchases.toLocaleString(), color: colors.section2 },
              { label: isRTL ? 'الربح' : 'Profit', value: netProfit.toLocaleString(), color: netProfit >= 0 ? colors.success : colors.destructive },
            ].map((m, i) => (
              <View key={i} style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
                <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              </View>
            ))}
          </View>

          {/* Search */}
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={isRTL ? 'بحث في التقارير...' : 'Search reports...'}
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color={colors.mutedForeground} /></TouchableOpacity>}
          </View>

          {/* Export Row */}
          <View style={[styles.exportRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {[{ f: 'PDF', c: colors.destructive }, { f: 'Excel', c: colors.success }, { f: 'CSV', c: colors.section2 }].map(({ f, c }) => (
              <TouchableOpacity key={f} style={[styles.exportBtn, { backgroundColor: c + '14', borderColor: c }]} onPress={() => exportAlert(f)}>
                <Text style={{ color: c, fontSize: 12, fontWeight: '700' }}>{f}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#25d36614', borderColor: '#25d366' }]} onPress={() => Alert.alert('WhatsApp', isRTL ? 'مشاركة عبر واتساب' : 'Share via WhatsApp')}>
              <Ionicons name="logo-whatsapp" size={14} color="#25d366" />
              <Text style={{ color: '#25d366', fontSize: 11, fontWeight: '700' }}>{isRTL ? 'واتساب' : 'WA'}</Text>
            </TouchableOpacity>
          </View>

          {/* Report Groups */}
          {filteredGroups.map((group, gi) => (
            <View key={gi} style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.groupHeader, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomColor: colors.border }]}>
                <View style={[styles.groupIcon, { backgroundColor: group.color + '18' }]}>
                  <Ionicons name={group.icon} size={20} color={group.color} />
                </View>
                <Text style={[styles.groupTitle, { color: group.color, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }]}>{group.title}</Text>
              </View>
              {group.reports.map((rpt, ri) => (
                <TouchableOpacity key={ri} style={[styles.rptRow, { borderTopColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]} onPress={() => router.push(rpt.route as never)} activeOpacity={0.7}>
                  <View style={[styles.rptIcon, { backgroundColor: group.color + '10' }]}>
                    <Ionicons name={rpt.icon} size={16} color={group.color} />
                  </View>
                  <Text style={[styles.rptLabel, { color: colors.foreground, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }]}>{rpt.label}</Text>
                  {rpt.value && <Text style={[styles.rptValue, { color: group.color }]}>{rpt.value}</Text>}
                  <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={notifications.slice().reverse()}
          keyExtractor={n => n.id}
          contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}
          ListHeaderComponent={
            unread > 0 ? (
              <TouchableOpacity style={[styles.markAllBtn, { backgroundColor: color + '14', borderColor: color }]} onPress={() => markAllNotificationsRead()}>
                <Ionicons name="checkmark-done-outline" size={16} color={color} />
                <Text style={[styles.markAllText, { color: color }]}>{isRTL ? 'تعيين الكل مقروء' : 'Mark all as read'}</Text>
              </TouchableOpacity>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notifCard, { backgroundColor: item.read ? colors.card : color + '0C', borderColor: item.read ? colors.border : color }]}
              onPress={() => markNotificationRead(item.id)}
            >
              <View style={[styles.notifInner, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.notifIconWrap, { backgroundColor: (notifColorMap[item.type] || color) + '18' }]}>
                  <Ionicons name={notifIconMap[item.type] || 'notifications-outline'} size={20} color={notifColorMap[item.type] || color} />
                </View>
                <View style={{ flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
                  <Text style={[styles.notifTitle, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{item.title}</Text>
                  <Text style={[styles.notifMsg, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>{item.message}</Text>
                  <Text style={[styles.notifTime, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
                    {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en')}
                  </Text>
                </View>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: color }]} />}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>{isRTL ? 'لا توجد إشعارات' : 'No notifications'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function accounts_count(n: number) { return n.toString(); }

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '600' },
  badge: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  metricsStrip: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  metricItem: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: 11, marginBottom: 3 },
  metricValue: { fontSize: 14, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  exportRow: { gap: 8, marginBottom: 14 },
  exportBtn: { flex: 1, flexDirection: 'row', paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 4 },
  groupCard: { borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  groupHeader: { alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  groupIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { fontSize: 14, fontWeight: '700' },
  rptRow: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 0.5, gap: 6 },
  rptIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rptLabel: { flex: 1, fontSize: 13 },
  rptValue: { fontSize: 13, fontWeight: '700' },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 8, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  markAllText: { fontSize: 13, fontWeight: '600' },
  notifCard: { borderRadius: 14, borderWidth: 1, marginBottom: 8, padding: 14 },
  notifInner: { alignItems: 'center' },
  notifIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  notifMsg: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { alignItems: 'center', marginTop: 80 },
});
