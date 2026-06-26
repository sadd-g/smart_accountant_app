import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';
import { PickerModal } from '../../src/components/ui/PickerModal';

interface InvoiceLine { id: string; itemId: string; itemName: string; unit: string; qty: string; freeQty: string; price: string; discount: string; total: string; }

export default function PurchaseInvoiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: invoices, add, remove, update } = useLocalTable('purchaseInvoices');
  const { data: suppliers } = useLocalTable('suppliers');
  const { data: items } = useLocalTable('items');
  const { data: warehouses } = useLocalTable('warehouses');
  const { data: cashBoxes } = useLocalTable('cashBoxes');
  const { data: units } = useLocalTable('units');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'cash' | 'credit'>('cash');
  const [editMode, setEditMode] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);
  const [showCashBoxPicker, setShowCashBoxPicker] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [currentLineId, setCurrentLineId] = useState('');
  const [currentField, setCurrentField] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierId: '', supplierName: '', warehouseId: '', warehouseName: '',
    cashBoxId: '', cashBoxName: '', paid: '0', discount: '0', description: '', refNumber: ''
  });
  const [lines, setLines] = useState<InvoiceLine[]>([{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0', freeQty: '0', price: '0', discount: '0', total: '0' }]);

  const addLine = () => setLines([...lines, { id: Date.now().toString(), itemId: '', itemName: '', unit: 'قطعة', qty: '0', freeQty: '0', price: '0', discount: '0', total: '0' }]);
  const removeLine = (id: string) => { if (lines.length > 1) setLines(lines.filter(l => l.id !== id)); };
  const updateLine = (id: string, field: string, value: string) => {
    setLines(lines.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (['qty', 'price', 'discount'].includes(field)) updated.total = (((parseFloat(updated.qty) || 0) * (parseFloat(updated.price) || 0)) - (parseFloat(updated.discount) || 0)).toString();
      return updated;
    }));
  };

  const subtotal = lines.reduce((s, l) => s + (parseFloat(l.total) || 0), 0);
  const total = subtotal - (parseFloat(formData.discount) || 0);
  const paid = parseFloat(formData.paid) || 0;
  const remaining = total - paid;

  const generateNumber = () => {
    const prefix = invoiceType === 'cash' ? 'CPI' : 'PRI';
    return `${prefix}-${(invoices.length + 1).toString().padStart(6, '0')}`;
  };

  const handleSave = async () => {
    if (!formData.supplierName) { Alert.alert('خطأ', 'الرجاء اختيار المورد'); return; }
    const data = { number: generateNumber(), type: invoiceType, ...formData, subtotal, total, paid, remaining, items: lines.filter(l => l.itemName) };
    if (editMode && selectedInvoice) { await update(selectedInvoice.id, data); } else { await add(data); }
    setShowModal(false); setEditMode(false); setSelectedInvoice(null);
  };

  const openEdit = (inv: any) => {
    setInvoiceType(inv.type); setFormData({ date: inv.date, supplierId: inv.supplierId || '', supplierName: inv.supplierName, warehouseId: inv.warehouseId || '', warehouseName: inv.warehouseName || '', cashBoxId: inv.cashBoxId || '', cashBoxName: inv.cashBoxName || '', paid: inv.paid?.toString() || '0', discount: inv.discount?.toString() || '0', description: inv.description || '', refNumber: inv.refNumber || '' });
    setLines(inv.items?.length > 0 ? inv.items : [{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0', freeQty: '0', price: '0', discount: '0', total: '0' }]);
    setSelectedInvoice(inv); setEditMode(true); setShowModal(true);
  };

  const filtered = invoices.filter((i: any) => i.number?.includes(searchQuery) || i.supplierName?.includes(searchQuery));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>فواتير المشتريات</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditMode(false); setSelectedInvoice(null); setFormData({ date: new Date().toISOString().split('T')[0], supplierId: '', supplierName: '', warehouseId: '', warehouseName: '', cashBoxId: '', cashBoxName: '', paid: '0', discount: '0', description: '', refNumber: '' }); setLines([{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0', freeQty: '0', price: '0', discount: '0', total: '0' }]); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>
      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn} onPress={() => Alert.alert('🖨️', 'جاري الطباعة')}><Text>🖨️</Text></TouchableOpacity>
      </View>
      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>📋</Text><Text style={styles.emptyText}>لا توجد فواتير</Text></View>
      ) : (
        <FlatList data={filtered} keyExtractor={(i: any) => i.id} renderItem={({ item }) => (
          <TouchableOpacity style={styles.invCard} onPress={() => openEdit(item)} onLongPress={() => Alert.alert('حذف', `حذف "${item.number}"؟`, [{ text: 'حذف', style: 'destructive', onPress: () => remove(item.id) }, { text: 'إلغاء' }])}>
            <View style={styles.invHeader}><Text style={styles.invNumber}>{item.number}</Text><Text style={[styles.invTotal, { color: item.remaining > 0 ? '#F59E0B' : '#10B981' }]}>{item.total?.toLocaleString()} ﷼</Text></View>
            <Text style={styles.invSupplier}>🏪 {item.supplierName}</Text>
            <View style={styles.invFooter}><Text style={styles.invDate}>{item.date}</Text><Text style={[styles.invType, { color: item.type === 'cash' ? '#10B981' : '#F59E0B' }]}>{item.type === 'cash' ? '💰 نقدي' : '📋 آجل'}</Text></View>
          </TouchableOpacity>
        )} contentContainerStyle={{ padding: 16 }} />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { maxHeight: '95%' }]}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{editMode ? 'تعديل' : 'إضافة'} فاتورة مشتريات</Text><TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.fieldLabel}>نوع الفاتورة</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity style={[styles.typeBtn, invoiceType === 'cash' && styles.typeBtnActive]} onPress={() => setInvoiceType('cash')}>
                <Text style={[styles.typeBtnText, invoiceType === 'cash' && styles.typeBtnTextActive]}>💰 نقدي</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, invoiceType === 'credit' && styles.typeBtnActive]} onPress={() => setInvoiceType('credit')}>
                <Text style={[styles.typeBtnText, invoiceType === 'credit' && styles.typeBtnTextActive]}>📋 آجل</Text></TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>رقم الفاتورة</Text>
            <TextInput style={[styles.fieldInput, { color: '#D4AF37', fontWeight: 'bold' }]} value={generateNumber()} editable={false} />

            {invoiceType === 'cash' && (
              <>
                <Text style={styles.fieldLabel}>الصندوق *</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCashBoxPicker(true)}>
                  <Text style={formData.cashBoxName ? styles.pickerText : styles.pickerPlaceholder}>{formData.cashBoxName || 'اختيار الصندوق'}</Text><Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>
              </>
            )}

            <Text style={styles.fieldLabel}>المورد *</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowSupplierPicker(true)}>
              <Text style={formData.supplierName ? styles.pickerText : styles.pickerPlaceholder}>{formData.supplierName || 'اختيار المورد'}</Text><Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>

            <Text style={styles.fieldLabel}>المخزن *</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowWarehousePicker(true)}>
              <Text style={formData.warehouseName ? styles.pickerText : styles.pickerPlaceholder}>{formData.warehouseName || 'اختيار المخزن'}</Text><Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>

            <Text style={styles.fieldLabel}>التاريخ</Text><TextInput style={styles.fieldInput} value={formData.date} onChangeText={v => setFormData({ ...formData, date: v })} />
            <Text style={styles.fieldLabel}>البيان</Text><TextInput style={[styles.fieldInput, { height: 50 }]} value={formData.description} onChangeText={v => setFormData({ ...formData, description: v })} placeholder="بيان" placeholderTextColor="#666" multiline />
            <Text style={styles.fieldLabel}>رقم المرجع</Text><TextInput style={styles.fieldInput} value={formData.refNumber} onChangeText={v => setFormData({ ...formData, refNumber: v })} placeholder="اختياري" placeholderTextColor="#666" />

            <Text style={styles.sectionTitle}>📦 الأصناف</Text>
            {lines.map((line, index) => (
              <View key={line.id} style={styles.lineCard}>
                <View style={styles.lineHeader}><Text style={styles.lineNum}>#{index + 1}</Text>{lines.length > 1 && <TouchableOpacity onPress={() => removeLine(line.id)}><Text>🗑️</Text></TouchableOpacity>}</View>
                
                <TouchableOpacity style={styles.pickerButton} onPress={() => { setCurrentLineId(line.id); setShowItemPicker(true); }}>
                  <Text style={line.itemName ? styles.pickerText : styles.pickerPlaceholder}>{line.itemName || 'اختيار الصنف *'}</Text><Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>
                
                <TouchableOpacity style={styles.pickerButton} onPress={() => { setCurrentLineId(line.id); setCurrentField('unit'); setShowUnitPicker(true); }}>
                  <Text style={styles.pickerText}>{line.unit || 'الوحدة'}</Text><Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>
                
                <View style={styles.row}>
                  <TextInput style={[styles.fieldInput, styles.half]} value={line.qty} onChangeText={v => updateLine(line.id, 'qty', v)} placeholder="كمية" placeholderTextColor="#666" keyboardType="numeric" />
                  <TextInput style={[styles.fieldInput, styles.half]} value={line.price} onChangeText={v => updateLine(line.id, 'price', v)} placeholder="سعر" placeholderTextColor="#666" keyboardType="numeric" />
                </View>
                <View style={styles.row}>
                  <TextInput style={[styles.fieldInput, styles.half]} value={line.freeQty} onChangeText={v => updateLine(line.id, 'freeQty', v)} placeholder="مجاني" placeholderTextColor="#666" keyboardType="numeric" />
                  <TextInput style={[styles.fieldInput, styles.half]} value={line.discount} onChangeText={v => updateLine(line.id, 'discount', v)} placeholder="خصم" placeholderTextColor="#666" keyboardType="numeric" />
                </View>
                <Text style={styles.lineTotal}>الإجمالي: {parseFloat(line.total || '0').toLocaleString()} ﷼</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addLineBtn} onPress={addLine}><Text>+ إضافة صنف</Text></TouchableOpacity>

            <View style={styles.summarySection}>
              <Text style={styles.summaryLabel}>الإجمالي: {subtotal.toLocaleString()} ﷼</Text>
              <Text style={styles.fieldLabel}>خصم إضافي</Text><TextInput style={styles.fieldInput} value={formData.discount} onChangeText={v => setFormData({ ...formData, discount: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>المدفوع</Text><TextInput style={styles.fieldInput} value={formData.paid} onChangeText={v => setFormData({ ...formData, paid: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
              <Text style={styles.grandTotal}>الصافي: {total.toLocaleString()} ﷼ | المتبقي: {remaining.toLocaleString()} ﷼</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}><Text style={styles.saveModalBtnText}>💾 {editMode ? 'تحديث' : 'حفظ'}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelModalBtnText}>إلغاء</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </View></View>
      </Modal>

      <PickerModal visible={showSupplierPicker} title="اختيار المورد" data={suppliers || []} displayField="name" subField="code" onSelect={(item) => setFormData({ ...formData, supplierId: item.id, supplierName: item.name })} onClose={() => setShowSupplierPicker(false)} />
      <PickerModal visible={showWarehousePicker} title="اختيار المخزن" data={warehouses || []} displayField="name" subField="code" onSelect={(item) => setFormData({ ...formData, warehouseId: item.id, warehouseName: item.name })} onClose={() => setShowWarehousePicker(false)} />
      <PickerModal visible={showCashBoxPicker} title="اختيار الصندوق" data={cashBoxes || []} displayField="name" subField="currency" onSelect={(item) => setFormData({ ...formData, cashBoxId: item.id, cashBoxName: item.name })} onClose={() => setShowCashBoxPicker(false)} />
      <PickerModal visible={showItemPicker} title="اختيار الصنف" data={items || []} displayField="name" subField="code" onSelect={(item) => { updateLine(currentLineId, 'itemId', item.id); updateLine(currentLineId, 'itemName', item.name); updateLine(currentLineId, 'price', item.costPrice?.toString() || '0'); updateLine(currentLineId, 'unit', item.unit || 'قطعة'); }} onClose={() => setShowItemPicker(false)} />
      <PickerModal visible={showUnitPicker} title="اختيار الوحدة" data={units || []} displayField="name" subField="code" onSelect={(item) => { updateLine(currentLineId, 'unit', item.name); }} onClose={() => setShowUnitPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A1128'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},backBtn:{fontSize:24,color:'#D4AF37',fontWeight:'bold'},title:{fontSize:18,fontWeight:'bold',color:'#FFFFFF'},addBtn:{width:36,height:36,borderRadius:18,backgroundColor:'#D4AF37'+'20',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#D4AF37'},addBtnText:{fontSize:20,color:'#D4AF37',fontWeight:'bold'},
  controlBar:{flexDirection:'row',paddingHorizontal:16,marginBottom:12,gap:8},searchInput:{flex:1,backgroundColor:'#16213E',borderRadius:10,padding:10,color:'#FFFFFF',borderWidth:1,borderColor:'#2a3550',textAlign:'right',fontSize:14},printBtn:{backgroundColor:'#16213E',borderRadius:10,padding:10,justifyContent:'center',borderWidth:1,borderColor:'#2a3550'},
  empty:{flex:1,justifyContent:'center',alignItems:'center'},emptyIcon:{fontSize:48,marginBottom:12},emptyText:{color:'#FFFFFF',fontSize:16,fontWeight:'bold'},
  invCard:{backgroundColor:'#16213E',borderRadius:14,padding:14,marginBottom:10,borderWidth:1,borderColor:'#2a3550'},invHeader:{flexDirection:'row',justifyContent:'space-between',marginBottom:8},invNumber:{color:'#D4AF37',fontSize:14,fontWeight:'bold'},invTotal:{fontSize:16,fontWeight:'bold'},invSupplier:{color:'#FFFFFF',fontSize:14,marginBottom:6},invFooter:{flexDirection:'row',justifyContent:'space-between',borderTopWidth:1,borderTopColor:'#2a3550',paddingTop:8},invDate:{color:'#94a3b8',fontSize:11},invType:{fontSize:12,fontWeight:'bold'},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},modalContent:{backgroundColor:'#16213E',borderTopLeftRadius:20,borderTopRightRadius:20,maxHeight:'95%'},modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#2a3550'},modalTitle:{color:'#D4AF37',fontSize:18,fontWeight:'bold'},modalClose:{color:'#EF4444',fontSize:22,fontWeight:'bold'},modalBody:{padding:16},
  fieldLabel:{color:'#94a3b8',fontSize:13,marginBottom:6,marginTop:12},fieldInput:{backgroundColor:'#0A1128',borderRadius:10,padding:12,color:'#FFFFFF',borderWidth:1,borderColor:'#2a3550',fontSize:14},
  typeRow:{flexDirection:'row',gap:8},typeBtn:{flex:1,paddingVertical:12,borderRadius:10,backgroundColor:'#0A1128',borderWidth:1,borderColor:'#2a3550',alignItems:'center'},typeBtnActive:{borderColor:'#D4AF37',backgroundColor:'#D4AF37'+'20'},typeBtnText:{color:'#94a3b8',fontSize:13},typeBtnTextActive:{color:'#D4AF37',fontWeight:'bold'},
  pickerButton:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#0A1128',borderRadius:10,padding:14,borderWidth:1,borderColor:'#2a3550',marginBottom:6},pickerText:{color:'#FFFFFF',fontSize:14,flex:1},pickerPlaceholder:{color:'#666',fontSize:14,flex:1},pickerArrow:{color:'#D4AF37',fontSize:12,marginLeft:8},
  sectionTitle:{fontSize:16,fontWeight:'bold',color:'#D4AF37',marginTop:16,marginBottom:10},lineCard:{backgroundColor:'#0A1128',borderRadius:10,padding:12,marginBottom:8,borderWidth:1,borderColor:'#2a3550'},lineHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},lineNum:{color:'#D4AF37',fontSize:12,fontWeight:'bold'},row:{flexDirection:'row',gap:8},half:{flex:1},lineTotal:{color:'#10B981',fontSize:13,fontWeight:'bold',textAlign:'right',marginTop:4},
  addLineBtn:{backgroundColor:'#D4AF37'+'20',borderRadius:10,padding:12,alignItems:'center',marginTop:8,borderWidth:1,borderColor:'#D4AF37'+'40'},summarySection:{backgroundColor:'#0A1128',borderRadius:12,padding:14,marginTop:12},summaryLabel:{color:'#FFFFFF',fontSize:16,fontWeight:'bold',marginBottom:8},grandTotal:{color:'#F59E0B',fontSize:14,fontWeight:'bold',textAlign:'center',marginTop:8},
  modalActions:{flexDirection:'row',gap:10,marginTop:24,marginBottom:16},saveModalBtn:{flex:1,backgroundColor:'#D4AF37',borderRadius:12,padding:14,alignItems:'center'},saveModalBtnText:{color:'#0A1128',fontSize:16,fontWeight:'bold'},cancelModalBtn:{flex:1,backgroundColor:'#2a3550',borderRadius:12,padding:14,alignItems:'center'},cancelModalBtnText:{color:'#FFFFFF',fontSize:16},
});
