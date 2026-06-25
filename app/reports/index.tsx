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
  const { data: vouchers } = useLocalTable('vouchers');
  const { data: currencies } = useLocalTable('currencies');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');

  const reportTypes = [
    { id: 'trialBalance', icon: '⚖️', title: 'ميزان المراجعة', desc: 'ملخص أرصدة جميع الحسابات' },
    { id: 'generalLedger', icon: '📚', title: 'الأستاذ العام', desc: 'حركة جميع الحسابات' },
    { id: 'accountStatement', icon: '📄', title: 'كشف حساب', desc: 'تفاصيل حركة حساب محدد' },
    { id: 'incomeStatement', icon: '📈', title: 'قائمة الدخل', desc: 'الإيرادات والمصروفات' },
    { id: 'balanceSheet', icon: '🏛️', title: 'الميزانية العمومية', desc: 'الأصول والخصوم وحقوق الملكية' },
    { id: 'cashFlow', icon: '💰', title: 'التدفقات النقدية', desc: 'حركة النقدية' },
    { id: 'voucherReport', icon: '🧾', title: 'تقرير السندات', desc: 'سندات القبض والصرف' },
    { id: 'currencyReport', icon: '💱', title: 'تقرير العملات', desc: 'الأرصدة حسب العملة' },
  ];

  const handleGenerateReport = (reportId: string) => {
    if (!dateFrom || !dateTo) {
      setSelectedReport(reportId);
      setShowFilterModal(true);
      return;
    }
    generateReport(reportId);
  };

  const generateReport = (reportId: string) => {
    const totalAssets = accounts.filter((a: any) => a.type === 'أصل').reduce((s: number, a: any) => s + (a.balance || 0), 0);
    const totalLiabilities = accounts.filter((a: any) => a.type === 'خصم').reduce((s: number, a: any) => s + (a.balance || 0), 0);
    const totalEquity = accounts.filter((a: any) => a.type === 'ملكية').reduce((s: number, a: any) => s + (a.balance || 0), 0);
    const totalIncome = accounts.filter((a: any) => a.type === 'إيراد').reduce((s: number, a: any) => s + (a.balance || 0), 0);
    const totalExpenses = accounts.filter((a: any) => a.type === 'مصروف').reduce((s: number, a: any) => s + (a.balance || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    Alert.alert(
      '📊 التقرير',
      `الفترة: ${dateFrom || 'الكل'} - ${dateTo || 'الكل'}\n\n` +
      `الأصول: ${totalAssets.toLocaleString()} ﷼\n` +
      `الخصوم: ${totalLiabilities.toLocaleString()} ﷼\n` +
      `حقوق الملكية: ${totalEquity.toLocaleString()} ﷼\n` +
      `الإيرادات: ${totalIncome.toLocaleString()} ﷼\n` +
      `المصروفات: ${totalExpenses.toLocaleString()} ﷼\n` +
      `صافي الربح: ${netProfit.toLocaleString()} ﷼\n\n` +
      `عدد الحسابات: ${accounts.length}\n` +
      `عدد القيود: ${entries.length}\n` +
      `عدد السندات: ${vouchers.length}`,
      [
        { text: '🖨️ طباعة', onPress: () => Alert.alert('طباعة', 'جاري تجهيز التقرير للطباعة') },
        { text: '📤 مشاركة', onPress: () => Alert.alert('مشاركة', 'جاري مشاركة التقرير') },
        { text: '📋 تصدير', onPress: () => Alert.alert('تصدير', 'جاري تصدير التقرير إلى ملف') },
        { text: 'إغلاق', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>التقارير المالية</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* فلتر التاريخ */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
          <Text style={styles.filterBtnText}>📅 الفترة</Text>
        </TouchableOpacity>
        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>{dateFrom || 'من'} - {dateTo || 'إلى'}</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => { setDateFrom(''); setDateTo(''); }}>
          <Text style={styles.filterBtnText}>🔄 مسح</Text>
        </TouchableOpacity>
      </View>

      {/* بطاقات إحصائية */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📚</Text>
          <Text style={styles.statValue}>{accounts.length}</Text>
          <Text style={styles.statLabel}>حساب</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📝</Text>
          <Text style={styles.statValue}>{entries.length}</Text>
          <Text style={styles.statLabel}>قيد</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🧾</Text>
          <Text style={styles.statValue}>{vouchers.length}</Text>
          <Text style={styles.statLabel}>سند</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>اختر نوع التقرير</Text>
        
        <View style={styles.reportsGrid}>
          {reportTypes.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() => handleGenerateReport(report.id)}
            >
              <Text style={styles.reportIcon}>{report.icon}</Text>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDesc}>{report.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* أزرار التحكم */}
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => Alert.alert('طباعة', 'جاري طباعة جميع التقارير')}>
            <Text style={styles.controlBtnText}>🖨️ طباعة الكل</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => Alert.alert('تصدير', 'جاري تصدير البيانات إلى Excel')}>
            <Text style={styles.controlBtnText}>📋 تصدير Excel</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => Alert.alert('PDF', 'جاري إنشاء ملف PDF')}>
            <Text style={styles.controlBtnText}>📄 تصدير PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => Alert.alert('مشاركة', 'جاري مشاركة التقرير')}>
            <Text style={styles.controlBtnText}>📤 مشاركة</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal تحديد الفترة */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تحديد الفترة</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>من تاريخ</Text>
              <TextInput style={styles.fieldInput} value={dateFrom} onChangeText={setDateFrom} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />
              
              <Text style={styles.fieldLabel}>إلى تاريخ</Text>
              <TextInput style={styles.fieldInput} value={dateTo} onChangeText={setDateTo} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />

              <View style={styles.quickDates}>
                {[
                  { label: 'اليوم', from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
                  { label: 'الشهر', from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
                  { label: 'السنة', from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
                ].map((d, i) => (
                  <TouchableOpacity key={i} style={styles.quickDateBtn} onPress={() => { setDateFrom(d.from); setDateTo(d.to); }}>
                    <Text style={styles.quickDateText}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.applyBtn} onPress={() => { setShowFilterModal(false); if (selectedReport) generateReport(selectedReport); }}>
                <Text style={styles.applyBtnText}>✅ تطبيق وعرض التقرير</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { fontSize: 24, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  filterBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  filterBtn: { backgroundColor: '#16213E', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#2a3550' },
  filterBtnText: { color: '#D4AF37', fontSize: 13 },
  dateDisplay: { flex: 1, alignItems: 'center' },
  dateText: { color: '#94a3b8', fontSize: 13 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#94a3b8', fontSize: 11 },
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  reportsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  reportCard: { width: '48%', backgroundColor: '#16213E', borderRadius: 14, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  reportIcon: { fontSize: 32, marginBottom: 8 },
  reportTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  reportDesc: { color: '#94a3b8', fontSize: 10, textAlign: 'center' },
  controlRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  controlBtn: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  controlBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  quickDates: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickDateBtn: { flex: 1, backgroundColor: '#0A1128', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  quickDateText: { color: '#94a3b8', fontSize: 12 },
  applyBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  applyBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
