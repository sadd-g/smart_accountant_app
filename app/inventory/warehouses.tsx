import { ControlButtons, ControlHeader } from '../../src/components/ui/ControlButtons';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface Warehouse {
  id: string; code: string; name: string; nameEn: string; location: string; itemsCount: number; notes: string; createdAt: string;
}

export default function WarehousesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: warehouses, add, remove, update } = useLocalTable<Warehouse>('warehouses');
  const { data: items } = useLocalTable('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWh, setSelectedWh] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ name: '', nameEn: '', location: '', notes: '' });

  const getItemsCount = (whId: string) => items.filter((i: any) => i.warehouseId === whId).length;

  const filtered = warehouses.filter((w: Warehouse) => w.name?.includes(searchQuery) || w.code?.includes(searchQuery));

  const generateCode = () => `WH-${(warehouses.length + 1).toString().padStart(3, '0')}`;

  const handleSave = async () => {
    if (!formData.name) { Alert.alert('خطأ', 'الرجاء إدخال اسم المستودع'); return; }
    if (editMode && selectedWh) {
      await update(selectedWh.id, formData);
    } else {
      await add({ ...formData, code: generateCode(), itemsCount: 0 });
    }
    setShowModal(false); resetForm();
  };

  const handleDelete = (wh: Warehouse) => {
    const count = getItemsCount(wh.id);
    if (count > 0) { Alert.alert('تنبيه', `لا يمكن حذف مستودع يحتوي على ${count} صنف`); return; }
    Alert.alert('تأكيد الحذف', `هل تريد حذف "${wh.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(wh.id) },
    ]);
  };

  const resetForm = () => { setFormData({ name: '', nameEn: '', location: '', notes: '' }); setSelectedWh(null); setEditMode(false); };

  const openEdit = (wh: Warehouse) => {
    setFormData({ name: wh.name, nameEn: wh.nameEn || '', location: wh.location || '', notes: wh.notes || '' });
    setSelectedWh(wh); setEditMode(true); setShowModal(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>المستودعات ({warehouses.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}><Text style={styles.printBtnText}>🖨️</Text></TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>إجمالي المستودعات</Text>
        <Text style={styles.summaryValue}>{warehouses.length}</Text>
        <Text style={styles.summarySub}>إجمالي الأصناف: {items.length}</Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>🏭</Text><Text style={styles.emptyText}>لا توجد مستودعات</Text><Text style={styles.emptySubtext}>اضغط + لإضافة مستودع</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: Warehouse) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openEdit(item)} onLongPress={() => handleDelete(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🏭</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardCode}>{item.code}</Text>
                  {item.location ? <Text style={styles.cardLocation}>📍 {item.location}</Text> : null}
                </View>
                <View style={styles.itemsBadge}>
                  <Text style={styles.itemsCount}>{getItemsCount(item.id)}</Text>
                  <Text style={styles.itemsLabel}>صنف</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}><Text style={styles.editBtnText}>✏️ تعديل</Text></TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}><Text style={styles.deleteBtnText}>🗑️ حذف</Text></TouchableOpacity>
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
              <Text style={styles.modalTitle}>{editMode ? 'تعديل مستودع' : 'إضافة مستودع جديد'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>اسم المستودع *</Text>
              <TextInput style={styles.fieldInput} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="اسم المستودع" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>الاسم بالإنجليزي</Text>
              <TextInput style={styles.fieldInput} value={formData.nameEn} onChangeText={(v) => setFormData({ ...formData, nameEn: v })} placeholder="Warehouse name" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>الموقع</Text>
              <TextInput style={styles.fieldInput} value={formData.location} onChangeText={(v) => setFormData({ ...formData, location: v })} placeholder="موقع المستودع" placeholderTextColor="#666" />
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
  cardCode: { color: '#94a3b8', fontSize: 11, marginBottom: 2 },
  cardLocation: { color: '#6B7280', fontSize: 11 },
  itemsBadge: { alignItems: 'center', backgroundColor: '#D4AF37' + '20', padding: 10, borderRadius: 10, minWidth: 50 },
  itemsCount: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  itemsLabel: { color: '#94a3b8', fontSize: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 10 },
  editBtn: { backgroundColor: '#3B82F6' + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: '#3B82F6', fontSize: 12, fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#EF4444' + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
});
