import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface Voucher { id: string; number: string; type: 'receipt' | 'payment'; voucherType: 'cash' | 'bank'; date: string; sourceId: string; sourceName: string; sourceType: string; currency: string; exchangeRate: number; accountId: string; accountName: string; description: string; amount: number; localAmount: number; refNumber: string; createdAt: string; }

export default function VouchersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: vouchers, add, remove, update } = useLocalTable<Voucher>('vouchers');
  const { data: accounts } = useLocalTable('accounts');
  const { data: cashBoxes } = useLocalTable('cashBoxes');
  const { data: banks } = useLocalTable('banks');
  const { data: currencies } = useLocalTable('currencies');
  
  const [activeTab, setActiveTab] = useState<'receipt' | 'payment'>('receipt');
  const [voucherType, setVoucherType] = useState<'cash' | 'bank'>('cash');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], sourceId: '', sourceName: '', sourceType: 'cash',
    currency: 'YER', exchangeRate: '1', accountId: '', accountName: '',
    description: '', amount: '', localAmount: '', refNumber: ''
  });

  const defaultCurrency = currencies.find((c: any) => c.isDefault);
  const exchangeRate = parseFloat(formData.exchangeRate) || 1;
  const amount = parseFloat(formData.amount) || 0;
  const localAmount = formData.currency !== 'YER' ? amount * exchangeRate : amount;

  // تحديث تلقائي للمبلغ المحلي عند تغيير العملة أو سعر الصرف
  useEffect(() => {
    setFormData(prev => ({ ...prev, localAmount: localAmount.toString() }));
  }, [formData.currency, formData.exchangeRate, formData.amount]);

  // توليد رقم السند تلقائياً
  const generateVoucherNumber = () => {
    const prefix = activeTab === 'receipt' ? 'RV' : 'PV';
    const typePrefix = voucherType === 'cash' ? 'C' : 'B';
    const count = vouchers.filter((v: Voucher) => v.voucherType === voucherType && v.type === activeTab).length;
    return `${prefix}-${typePrefix}-${(count + 1).toString().padStart(6, '0')}`;
  };

  const handleSave = async () => {
    if (!formData.sourceName || !formData.accountName || !formData.amount) {
      Alert.alert('خطأ', 'الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }
    const data = {
      number: generateVoucherNumber(), type: activeTab, voucherType,
      date: formData.date, sourceId: formData.sourceId, sourceName: formData.sourceName,
      sourceType: formData.sourceType, currency: formData.currency,
      exchangeRate: parseFloat(formData.exchangeRate) || 1,
      accountId: formData.accountId, accountName: formData.accountName,
      description: formData.description, amount: parseFloat(formData.amount) || 0,
      localAmount: localAmount, refNumber: formData.refNumber
    };
    
    if (selectedVoucher) {
      await update(selectedVoucher.id, data);
    } else {
      await add(data);
    }
    setShowModal(false); resetForm();
  };

  const handleDelete = (v: Voucher) => {
    Alert.alert('تأكيد الحذف', `حذف السند "${v.number}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(v.id) },
    ]);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0], sourceId: '', sourceName: '', sourceType: voucherType,
      currency: 'YER', exchangeRate: '1', accountId: '', accountName: '',
      description: '', amount: '', localAmount: '', refNumber: ''
    });
    setSelectedVoucher(null);
  };

  const openEdit = (v: Voucher) => {
    setFormData({
      date: v.date, sourceId: v.sourceId || '', sourceName: v.sourceName, sourceType: v.sourceType,
      currency: v.currency, exchangeRate: v.exchangeRate?.toString() || '1',
      accountId: v.accountId || '', accountName: v.accountName,
      description: v.description || '', amount: v.amount?.toString() || '',
      localAmount: v.localAmount?.toString() || '', refNumber: v.refNumber || ''
    });
    setVoucherType(v.voucherType);
    setSelectedVoucher(v);
    setShowModal(true);
  };

  const sources = voucherType === 'cash' ? cashBoxes : banks;
  const totalReceipts = vouchers.filter((v: Voucher) => v.type === 'receipt').reduce((s: number, v: Voucher) => s + (v.localAmount || v.amount || 0), 0);
  const totalPayments = vouchers.filter((v: Voucher) => v.type === 'payment').reduce((s: number, v: Voucher) => s + (v.localAmount || v.amount || 0), 0);

  const filtered = vouchers.filter((v: Voucher) =>
    v.type === activeTab && (v.number?.includes(searchQuery) || v.description?.includes(searchQuery) || v.accountName?.includes(searchQuery))
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>سندات القبض والصرف</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setVoucherType('cash'); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* تبويبات القبض/الصرف */}
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

      {/* شريط البحث */}
      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}><Text style={styles.printBtnText}>🖨️</Text></TouchableOpacity>
      </View>

      {/* قائمة السندات */}
      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>🧾</Text><Text style={styles.emptyText}>لا توجد سندات</Text></View>
      ) : (
        <FlatList data={filtered} keyExtractor={(item: Voucher) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.vCard, { borderLeftColor: item.type === 'receipt' ? '#10B981' : '#EF4444' }]} onPress={() => { openEdit(item); }} onLongPress={() => handleDelete(item)}>
              <View style={styles.vHeader}>
                <View>
                  <Text style={styles.vNumber}>{item.number}</Text>
                  <Text style={styles.vDate}>{item.date}</Text>
                </View>
                <Text style={[styles.vAmount, { color: item.type === 'receipt' ? '#10B981' : '#EF4444' }]}>
                  {item.type === 'receipt' ? '+' : '-'}{(item.localAmount || item.amount || 0).toLocaleString()} ﷼
                </Text>
              </View>
              <Text style={styles.vAccount}>{item.accountName}</Text>
              <View style={styles.vFooter}>
                <Text style={styles.vSource}>{item.voucherType === 'cash' ? '💰' : '🏦'} {item.sourceName}</Text>
                <Text style={styles.vType}>{item.voucherType === 'cash' ? 'نقدي' : 'بنكي'}</Text>
              </View>
            </TouchableOpacity>
          )} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        />
      )}

      {/* Modal إضافة/تعديل سند */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedVoucher ? 'تعديل سند' : 'سند جديد'} ({activeTab === 'receipt' ? 'قبض' : 'صرف'})</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              
              {/* نوع السند - نقدي / بنكي */}
              <Text style={styles.fieldLabel}>نوع السند</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity style={[styles.typeBtn, voucherType === 'cash' && styles.typeBtnActive]} onPress={() => { setVoucherType('cash'); setFormData({ ...formData, sourceType: 'cash', sourceId: '', sourceName: '' }); }}>
                  <Text style={[styles.typeBtnText, voucherType === 'cash' && styles.typeBtnTextActive]}>💰 نقدي</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeBtn, voucherType === 'bank' && styles.typeBtnActive]} onPress={() => { setVoucherType('bank'); setFormData({ ...formData, sourceType: 'bank', sourceId: '', sourceName: '' }); }}>
                  <Text style={[styles.typeBtnText, voucherType === 'bank' && styles.typeBtnTextActive]}>🏦 بنكي / محفظة</Text>
                </TouchableOpacity>
              </View>

              {/* رقم السند (تلقائي) */}
              <Text style={styles.fieldLabel}>رقم السند</Text>
              <TextInput style={[styles.fieldInput, { backgroundColor: '#0A1128', color: '#D4AF37' }]} value={generateVoucherNumber()} editable={false} />

              {/* اختيار الصندوق أو البنك */}
              <Text style={styles.fieldLabel}>{voucherType === 'cash' ? 'اختيار الصندوق' : 'اختيار البنك / المحفظة'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sourceList}>
                {(sources || []).map((s: any) => (
                  <TouchableOpacity key={s.id} style={[styles.sourceBtn, formData.sourceId === s.id && styles.sourceBtnActive]}
                    onPress={() => setFormData({ ...formData, sourceId: s.id, sourceName: s.name || s.accountName })}>
                    <Text style={[styles.sourceBtnText, formData.sourceId === s.id && styles.sourceBtnTextActive]}>{s.name || s.accountName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* العملة وسعر الصرف */}
              <Text style={styles.fieldLabel}>العملة</Text>
              <View style={styles.currencyRow}>
                {(currencies || []).map((c: any) => (
                  <TouchableOpacity key={c.id} style={[styles.currencyBtn, formData.currency === c.code && styles.currencyBtnActive]}
                    onPress={() => setFormData({ ...formData, currency: c.code, exchangeRate: c.rate?.toString() || '1' })}>
                    <Text style={[styles.currencyBtnText, formData.currency === c.code && styles.currencyBtnTextActive]}>{c.code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {formData.currency !== 'YER' && (
                <>
                  <Text style={styles.fieldLabel}>سعر الصرف</Text>
                  <TextInput style={styles.fieldInput} value={formData.exchangeRate} onChangeText={(v) => setFormData({ ...formData, exchangeRate: v })} keyboardType="numeric" placeholder="1" placeholderTextColor="#666" />
                </>
              )}

              {/* التاريخ */}
              <Text style={styles.fieldLabel}>التاريخ</Text>
              <TextInput style={styles.fieldInput} value={formData.date} onChangeText={(v) => setFormData({ ...formData, date: v })} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />

              {/* الحساب المدين/الدائن */}
              <Text style={styles.fieldLabel}>الحساب {activeTab === 'receipt' ? 'الدائن' : 'المدين'} *</Text>
              <View style={styles.accountList}>
                {(accounts || []).slice(0, 20).map((a: any) => (
                  <TouchableOpacity key={a.id} style={[styles.accountChip, formData.accountId === a.id && styles.accountChipActive]}
                    onPress={() => setFormData({ ...formData, accountId: a.id, accountName: a.name })}>
                    <Text style={[styles.accountChipText, formData.accountId === a.id && styles.accountChipTextActive]}>{a.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* البيان */}
              <Text style={styles.fieldLabel}>البيان</Text>
              <TextInput style={[styles.fieldInput, { height: 60 }]} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} placeholder="بيان السند" placeholderTextColor="#666" multiline />

              {/* المبلغ */}
              <Text style={styles.fieldLabel}>المبلغ *</Text>
              <TextInput style={styles.fieldInput} value={formData.amount} onChangeText={(v) => setFormData({ ...formData, amount: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
              <Text style={styles.localAmount}>المبلغ بالريال: {localAmount.toLocaleString()} ﷼</Text>

              {/* رقم المرجع */}
              <Text style={styles.fieldLabel}>رقم المرجع</Text>
              <TextInput style={styles.fieldInput} value={formData.refNumber} onChangeText={(v) => setFormData({ ...formData, refNumber: v })} placeholder="رقم مرجعي (اختياري)" placeholderTextColor="#666" />

              {/* أزرار التحكم */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}>
                  <Text style={styles.saveModalBtnText}>💾 حفظ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelModalBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  vCard: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: '#2a3550' },
  vHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  vNumber: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  vDate: { color: '#94a3b8', fontSize: 11 },
  vAmount: { fontSize: 16, fontWeight: 'bold' },
  vAccount: { color: '#FFFFFF', fontSize: 14, marginBottom: 6 },
  vFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 8 },
  vSource: { color: '#94a3b8', fontSize: 12 },
  vType: { color: '#94a3b8', fontSize: 11 },
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
  sourceList: { maxHeight: 40, marginBottom: 8 },
  sourceBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550', marginRight: 6 },
  sourceBtnActive: { borderColor: '#10B981', backgroundColor: '#10B981' + '20' },
  sourceBtnText: { color: '#94a3b8', fontSize: 12 },
  sourceBtnTextActive: { color: '#10B981', fontWeight: 'bold' },
  currencyRow: { flexDirection: 'row', gap: 6 },
  currencyBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550' },
  currencyBtnActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF37' + '20' },
  currencyBtnText: { color: '#94a3b8', fontSize: 12 },
  currencyBtnTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  accountList: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  accountChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550' },
  accountChipActive: { borderColor: '#10B981', backgroundColor: '#10B981' + '20' },
  accountChipText: { color: '#94a3b8', fontSize: 11 },
  accountChipTextActive: { color: '#10B981', fontWeight: 'bold' },
  localAmount: { color: '#F59E0B', fontSize: 12, textAlign: 'right', marginTop: 4 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
});
