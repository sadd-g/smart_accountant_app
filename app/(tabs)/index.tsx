import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput, RefreshControl } from 'react-native';
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
  
  const [showMenu, setShowMenu] = useState(false);
  const [showSection, setShowSection] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const totalSales = (invoices || []).reduce((s: number, i: any) => s + (i.total || 0), 0);
  const totalCash = (cashBoxes || []).reduce((s: number, c: any) => s + (c.balance || 0), 0);

  // جميع الأقسام مع شاشاتها
  const sections: Record<string, { icon: string; title: string; desc: string; color: string; items: { label: string; route: string }[] }> = {
    ledger: {
      icon: '📚', title: 'دفتر الأستاذ العام', desc: 'الحسابات، القيود، السندات، البنوك', color: '#D4AF37',
      items: [
        { label: 'دليل الحسابات', route: '/ledger/accounts' },
        { label: 'مجموعات الحسابات', route: '/ledger/account-groups' },
        { label: 'القيود اليومية', route: '/ledger/journal-entry' },
        { label: 'سندات القبض والصرف', route: '/ledger/vouchers' },
        { label: 'الصناديق', route: '/ledger/cash-boxes' },
        { label: 'البنوك والمحافظ', route: '/ledger/banks' },
        { label: 'العملات', route: '/ledger/currencies' },
        { label: 'ميزان المراجعة', route: '/ledger/trial-balance' },
        { label: 'كشف حساب', route: '/ledger/account-statement' },
      ]
    },
    inventory: {
      icon: '📦', title: 'المخزون والمشتريات', desc: 'الموردين، الأصناف، المستودعات', color: '#3B82F6',
      items: [
        { label: 'الموردين', route: '/inventory/suppliers' },
        { label: 'المستودعات', route: '/inventory/warehouses' },
        { label: 'الأصناف', route: '/inventory/items' },
        { label: 'فاتورة مشتريات', route: '/inventory/purchase-invoice' },
        { label: 'مرتجع مشتريات', route: '/inventory/purchase-return' },
        { label: 'صرف مخزون', route: '/inventory/inventory-issue' },
        { label: 'توريد مخزون', route: '/inventory/inventory-receipt' },
        { label: 'تحويل مخزني', route: '/inventory/warehouse-transfer' },
        { label: 'جرد مخزون', route: '/inventory/stock-count' },
        { label: 'تسوية مخزون', route: '/inventory/stock-adjustment' },
        { label: 'وحدات القياس', route: '/inventory/units' },
        { label: 'الفئات', route: '/inventory/categories' },
        { label: 'الماركات', route: '/inventory/brands' },
        { label: 'تقرير الكميات', route: '/inventory/qty-report' },
        { label: 'تقرير التكاليف', route: '/inventory/cost-report' },
        { label: 'حركة الأصناف', route: '/inventory/item-movement' },
        { label: 'حركة الموردين', route: '/inventory/supplier-movement' },
        { label: 'أصناف بطيئة', route: '/inventory/slow-moving' },
        { label: 'أصناف منتهية', route: '/inventory/expired' },
      ]
    },
    sales: {
      icon: '💰', title: 'المبيعات والعملاء', desc: 'الفواتير، العملاء، المندوبين', color: '#10B981',
      items: [
        { label: 'العملاء', route: '/sales/customers' },
        { label: 'مجموعات العملاء', route: '/sales/customer-groups' },
        { label: 'فاتورة مبيعات', route: '/sales/sales-invoice' },
        { label: 'مرتجع مبيعات', route: '/sales/sales-return' },
        { label: 'عرض سعر', route: '/sales/quotation' },
        { label: 'مندوبي المبيعات', route: '/sales/reps' },
        { label: 'ملخص المبيعات', route: '/sales/summary' },
        { label: 'مبيعات العملاء', route: '/sales/customer-sales' },
        { label: 'مبيعات الأصناف', route: '/sales/item-sales' },
        { label: 'أداء المندوبين', route: '/sales/rep-performance' },
      ]
    },
    reports: {
      icon: '📊', title: 'التقارير والتنبيهات', desc: 'جميع التقارير المالية', color: '#7C3AED',
      items: [
        { label: 'جميع التقارير', route: '/reports/index' },
        { label: 'ميزان المراجعة', route: '/ledger/trial-balance' },
        { label: 'الأستاذ العام', route: '/ledger/general-ledger' },
        { label: 'كشف حساب', route: '/ledger/account-statement' },
        { label: 'تقارير العملات', route: '/ledger/currency-reports' },
      ]
    },
  };

  const quickActions = [
    { icon: '📄', label: 'فاتورة مبيعات', route: '/sales/sales-invoice', color: '#10B981' },
    { icon: '📋', label: 'فاتورة مشتريات', route: '/inventory/purchase-invoice', color: '#3B82F6' },
    { icon: '📝', label: 'قيد يومية', route: '/ledger/journal-entry', color: '#7C3AED' },
    { icon: '🧾', label: 'سند قبض/صرف', route: '/ledger/vouchers', color: '#D4AF37' },
  ];

  const systemItems = [
    { label: '⚙️ الإعدادات', route: '/settings' },
    { label: '👑 لوحة تحكم المالك', route: '/owner' },
    { label: '🎤 الأوامر الصوتية', route: '/voice' },
    { label: '💾 النسخ الاحتياطي', route: '/backup' },
    { label: 'ℹ️ حول التطبيق', route: '/about' },
    { label: '🚪 تسجيل الخروج', route: '/login' },
  ];

  const handleSectionPress = (key: string) => {
    const section = sections[key];
    setSectionTitle(section.title);
    setShowSection(key);
  };

  const currentSection = showSection ? sections[showSection] : null;

  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* الهيدر */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>💎 دفتر المحاسب الذكي</Text>
          <Text style={styles.subtitle}>النظام المحاسبي المتكامل</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setShowMenu(true)}>
            <Text style={styles.menuBtnText}>📋</Text></TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/settings')}>
            <Text style={styles.menuBtnText}>⚙️</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}>
        
        {/* إحصائيات */}
        <View style={styles.statsRow}>
          {[
            { icon: '💰', label: 'المبيعات', value: totalSales.toLocaleString() + ' ﷼', color: '#10B981' },
            { icon: '📚', label: 'الحسابات', value: accounts.length.toString(), color: '#D4AF37' },
            { icon: '👥', label: 'العملاء', value: customers.length.toString(), color: '#3B82F6' },
            { icon: '💵', label: 'النقدية', value: totalCash.toLocaleString() + ' ﷼', color: '#7C3AED' },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* الأقسام الرئيسية */}
        <Text style={styles.sectionTitle}>📊 الأقسام الرئيسية</Text>
        {Object.entries(sections).map(([key, section]) => (
          <TouchableOpacity key={key} style={[styles.mainCard, { borderLeftColor: section.color }]} onPress={() => handleSectionPress(key)}>
            <Text style={styles.cardIcon}>{section.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>{section.title}</Text>
              <Text style={styles.cardDesc}>{section.desc}</Text>
              <Text style={styles.cardCount}>{section.items.length} شاشة</Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* إجراءات سريعة */}
        <Text style={styles.sectionTitle}>⚡ إجراءات سريعة</Text>
        <View style={styles.quickRow}>
          {quickActions.map((action, i) => (
            <TouchableOpacity key={i} style={styles.quickCard} onPress={() => router.push(action.route as any)}>
              <View style={[styles.quickIcon, { backgroundColor: action.color + '20' }]}>
                <Text style={styles.quickEmoji}>{action.icon}</Text></View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* روابط النظام */}
        <Text style={styles.sectionTitle}>⚙️ النظام</Text>
        <View style={styles.systemGrid}>
          {systemItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.systemItem} onPress={() => router.push(item.route as any)}>
              <Text style={styles.systemItemText}>{item.label}</Text>
              <Text style={styles.systemArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal عرض شاشات القسم */}
      <Modal visible={!!showSection} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentSection?.icon} {sectionTitle}</Text>
              <TouchableOpacity onPress={() => setShowSection(null)}>
                <Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {currentSection?.items.map((item, i) => (
                <TouchableOpacity key={i} style={styles.sectionItem} onPress={() => { setShowSection(null); router.push(item.route as any); }}>
                  <Text style={styles.sectionItemText}>{item.label}</Text>
                  <Text style={styles.sectionArrow}>→</Text>
                </TouchableOpacity>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* القائمة المنسدلة الكاملة */}
      <Modal visible={showMenu} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📋 القائمة الكاملة</Text>
              <TouchableOpacity onPress={() => { setShowMenu(false); setSearchQuery(''); }}>
                <Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput style={styles.menuSearch} value={searchQuery} onChangeText={setSearchQuery} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" />
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.entries(sections).map(([key, section]) => (
                  <View key={key} style={styles.menuSection}>
                    <Text style={styles.menuSectionTitle}>{section.icon} {section.title}</Text>
                    {section.items.filter(i => i.label.includes(searchQuery)).map((item, j) => (
                      <TouchableOpacity key={j} style={styles.menuItem} onPress={() => { setShowMenu(false); setSearchQuery(''); router.push(item.route as any); }}>
                        <Text style={styles.menuItemText}>{item.label}</Text><Text style={styles.menuArrow}>→</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                <Text style={styles.menuSectionTitle}>⚙️ النظام</Text>
                {systemItems.filter(i => i.label.includes(searchQuery)).map((item, j) => (
                  <TouchableOpacity key={j} style={styles.menuItem} onPress={() => { setShowMenu(false); setSearchQuery(''); router.push(item.route as any); }}>
                    <Text style={styles.menuItemText}>{item.label}</Text><Text style={styles.menuArrow}>→</Text>
                  </TouchableOpacity>
                ))}
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  welcome: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: '#D4AF37', marginTop: 2 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  menuBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#16213E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  menuBtnText: { fontSize: 20 },
  content: { flex: 1, paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 16, marginTop: 8 },
  statCard: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { color: '#94a3b8', fontSize: 9 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10, marginTop: 20 },
  mainCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213E', borderRadius: 14, padding: 16, marginBottom: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: '#2a3550' },
  cardIcon: { fontSize: 28, marginRight: 12 },
  cardLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 3 },
  cardDesc: { color: '#94a3b8', fontSize: 11 },
  cardCount: { color: '#6B7280', fontSize: 10, marginTop: 4 },
  cardArrow: { color: '#D4AF37', fontSize: 18 },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickCard: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  quickIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  quickEmoji: { fontSize: 18 },
  quickLabel: { color: '#FFFFFF', fontSize: 9, textAlign: 'center' },
  systemGrid: { gap: 4 },
  systemItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#16213E', borderRadius: 10, marginBottom: 4, borderWidth: 1, borderColor: '#2a3550' },
  systemItemText: { color: '#FFFFFF', fontSize: 13 },
  systemArrow: { color: '#D4AF37', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  sectionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#0A1128', borderRadius: 10, marginBottom: 6 },
  sectionItemText: { color: '#FFFFFF', fontSize: 14 },
  sectionArrow: { color: '#D4AF37', fontSize: 16 },
  menuSearch: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14, marginBottom: 12 },
  menuSection: { marginBottom: 16 },
  menuSectionTitle: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#0A1128', borderRadius: 10, marginBottom: 4 },
  menuItemText: { color: '#FFFFFF', fontSize: 13 },
  menuArrow: { color: '#D4AF37', fontSize: 14 },
});
