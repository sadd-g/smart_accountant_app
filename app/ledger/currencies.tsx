import { ControlButtons, ControlHeader } from '../../src/components/ui/ControlButtons';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault: boolean;
}

export default function CurrenciesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: currencies, add, remove, update } = useLocalTable<Currency>('currencies');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', symbol: '', rate: '1', isDefault: false });

  const filtered = currencies.filter((c: Currency) => 
    c.name?.includes(searchQuery) || c.code?.includes(searchQuery)
  );

  const handleSave = async () => {
    if (!formData.code || !formData.name) { Alert.alert('خطأ', 'الرجاء إدخال الكود والاسم'); return; }
    
    if (editMode && selectedCurrency) {
      await update(selectedCurrency.id, { ...formData, rate: parseFloat(formData.rate) || 1 });
    } else {
      await add({ ...formData, rate: parseFloat(formData.rate) || 1 });
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (currency: Currency) => {
    if (currency.isDefault) { Alert.alert('تنبيه', 'لا يمكن حذف العملة الأساسية'); return; }
    Alert.alert('تأكيد الحذف', `هل تريد حذف "${currency.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(currency.id) },
    ]);
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', symbol: '', rate: '1', isDefault: false });
    setSelectedCurrency(null);
    setEditMode(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>العملات</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث عن عملة..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}>
          <Text style={styles.printBtnText}>🖨️</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💱</Text>
          <Text style={styles.emptyText}>لا توجد عملات</Text>
          <Text style={styles.emptySubtext}>اضغط + لإضافة عملة جديدة</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: Currency) => item.id}
          renderItem={({ item }: { item: Currency }) => (
            <TouchableOpacity style={[styles.currencyCard, item.isDefault && styles.defaultCard]} onPress={() => { setFormData({ code: item.code, name: item.name, symbol: item.symbol, rate: item.rate?.toString(), isDefault: item.isDefault }); setSelectedCurrency(item); setEditMode(true); setShowModal(true); }} onLongPress={() => handleDelete(item)}>
              <View style={styles.currencyHeader}>
                <View style={styles.symbolCircle}>
                  <Text style={styles.symbolText}>{item.symbol}</Text>
                </View>
                <View style={styles.currencyInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.currencyName}>{item.name}</Text>
                    {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>أساسي</Text></View>}
                  </View>
                  <Text style={styles.currencyCode}>{item.code}</Text>
                </View>
                <View style={styles.rateContainer}>
                  <Text style={styles.rateValue}>1 = {item.rate?.toLocaleString()} ﷼</Text>
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
              <Text style={styles.modalTitle}>{editMode ? 'تعديل عملة' : 'إضافة عملة جديدة'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>كود العملة *</Text>
              <TextInput style={styles.fieldInput} value={formData.code} onChangeText={(v) => setFormData({ ...formData, code: v.toUpperCase() })} placeholder="مثال: USD" placeholderTextColor="#666" autoCapitalize="characters" maxLength={4} />

              <Text style={styles.fieldLabel}>اسم العملة *</Text>
              <TextInput style={styles.fieldInput} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="مثال: دولار أمريكي" placeholderTextColor="#666" />

              <Text style={styles.fieldLabel}>الرمز</Text>
              <TextInput style={styles.fieldInput} value={formData.symbol} onChangeText={(v) => setFormData({ ...formData, symbol: v })} placeholder="مثال: $" placeholderTextColor="#666" />

              <Text style={styles.fieldLabel}>سعر الصرف (مقابل الريال اليمني)</Text>
              <TextInput style={styles.fieldInput} value={formData.rate} onChangeText={(v) => setFormData({ ...formData, rate: v })} keyboardType="numeric" placeholder="1" placeholderTextColor="#666" />

              <TouchableOpacity style={styles.defaultToggle} onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}>
                <Text style={styles.defaultToggleText}>{formData.isDefault ? '✅' : '⬜'} عملة أساسية</Text>
              </TouchableOpacity>

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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emptySubtext: { color: '#94a3b8', fontSize: 12 },
  currencyCard: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  defaultCard: { borderColor: '#D4AF37', borderWidth: 2 },
  currencyHeader: { flexDirection: 'row', alignItems: 'center' },
  symbolCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#D4AF37' + '20', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  symbolText: { fontSize: 18, color: '#D4AF37', fontWeight: 'bold' },
  currencyInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  currencyName: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginRight: 6 },
  defaultBadge: { backgroundColor: '#D4AF37' + '30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  defaultText: { color: '#D4AF37', fontSize: 9, fontWeight: 'bold' },
  currencyCode: { color: '#94a3b8', fontSize: 12 },
  rateContainer: {},
  rateValue: { color: '#10B981', fontSize: 13, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  defaultToggle: { paddingVertical: 12, marginTop: 16, alignItems: 'center' },
  defaultToggleText: { color: '#FFFFFF', fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
});
