import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';
import { PickerModal } from '../../src/components/ui/PickerModal';

export default function VouchersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: vouchers, add, remove, update } = useLocalTable('vouchers');
  const { data: accounts } = useLocalTable('accounts');
  const { data: cashBoxes } = useLocalTable('cashBoxes');
  const { data: banks } = useLocalTable('banks');
  const { data: currencies } = useLocalTable('currencies');
  
  const [activeTab, setActiveTab] = useState<'receipt' | 'payment'>('receipt');
  const [voucherType, setVoucherType] = useState<'cash' | 'bank'>('cash');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sourceId: '', sourceName: '', sourceType: 'cash',
    currency: 'YER', exchangeRate: '1',
    accountId: '', accountName: '',
    description: '', amount: '', refNumber: ''
  });

  const exchangeRate = parseFloat(formData.exchangeRate) || 1;
  const amount = parseFloat(formData.amount) || 0;
  const localAmount = formData.currency !== 'YER' ? amount * exchangeRate : amount;
  const sources = voucherType === 'cash' ? cashBoxes : banks;

  const generateNumber = () => {
    const prefix = activeTab === 'receipt' ? 'RV' : 'PV';
    const typePrefix = voucherType === 'cash' ? 'C' : 'B';
    const count = vouchers.filter((v: any) => v.voucherType === voucherType && v.type === activeTab).length;
    return `${prefix}-${typePrefix}-${(count + 1).toString().padStart(6, '0')}`;
  };

  const handleSave = async () => {
    if (!formData.sourceName || !formData.accountName || !formData.amount) {
      Alert.alert('خطأ', 'الرجاء اختيار الصندوق/البنك والحساب وإدخال المبلغ');
      return;
    }
    const data = { number: generateNumber(), type: activeTab, voucherType, ...formData, exchangeRate, amount, localAmount };
    if (editMode && selectedVoucher) { await update(selectedVoucher.id, data); }
    else { await add(data); }
    setShowModal(false); setEditMode(false); setSelectedVoucher(null);
  };

  const openEdit = (v: any) => {
    setVoucherType(v.voucherType); setActiveTab(v.type);
    setFormData({ date: v.date, sourceId: v.sourceId, sourceName: v.sourceName, sourceType: v.sourceType, currency: v.currency, exchangeRate: v.exchangeRate?.toString() || '1', accountId: v.accountId, accountName: v.accountName, description: v.description || '', amount: v.amount?.toString() || '', refNumber: v.refNumber || '' });
    setSelectedVoucher(v); setEditMode(true); setShowModal(true);
  };

  const filteredVouchers = vouchers.filter((v: any) => v.type === activeTab && (v.number?.includes(searchQuery) || v.accountName?.includes(searchQuery)));
  const totalReceipts = vouchers.filter((v: any) => v.type === 'receipt').reduce((s: number, v: any) => s + (v.localAmount || v.amount || 0), 0);
  const totalPayments = vouchers.filter((v: any) => v.type === 'payment').reduce((s: number, v: any) => s + (v.localAmount || v.amount || 0), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>سندات القبض والصرف</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditMode(false); setSelectedVoucher(null); setFormData({ date: new Date().toISOString().split('T')[0], sourceId: '', sourceName: '', sourceType: voucherType, currency: 'YER', exchangeRate: '1', accountId: '', accountName: '', description: '', amount: '', refNumber: '' }); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'receipt' && styles.tabActive]} onPress={() => setActiveTab('receipt')}>
          <Text style={[styles.tabText, activeTab === 'receipt' && styles.tabTextActive]}>📥 قبض</Text>
          <Text style={styles.tabAmount}>{totalReceipts.toLocaleString()} ﷼</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'payment' && styles.tabActive]} onPress={() => setActiveTab('payment')}>
          <Text style={[styles.tabText, activeTab === 'payment' && styles.tabTextActive]}>📤 صرف</Text>
          <Text style={styles.tabAmount}>{totalPayments.toLocaleString()} ﷼</Text></TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn} onPress={() => Alert.alert('🖨️', 'جاري الطباعة')}><Text>🖨️</Text></TouchableOpacity>
      </View>

      {filteredVouchers.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>🧾</Text><Text style={styles.emptyText}>لا توجد سندات</Text></View>
      ) : (
        <FlatList data={filteredVouchers} keyExtractor={(i: any) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.vCard, { borderLeftColor: item.type === 'receipt' ? '#10B981' : '#EF4444', borderLeftWidth: 4 }]} onPress={() => openEdit(item)} onLongPress={() => Alert.alert('حذف', `حذف "${item.number}"؟`, [{ text: 'حذف', style: 'destructive', onPress: () => remove(item.id) }, { text: 'إلغاء' }])}>
              <View style={styles.vHeader}><View><Text style={styles.vNumber}>{item.number}</Text><Text style={styles.vDate}>{item.date}</Text></View>
              <Text style={[styles.vAmount, { color: item.type === 'receipt' ? '#10B981' : '#EF4444' }]}>{item.type === 'receipt' ? '+' : '-'}{(item.localAmount || item.amount || 0).toLocaleString()} ﷼</Text></View>
              <Text style={styles.vAccount}>{item.accountName}</Text>
              <View style={styles.vFooter}><Text style={styles.vSource}>{item.voucherType === 'cash' ? '💰' : '🏦'} {item.sourceName}</Text>{item.refNumber ? <Text style={styles.vRef}>#{item.refNumber}</Text> : null}</View>
            </TouchableOpacity>
          )} contentContainerStyle={{ padding: 16 }} />
      )}

      {/* Modal الإضافة */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{editMode ? 'تعديل' : 'إضافة'} سند {activeTab === 'receipt' ? 'قبض' : 'صرف'}</Text><TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>نوع السند</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity style={[styles.typeBtn, voucherType === 'cash' && styles.typeBtnActive]} onPress={() => { setVoucherType('cash'); setFormData({ ...formData, sourceType: 'cash', sourceId: '', sourceName: '' }); }}>
                  <Text style={[styles.typeBtnText, voucherType === 'cash' && styles.typeBtnTextActive]}>💰 نقدي</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.typeBtn, voucherType === 'bank' && styles.typeBtnActive]} onPress={() => { setVoucherType('bank'); setFormData({ ...formData, sourceType: 'bank', sourceId: '', sourceName: '' }); }}>
                  <Text style={[styles.typeBtnText, voucherType === 'bank' && styles.typeBtnTextActive]}>🏦 بنكي</Text></TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>رقم السند</Text>
              <TextInput style={[styles.fieldInput, { color: '#D4AF37', fontWeight: 'bold' }]} value={generateNumber()} editable={false} />

              <Text style={styles.fieldLabel}>{voucherType === 'cash' ? 'الصندوق' : 'البنك/المحفظة'} *</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowSourcePicker(true)}>
                <Text style={formData.sourceName ? styles.pickerText : styles.pickerPlaceholder}>{formData.sourceName || `اختيار ${voucherType === 'cash' ? 'الصندوق' : 'البنك'}`}</Text>
                <Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>

              <Text style={styles.fieldLabel}>الحساب {activeTab === 'receipt' ? 'الدائن' : 'المدين'} *</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowAccountPicker(true)}>
                <Text style={formData.accountName ? styles.pickerText : styles.pickerPlaceholder}>{formData.accountName || 'اختيار الحساب'}</Text>
                <Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>

              <Text style={styles.fieldLabel}>العملة</Text>
              <View style={styles.chipRow}>{(currencies || []).map((c: any) => (
                <TouchableOpacity key={c.id} style={[styles.chip, formData.currency === c.code && styles.chipActive]} onPress={() => setFormData({ ...formData, currency: c.code, exchangeRate: c.rate?.toString() || '1' })}>
                  <Text style={[styles.chipText, formData.currency === c.code && styles.chipTextActive]}>{c.code}</Text></TouchableOpacity>
              ))}</View>
              
              {formData.currency !== 'YER' && (
                <>
                  <Text style={styles.fieldLabel}>سعر الصرف</Text>
                  <TextInput style={styles.fieldInput} value={formData.exchangeRate} onChangeText={v => setFormData({ ...formData, exchangeRate: v })} keyboardType="numeric" placeholderTextColor="#666" />
                  <Text style={styles.localAmount}>المبلغ بالريال: {localAmount.toLocaleString()} ﷼</Text>
                </>
              )}

              <Text style={styles.fieldLabel}>التاريخ</Text><TextInput style={styles.fieldInput} value={formData.date} onChangeText={v => setFormData({ ...formData, date: v })} placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>البيان</Text><TextInput style={[styles.fieldInput, { height: 60 }]} value={formData.description} onChangeText={v => setFormData({ ...formData, description: v })} placeholder="بيان السند" placeholderTextColor="#666" multiline />
              <Text style={styles.fieldLabel}>المبلغ *</Text><TextInput style={[styles.fieldInput, { fontSize: 18 }]} value={formData.amount} onChangeText={v => setFormData({ ...formData, amount: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
              <Text style={styles.localAmount}>المبلغ بالريال: {localAmount.toLocaleString()} ﷼</Text>
              <Text style={styles.fieldLabel}>رقم المرجع</Text><TextInput style={styles.fieldInput} value={formData.refNumber} onChangeText={v => setFormData({ ...formData, refNumber: v })} placeholder="اختياري" placeholderTextColor="#666" />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}><Text style={styles.saveModalBtnText}>💾 {editMode ? 'تحديث' : 'حفظ'}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelModalBtnText}>إلغاء</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* منتقي الحسابات */}
      <PickerModal visible={showAccountPicker} title="اختيار الحساب" data={accounts || []} displayField="name" subField="code" onSelect={(item) => { setFormData({ ...formData, accountId: item.id, accountName: item.name }); }} onClose={() => setShowAccountPicker(false)} />

      {/* منتقي الصندوق/البنك */}
      <PickerModal visible={showSourcePicker} title={`اختيار ${voucherType === 'cash' ? 'الصندوق' : 'البنك'}`} data={sources || []} displayField="name" subField="currency" onSelect={(item) => { setFormData({ ...formData, sourceId: item.id, sourceName: item.name || item.accountName }); }} onClose={() => setShowSourcePicker(false)} />
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  vCard: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  vHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  vNumber: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  vDate: { color: '#94a3b8', fontSize: 11 },
  vAmount: { fontSize: 16, fontWeight: 'bold' },
  vAccount: { color: '#FFFFFF', fontSize: 14, marginBottom: 6 },
  vFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 8 },
  vSource: { color: '#94a3b8', fontSize: 12 },
  vRef: { color: '#6B7280', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '95%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550', alignItems: 'center' },
  typeBtnActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF37' + '20' },
  typeBtnText: { color: '#94a3b8', fontSize: 13 },
  typeBtnTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A1128', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#2a3550' },
  pickerText: { color: '#FFFFFF', fontSize: 14, flex: 1 },
  pickerPlaceholder: { color: '#666', fontSize: 14, flex: 1 },
  pickerArrow: { color: '#D4AF37', fontSize: 12, marginLeft: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550' },
  chipActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF37' + '20' },
  chipText: { color: '#94a3b8', fontSize: 11 },
  chipTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  localAmount: { color: '#F59E0B', fontSize: 12, textAlign: 'right', marginTop: 4 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
});
