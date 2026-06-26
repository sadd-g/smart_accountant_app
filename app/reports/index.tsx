import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Modal, TextInput } from 'react-native';
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const reports = [
    { icon: '⚖️', label: 'ميزان المراجعة', desc: 'ملخص الأرصدة', route: '/ledger/trial-balance' },
    { icon: '📚', label: 'الأستاذ العام', desc: 'جميع الحسابات', route: '/ledger/account-statement' },
    { icon: '📄', label: 'كشف حساب', desc: 'حركة حساب محدد', route: '/ledger/account-statement' },
    { icon: '💱', label: 'تقارير العملات', desc: 'الأرصدة حسب العملة', route: '/ledger/currency-reports' },
    { icon: '📊', label: 'حركة الأصناف', desc: 'تقرير حركة المخزون', route: '/inventory/item-movement' },
    { icon: '📋', label: 'ملخص المبيعات', desc: 'إحصائيات المبيعات', route: '/sales/summary' },
  ];

  const handleExport = (format: string) => Alert.alert('تصدير', `جاري التصدير بصيغة ${format}`);
  const handlePrint = () => Alert.alert('طباعة', 'جاري الطباعة');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📊 التقارير والتنبيهات</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* فلتر التاريخ */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
            <Text style={styles.filterText}>📅 {dateFrom || 'من'} - {dateTo || 'إلى'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} onPress={() => { setDateFrom(''); setDateTo(''); }}>
            <Text style={styles.filterText}>🔄 مسح</Text>
          </TouchableOpacity>
        </View>

        {/* إحصائيات */}
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statVal}>{accounts.length}</Text><Text style={styles.statLbl}>حسابات</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>{entries.length}</Text><Text style={styles.statLbl}>قيود</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>{invoices.length}</Text><Text style={styles.statLbl}>فواتير</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>{items.length}</Text><Text style={styles.statLbl}>أصناف</Text></View>
        </View>

        {/* التقارير */}
        <Text style={styles.secTitle}>📋 التقارير المتاحة</Text>
        {reports.map((r, i) => (
          <TouchableOpacity key={i} style={styles.reportCard} onPress={() => router.push(r.route as any)}>
            <Text style={styles.reportIcon}>{r.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.reportLabel}>{r.label}</Text>
              <Text style={styles.reportDesc}>{r.desc}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* تصدير */}
        <Text style={styles.secTitle}>📤 تصدير ومشاركة</Text>
        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('PDF')}><Text style={styles.exportText}>📄 PDF</Text></TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('Excel')}><Text style={styles.exportText}>📋 Excel</Text></TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={handlePrint}><Text style={styles.exportText}>🖨️ طباعة</Text></TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal تحديد الفترة */}
      <Modal visible={showFilter} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تحديد الفترة</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>من تاريخ</Text>
              <TextInput style={styles.fieldInput} value={dateFrom} onChangeText={setDateFrom} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>إلى تاريخ</Text>
              <TextInput style={styles.fieldInput} value={dateTo} onChangeText={setDateTo} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilter(false)}>
                <Text style={styles.applyText}>✅ تطبيق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#16213E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  backText: { fontSize: 18, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  content: { padding: 14 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterBtn: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  filterText: { color: '#D4AF37', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  statVal: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginBottom: 3 },
  statLbl: { color: '#94a3b8', fontSize: 10 },
  secTitle: { fontSize: 15, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10, marginTop: 18 },
  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2a3550' },
  reportIcon: { fontSize: 26, marginRight: 12 },
  reportLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  reportDesc: { color: '#94a3b8', fontSize: 11 },
  arrow: { fontSize: 20, color: '#D4AF37', fontWeight: 'bold' },
  exportRow: { flexDirection: 'row', gap: 8 },
  exportBtn: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  exportText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  applyBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  applyText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
