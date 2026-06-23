import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppDrawer from '../components/AppDrawer';
import StatCard from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import { useColors } from '../hooks/useColors';

interface Section {
  code: string;
  titleAr: string;
  titleEn: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  descAr: string;
  descEn: string;
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL, subscription, profile } = useApp();
  const { customers, items, salesInvoices, purchaseInvoices, notifications, vouchers, journalEntries } = useDatabase();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalSales = salesInvoices.reduce((s, inv) => s + inv.total, 0);
  const totalPurchases = purchaseInvoices.reduce((s, inv) => s + inv.total, 0);
  const netProfit = totalSales - totalPurchases;
  const unreadCount = notifications.filter(n => !n.read).length;

  const sections: Section[] = [
    {
      code: 'GL',
      titleAr: 'الأستاذ العام',
      titleEn: 'General Ledger',
      icon: 'book-outline',
      color: colors.section1,
      route: '/ledger/',
      descAr: 'الحسابات • السندات • القيود',
      descEn: 'Accounts • Vouchers • Journals',
    },
    {
      code: 'SA',
      titleAr: 'العملاء والمبيعات',
      titleEn: 'Sales & Customers',
      icon: 'people-outline',
      color: colors.section3,
      route: '/sales/',
      descAr: 'فواتير • عملاء • مندوبون',
      descEn: 'Invoices • Customers • Reps',
    },
    {
      code: 'PU',
      titleAr: 'الموردين والمشتريات',
      titleEn: 'Suppliers & Purchases',
      icon: 'cube-outline',
      color: colors.section2,
      route: '/inventory/',
      descAr: 'موردون • فواتير شراء • أصناف',
      descEn: 'Suppliers • Purchase • Items',
    },
    {
      code: 'WH',
      titleAr: 'المخازن',
      titleEn: 'Warehouses',
      icon: 'archive-outline',
      color: colors.section5,
      route: '/inventory/',
      descAr: 'مخازن • حركة • جرد',
      descEn: 'Warehouses • Movement • Stock',
    },
    {
      code: 'NF',
      titleAr: 'التنبيهات',
      titleEn: 'Notifications',
      icon: 'notifications-outline',
      color: colors.warning,
      route: '/notifications',
      descAr: 'إشعارات • تحذيرات • تنبيهات',
      descEn: 'Alerts • Warnings • Reminders',
    },
    {
      code: 'RP',
      titleAr: 'التقارير',
      titleEn: 'Reports',
      icon: 'bar-chart-outline',
      color: colors.section4,
      route: '/reports/',
      descAr: 'تقارير • إحصائيات • تصدير',
      descEn: 'Reports • Analytics • Export',
    },
  ];

  const openSection = (route: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as never);
  };

  return (
    <>
      <Modal visible={drawerOpen} animationType="none" transparent onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setDrawerOpen(false)} activeOpacity={1} />
          <View style={[styles.drawerContainer, { backgroundColor: colors.background }]}>
            <AppDrawer onClose={() => setDrawerOpen(false)} />
          </View>
        </View>
      </Modal>

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, {
          backgroundColor: colors.primary,
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 12,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }]}>
          <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.headerBtn}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>{isRTL ? 'دفتر المحاسب الذكي' : 'Smart Accountant'}</Text>
            <Text style={styles.headerSub}>{profile.name || (isRTL ? 'مرحباً' : 'Welcome')}</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/notifications' as never)}>
            <View>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Subscription Warning */}
          {subscription.daysLeft <= 14 && (
            <View style={[styles.subWarning, { backgroundColor: colors.warning + '18', borderColor: colors.warning }]}>
              <Ionicons name="warning" size={18} color={colors.warning} />
              <Text style={[styles.subWarningText, { color: colors.warning }]}>
                {isRTL
                  ? `تنبيه: سينتهي اشتراكك خلال ${subscription.daysLeft} يوم`
                  : `Warning: Subscription expires in ${subscription.daysLeft} days`}
              </Text>
            </View>
          )}

          {/* Stats Row 1 */}
          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <StatCard label={isRTL ? 'المبيعات' : 'Sales'} value={totalSales.toLocaleString()} icon="trending-up" color={colors.section3} />
            <StatCard label={isRTL ? 'المشتريات' : 'Purchases'} value={totalPurchases.toLocaleString()} icon="trending-down" color={colors.section2} />
          </View>
          {/* Stats Row 2 */}
          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <StatCard label={isRTL ? 'صافي الربح' : 'Net Profit'} value={netProfit.toLocaleString()} icon="cash-outline" color={netProfit >= 0 ? colors.success : colors.destructive} />
            <StatCard label={isRTL ? 'العملاء' : 'Customers'} value={customers.length.toString()} icon="people" color={colors.section1} />
          </View>
          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <StatCard label={isRTL ? 'الأصناف' : 'Items'} value={items.length.toString()} icon="cube" color={colors.section4} />
            <StatCard label={isRTL ? 'السندات' : 'Vouchers'} value={vouchers.length.toString()} icon="document-text" color={colors.section5} />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'الأقسام الرئيسية' : 'Main Sections'}
          </Text>

          {/* Sections Grid (2 per row) */}
          <View style={styles.sectionsGrid}>
            {sections.map((section, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => openSection(section.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.sectionTopRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: section.color + '18' }]}>
                    <Ionicons name={section.icon} size={26} color={section.color} />
                  </View>
                  <View style={[styles.sectionCodeBadge, { backgroundColor: section.color }]}>
                    <Text style={styles.sectionCode}>{section.code}</Text>
                  </View>
                </View>
                <Text style={[styles.sectionTitle, { color: section.color, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL ? section.titleAr : section.titleEn}
                </Text>
                <Text style={[styles.sectionDesc, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL ? section.descAr : section.descEn}
                </Text>
                <View style={[styles.sectionArrow, { alignSelf: isRTL ? 'flex-start' : 'flex-end' }]}>
                  <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={16} color={section.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions Row */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', marginTop: 8 }]}>
            {isRTL ? 'وصول سريع' : 'Quick Access'}
          </Text>
          <View style={[styles.quickRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {[
              { icon: 'receipt-outline' as const, labelAr: 'سند قبض', labelEn: 'Receipt', route: '/ledger/cash-receipt', color: colors.success },
              { icon: 'card-outline' as const, labelAr: 'سند صرف', labelEn: 'Payment', route: '/ledger/cash-payment', color: colors.destructive },
              { icon: 'document-outline' as const, labelAr: 'فاتورة بيع', labelEn: 'Sales', route: '/sales/sales-invoice', color: colors.section3 },
              { icon: 'book-outline' as const, labelAr: 'قيد', labelEn: 'Journal', route: '/ledger/journal-entry', color: colors.section1 },
            ].map((q, i) => (
              <TouchableOpacity key={i} style={[styles.quickBtn, { backgroundColor: q.color + '12', borderColor: q.color + '40' }]} onPress={() => router.push(q.route as never)}>
                <Ionicons name={q.icon} size={22} color={q.color} />
                <Text style={[styles.quickLabel, { color: q.color }]}>{isRTL ? q.labelAr : q.labelEn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16, justifyContent: 'space-between', alignItems: 'center' },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  badge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#ef4444', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 12 },
  subWarning: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  subWarningText: { flex: 1, fontSize: 13, fontWeight: '600' },
  statsRow: { gap: 10, marginTop: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '700', marginTop: 18, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sectionCard: { width: '47.5%', borderRadius: 14, borderWidth: 1, padding: 14, minHeight: 140 },
  sectionTopRow: { justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  sectionIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionCodeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  sectionCode: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  sectionDesc: { fontSize: 11, lineHeight: 16, marginBottom: 8 },
  sectionArrow: { marginTop: 4 },
  quickRow: { gap: 8, marginBottom: 8 },
  quickBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 6 },
  quickLabel: { fontSize: 11, fontWeight: '700' },
  drawerOverlay: { flex: 1, flexDirection: 'row' },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  drawerContainer: { width: 285 },
});
