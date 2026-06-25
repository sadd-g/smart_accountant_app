import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface Voucher {
  id: string;
  number: string;
  type: 'receipt' | 'payment';
  date: string;
  accountId: string;
  accountName: string;
  sourceType: 'cash' | 'bank' | 'wallet';
  sourceName: string;
  currency: string;
  amount: number;
  description: string;
  refNumber: string;
  createdAt: string;
}

export default function VouchersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: vouchers, add, remove } = useLocalTable<Voucher>('vouchers');
  const { data: cashBoxes } = useLocalTable('cashBoxes');
  const { data: banks } = useLocalTable('banks');
  const { data: accounts } = useLocalTable('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'receipt' | 'payment'>('receipt');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    accountName: '',
    sourceType: 'cash' as 'cash' | 'bank' | 'wallet',
    sourceName: '',
    currency: 'YER',
    amount: '',
    description: '',
    refNumber: '',
  });

  const getAllSources = () => {
    const cashSources = cashBoxes.map((c: any) => ({ name: c.name, type: 'cash' as const }));
    const bankSources = banks.filter((b: any) => b.type === 'bank').map((b: any) => ({ name: b.name, type: 'bank' as const }));
    const walletSources = banks.filter((b: any) => b.type === 'wallet').map((b: any) => ({ name: b.name, type: 'wallet' as const }));
    return [...cashSources, ...bankSources, ...walletSources];
  };

  const sourcesForType = getAllSources().filter(s => s.type === formData.sourceType);

  const filtered = vouchers.filter((v: Voucher) => 
    v.type === activeTab && (v.number?.includes(searchQuery) || v.description?.includes(searchQuery) || v.accountName?.includes(searchQuery))
  );

  const totalReceipts = vouchers.filter((v: Voucher) => v.type === 'receipt').reduce((s: number, v: Voucher) => s + (v.amount || 0), 0);
  const totalPayments = vouchers.filter((v: Voucher) => v.type === 'payment').reduce((s: number, v: Voucher) => s + (v.amount || 0), 0);

  const handleSave = async () => {
    if (!formData.accountName || !formData.amount || !formData.sourceName) {
      Alert.alert('خطأ', 'الرجاء إدخال جميع الحقول المطلوبة');
      return;
    }

    const prefix = activeTab === 'receipt' ? 'RV' : 'PV';
    const number = `${prefix}-${(vouchers.length + 1).toString().padStart(6, '0')}`;

    await add({
      number,
      type: activeTab,
      date: formData.date,
      accountName: formData.accountName,
      sourceType: formData.sourceType,
      sourceName: formData.sourceName,
      currency: formData.currency,
      amount: parseFloat(formData.amount),
      description: formData.description,
      refNumber: formData.refNumber,
    });

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (voucher: Voucher) => {
    Alert.alert('تأكيد الحذف', `هل تريد حذف السند "${voucher.number}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(voucher.id) },
    ]);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      accountName: '',
      sourceType: 'cash',
      sourceName: '',
      currency: 'YER',
      amount: '',
      description: '',
      refNumber: '',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>سندات القبض والصرف</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* التبويبات */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'receipt' && styles.tabActive]} onPress={() => setActiveTab('receipt')}>
          <Text style={[styles.tabText, activeTab === 'receipt' && styles.tabTextActive]}>📥 سندات القبض</Text>
          <Text style={styles.tabAmount}>{totalReceipts.toLocaleString()} ﷼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'payment' && styles.tabActive]} onPress={() => setActiveTab('payment')}>
          <Text style={[styles.tabText, activeTab === 'payment' && styles.tabTextActive]}>📤 سندات الصرف</Text>
          <Text style={styles.tabAmount}>{totalPayments.toLocaleString()} ﷼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}><Text style={styles.printBtnText}>🖨️</Text></TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>{activeTab === 'receipt' ? '📥' : '📤'}</Text>
          <Text style={styles.emptyText}>لا توجد سندات {activeTab === 'receipt' ? 'قبض' : 'صرف'}</Text>
          <Text style={styles.emptySubtext}>اضغط + لإضافة سند جديد</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: Voucher) => item.id}
          renderItem={({ item }: { item: Voucher }) => (
            <TouchableOpacity style={[styles.voucherCard, { borderLeftColor: item.type === 'receipt' ? '#10B981' : '#EF4444' }]} onPress={() => { setSelectedVoucher(item); setShowDetailModal(true); }} onLongPress={() => handleDelete(item)}>
              <View style={styles.voucherHeader}>
                <View>
                  <Text style={styles.voucherNumber}>{item.number}</Text>
                  <Text style={styles.voucherDate}>{item.date}</Text>
                </View>
                <Text style={[styles.voucherAmount, { color: item.type === 'receipt' ? '#10B981' : '#EF4444' }]}>
                  {item.type === 'receipt' ? '+' : '-'}{item.amount?.toLocaleString()} ﷼
                </Text>
              </View>
              <Text style={styles.voucherAccount}>{item.accountName}</Text>
              <View style={styles.voucherFooter}>
                <Text style={styles.voucherSource}>{item.sourceType === 'cash' ? '💰' : item.sourceType === 'bank' ? '🏦' : '📱'} {item.sourceName}</Text>
                <Text style={styles.voucherDescription} numberOfLines={1}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        />
      )}

      {/* Modal إضافة سند */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeTab === 'receipt' ? 'سند قبض جديد' : 'سند صرف جديد'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>التاريخ</Text>
              <TextInput style={styles.fieldInput} value={formData.date} onChangeText={(v) => setFormData({ ...formData, date: v })} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />

              <Text style={styles.fieldLabel}>نوع المصدر</Text>
              <View style={styles.typeRow}>
                {[
                  { key: 'cash', label: '💰 صندوق' },
                  { key: 'bank', label: '🏦 بنك' },
                  { key: 'wallet', label: '📱 محفظة' },
                ].map(t => (
                  <TouchableOpacity key={t.key} style={[styles.typeBtn, formData.sourceType === t.key && styles.typeBtnActive]} onPress={() => { setFormData({ ...formData, sourceType: t.key as any, sourceName: '' }); }}>
                    <Text style={[styles.typeBtnText, formData.sourceType === t.key && styles.typeBtnTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>اختيار {formData.sourceType === 'cash' ? 'الصندوق' : formData.sourceType === 'bank' ? 'البنك' : 'المحفظة'}</Text>
              <ScrollView horizontal style={styles.sourceList}>
                {sourcesForType.map((source, i) => (
                  <TouchableOpacity key={i} style={[styles.sourceBtn, formData.sourceName === source.name && styles.sourceBtnActive]} onPress={() => setFormData({ ...formData, sourceName: source.name })}>
                    <Text style={[styles.sourceBtnText, formData.sourceName === source.name && styles.sourceBtnTextActive]}>{source.name}</Text>
                  </TouchableOpacity>
                ))}
                {sourcesForType.length === 0 && <Text style={styles.noSource}>لا توجد {formData.sourceType === 'cash' ? 'صناديق' : formData.sourceType === 'bank' ? 'بنوك' : 'محافظ'} متاحة</Text>}
              </ScrollView>

              <Text style={styles.fieldLabel}>الحساب ({activeTab === 'receipt' ? 'دائن' : 'مدين'}) *</Text>
              <TextInput style={styles.fieldInput} value={formData.accountName} onChangeText={(v) => setFormData({ ...formData, accountName: v })} placeholder="اسم الحساب" placeholderTextColor="#666" />

              <Text style={styles.fieldLabel}>البيان</Text>
              <TextInput style={[styles.fieldInput, { height: 60 }]} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} placeholder="بيان السند" placeholderTextColor="#666" multiline textAlignVertical="top" />

              <Text style={styles.fieldLabel}>المبلغ *</Text>
              <TextInput style={styles.fieldInput} value={formData.amount} onChangeText={(v) => setFormData({ ...formData, amount: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />

              <Text style={styles.fieldLabel}>رقم المرجع</Text>
              <TextInput style={styles.fieldInput} value={formData.refNumber} onChangeText={(v) => setFormData({ ...formData, refNumber: v })} placeholder="رقم مرجعي (اختياري)" placeholderTextColor="#666" />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}>
                  <Text style={styles.saveModalBtnText}>💾 حفظ السند</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelModalBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal تفاصيل السند */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تفاصيل السند</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedVoucher && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>رقم السند</Text>
                  <Text style={styles.detailValue}>{selectedVoucher.number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>النوع</Text>
                  <Text style={[styles.detailValue, { color: selectedVoucher.type === 'receipt' ? '#10B981' : '#EF4444' }]}>
                    {selectedVoucher.type === 'receipt' ? 'سند قبض' : 'سند صرف'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>التاريخ</Text>
                  <Text style={styles.detailValue}>{selectedVoucher.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>المصدر</Text>
                  <Text style={styles.detailValue}>{selectedVoucher.sourceName} ({selectedVoucher.sourceType})</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الحساب</Text>
                  <Text style={styles.detailValue}>{selectedVoucher.accountName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>المبلغ</Text>
                  <Text style={[styles.detailValue, { color: selectedVoucher.type === 'receipt' ? '#10B981' : '#EF4444', fontSize: 18 }]}>
                    {selectedVoucher.amount?.toLocaleString()} ﷼
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>البيان</Text>
                  <Text style={styles.detailValue}>{selectedVoucher.description}</Text>
                </View>
                {selectedVoucher.refNumber ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>رقم المرجع</Text>
                    <Text style={styles.detailValue}>{selectedVoucher.refNumber}</Text>
                  </View>
                ) : null}
              </ScrollView>
            )}
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
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D4AF37' + '20', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37' },
  addBtnText: { fontSize: 20, color: '#D4AF37', fontWeight: 'bold' },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 8 },
  tab: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  tabActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF37' + '10' },
  tabText: { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
  tabTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  tabAmount: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  controlBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 10, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14 },
  printBtn: { backgroundColor: '#16213E', borderRadius: 10, padding: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#2a3550' },
  printBtnText: { fontSize: 18 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emptySubtext: { color: '#94a3b8', fontSize: 12 },
  voucherCard: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: '#2a3550' },
  voucherHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  voucherNumber: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  voucherDate: { color: '#94a3b8', fontSize: 11 },
  voucherAmount: { fontSize: 18, fontWeight: 'bold' },
  voucherAccount: { color: '#FFFFFF', fontSize: 14, marginBottom: 6 },
  voucherFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 8 },
  voucherSource: { color: '#94a3b8', fontSize: 12 },
  voucherDescription: { color: '#6B7280', fontSize: 11, flex: 1, textAlign: 'right', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  typeRow: { flexDirection: 'row', gap: 6 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550', alignItems: 'center' },
  typeBtnActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF37' + '20' },
  typeBtnText: { color: '#94a3b8', fontSize: 12 },
  typeBtnTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  sourceList: { maxHeight: 40, marginBottom: 8 },
  sourceBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550', marginRight: 6 },
  sourceBtnActive: { borderColor: '#10B981', backgroundColor: '#10B981' + '20' },
  sourceBtnText: { color: '#94a3b8', fontSize: 12 },
  sourceBtnTextActive: { color: '#10B981', fontWeight: 'bold' },
  noSource: { color: '#EF4444', fontSize: 12, fontStyle: 'italic' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  detailLabel: { color: '#94a3b8', fontSize: 14 },
  detailValue: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', flex: 1, textAlign: 'right' },
});
