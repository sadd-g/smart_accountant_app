import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface Bank {
  id: string;
  name: string;
  accountNumber: string;
  type: 'bank' | 'wallet';
  provider: string;
  phone: string;
  balance: number;
  currency: string;
  createdAt: string;
}

export default function BanksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: banks, add, remove, update } = useLocalTable<Bank>('banks');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'bank' | 'wallet'>('bank');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [formData, setFormData] = useState({
    name: '', accountNumber: '', type: 'bank' as 'bank' | 'wallet',
    provider: '', phone: '', balance: '0', currency: 'YER'
  });

  const filtered = banks.filter((b: Bank) => 
    b.type === activeTab && (b.name?.includes(searchQuery) || b.accountNumber?.includes(searchQuery))
  );

  const totalBankBalance = banks.filter((b: Bank) => b.type === 'bank').reduce((s: number, b: Bank) => s + (b.balance || 0), 0);
  const totalWalletBalance = banks.filter((b: Bank) => b.type === 'wallet').reduce((s: number, b: Bank) => s + (b.balance || 0), 0);

  const handleSave = async () => {
    if (!formData.name) { Alert.alert('خطأ', 'الرجاء إدخال الاسم'); return; }
    
    if (editMode && selectedBank) {
      await update(selectedBank.id, { ...formData, balance: parseFloat(formData.balance) || 0 });
    } else {
      await add({ ...formData, balance: parseFloat(formData.balance) || 0 });
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (bank: Bank) => {
    Alert.alert('تأكيد الحذف', `هل تريد حذف "${bank.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(bank.id) },
    ]);
  };

  const resetForm = () => {
    setFormData({ name: '', accountNumber: '', type: activeTab, provider: '', phone: '', balance: '0', currency: 'YER' });
    setSelectedBank(null);
    setEditMode(false);
  };

  const providers = ['يمن موبايل', 'سبأفون', 'يمن فون', 'عدن نت', 'ام تي ان'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>البنوك والمحافظ</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setFormData({ ...formData, type: activeTab }); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* التبويبات */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'bank' && styles.tabActive]} onPress={() => setActiveTab('bank')}>
          <Text style={[styles.tabText, activeTab === 'bank' && styles.tabTextActive]}>🏦 البنوك</Text>
          <Text style={[styles.tabBalance, activeTab === 'bank' && styles.tabTextActive]}>{totalBankBalance.toLocaleString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'wallet' && styles.tabActive]} onPress={() => setActiveTab('wallet')}>
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.tabTextActive]}>📱 المحافظ</Text>
          <Text style={[styles.tabBalance, activeTab === 'wallet' && styles.tabTextActive]}>{totalWalletBalance.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}>
          <Text style={styles.printBtnText}>🖨️</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>{activeTab === 'bank' ? '🏦' : '📱'}</Text>
          <Text style={styles.emptyText}>لا توجد {activeTab === 'bank' ? 'بنوك' : 'محافظ'}</Text>
          <Text style={styles.emptySubtext}>اضغط + للإضافة</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: Bank) => item.id}
          renderItem={({ item }: { item: Bank }) => (
            <TouchableOpacity style={styles.card} onPress={() => { setFormData({ name: item.name, accountNumber: item.accountNumber || '', type: item.type, provider: item.provider || '', phone: item.phone || '', balance: item.balance?.toString() || '0', currency: item.currency || 'YER' }); setSelectedBank(item); setEditMode(true); setShowModal(true); }} onLongPress={() => handleDelete(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{item.type === 'bank' ? '🏦' : '📱'}</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardDetail}>{item.type === 'bank' ? (item.accountNumber || 'بدون رقم حساب') : (item.provider || '')}</Text>
                  {item.phone ? <Text style={styles.cardPhone}>{item.phone}</Text> : null}
                </View>
                <Text style={[styles.cardBalance, { color: (item.balance || 0) >= 0 ? '#10B981' : '#EF4444' }]}>
{(item as any).balance} ر.س
                </Text>
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
              <Text style={styles.modalTitle}>{editMode ? 'تعديل' : 'إضافة'} {activeTab === 'bank' ? 'بنك' : 'محفظة'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>الاسم *</Text>
              <TextInput style={styles.fieldInput} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="الاسم" placeholderTextColor="#666" />

              {activeTab === 'bank' ? (
                <View>
                  <Text style={styles.fieldLabel}>رقم الحساب</Text>
                  <TextInput style={styles.fieldInput} value={formData.accountNumber} onChangeText={(v) => setFormData({ ...formData, accountNumber: v })} placeholder="رقم الحساب" placeholderTextColor="#666" keyboardType="numeric" />
                </View>
              ) : (
                <View>
                  <Text style={styles.fieldLabel}>مزود الخدمة</Text>
                  <View style={styles.providerRow}>
                    {providers.map(p => (
                      <TouchableOpacity key={p} style={[styles.providerBtn, formData.provider === p && styles.providerBtnActive]} onPress={() => setFormData({ ...formData, provider: p })}>
                        <Text style={[styles.providerBtnText, formData.provider === p && styles.providerBtnTextActive]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.fieldLabel}>رقم الهاتف</Text>
                  <TextInput style={styles.fieldInput} value={formData.phone} onChangeText={(v) => setFormData({ ...formData, phone: v })} placeholder="رقم الهاتف" placeholderTextColor="#666" keyboardType="phone-pad" />
                </View>
              )}

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
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 8 },
  tab: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  tabActive: { backgroundColor: '#D4AF37' + '20', borderColor: '#D4AF37' },
  tabText: { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
  tabTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  tabBalance: { color: '#6B7280', fontSize: 14, fontWeight: 'bold' },
  controlBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 10, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14 },
  printBtn: { backgroundColor: '#16213E', borderRadius: 10, padding: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#2a3550' },
  printBtnText: { fontSize: 18 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emptySubtext: { color: '#94a3b8', fontSize: 12 },
  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { fontSize: 28, marginRight: 10 },
  cardInfo: { flex: 1 },
  cardName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  cardDetail: { color: '#94a3b8', fontSize: 12, marginBottom: 2 },
  cardPhone: { color: '#6B7280', fontSize: 11 },
  cardBalance: { fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  providerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  providerBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550' },
  providerBtnActive: { backgroundColor: '#D4AF37' + '20', borderColor: '#D4AF37' },
  providerBtnText: { color: '#94a3b8', fontSize: 11 },
  providerBtnTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
});
