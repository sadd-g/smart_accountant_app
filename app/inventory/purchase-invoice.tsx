import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface InvoiceLine { id: string; itemId: string; itemName: string; unit: string; qty: string; freeQty: string; price: string; discount: string; total: string; }
interface PurchaseInvoice { id: string; number: string; type: 'cash' | 'credit'; date: string; customerId: string; customerName: string; warehouseId: string; warehouseName: string; cashBoxId: string; cashBoxName: string; subtotal: number; discount: number; tax: number; total: number; paid: number; remaining: number; refNumber: string; description: string; items: InvoiceLine[]; createdAt: string; }

export default function PurchaseInvoiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: invoices, add, remove, update } = useLocalTable<PurchaseInvoice>('purchaseInvoices');
  const { data: suppliers } = useLocalTable('suppliers');
  const { data: items } = useLocalTable('items');
  const { data: warehouses } = useLocalTable('warehouses');
  const { data: cashBoxes } = useLocalTable('cashBoxes');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'cash' | 'credit'>('cash');
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], customerId: '', customerName: '',
    warehouseId: '', warehouseName: '', cashBoxId: '', cashBoxName: '',
    paid: '0', discount: '0', description: '', refNumber: ''
  });
  const [lines, setLines] = useState<InvoiceLine[]>([
    { id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0', freeQty: '0', price: '0', discount: '0', total: '0' }
  ]);

  const addLine = () => setLines([...lines, { id: Date.now().toString(), itemId: '', itemName: '', unit: 'قطعة', qty: '0', freeQty: '0', price: '0', discount: '0', total: '0' }]);
  const removeLine = (id: string) => { if (lines.length > 1) setLines(lines.filter(l => l.id !== id)); };
  const updateLine = (id: string, field: string, value: string) => {
    setLines(lines.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (field === 'qty' || field === 'price' || field === 'discount' || field === 'freeQty') {
        const qty = parseFloat(updated.qty) || 0;
        const price = parseFloat(updated.price) || 0;
        const disc = parseFloat(updated.discount) || 0;
        updated.total = ((qty * price) - disc).toString();
      }
      return updated;
    }));
  };

  const subtotal = lines.reduce((s, l) => s + (parseFloat(l.total) || 0), 0);
  const discountTotal = parseFloat(formData.discount) || 0;
  const total = subtotal - discountTotal;
  const paid = parseFloat(formData.paid) || 0;
  const remaining = total - paid;

  const generateNumber = () => {
    const prefix = invoiceType === 'cash' ? 'CSI' : 'CRI';
    const count = invoices.filter((i: PurchaseInvoice) => i.type === invoiceType).length;
    return `${prefix}-${(count + 1).toString().padStart(6, '0')}`;
  };

  const handleSave = async () => {
    if (!formData.customerName || lines.length === 0) { Alert.alert('خطأ', 'الرجاء إدخال العميل والأصناف'); return; }
    const data = {
      number: generateNumber(), type: invoiceType, date: formData.date,
      customerId: formData.customerId, customerName: formData.customerName,
      warehouseId: formData.warehouseId, warehouseName: formData.warehouseName,
      cashBoxId: formData.cashBoxId, cashBoxName: formData.cashBoxName,
      subtotal, discount: discountTotal, tax: 0, total, paid, remaining,
      refNumber: formData.refNumber, description: formData.description,
      items: lines.filter(l => l.itemName && parseFloat(l.total) > 0)
    };
    if (selectedInvoice) { await update(selectedInvoice.id, data); }
    else { await add(data); }
    setShowModal(false); resetForm();
  };

  const handleDelete = (inv: PurchaseInvoice) => {
    Alert.alert('حذف', `حذف "${inv.number}"؟`, [{ text: 'حذف', style: 'destructive', onPress: () => remove(inv.id) }, { text: 'إلغاء', style: 'cancel' }]);
  };

  const resetForm = () => {
    setFormData({ date: new Date().toISOString().split('T')[0], customerId: '', customerName: '', warehouseId: '', warehouseName: '', cashBoxId: '', cashBoxName: '', paid: '0', discount: '0', description: '', refNumber: '' });
    setLines([{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0', freeQty: '0', price: '0', discount: '0', total: '0' }]);
    setSelectedInvoice(null);
  };

  const openEdit = (inv: PurchaseInvoice) => {
    setInvoiceType(inv.type);
    setFormData({ date: inv.date, customerId: inv.customerId || '', customerName: inv.customerName, warehouseId: inv.warehouseId || '', warehouseName: inv.warehouseName || '', cashBoxId: inv.cashBoxId || '', cashBoxName: inv.cashBoxName || '', paid: inv.paid?.toString() || '0', discount: inv.discount?.toString() || '0', description: inv.description || '', refNumber: inv.refNumber || '' });
    setLines(inv.items?.length > 0 ? inv.items.map((l: InvoiceLine) => ({ ...l, qty: l.qty?.toString(), freeQty: l.freeQty?.toString(), price: l.price?.toString(), discount: l.discount?.toString(), total: l.total?.toString() })) : [{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0', freeQty: '0', price: '0', discount: '0', total: '0' }]);
    setSelectedInvoice(inv); setShowModal(true);
  };

  const filtered = invoices.filter((i: PurchaseInvoice) => i.number?.includes(searchQuery) || i.customerName?.includes(searchQuery));
  const totalSales = invoices.reduce((s: number, i: PurchaseInvoice) => s + (i.total || 0), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>فواتير المشتريات ({invoices.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setInvoiceType('cash'); setShowModal(true); }}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>
      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}><Text style={styles.printBtnText}>🖨️</Text></TouchableOpacity>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>إجمالي المشتريات</Text>
        <Text style={styles.summaryValue}>{totalSales.toLocaleString()} ﷼</Text>
      </View>
      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>📄</Text><Text style={styles.emptyText}>لا توجد فواتير</Text></View>
      ) : (
        <FlatList data={filtered} keyExtractor={(i: PurchaseInvoice) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.invCard} onPress={() => openEdit(item)} onLongPress={() => handleDelete(item)}>
              <View style={styles.invHeader}>
                <Text style={styles.invNumber}>{item.number}</Text>
                <Text style={[styles.invTotal, { color: item.remaining > 0 ? '#F59E0B' : '#10B981' }]}>{item.total?.toLocaleString()} ﷼</Text>
              </View>
              <Text style={styles.invCustomer}>👤 {item.customerName}</Text>
              <View style={styles.invFooter}>
                <Text style={styles.invDate}>{item.date}</Text>
                <Text style={[styles.invType, { color: item.type === 'cash' ? '#10B981' : '#F59E0B' }]}>{item.type === 'cash' ? '💰 نقدي' : '📋 آجل'}</Text>
              </View>
            </TouchableOpacity>
          )} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} />
      )}
      
      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedInvoice ? 'تعديل فاتورة' : 'فاتورة جديدة'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              
              <Text style={styles.fieldLabel}>نوع الفاتورة</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity style={[styles.typeBtn, invoiceType === 'cash' && styles.typeBtnActive]} onPress={() => setInvoiceType('cash')}>
                  <Text style={[styles.typeBtnText, invoiceType === 'cash' && styles.typeBtnTextActive]}>💰 نقدي</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeBtn, invoiceType === 'credit' && styles.typeBtnActive]} onPress={() => setInvoiceType('credit')}>
                  <Text style={[styles.typeBtnText, invoiceType === 'credit' && styles.typeBtnTextActive]}>📋 آجل</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>رقم الفاتورة</Text>
              <TextInput style={[styles.fieldInput, { backgroundColor: '#0A1128', color: '#D4AF37' }]} value={generateNumber()} editable={false} />

              {invoiceType === 'cash' && (
                <>
                  <Text style={styles.fieldLabel}>الصندوق</Text>
                  <View style={styles.chipRow}>
                    {(cashBoxes || []).map((c: any) => (
                      <TouchableOpacity key={c.id} style={[styles.chip, formData.cashBoxId === c.id && styles.chipActive]} onPress={() => setFormData({ ...formData, cashBoxId: c.id, cashBoxName: c.name })}>
                        <Text style={[styles.chipText, formData.cashBoxId === c.id && styles.chipTextActive]}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.fieldLabel}>العميل *</Text>
              <View style={styles.chipRow}>
                {(suppliers || []).map((c: any) => (
                  <TouchableOpacity key={c.id} style={[styles.chip, formData.customerId === c.id && styles.chipActive]} onPress={() => setFormData({ ...formData, customerId: c.id, customerName: c.name })}>
                    <Text style={[styles.chipText, formData.customerId === c.id && styles.chipTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>المخزن</Text>
              <View style={styles.chipRow}>
                {(warehouses || []).map((w: any) => (
                  <TouchableOpacity key={w.id} style={[styles.chip, formData.warehouseId === w.id && styles.chipActive]} onPress={() => setFormData({ ...formData, warehouseId: w.id, warehouseName: w.name })}>
                    <Text style={[styles.chipText, formData.warehouseId === w.id && styles.chipTextActive]}>{w.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>التاريخ</Text>
              <TextInput style={styles.fieldInput} value={formData.date} onChangeText={(v) => setFormData({ ...formData, date: v })} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />

              <Text style={styles.fieldLabel}>البيان</Text>
              <TextInput style={[styles.fieldInput, { height: 50 }]} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} placeholder="بيان الفاتورة" placeholderTextColor="#666" multiline />

              <Text style={styles.fieldLabel}>رقم المرجع</Text>
              <TextInput style={styles.fieldInput} value={formData.refNumber} onChangeText={(v) => setFormData({ ...formData, refNumber: v })} placeholder="رقم مرجعي" placeholderTextColor="#666" />

              {/* الأصناف الديناميكية */}
              <Text style={styles.sectionTitle}>📦 الأصناف</Text>
              {lines.map((line, index) => (
                <View key={line.id} style={styles.lineCard}>
                  <View style={styles.lineHeader}>
                    <Text style={styles.lineNum}>#{index + 1}</Text>
                    {lines.length > 1 && <TouchableOpacity onPress={() => removeLine(line.id)}><Text>🗑️</Text></TouchableOpacity>}
                  </View>
                  <TextInput style={styles.fieldInput} value={line.itemName} onChangeText={(v) => updateLine(line.id, 'itemName', v)} placeholder="اسم الصنف" placeholderTextColor="#666" />
                  <View style={styles.row}>
                    <TextInput style={[styles.fieldInput, styles.half]} value={line.qty} onChangeText={(v) => updateLine(line.id, 'qty', v)} placeholder="الكمية" placeholderTextColor="#666" keyboardType="numeric" />
                    <TextInput style={[styles.fieldInput, styles.half]} value={line.price} onChangeText={(v) => updateLine(line.id, 'price', v)} placeholder="السعر" placeholderTextColor="#666" keyboardType="numeric" />
                  </View>
                  <View style={styles.row}>
                    <TextInput style={[styles.fieldInput, styles.half]} value={line.freeQty} onChangeText={(v) => updateLine(line.id, 'freeQty', v)} placeholder="مجاني" placeholderTextColor="#666" keyboardType="numeric" />
                    <TextInput style={[styles.fieldInput, styles.half]} value={line.discount} onChangeText={(v) => updateLine(line.id, 'discount', v)} placeholder="خصم" placeholderTextColor="#666" keyboardType="numeric" />
                  </View>
                  <Text style={styles.lineTotal}>الإجمالي: {parseFloat(line.total || '0').toLocaleString()} ﷼</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.addLineBtn} onPress={addLine}><Text style={styles.addLineText}>+ إضافة صنف</Text></TouchableOpacity>

              {/* المجاميع */}
              <View style={styles.summarySection}>
                <Text style={styles.summaryLabel}>الإجمالي: {subtotal.toLocaleString()} ﷼</Text>
                <Text style={styles.fieldLabel}>خصم إضافي</Text>
                <TextInput style={styles.fieldInput} value={formData.discount} onChangeText={(v) => setFormData({ ...formData, discount: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
                <Text style={styles.fieldLabel}>المدفوع</Text>
                <TextInput style={styles.fieldInput} value={formData.paid} onChangeText={(v) => setFormData({ ...formData, paid: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
                <Text style={styles.grandTotal}>الصافي: {total.toLocaleString()} ﷼ | المتبقي: {remaining.toLocaleString()} ﷼</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}><Text style={styles.saveModalBtnText}>💾 حفظ</Text></TouchableOpacity>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelModalBtnText}>إلغاء</Text></TouchableOpacity>
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
  controlBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 10, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14 },
  printBtn: { backgroundColor: '#16213E', borderRadius: 10, padding: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#2a3550' },
  printBtnText: { fontSize: 18 },
  summaryCard: { marginHorizontal: 16, marginBottom: 16, padding: 20, backgroundColor: '#16213E', borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  summaryLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  summaryValue: { color: '#10B981', fontSize: 28, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  invCard: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  invHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  invNumber: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  invTotal: { fontSize: 16, fontWeight: 'bold' },
  invCustomer: { color: '#FFFFFF', fontSize: 14, marginBottom: 6 },
  invFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 8 },
  invDate: { color: '#94a3b8', fontSize: 11 },
  invType: { fontSize: 12, fontWeight: 'bold' },
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550' },
  chipActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF37' + '20' },
  chipText: { color: '#94a3b8', fontSize: 11 },
  chipTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37', marginTop: 16, marginBottom: 10 },
  lineCard: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a3550' },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lineNum: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  lineTotal: { color: '#10B981', fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginTop: 4 },
  addLineBtn: { backgroundColor: '#D4AF37' + '20', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#D4AF37' + '40' },
  addLineText: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  summarySection: { backgroundColor: '#0A1128', borderRadius: 12, padding: 14, marginTop: 12 },
  summaryLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  grandTotal: { color: '#F59E0B', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginTop: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
});
