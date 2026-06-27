import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface TransferLine { id: string; itemId: string; itemName: string; unit: string; qty: string; }
interface Transfer { id: string; number: string; date: string; fromWarehouseId: string; fromWarehouseName: string; toWarehouseId: string; toWarehouseName: string; description: string; refNumber: string; items: TransferLine[]; createdAt: string; }

export default function WarehouseTransferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: transfers, add, remove, update } = useLocalTable<Transfer>('warehouseTransfers');
  const { data: warehouses } = useLocalTable('warehouses');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], fromWarehouseId: '', fromWarehouseName: '', toWarehouseId: '', toWarehouseName: '', description: '', refNumber: '' });
  const [lines, setLines] = useState<TransferLine[]>([{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0' }]);

  const addLine = () => setLines([...lines, { id: Date.now().toString(), itemId: '', itemName: '', unit: 'قطعة', qty: '0' }]);
  const removeLine = (id: string) => { if (lines.length > 1) setLines(lines.filter(l => l.id !== id)); };
  const updateLine = (id: string, field: string, value: string) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const generateNumber = () => `TRANS-${(transfers.length + 1).toString().padStart(6, '0')}`;

  const handleSave = async () => {
    if (!formData.fromWarehouseName || !formData.toWarehouseName || lines.length === 0) { Alert.alert('خطأ', 'الرجاء تعبئة جميع الحقول'); return; }
    if (formData.fromWarehouseId === formData.toWarehouseId) { Alert.alert('خطأ', 'لا يمكن التحويل لنفس المستودع'); return; }
    const data = { ...formData, number: generateNumber(), items: lines.filter(l => l.itemName && parseFloat(l.qty) > 0) };
    if (selectedTransfer) { await update(selectedTransfer.id, data); } else { await add(data); }
    setShowModal(false); resetForm();
  };

  const handleDelete = (t: Transfer) => { Alert.alert('حذف', `حذف "${t.number}"؟`, [{ text: 'حذف', style: 'destructive', onPress: () => remove(t.id) }, { text: 'إلغاء' }]); };
  const resetForm = () => { setFormData({ date: new Date().toISOString().split('T')[0], fromWarehouseId: '', fromWarehouseName: '', toWarehouseId: '', toWarehouseName: '', description: '', refNumber: '' }); setLines([{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0' }]); setSelectedTransfer(null); };

  const filtered = transfers.filter((t: Transfer) => t.number?.includes(searchQuery));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>تحويل مخزني ({transfers.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}><Text style={styles.printBtnText}>🖨️</Text></TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>🔄</Text><Text style={styles.emptyText}>لا توجد تحويلات</Text></View>
      ) : (
        <FlatList data={filtered} keyExtractor={(i: Transfer) => i.id} renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setFormData({ date: item.date, fromWarehouseId: item.fromWarehouseId, fromWarehouseName: item.fromWarehouseName, toWarehouseId: item.toWarehouseId, toWarehouseName: item.toWarehouseName, description: item.description || '', refNumber: item.refNumber || '' }); setLines(item.items || []); setSelectedTransfer(item); setShowModal(true); }} onLongPress={() => handleDelete(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardNumber}>{item.number}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
            <Text style={styles.cardDetail}>🏭 {item.fromWarehouseName} → {item.toWarehouseName}</Text>
            <Text style={styles.cardItems}>{item.items?.length || 0} صنف</Text>
          </TouchableOpacity>
        )} contentContainerStyle={{ padding: 16 }} />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{selectedTransfer ? 'تعديل تحويل' : 'تحويل جديد'}</Text><TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>رقم الأمر</Text>
              <TextInput style={[styles.fieldInput, { backgroundColor: '#0A1128', color: '#D4AF37' }]} value={generateNumber()} editable={false} />
              <Text style={styles.fieldLabel}>المخزن المحول منه *</Text>
              <View style={styles.chipRow}>{(warehouses || []).map((w: any) => (
                <TouchableOpacity key={w.id} style={[styles.chip, formData.fromWarehouseId === w.id && styles.chipActive]} onPress={() => setFormData({ ...formData, fromWarehouseId: w.id, fromWarehouseName: w.name })}>
                  <Text style={[styles.chipText, formData.fromWarehouseId === w.id && styles.chipTextActive]}>{w.name}</Text>
                </TouchableOpacity>
              ))}</View>
              <Text style={styles.fieldLabel}>المخزن المستلم *</Text>
              <View style={styles.chipRow}>{(warehouses || []).map((w: any) => (
                <TouchableOpacity key={w.id} style={[styles.chip, formData.toWarehouseId === w.id && styles.chipActive]} onPress={() => setFormData({ ...formData, toWarehouseId: w.id, toWarehouseName: w.name })}>
                  <Text style={[styles.chipText, formData.toWarehouseId === w.id && styles.chipTextActive]}>{w.name}</Text>
                </TouchableOpacity>
              ))}</View>
              <Text style={styles.fieldLabel}>التاريخ</Text>
              <TextInput style={styles.fieldInput} value={formData.date} onChangeText={(v) => setFormData({ ...formData, date: v })} />
              <Text style={styles.fieldLabel}>البيان</Text>
              <TextInput style={[styles.fieldInput, { height: 50 }]} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} multiline placeholder="بيان التحويل" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>رقم المرجع</Text>
              <TextInput style={styles.fieldInput} value={formData.refNumber} onChangeText={(v) => setFormData({ ...formData, refNumber: v })} placeholder="رقم مرجعي" placeholderTextColor="#666" />

              <Text style={styles.sectionTitle}>📦 الأصناف</Text>
              {lines.map((line, index) => (
                <View key={line.id} style={styles.lineCard}>
                  <View style={styles.lineHeader}><Text style={styles.lineNum}>#{index + 1}</Text>{lines.length > 1 && <TouchableOpacity onPress={() => removeLine(line.id)}><Text>🗑️</Text></TouchableOpacity>}</View>
                  <TextInput style={styles.fieldInput} value={line.itemName} onChangeText={(v) => updateLine(line.id, 'itemName', v)} placeholder="اسم الصنف" placeholderTextColor="#666" />
                  <View style={styles.row}>
                    <TextInput style={[styles.fieldInput, styles.half]} value={line.qty} onChangeText={(v) => updateLine(line.id, 'qty', v)} placeholder="الكمية" placeholderTextColor="#666" keyboardType="numeric" />
                    <TextInput style={[styles.fieldInput, styles.half]} value={line.unit} onChangeText={(v) => updateLine(line.id, 'unit', v)} placeholder="الوحدة" placeholderTextColor="#666" />
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.addLineBtn} onPress={addLine}><Text style={styles.addLineText}>+ إضافة صنف</Text></TouchableOpacity>

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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardNumber: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  cardDate: { color: '#94a3b8', fontSize: 11 },
  cardDetail: { color: '#FFFFFF', fontSize: 13, marginBottom: 4 },
  cardItems: { color: '#94a3b8', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '95%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
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
  addLineBtn: { backgroundColor: '#D4AF37' + '20', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#D4AF37' + '40' },
  addLineText: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
});
