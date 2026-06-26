import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface Item {
  id: string; code: string; name: string; nameEn: string; unit: string; quantity: number;
  minQuantity: number; costPrice: number; salePrice: number; warehouseId: string; categoryId: string; notes: string; createdAt: string;
}

export default function ItemsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: items, add, remove, update } = useLocalTable<Item>('items');
  const { data: warehouses } = useLocalTable('warehouses');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: '', nameEn: '', unit: 'قطعة', quantity: '0', minQuantity: '0',
    costPrice: '0', salePrice: '0', warehouseId: '', categoryId: '', notes: ''
  });

  const filtered = items.filter((i: Item) => i.name?.includes(searchQuery) || i.code?.includes(searchQuery));
  const totalValue = items.reduce((s: number, i: Item) => s + ((i.quantity || 0) * (i.costPrice || 0)), 0);

  const generateCode = () => `ITM-${(items.length + 1).toString().padStart(4, '0')}`;

  const handleSave = async () => {
    if (!formData.name) { Alert.alert('خطأ', 'الرجاء إدخال اسم الصنف'); return; }
    if (editMode && selectedItem) {
      await update(selectedItem.id, { ...formData, quantity: parseFloat(formData.quantity) || 0, costPrice: parseFloat(formData.costPrice) || 0, salePrice: parseFloat(formData.salePrice) || 0 });
    } else {
      await add({ ...formData, code: generateCode(), quantity: parseFloat(formData.quantity) || 0, costPrice: parseFloat(formData.costPrice) || 0, salePrice: parseFloat(formData.salePrice) || 0 });
    }
    setShowModal(false); resetForm();
  };

  const handleDelete = (item: Item) => {
    Alert.alert('تأكيد الحذف', `هل تريد حذف "${item.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(item.id) },
    ]);
  };

  const resetForm = () => {
    setFormData({ name: '', nameEn: '', unit: 'قطعة', quantity: '0', minQuantity: '0', costPrice: '0', salePrice: '0', warehouseId: '', categoryId: '', notes: '' });
    setSelectedItem(null); setEditMode(false);
  };

  const openEdit = (item: Item) => {
    setFormData({ name: item.name, nameEn: item.nameEn || '', unit: item.unit || 'قطعة', quantity: item.quantity?.toString() || '0', minQuantity: item.minQuantity?.toString() || '0', costPrice: item.costPrice?.toString() || '0', salePrice: item.salePrice?.toString() || '0', warehouseId: item.warehouseId || '', categoryId: item.categoryId || '', notes: item.notes || '' });
    setSelectedItem(item); setEditMode(true); setShowModal(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>الأصناف ({items.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}><Text style={styles.printBtnText}>🖨️</Text></TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>قيمة المخزون</Text>
        <Text style={styles.summaryValue}>{totalValue.toLocaleString()} ﷼</Text>
        <Text style={styles.summarySub}>عدد الأصناف: {items.length} | الكمية الإجمالية: {items.reduce((s: number, i: Item) => s + (i.quantity || 0), 0)}</Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>📦</Text><Text style={styles.emptyText}>لا توجد أصناف</Text><Text style={styles.emptySubtext}>اضغط + لإضافة صنف</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: Item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openEdit(item as any)} onLongPress={() => handleDelete(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📦</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardCode}>{item.code} | {item.unit}</Text>
                </View>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyText}>{item.quantity || 0}</Text>
                </View>
              </View>
              <View style={styles.priceRow}>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>تكلفة</Text>
<Text style={[styles.priceValue, { color: '#EF4444' }]}>{(item as any).costPrice} ر.س</Text>
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>بيع</Text>
<Text style={[styles.priceValue, { color: '#10B981' }]}>{(item as any).salePrice} ر.س</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editMode ? 'تعديل صنف' : 'إضافة صنف جديد'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>اسم الصنف *</Text>
              <TextInput style={styles.fieldInput} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="اسم الصنف" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>الاسم بالإنجليزي</Text>
              <TextInput style={styles.fieldInput} value={formData.nameEn} onChangeText={(v) => setFormData({ ...formData, nameEn: v })} placeholder="Item name" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>الوحدة</Text>
              <TextInput style={styles.fieldInput} value={formData.unit} onChangeText={(v) => setFormData({ ...formData, unit: v })} placeholder="قطعة، كيلو، لتر..." placeholderTextColor="#666" />
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>الكمية</Text>
                  <TextInput style={styles.fieldInput} value={formData.quantity} onChangeText={(v) => setFormData({ ...formData, quantity: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
                </View>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>الحد الأدنى</Text>
                  <TextInput style={styles.fieldInput} value={formData.minQuantity} onChangeText={(v) => setFormData({ ...formData, minQuantity: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>سعر التكلفة</Text>
                  <TextInput style={styles.fieldInput} value={formData.costPrice} onChangeText={(v) => setFormData({ ...formData, costPrice: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
                </View>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>سعر البيع</Text>
                  <TextInput style={styles.fieldInput} value={formData.salePrice} onChangeText={(v) => setFormData({ ...formData, salePrice: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
                </View>
              </View>
              <Text style={styles.fieldLabel}>ملاحظات</Text>
              <TextInput style={[styles.fieldInput, { height: 60 }]} value={formData.notes} onChangeText={(v) => setFormData({ ...formData, notes: v })} placeholder="ملاحظات" placeholderTextColor="#666" multiline />
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
  summaryValue: { color: '#D4AF37', fontSize: 28, fontWeight: 'bold' },
  summarySub: { color: '#6B7280', fontSize: 11, marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emptySubtext: { color: '#94a3b8', fontSize: 12 },
  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardIcon: { fontSize: 28, marginRight: 10 },
  cardInfo: { flex: 1 },
  cardName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  cardCode: { color: '#94a3b8', fontSize: 11 },
  qtyBadge: { backgroundColor: '#D4AF37' + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  qtyText: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 10 },
  priceItem: { alignItems: 'center' },
  priceLabel: { color: '#94a3b8', fontSize: 10, marginBottom: 2 },
  priceValue: { fontSize: 14, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
});
