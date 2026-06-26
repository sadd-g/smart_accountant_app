import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

export default function ReportsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: accounts } = useLocalTable('accounts');
  const { data: entries } = useLocalTable('journalEntries');
  const { data: invoices } = useLocalTable('salesInvoices');
  const { data: items } = useLocalTable('items');
  const { data: customers } = useLocalTable('customers');
  const { data: suppliers } = useLocalTable('suppliers');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [searchItem, setSearchItem] = useState('');

  // تنبيهات
  const lowStockItems = items.filter((i: any) => (i.quantity || 0) <= (i.minQuantity || 10));
  const activeCustomers = customers.filter((c: any) => (c.balance || 0) > 10000);
  const inactiveCustomers = customers.filter((c: any) => (c.balance || 0) === 0);

  const handleExport = (format: string) => {
    Alert.alert('تصدير', `جاري تصدير التقرير بصيغة ${format}`);
  };

  const handlePrint = () => {
    Alert.alert('طباعة', 'جاري تجهيز التقرير للطباعة');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>التقارير والتنبيهات</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* فلتر التاريخ */}
        <View style={styles.filterBar}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
            <Text style={styles.filterBtnText}>📅 الفترة</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{dateFrom || 'من'} - {dateTo || 'إلى'}</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={() => { setDateFrom(''); setDateTo(''); }}>
            <Text style={styles.filterBtnText}>🔄 مسح</Text>
          </TouchableOpacity>
        </View>

        {/* بطاقات إحصائية */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statIcon}>📚</Text><Text style={styles.statValue}>{accounts.length}</Text><Text style={styles.statLabel}>حساب</Text></View>
          <View style={styles.statCard}><Text style={styles.statIcon}>📝</Text><Text style={styles.statValue}>{entries.length}</Text><Text style={styles.statLabel}>قيد</Text></View>
          <View style={styles.statCard}><Text style={styles.statIcon}>📄</Text><Text style={styles.statValue}>{invoices.length}</Text><Text style={styles.statLabel}>فاتورة</Text></View>
          <View style={styles.statCard}><Text style={styles.statIcon}>📦</Text><Text style={styles.statValue}>{items.length}</Text><Text style={styles.statLabel}>صنف</Text></View>
        </View>

        {/* التقارير المالية */}
        <Text style={styles.sectionTitle}>📊 التقارير المالية</Text>
        <View style={styles.grid}>
          {[
            { icon: '⚖️', label: 'ميزان المراجعة', route: '/ledger/trial-balance' },
            { icon: '📚', label: 'الأستاذ العام', route: '/ledger/general-ledger' },
            { icon: '📄', label: 'كشف حساب', route: '/ledger/account-statement' },
            { icon: '📈', label: 'قائمة الدخل', route: '/reports/index' },
            { icon: '🏛️', label: 'الميزانية', route: '/reports/index' },
            { icon: '💰', label: 'التدفقات النقدية', route: '/reports/index' },
          ].map((r, i) => (
            <TouchableOpacity key={i} style={styles.reportCard} onPress={() => router.push(r.route as any)}>
              <Text style={styles.reportIcon}>{r.icon}</Text>
              <Text style={styles.reportLabel}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* تقارير العملاء والمبيعات */}
        <Text style={styles.sectionTitle}>👥 تقارير العملاء والمبيعات</Text>
        <View style={styles.grid}>
          {[
            { icon: '📊', label: 'مبيعات العملاء', route: '/sales/customer-sales' },
            { icon: '📦', label: 'مبيعات الأصناف', route: '/sales/item-sales' },
            { icon: '📋', label: 'ملخص المبيعات', route: '/sales/summary' },
            { icon: '⭐', label: 'أداء المندوبين', route: '/sales/rep-performance' },
          ].map((r, i) => (
            <TouchableOpacity key={i} style={styles.reportCard} onPress={() => router.push(r.route as any)}>
              <Text style={styles.reportIcon}>{r.icon}</Text>
              <Text style={styles.reportLabel}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* تقارير المخزون والمشتريات */}
        <Text style={styles.sectionTitle}>📦 تقارير المخزون والمشتريات</Text>
        <View style={styles.grid}>
          {[
            { icon: '📉', label: 'كميات المخزون', route: '/inventory/qty-report' },
            { icon: '💲', label: 'تكاليف المخزون', route: '/inventory/cost-report' },
            { icon: '🔄', label: 'حركة الأصناف', route: '/inventory/item-movement' },
            { icon: '🏪', label: 'حركة الموردين', route: '/inventory/supplier-movement' },
            { icon: '🐌', label: 'أصناف بطيئة', route: '/inventory/slow-moving' },
            { icon: '⚠️', label: 'أصناف منتهية', route: '/inventory/expired' },
          ].map((r, i) => (
            <TouchableOpacity key={i} style={styles.reportCard} onPress={() => router.push(r.route as any)}>
              <Text style={styles.reportIcon}>{r.icon}</Text>
              <Text style={styles.reportLabel}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* بحث عن حركة صنف */}
        <Text style={styles.sectionTitle}>🔍 بحث عن حركة صنف</Text>
        <View style={styles.searchCard}>
          <TextInput style={styles.searchField} value={searchItem} onChangeText={setSearchItem} placeholder="اسم الصنف أو العميل أو المورد أو المخزن" placeholderTextColor="#94a3b8" />
          <View style={styles.searchActions}>
            <TouchableOpacity style={styles.searchBtn} onPress={() => Alert.alert('نتائج', `نتائج البحث عن "${searchItem}"`)}>
              <Text style={styles.searchBtnText}>🔍 بحث</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchBtn} onPress={handlePrint}>
              <Text style={styles.searchBtnText}>🖨️ طباعة</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* التنبيهات */}
        <Text style={styles.sectionTitle}>🔔 التنبيهات</Text>
        
        {/* أصناف منخفضة */}
        {lowStockItems.length > 0 && (
          <View style={[styles.alertCard, { borderLeftColor: '#F59E0B' }]}>
            <Text style={styles.alertTitle}>⚠️ أصناف منخفضة المخزون ({lowStockItems.length})</Text>
            {lowStockItems.slice(0, 3).map((item: any, i: number) => (
              <Text key={i} style={styles.alertItem}>📦 {item.name}: {item.quantity || 0} متبقي</Text>
            ))}
          </View>
        )}

        {/* عملاء نشطين */}
        {activeCustomers.length > 0 && (
          <View style={[styles.alertCard, { borderLeftColor: '#10B981' }]}>
            <Text style={styles.alertTitle}>✅ عملاء نشطين ({activeCustomers.length})</Text>
            {activeCustomers.slice(0, 3).map((c: any, i: number) => (
              <Text key={i} style={styles.alertItem}>👤 {c.name}: {c.balance?.toLocaleString()} ﷼</Text>
            ))}
          </View>
        )}

        {/* عملاء راكدين */}
        {inactiveCustomers.length > 0 && (
          <View style={[styles.alertCard, { borderLeftColor: '#EF4444' }]}>
            <Text style={styles.alertTitle}>❌ عملاء راكدين ({inactiveCustomers.length})</Text>
            {inactiveCustomers.slice(0, 3).map((c: any, i: number) => (
              <Text key={i} style={styles.alertItem}>👤 {c.name}</Text>
            ))}
          </View>
        )}

        {/* أهداف المبيعات */}
        <View style={[styles.alertCard, { borderLeftColor: '#3B82F6' }]}>
          <Text style={styles.alertTitle}>🎯 أهداف المبيعات</Text>
          <Text style={styles.alertItem}>📊 نسبة الإنجاز: 65%</Text>
          <Text style={styles.alertItem}>⏳ متبقي: 15 يوم</Text>
          <Text style={styles.alertItem}>💪 "أنت على المسار الصحيح، واصل التقدم!"</Text>
        </View>

        {/* الاشتراك */}
        <View style={[styles.alertCard, { borderLeftColor: '#7C3AED' }]}>
          <Text style={styles.alertTitle}>💎 حالة الاشتراك</Text>
          <Text style={styles.alertItem}>📅 متبقي: 83 يوم</Text>
          <Text style={styles.alertItem}>🔄 ينتهي في: 2026-09-16</Text>
        </View>

        {/* أزرار التصدير */}
        <Text style={styles.sectionTitle}>📤 تصدير ومشاركة</Text>
        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('PDF')}><Text style={styles.exportBtnText}>📄 PDF</Text></TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('Excel')}><Text style={styles.exportBtnText}>📋 Excel</Text></TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('CSV')}><Text style={styles.exportBtnText}>📝 CSV</Text></TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={() => Alert.alert('مشاركة', 'جاري مشاركة التقرير')}><Text style={styles.exportBtnText}>📤 مشاركة</Text></TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal الفلتر */}
      <Modal visible={showFilter} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>تحديد الفترة</Text><TouchableOpacity onPress={() => setShowFilter(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>من تاريخ</Text>
              <TextInput style={styles.fieldInput} value={dateFrom} onChangeText={setDateFrom} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>إلى تاريخ</Text>
              <TextInput style={styles.fieldInput} value={dateTo} onChangeText={setDateTo} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilter(false)}><Text style={styles.applyBtnText}>✅ تطبيق</Text></TouchableOpacity>
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
  backBtn: { fontSize: 24, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 16 },
  filterBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  filterBtn: { backgroundColor: '#16213E', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#2a3550' },
  filterBtnText: { color: '#D4AF37', fontSize: 13 },
  dateText: { flex: 1, color: '#94a3b8', textAlign: 'center', fontSize: 13 },
  statsRow: { flexDirection: 'row', marginBottom: 16, gap: 6 },
  statCard: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  statLabel: { color: '#94a3b8', fontSize: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10, marginTop: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reportCard: { width: '31%', backgroundColor: '#16213E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  reportIcon: { fontSize: 24, marginBottom: 6 },
  reportLabel: { color: '#FFFFFF', fontSize: 10, textAlign: 'center' },
  searchCard: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#2a3550' },
  searchField: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14, marginBottom: 8 },
  searchActions: { flexDirection: 'row', gap: 8 },
  searchBtn: { flex: 1, backgroundColor: '#D4AF37' + '20', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37' + '40' },
  searchBtnText: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold' },
  alertCard: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: '#2a3550' },
  alertTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  alertItem: { color: '#94a3b8', fontSize: 12, marginBottom: 4 },
  exportRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  exportBtn: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  exportBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  applyBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  applyBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
