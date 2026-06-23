import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useColors } from '../hooks/useColors';

interface DrawerItem {
  icon: keyof typeof Ionicons.glyphMap;
  labelAr: string;
  labelEn: string;
  route?: string;
  action?: () => void;
  color?: string;
  badge?: string;
}

interface DrawerSection {
  titleAr: string;
  titleEn: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  items: DrawerItem[];
}

interface Props { onClose: () => void; }

export default function AppDrawer({ onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL, logout, profile } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const sections: DrawerSection[] = [
    {
      titleAr: 'الأستاذ العام',
      titleEn: 'General Ledger',
      icon: 'book-outline',
      color: colors.section1,
      items: [
        { icon: 'list-outline', labelAr: 'الحسابات', labelEn: 'Accounts', route: '/ledger/accounts' },
        { icon: 'layers-outline', labelAr: 'مجموعات الحسابات', labelEn: 'Account Groups', route: '/ledger/account-groups' },
        { icon: 'cash-outline', labelAr: 'العملات', labelEn: 'Currencies', route: '/ledger/currencies' },
        { icon: 'wallet-outline', labelAr: 'الصناديق', labelEn: 'Cash Boxes', route: '/ledger/cash-boxes' },
        { icon: 'card-outline', labelAr: 'البنوك', labelEn: 'Banks', route: '/ledger/banks' },
        { icon: 'phone-portrait-outline', labelAr: 'المحافظ الإلكترونية', labelEn: 'E-Wallets', route: '/ledger/ewallets' },
        { icon: 'receipt-outline', labelAr: 'سند قبض نقدي', labelEn: 'Cash Receipt', route: '/ledger/cash-receipt' },
        { icon: 'card-outline', labelAr: 'سند صرف نقدي', labelEn: 'Cash Payment', route: '/ledger/cash-payment' },
        { icon: 'receipt-outline', labelAr: 'سند قبض بنكي', labelEn: 'Bank Receipt', route: '/ledger/bank-receipt' },
        { icon: 'card-outline', labelAr: 'سند صرف بنكي', labelEn: 'Bank Payment', route: '/ledger/bank-payment' },
        { icon: 'journal-outline', labelAr: 'قيد يومية', labelEn: 'Journal Entry', route: '/ledger/journal-entry' },
        { icon: 'repeat-outline', labelAr: 'قيود متكررة', labelEn: 'Recurring Journal', route: '/ledger/recurring-journal' },
        { icon: 'document-text-outline', labelAr: 'كشف حساب', labelEn: 'Account Statement', route: '/ledger/account-statement' },
        { icon: 'scale-outline', labelAr: 'ميزان المراجعة', labelEn: 'Trial Balance', route: '/ledger/trial-balance' },
        { icon: 'book-outline', labelAr: 'الأستاذ العام', labelEn: 'General Ledger', route: '/ledger/general-ledger' },
      ],
    },
    {
      titleAr: 'العملاء والمبيعات',
      titleEn: 'Sales & Customers',
      icon: 'people-outline',
      color: colors.section3,
      items: [
        { icon: 'people-outline', labelAr: 'العملاء', labelEn: 'Customers', route: '/sales/customers' },
        { icon: 'person-outline', labelAr: 'المندوبون', labelEn: 'Sales Reps', route: '/sales/reps' },
        { icon: 'receipt-outline', labelAr: 'فواتير المبيعات', labelEn: 'Sales Invoices', route: '/sales/sales-invoice' },
        { icon: 'return-down-back-outline', labelAr: 'مردودات المبيعات', labelEn: 'Sales Returns', route: '/sales/sales-return' },
        { icon: 'clipboard-outline', labelAr: 'عروض الأسعار', labelEn: 'Quotations', route: '/sales/quotation' },
        { icon: 'layers-outline', labelAr: 'مجموعات العملاء', labelEn: 'Customer Groups', route: '/sales/customer-groups' },
        { icon: 'bar-chart-outline', labelAr: 'ملخص المبيعات', labelEn: 'Sales Summary', route: '/sales/summary' },
        { icon: 'person-outline', labelAr: 'أداء المندوبين', labelEn: 'Rep Performance', route: '/sales/rep-performance' },
        { icon: 'trophy-outline', labelAr: 'هدف المبيعات', labelEn: 'Sales Target', route: '/reports/sales-target' },
      ],
    },
    {
      titleAr: 'الموردين والمشتريات',
      titleEn: 'Suppliers & Purchases',
      icon: 'cube-outline',
      color: colors.section2,
      items: [
        { icon: 'business-outline', labelAr: 'الموردون', labelEn: 'Suppliers', route: '/inventory/suppliers' },
        { icon: 'receipt-outline', labelAr: 'فواتير الشراء', labelEn: 'Purchase Invoices', route: '/inventory/purchase-invoice' },
        { icon: 'return-down-back-outline', labelAr: 'مردودات الشراء', labelEn: 'Purchase Returns', route: '/inventory/purchase-return' },
        { icon: 'cube-outline', labelAr: 'الأصناف', labelEn: 'Items', route: '/inventory/items' },
        { icon: 'pricetag-outline', labelAr: 'الوحدات', labelEn: 'Units', route: '/inventory/units' },
        { icon: 'grid-outline', labelAr: 'الفئات', labelEn: 'Categories', route: '/inventory/categories' },
        { icon: 'ribbon-outline', labelAr: 'العلامات التجارية', labelEn: 'Brands', route: '/inventory/brands' },
      ],
    },
    {
      titleAr: 'المخازن',
      titleEn: 'Warehouses',
      icon: 'archive-outline',
      color: colors.section5,
      items: [
        { icon: 'home-outline', labelAr: 'المخازن', labelEn: 'Warehouses', route: '/inventory/warehouses' },
        { icon: 'arrow-down-outline', labelAr: 'توريد للمخزن', labelEn: 'Stock Receipt', route: '/inventory/inventory-receipt' },
        { icon: 'arrow-up-outline', labelAr: 'صرف من المخزن', labelEn: 'Stock Issue', route: '/inventory/inventory-issue' },
        { icon: 'swap-horizontal-outline', labelAr: 'تحويل بين مخازن', labelEn: 'Warehouse Transfer', route: '/inventory/warehouse-transfer' },
        { icon: 'calculator-outline', labelAr: 'الجرد', labelEn: 'Stock Count', route: '/inventory/stock-count' },
        { icon: 'settings-outline', labelAr: 'تسوية المخزون', labelEn: 'Stock Adjustment', route: '/inventory/stock-adjustment' },
        { icon: 'stats-chart-outline', labelAr: 'تقرير الكميات', labelEn: 'Qty Report', route: '/inventory/qty-report' },
        { icon: 'move-outline', labelAr: 'حركة صنف', labelEn: 'Item Movement', route: '/inventory/item-movement' },
        { icon: 'alert-circle-outline', labelAr: 'أصناف بطيئة الحركة', labelEn: 'Slow Moving', route: '/inventory/slow-moving' },
        { icon: 'time-outline', labelAr: 'أصناف منتهية الصلاحية', labelEn: 'Expired Items', route: '/inventory/expired' },
      ],
    },
    {
      titleAr: 'التقارير',
      titleEn: 'Reports',
      icon: 'bar-chart-outline',
      color: colors.section4,
      items: [
        { icon: 'bar-chart-outline', labelAr: 'مركز التقارير', labelEn: 'Reports Center', route: '/reports/' },
        { icon: 'trophy-outline', labelAr: 'هدف المبيعات', labelEn: 'Sales Target', route: '/reports/sales-target' },
        { icon: 'scale-outline', labelAr: 'ميزان المراجعة', labelEn: 'Trial Balance', route: '/ledger/trial-balance' },
        { icon: 'document-text-outline', labelAr: 'كشف حساب', labelEn: 'Account Statement', route: '/ledger/account-statement' },
      ],
    },
  ];

  const utilItems: DrawerItem[] = [
    { icon: 'notifications-outline', labelAr: 'التنبيهات', labelEn: 'Notifications', route: '/notifications' },
    { icon: 'mic-outline', labelAr: 'الأوامر الصوتية', labelEn: 'Voice Commands', route: '/voice' },
    { icon: 'settings-outline', labelAr: 'الإعدادات', labelEn: 'Settings', route: '/settings' },
    { icon: 'cloud-upload-outline', labelAr: 'النسخ الاحتياطي', labelEn: 'Backup', route: '/backup' },
    { icon: 'shield-outline', labelAr: 'لوحة المالك', labelEn: 'Owner Panel', route: '/owner' },
    { icon: 'information-circle-outline', labelAr: 'حول التطبيق', labelEn: 'About', route: '/about' },
  ];

  const handleItem = (item: DrawerItem) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    if (item.route) setTimeout(() => router.push(item.route as never), 250);
    else if (item.action) setTimeout(item.action, 250);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerName, { textAlign: isRTL ? 'right' : 'left' }]}>{profile.name || 'المالك'}</Text>
          <Text style={[styles.headerSub, { textAlign: isRTL ? 'right' : 'left' }]}>{t.appName}</Text>
        </View>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {/* Module sections (expandable) */}
        {sections.map((sec) => (
          <View key={sec.titleAr}>
            <TouchableOpacity
              style={[styles.sectionHeader, { borderBottomColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={() => setExpanded(expanded === sec.titleAr ? null : sec.titleAr)}
            >
              <View style={[styles.secIcon, { backgroundColor: sec.color + '18' }]}>
                <Ionicons name={sec.icon} size={18} color={sec.color} />
              </View>
              <Text style={[styles.sectionTitle, { color: sec.color, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }]}>
                {isRTL ? sec.titleAr : sec.titleEn}
              </Text>
              <Ionicons name={expanded === sec.titleAr ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>

            {expanded === sec.titleAr && sec.items.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[styles.subItem, { borderBottomColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: colors.card }]}
                onPress={() => handleItem(item)}
              >
                <Ionicons name={item.icon} size={16} color={sec.color} style={{ marginLeft: isRTL ? 0 : 32, marginRight: isRTL ? 32 : 0 }} />
                <Text style={[styles.subLabel, { color: colors.foreground, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }]}>
                  {isRTL ? item.labelAr : item.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Utility divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Utility items */}
        {utilItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.utilItem, { borderBottomColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={() => handleItem(item)}
          >
            <Ionicons name={item.icon} size={20} color={item.color || colors.primary} />
            <Text style={[styles.utilLabel, { color: item.color || colors.foreground, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
              {isRTL ? item.labelAr : item.labelEn}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity
          style={[styles.utilItem, { borderBottomColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          onPress={() => {
            onClose();
            setTimeout(() => Alert.alert(
              isRTL ? 'تسجيل الخروج' : 'Logout',
              isRTL ? 'هل تريد تسجيل الخروج؟' : 'Confirm logout?',
              [{ text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' }, { text: isRTL ? 'خروج' : 'Logout', style: 'destructive', onPress: logout }]
            ), 300);
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={[styles.utilLabel, { color: colors.destructive, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
            {isRTL ? 'تسجيل الخروج' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8, borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>م/ صدام بشير • 736002798</Text>
        <Text style={[styles.footerVersion, { color: colors.mutedForeground }]}>v2.0.0-SQLite</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24, gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  list: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  secIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '700' },
  subItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 0.3 },
  subLabel: { flex: 1, fontSize: 13 },
  divider: { height: 6, marginVertical: 6 },
  utilItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5 },
  utilLabel: { fontSize: 14, fontWeight: '500' },
  footer: { padding: 16, alignItems: 'center', borderTopWidth: 1 },
  footerText: { fontSize: 12 },
  footerVersion: { fontSize: 11, marginTop: 2 },
});
