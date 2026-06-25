import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface InvoiceLine { id: string; itemName: string; qty: string; price: string; total: string; }
interface PurchaseInvoice {
  id: string; number: string; date: string; supplierName: string; subtotal: number;
  discount: number; total: number; paid: number; remaining: number;
  paymentType: string; notes: string; items: InvoiceLine[]; createdAt: string;
}

export default function PurchaseInvoiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: invoices, add, remove } = useLocalTable<PurchaseInvoice>('purchaseInvoices');
  const { data: suppliers } = useLocalTable('suppliers');
  const { data: items } = useLocalTable('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [paid, setPaid] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<InvoiceLine[]>([{ id: '1', itemName: '', qty: '0', price: '0', total: '0' }]);

  const addLine = () => setLines([...lines, { id: Date.now().toString(), itemName: '', qty: '0', price: '0', total: '0' }]);
  const removeLine = (id: string) => { if (lines.length > 1) setLines(lines.filter(l => l.id !== id)); };
  const updateLine = (id: string, field: string, value: string) => {
    setLines(lines.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (field === 'qty' || field === 'price') {
        updated.total = ((parseFloat(updated.qty) || 0) * (parseFloat(updated.price) || 0)).toString();
      }
      return updated;
    }));
  };

  const subtotal = lines.reduce((s, l) => s + (parseFloat(l.total) || 0), 0);
  const totalAfterDiscount = subtotal - (parseFloat(discount) || 0);
  const remaining = totalAfterDiscount - (parseFloat(paid) || 0);

  const generateNumber = () => `PI-${(invoices.length + 1).toString().padStart(6, '0')}`;

  const handleSave = async () => {
    if (!supplierName || lines.length === 0) { Alert.alert('خطأ', 'الرجاء إدخال المورد والأصناف'); return; }
    await add({
      number: generateNumber(), date, supplierName, subtotal,
      discount: parseFloat(discount) || 0, total: totalAfterDiscount,
      paid: parseFloat(paid) || 0, remaining, paymentType, notes,
      items: lines.filter(l => l.itemName && parseFloat(l.total) > 0),
    });
    setShowModal(false); resetForm();
  };

  const handleDelete = (invoice: PurchaseInvoice) => {
    Alert.alert('تأكيد الحذف', `هل تريد حذف "${invoice.number}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(invoice.id) },
    ]);
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]); setSupplierName(''); setPaymentType('cash');
    setPaid('0'); setDiscount('0'); setNotes('');
    setLines([{ id: '1', itemName: '', qty: '0', price: '0', total: '0' }]);
  };

  const filtered = invoices.filter((i: PurchaseInvoice) => i.number?.includes(searchQuery) || i.supplierName?.includes(searchQuery));
  const totalPurchases = invoices.reduce((s: number, i: PurchaseInvoice) => s + (i.total || 0), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>فواتير المشتريات ({invoices.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}><Text style={styles.printBtnText}>🖨️</Text></TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>إجمالي المشتريات</Text>
        <Text style={styles.summaryValue}>{totalPurchases.toLocaleString()} ﷼</Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>📋</Text><Text style={styles.emptyText}>لا توجد فواتير مشتريات</Text><Text style={styles.emptySubtext}>اضغط + لإضافة فاتورة</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: PurchaseInvoice) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.invoiceCard} onPress={() => { setSelectedInvoice(item); setShowDetailModal(true); }} onLongPress={() => handleDelete(item)}>
              <View style={styles.invoiceHeader}>
                <Text style={styles.invoiceNumber}>{item.number}</Text>
                <Text style={[styles.invoiceTotal, { color: item.remaining > 0 ? '#F59E0B' : '#10B981' }]}>
                  {item.total?.toLocaleString()} ﷼
                </Text>
              </View>
              <Text style={styles.invoiceSupplier}>🏪 {item.supplierName}</Text>
              <View style={styles.invoiceFooter}>
                <Text style={styles.invoiceDate}>{item.date}</Text>
                <Text style={[styles.invoicePayment, { color: item.paymentType === 'cash' ? '#10B981' : '#F59E0B' }]}>
                  {item.paymentType === 'cash' ? '💰 نقدي' : '📋 آجل'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>فاتورة مشتريات جديدة</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>التاريخ</Text>
              <TextInput style={styles.fieldInput} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>المورد *</Text>
              <TextInput style={styles.fieldInput} value={supplierName} onChangeText={setSupplierName} placeholder="اسم المورد" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>طريقة الدفع</Text>
              <View style={styles.paymentRow}>
                <TouchableOpacity style={[styles.paymentBtn, paymentType === 'cash' && styles.paymentBtnActive]} onPress={() => setPaymentType('cash')}>
                  <Text style={[styles.paymentText, paymentType === 'cash' && styles.paymentTextActive]}>💰 نقدي</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.paymentBtn, paymentType === 'credit' && styles.paymentBtnActive]} onPress={() => setPaymentType('credit')}>
                  <Text style={[styles.paymentText, paymentType === 'credit' && styles.paymentTextActive]}>📋 آجل</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>الأصناف</Text>
              {lines.map((line, index) => (
                <View key={line.id} style={styles.lineCard}>
                  <View style={styles.lineHeader}>
                    <Text style={styles.lineNum}>#{index + 1}</Text>
                    {lines.length > 1 && <TouchableOpacity onPress={() => removeLine(line.id)}><Text style={styles.removeBtn}>🗑️</Text></TouchableOpacity>}
                  </View>
                  <TextInput style={styles.fieldInput} value={line.itemName} onChangeText={(v) => updateLine(line.id, 'itemName', v)} placeholder="اسم الصنف" placeholderTextColor="#666" />
                  <View style={styles.row}>
                    <TextInput style={[styles.fieldInput, styles.half]} value={line.qty} onChangeText={(v) => updateLine(line.id, 'qty', v)} placeholder="كمية" placeholderTextColor="#666" keyboardType="numeric" />
                    <TextInput style={[styles.fieldInput, styles.half]} value={line.price} onChangeText={(v) => updateLine(line.id, 'price', v)} placeholder="سعر" placeholderTextColor="#666" keyboardType="numeric" />
                  </View>
                  <Text style={styles.lineTotal}>الإجمالي: {parseFloat(line.total).toLocaleString()} ﷼</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.addLineBtn} onPress={addLine}><Text style={styles.addLineText}>+ إضافة صنف</Text></TouchableOpacity>

              <View style={styles.summarySection}>
                <Text style={styles.summaryLabel}>الإجمالي: {subtotal.toLocaleString()} ﷼</Text>
                <Text style={styles.fieldLabel}>الخصم</Text>
                <TextInput style={styles.fieldInput} value={discount} onChangeText={setDiscount} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
                <Text style={styles.fieldLabel}>المدفوع</Text>
                <TextInput style={styles.fieldInput} value={paid} onChangeText={setPaid} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
                <Text style={styles.remainingText}>المتبقي: {remaining.toLocaleString()} ﷼</Text>
              </View>

              <Text style={styles.fieldLabel}>ملاحظات</Text>
              <TextInput style={[styles.fieldInput, { height: 60 }]} value={notes} onChangeText={setNotes} placeholder="ملاحظات" placeholderTextColor="#666" multiline />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}><Text style={styles.saveModalBtnText}>💾 حفظ الفاتورة</Text></TouchableOpacity>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelModalBtnText}>إلغاء</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تفاصيل الفاتورة</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            {selectedInvoice && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>رقم الفاتورة</Text><Text style={styles.detailValue}>{selectedInvoice.number}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>التاريخ</Text><Text style={styles.detailValue}>{selectedInvoice.date}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>المورد</Text><Text style={styles.detailValue}>{selectedInvoice.supplierName}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>الإجمالي</Text><Text style={styles.detailValue}>{selectedInvoice.total?.toLocaleString()} ﷼</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>المدفوع</Text><Text style={styles.detailValue}>{selectedInvoice.paid?.toLocaleString()} ﷼</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>المتبقي</Text><Text style={[styles.detailValue, { color: '#F59E0B' }]}>{selectedInvoice.remaining?.toLocaleString()} ﷼</Text></View>
                <Text style={styles.sectionTitle}>الأصناف</Text>
                {selectedInvoice.items?.map((item, i) => (
                  <View key={i} style={styles.lineDetail}>
                    <Text style={styles.lineItemName}>{item.itemName}</Text>
                    <Text style={styles.lineItemDetail}>{item.qty} × {item.price} = {item.total} ﷼</Text>
                  </View>
                ))}
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
  controlBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 10, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14 },
  printBtn: { backgroundColor: '#16213E', borderRadius: 10, padding: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#2a3550' },
  printBtnText: { fontSize: 18 },
  summaryCard: { marginHorizontal: 16, marginBottom: 16, padding: 20, backgroundColor: '#16213E', borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  summaryLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  summaryValue: { color: '#EF4444', fontSize: 28, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emptySubtext: { color: '#94a3b8', fontSize: 12 },
  invoiceCard: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  invoiceNumber: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  invoiceTotal: { fontSize: 18, fontWeight: 'bold' },
  invoiceSupplier: { color: '#FFFFFF', fontSize: 14, marginBottom: 6 },
  invoiceFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 8 },
  invoiceDate: { color: '#94a3b8', fontSize: 11 },
  invoicePayment: { fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  paymentRow: { flexDirection: 'row', gap: 8 },
  paymentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550', alignItems: 'center' },
  paymentBtnActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF37' + '20' },
  paymentText: { color: '#94a3b8', fontSize: 13 },
  paymentTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37', marginTop: 16, marginBottom: 10 },
  lineCard: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a3550' },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lineNum: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },
  removeBtn: { fontSize: 16 },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  lineTotal: { color: '#10B981', fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginTop: 4 },
  addLineBtn: { backgroundColor: '#D4AF37' + '20', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#D4AF37' + '40' },
  addLineText: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  summarySection: { backgroundColor: '#0A1128', borderRadius: 12, padding: 14, marginTop: 12 },
  summaryLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  remainingText: { color: '#F59E0B', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginTop: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  detailLabel: { color: '#94a3b8', fontSize: 14 },
  detailValue: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  lineDetail: { backgroundColor: '#0A1128', borderRadius: 8, padding: 10, marginBottom: 6 },
  lineItemName: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  lineItemDetail: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
});
