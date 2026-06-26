import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface CashBox {
  id: string;
  name: string;
  currency: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export default function CashBoxesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: cashBoxes, add, remove, update } = useLocalTable<CashBox>('cashBoxes');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBox, setSelectedBox] = useState<CashBox | null>(null);
  const [formData, setFormData] = useState({ name: '', currency: 'YER', balance: '0' });

  const currencies = ['YER', 'USD', 'SAR'];

  const filteredBoxes = cashBoxes.filter((b: CashBox) => b.name?.includes(searchQuery));
  const totalBalance = cashBoxes.reduce((s: number, b: CashBox) => s + (b.balance || 0), 0);

  const handleSave = async () => {
    if (!formData.name) { Alert.alert('خطأ', 'الرجاء إدخال اسم الصندوق'); return; }
    
    if (editMode && selectedBox) {
      await update(selectedBox.id, formData);
    } else {
      await add({ ...formData, balance: parseFloat(formData.balance) || 0, isActive: true });
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (box: CashBox) => {
    Alert.alert('تأكيد الحذف', `هل تريد حذف "${box.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(box.id) },
    ]);
  };

  const resetForm = () => {
    setFormData({ name: '', currency: 'YER', balance: '0' });
    setSelectedBox(null);
    setEditMode(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>الصناديق</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث عن صندوق..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}>
          <Text style={styles.printBtnText}>🖨️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>إجمالي النقدية</Text>
        <Text style={styles.summaryValue}>{totalBalance.toLocaleString()} ﷼</Text>
        <Text style={styles.summarySub}>عدد الصناديق: {cashBoxes.length}</Text>
      </View>

      {filteredBoxes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyText}>لا توجد صناديق</Text>
          <Text style={styles.emptySubtext}>اضغط + لإضافة صندوق جديد</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBoxes}
          keyExtractor={(item: CashBox) => item.id}
          renderItem={({ item }: { item: CashBox }) => (
            <TouchableOpacity style={styles.boxCard} onPress={() => { setFormData({ name: item.name, currency: item.currency, balance: item.balance?.toString() }); setSelectedBox(item); setEditMode(true); setShowModal(true); }} onLongPress={() => handleDelete(item)}>
              <View style={styles.boxHeader}>
                <Text style={styles.boxIcon}>💰</Text>
                <View style={styles.boxInfo}>
                  <Text style={styles.boxName}>{item.name}</Text>
                  <Text style={styles.boxCurrency}>{item.currency}</Text>
                </View>
                <View style={styles.balanceContainer}>
                  <Text style={[styles.balanceValue, { color: (item.balance || 0) >= 0 ? '#10B981' : '#EF4444' }]}>
                    {(item.balance || 0).toLocaleString()} ﷼
                  </Text>
                </View>
              </View>
              <View style={styles.boxFooter}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => { setFormData({ name: item.name, currency: item.currency, balance: item.balance?.toString() }); setSelectedBox(item); setEditMode(true); setShowModal(true); }}>
                  <Text style={styles.actionBtnText}>✏️ تعديل</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnDel} onPress={() => handleDelete(item)}>
                  <Text style={styles.actionBtnText}>🗑️ حذف</Text>
                </TouchableOpacity>
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
              <Text style={styles.modalTitle}>{editMode ? 'تعديل صندوق' : 'إضافة صندوق جديد'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>اسم الصندوق *</Text>
              <TextInput style={styles.fieldInput} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="اسم الصندوق" placeholderTextColor="#666" />

              <Text style={styles.fieldLabel}>العملة</Text>
              <View style={styles.currencyRow}>
                {currencies.map(cur => (
                  <TouchableOpacity key={cur} style={[styles.currencyBtn, formData.currency === cur && styles.currencyBtnActive]} onPress={() => setFormData({ ...formData, currency: cur })}>
                    <Text style={[styles.currencyBtnText, formData.currency === cur && styles.currencyBtnTextActive]}>{cur}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>الرصيد الافتتاحي</Text>
              <TextInput style={styles.fieldInput} value={formData.balance} onChangeText={(v) => setFormData({ ...formData, balance: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />

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
  controlBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 10, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14 },
  printBtn: { backgroundColor: '#16213E', borderRadius: 10, padding: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#2a3550' },
  printBtnText: { fontSize: 18 },
  summaryCard: { marginHorizontal: 16, marginBottom: 16, padding: 20, backgroundColor: '#16213E', borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  summaryLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  summaryValue: { color: '#D4AF37', fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  summarySub: { color: '#6B7280', fontSize: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emptySubtext: { color: '#94a3b8', fontSize: 12 },
  boxCard: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  boxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  boxIcon: { fontSize: 28, marginRight: 10 },
  boxInfo: { flex: 1 },
  boxName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  boxCurrency: { color: '#94a3b8', fontSize: 12 },
  balanceContainer: {},
  balanceValue: { fontSize: 18, fontWeight: 'bold' },
  boxFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 10 },
  actionBtn: { backgroundColor: '#3B82F6' + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionBtnDel: { backgroundColor: '#EF4444' + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  currencyRow: { flexDirection: 'row', gap: 8 },
  currencyBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550' },
  currencyBtnActive: { backgroundColor: '#10B981' + '20', borderColor: '#10B981' },
  currencyBtnText: { color: '#94a3b8', fontSize: 13 },
  currencyBtnTextActive: { color: '#10B981', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
});
