import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface IssueLine { id: string; itemId: string; itemName: string; unit: string; qty: string; price: string; total: string; }
interface InventoryIssue { id: string; number: string; date: string; warehouseId: string; warehouseName: string; accountId: string; accountName: string; description: string; refNumber: string; totalAmount: number; items: IssueLine[]; createdAt: string; }

export default function InventoryIssueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: issues, add, remove, update } = useLocalTable<InventoryIssue>('inventoryIssues');
  const { data: warehouses } = useLocalTable('warehouses');
  const { data: items } = useLocalTable('items');
  const { data: accounts } = useLocalTable('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<InventoryIssue | null>(null);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], warehouseId: '', warehouseName: '', accountId: '', accountName: '', description: '', refNumber: '' });
  const [lines, setLines] = useState<IssueLine[]>([{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0', price: '0', total: '0' }]);

  const addLine = () => setLines([...lines, { id: Date.now().toString(), itemId: '', itemName: '', unit: 'قطعة', qty: '0', price: '0', total: '0' }]);
  const removeLine = (id: string) => { if (lines.length > 1) setLines(lines.filter(l => l.id !== id)); };
  const updateLine = (id: string, field: string, value: string) => {
    setLines(lines.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (field === 'qty' || field === 'price') updated.total = ((parseFloat(updated.qty) || 0) * (parseFloat(updated.price) || 0)).toString();
      return updated;
    }));
  };

  const totalAmount = lines.reduce((s, l) => s + (parseFloat(l.total) || 0), 0);
  const generateNumber = () => `ISSUE-${(issues.length + 1).toString().padStart(6, '0')}`;

  const handleSave = async () => {
    if (!formData.warehouseName || !formData.accountName || lines.length === 0) { Alert.alert('خطأ', 'الرجاء تعبئة جميع الحقول'); return; }
    const data = { ...formData, number: generateNumber(), totalAmount, items: lines.filter(l => l.itemName && parseFloat(l.total) > 0) };
    if (selectedIssue) { await update(selectedIssue.id, data); } else { await add(data); }
    setShowModal(false); resetForm();
  };

  const handleDelete = (issue: InventoryIssue) => {
    Alert.alert('حذف', `حذف "${issue.number}"؟`, [{ text: 'حذف', style: 'destructive', onPress: () => remove(issue.id) }, { text: 'إلغاء', style: 'cancel' }]);
  };

  const resetForm = () => {
    setFormData({ date: new Date().toISOString().split('T')[0], warehouseId: '', warehouseName: '', accountId: '', accountName: '', description: '', refNumber: '' });
    setLines([{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0', price: '0', total: '0' }]);
    setSelectedIssue(null);
  };

  const filtered = issues.filter((i: InventoryIssue) => i.number?.includes(searchQuery) || i.description?.includes(searchQuery));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>صرف مخزون ({issues.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}><Text style={styles.printBtnText}>🖨️</Text></TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>📤</Text><Text style={styles.emptyText}>لا توجد عمليات صرف</Text></View>
      ) : (
        <FlatList data={filtered} keyExtractor={(i: InventoryIssue) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => { setFormData({ date: item.date, warehouseId: item.warehouseId || '', warehouseName: item.warehouseName, accountId: item.accountId || '', accountName: item.accountName, description: item.description || '', refNumber: item.refNumber || '' }); setLines(item.items || []); setSelectedIssue(item); setShowModal(true); }} onLongPress={() => handleDelete(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardNumber}>{item.number}</Text>
                <Text style={styles.cardTotal}>{item.totalAmount?.toLocaleString()} ﷼</Text>
              </View>
              <Text style={styles.cardDetail}>🏭 {item.warehouseName} → {item.accountName}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
            </TouchableOpacity>
          )} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedIssue ? 'تعديل صرف' : 'صرف مخزون جديد'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>رقم الأمر</Text>
              <TextInput style={[styles.fieldInput, { backgroundColor: '#0A1128', color: '#D4AF37' }]} value={generateNumber()} editable={false} />

              <Text style={styles.fieldLabel}>المخزن *</Text>
              <View style={styles.chipRow}>{(warehouses || []).map((w: any) => (
                <TouchableOpacity key={w.id} style={[styles.chip, formData.warehouseId === w.id && styles.chipActive]} onPress={() => setFormData({ ...formData, warehouseId: w.id, warehouseName: w.name })}>
                  <Text style={[styles.chipText, formData.warehouseId === w.id && styles.chipTextActive]}>{w.name}</Text>
                </TouchableOpacity>
              ))}</View>

              <Text style={styles.fieldLabel}>الحساب (جهة الصرف) *</Text>
              <View style={styles.chipRow}>{(accounts || []).slice(0, 15).map((a: any) => (
                <TouchableOpacity key={a.id} style={[styles.chip, formData.accountId === a.id && styles.chipActive]} onPress={() => setFormData({ ...formData, accountId: a.id, accountName: a.name })}>
                  <Text style={[styles.chipText, formData.accountId === a.id && styles.chipTextActive]}>{a.name}</Text>
                </TouchableOpacity>
              ))}</View>

              <Text style={styles.fieldLabel}>التاريخ</Text>
              <TextInput style={styles.fieldInput} value={formData.date} onChangeText={(v) => setFormData({ ...formData, date: v })} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>البيان</Text>
              <TextInput style={[styles.fieldInput, { height: 50 }]} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} placeholder="بيان الصرف" placeholderTextColor="#666" multiline />
              <Text style={styles.fieldLabel}>رقم المرجع</Text>
              <TextInput style={styles.fieldInput} value={formData.refNumber} onChangeText={(v) => setFormData({ ...formData, refNumber: v })} placeholder="رقم مرجعي" placeholderTextColor="#666" />

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
                  <Text style={styles.lineTotal}>الإجمالي: {parseFloat(line.total || '0').toLocaleString()} ﷼</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.addLineBtn} onPress={addLine}><Text style={styles.addLineText}>+ إضافة صنف</Text></TouchableOpacity>

              <Text style={styles.totalText}>الإجمالي الكلي: {totalAmount.toLocaleString()} ﷼</Text>

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
  cardTotal: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' },
  cardDetail: { color: '#FFFFFF', fontSize: 13, marginBottom: 4 },
  cardDate: { color: '#94a3b8', fontSize: 11 },
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
  lineTotal: { color: '#10B981', fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginTop: 4 },
  addLineBtn: { backgroundColor: '#D4AF37' + '20', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#D4AF37' + '40' },
  addLineText: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  totalText: { color: '#F59E0B', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 12 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
});
