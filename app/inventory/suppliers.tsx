import { ControlButtons, ControlHeader } from '../../src/components/ui/ControlButtons';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface Supplier {
  id: string; code: string; name: string; nameEn: string; phone: string; address: string;
  balance: number; currency: string; notes: string; isActive: boolean; createdAt: string;
}

export default function SuppliersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: suppliers, add, remove, update } = useLocalTable<Supplier>('suppliers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '', nameEn: '', phone: '', address: '', balance: '0', currency: 'YER', notes: ''
  });

  const filtered = suppliers.filter((s: Supplier) => 
    s.name?.includes(searchQuery) || s.code?.includes(searchQuery) || s.phone?.includes(searchQuery)
  );

  const totalBalance = suppliers.reduce((s: number, sup: Supplier) => s + (sup.balance || 0), 0);

  const generateCode = () => `SUP-${(suppliers.length + 1).toString().padStart(4, '0')}`;

  const handleSave = async () => {
    if (!formData.name) { Alert.alert('خطأ', 'الرجاء إدخال اسم المورد'); return; }
    if (editMode && selectedSupplier) {
      await update(selectedSupplier.id, { ...formData, balance: parseFloat(formData.balance) || 0 });
    } else {
      await add({ ...formData, code: generateCode(), balance: parseFloat(formData.balance) || 0, isActive: true });
    }
    setShowModal(false); resetForm();
  };

  const handleDelete = (supplier: Supplier) => {
    Alert.alert('تأكيد الحذف', `هل تريد حذف "${supplier.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(supplier.id) },
    ]);
  };

  const resetForm = () => {
    setFormData({ name: '', nameEn: '', phone: '', address: '', balance: '0', currency: 'YER', notes: '' });
    setSelectedSupplier(null); setEditMode(false);
  };

  const openEdit = (supplier: Supplier) => {
    setFormData({ name: supplier.name, nameEn: supplier.nameEn || '', phone: supplier.phone || '', address: supplier.address || '', balance: supplier.balance?.toString() || '0', currency: supplier.currency || 'YER', notes: supplier.notes || '' });
    setSelectedSupplier(supplier); setEditMode(true); setShowModal(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>الموردين ({suppliers.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}><Text style={styles.printBtnText}>🖨️</Text></TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>إجمالي الذمم الدائنة</Text>
        <Text style={styles.summaryValue}>{totalBalance.toLocaleString()} ﷼</Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>🏪</Text><Text style={styles.emptyText}>لا يوجد موردين</Text><Text style={styles.emptySubtext}>اضغط + لإضافة مورد</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: Supplier) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openEdit(item)} onLongPress={() => handleDelete(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🏪</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardCode}>{item.code}</Text>
                  {item.phone ? <Text style={styles.cardPhone}>📞 {item.phone}</Text> : null}
                </View>
                <View style={styles.balanceContainer}>
                  <Text style={[styles.balanceValue, { color: (item.balance || 0) >= 0 ? '#EF4444' : '#10B981' }]}>
                    {(item.balance || 0).toLocaleString()} ﷼
                  </Text>
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
              <Text style={styles.modalTitle}>{editMode ? 'تعديل مورد' : 'إضافة مورد جديد'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>اسم المورد *</Text>
              <TextInput style={styles.fieldInput} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="اسم المورد" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>الاسم بالإنجليزي (اختياري)</Text>
              <TextInput style={styles.fieldInput} value={formData.nameEn} onChangeText={(v) => setFormData({ ...formData, nameEn: v })} placeholder="Supplier name" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>رقم الهاتف</Text>
              <TextInput style={styles.fieldInput} value={formData.phone} onChangeText={(v) => setFormData({ ...formData, phone: v })} placeholder="رقم الهاتف" placeholderTextColor="#666" keyboardType="phone-pad" />
              <Text style={styles.fieldLabel}>العنوان</Text>
              <TextInput style={styles.fieldInput} value={formData.address} onChangeText={(v) => setFormData({ ...formData, address: v })} placeholder="العنوان" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>الرصيد الافتتاحي</Text>
              <TextInput style={styles.fieldInput} value={formData.balance} onChangeText={(v) => setFormData({ ...formData, balance: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
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
  summaryValue: { color: '#EF4444', fontSize: 28, fontWeight: 'bold' },
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
  cardPhone: { color: '#6B7280', fontSize: 11 },
  balanceContainer: {},
  balanceValue: { fontSize: 16, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 10 },
  editBtn: { backgroundColor: '#3B82F6' + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: '#3B82F6', fontSize: 12, fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#EF4444' + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
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
