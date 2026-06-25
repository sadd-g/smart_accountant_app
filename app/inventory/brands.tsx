import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface Brand { id: string; name: string; nameEn: string; }

export default function BrandsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: brands, add, remove } = useLocalTable<Brand>('brands');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', nameEn: '' });

  const filtered = brands.filter((b: Brand) => b.name?.includes(searchQuery));

  const handleSave = async () => {
    if (!formData.name) { Alert.alert('خطأ', 'الرجاء إدخال اسم الماركة'); return; }
    await add(formData);
    setShowModal(false); setFormData({ name: '', nameEn: '' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>الماركات ({brands.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>
      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>⭐</Text><Text style={styles.emptyText}>لا توجد ماركات</Text></View>
      ) : (
        <FlatList data={filtered} keyExtractor={(i: Brand) => i.id} renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => { Alert.alert('حذف', `حذف "${item.name}"؟`, [{ text: 'حذف', style: 'destructive', onPress: () => remove(item.id) }, { text: 'إلغاء' }]); }}>
            <Text style={styles.cardName}>{item.name}</Text>
            {item.nameEn ? <Text style={styles.cardEn}>{item.nameEn}</Text> : null}
          </TouchableOpacity>
        )} contentContainerStyle={{ padding: 16 }} />
      )}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>إضافة ماركة</Text><TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>اسم الماركة *</Text>
              <TextInput style={styles.fieldInput} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="اسم الماركة" placeholderTextColor="#666" />
              <Text style={styles.fieldLabel}>الاسم بالإنجليزي</Text>
              <TextInput style={styles.fieldInput} value={formData.nameEn} onChangeText={(v) => setFormData({ ...formData, nameEn: v })} placeholder="Brand name" placeholderTextColor="#666" />
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}><Text style={styles.saveModalBtnText}>💾 حفظ</Text></TouchableOpacity>
            </View>
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
  controlBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 },
  searchInput: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 10, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#16213E', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  cardName: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  cardEn: { color: '#94a3b8', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  saveModalBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
