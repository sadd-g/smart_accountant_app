import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable, YEMENI_CHART_OF_ACCOUNTS } from '../../hooks/useLocalStore';

interface Account {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  type: string;
  groupId: string;
  currency: string;
  balance: number;
  isMain: boolean;
  parentId: string | null;
  createdAt: string;
}

export default function AccountsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: accounts, add, remove, update, reload } = useLocalTable<Account>('accounts');
  const { data: groups } = useLocalTable('accountGroups');
  const { data: currencies } = useLocalTable('currencies');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('الكل');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isSubAccount, setIsSubAccount] = useState(false);

  // حقول الحساب الجديد
  const [newAccount, setNewAccount] = useState({
    name: '',
    nameEn: '',
    type: 'أصل',
    groupId: '',
    currency: 'YER',
    balance: '0',
    isMain: true,
    parentId: null as string | null,
  });

  const mainTypes = ['أصل', 'خصم', 'ملكية', 'إيراد', 'مصروف'];
  const currencyOptions = ['YER', 'USD', 'SAR', 'ALL'];

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'أصل': return '#D4AF37';
      case 'خصم': return '#EF4444';
      case 'ملكية': return '#3B82F6';
      case 'إيراد': return '#10B981';
      case 'مصروف': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'أصل': return '🏛️';
      case 'خصم': return '📋';
      case 'ملكية': return '👑';
      case 'إيراد': return '💰';
      case 'مصروف': return '📉';
      default: return '📄';
    }
  };

  const filteredAccounts = accounts.filter((acc: Account) => {
    const matchesSearch = (acc.name || '').includes(searchQuery) || (acc.code || '').includes(searchQuery);
    const matchesType = selectedGroup === 'الكل' || acc.type === selectedGroup;
    return matchesSearch && matchesType;
  });

  const mainAccounts = filteredAccounts.filter((a: Account) => a.isMain || !a.parentId);
  const subAccounts = (parentId: string) => filteredAccounts.filter((a: Account) => a.parentId === parentId);

  const handleAddAccount = async () => {
    if (!newAccount.name) {
      Alert.alert('خطأ', 'الرجاء إدخال اسم الحساب');
      return;
    }

    const parentAccount = isSubAccount && newAccount.parentId 
      ? accounts.find((a: Account) => a.id === newAccount.parentId)
      : null;

    const siblings = accounts.filter((a: Account) => 
      isSubAccount ? a.parentId === newAccount.parentId : a.type === newAccount.type && a.isMain
    );
    
    const code = parentAccount 
      ? `${parentAccount.code}${(siblings.length + 1).toString().padStart(2, '0')}`
      : `${mainTypes.indexOf(newAccount.type) + 1}${(siblings.length + 1).toString().padStart(2, '0')}`;

    await add({
      code,
      name: newAccount.name,
      nameEn: newAccount.nameEn || '',
      type: parentAccount ? parentAccount.type : newAccount.type,
      groupId: newAccount.groupId || '',
      currency: newAccount.currency,
      balance: parseFloat(newAccount.balance) || 0,
      isMain: !isSubAccount,
      parentId: isSubAccount ? newAccount.parentId : null,
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = async (account: Account) => {
    const hasSubAccounts = accounts.some((a: Account) => a.parentId === account.id);
    if (hasSubAccounts) {
      Alert.alert('تنبيه', 'لا يمكن حذف حساب يحتوي على حسابات فرعية');
      return;
    }

    Alert.alert('تأكيد الحذف', `هل تريد حذف "${account.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(account.id) },
    ]);
  };

  const resetForm = () => {
    setNewAccount({ name: '', nameEn: '', type: 'أصل', groupId: '', currency: 'YER', balance: '0', isMain: true, parentId: null });
    setIsSubAccount(false);
    setSelectedAccount(null);
  };

  const totalDebit = filteredAccounts.filter((a: Account) => ['أصل', 'مصروف'].includes(a.type)).reduce((s: number, a: Account) => s + (a.balance || 0), 0);
  const totalCredit = filteredAccounts.filter((a: Account) => ['خصم', 'ملكية', 'إيراد'].includes(a.type)).reduce((s: number, a: Account) => s + (a.balance || 0), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>دليل الحسابات</Text>
        <Text style={styles.count}>({accounts.length})</Text>
      </View>

      {/* شريط البحث وأزرار التحكم */}
      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => { resetForm(); setShowAddModal(true); }}>
            <Text style={styles.controlBtnText}>+ إضافة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => Alert.alert('طباعة', 'جاري تجهيز التقرير للطباعة')}>
            <Text style={styles.controlBtnText}>🖨️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* المجموعات الرئيسية */}
      <View style={styles.groupsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mainTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.groupCard, selectedGroup === type && styles.groupCardActive]}
              onPress={() => setSelectedGroup(selectedGroup === type ? 'الكل' : type)}
            >
              <Text style={styles.groupIcon}>{getTypeIcon(type)}</Text>
              <Text style={[styles.groupText, selectedGroup === type && styles.groupTextActive]}>{type}</Text>
              <Text style={[styles.groupCount, selectedGroup === type && styles.groupTextActive]}>
                {accounts.filter((a: Account) => a.type === type).length}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ملخص المدين والدائن */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>مدين</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>{totalDebit.toLocaleString()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>دائن</Text>
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{totalCredit.toLocaleString()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>الفرق</Text>
          <Text style={[styles.summaryValue, { color: '#D4AF37' }]}>{(totalDebit - totalCredit).toLocaleString()}</Text>
        </View>
      </View>

      {/* قائمة الحسابات */}
      {mainAccounts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>لا توجد حسابات</Text>
          <Text style={styles.emptySubtext}>اضغط + لإضافة حساب جديد</Text>
        </View>
      ) : (
        <FlatList
          data={mainAccounts}
          keyExtractor={(item: Account) => item.id}
          renderItem={({ item }: { item: Account }) => (
            <View>
              <TouchableOpacity
                style={[styles.accountCard, { borderRightColor: getTypeColor(item.type), borderRightWidth: 4 }]}
                onPress={() => { setSelectedAccount(item); setShowDetailModal(true); }}
                onLongPress={() => handleDelete(item)}
              >
                <View style={styles.accountHeader}>
                  <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]} />
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountCode}>{item.code}</Text>
                    <Text style={styles.accountName}>{item.name}</Text>
                    {item.nameEn ? <Text style={styles.accountNameEn}>{item.nameEn}</Text> : null}
                  </View>
                  <View style={styles.balanceContainer}>
                    <Text style={[styles.balanceValue, { color: (item.balance || 0) >= 0 ? '#10B981' : '#EF4444' }]}>
                      {(item.balance || 0).toLocaleString()}
                    </Text>
                    <Text style={styles.currencyText}>{item.currency}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { setNewAccount({ ...newAccount, type: item.type }); setSelectedAccount(item); setIsSubAccount(true); setNewAccount(prev => ({ ...prev, parentId: item.id })); setShowAddModal(true); }}>
                    <Text style={styles.subAddBtn}>+ فرعي</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              
              {/* الحسابات الفرعية */}
              {subAccounts(item.id).map((sub: Account) => (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.subAccountCard]}
                  onPress={() => { setSelectedAccount(sub); setShowDetailModal(true); }}
                  onLongPress={() => handleDelete(sub)}
                >
                  <Text style={styles.subAccountCode}>{sub.code}</Text>
                  <Text style={styles.subAccountName}>{sub.name}</Text>
                  <Text style={[styles.subBalance, { color: (sub.balance || 0) >= 0 ? '#10B981' : '#EF4444' }]}>
                    {(sub.balance || 0).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        />
      )}

      {/* Modal إضافة حساب */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isSubAccount ? `إضافة حساب فرعي لـ ${selectedAccount?.name || ''}` : 'إضافة حساب جديد'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {!isSubAccount && (
                <>
                  <Text style={styles.fieldLabel}>نوع الحساب</Text>
                  <View style={styles.typeSelector}>
                    {mainTypes.map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.typeBtn, newAccount.type === type && styles.typeBtnActive]}
                        onPress={() => setNewAccount({ ...newAccount, type })}
                      >
                        <Text style={[styles.typeBtnText, newAccount.type === type && styles.typeBtnTextActive]}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.fieldLabel}>اسم الحساب *</Text>
              <TextInput style={styles.fieldInput} value={newAccount.name} onChangeText={(v) => setNewAccount({ ...newAccount, name: v })} placeholder="اسم الحساب بالعربية" placeholderTextColor="#666" />

              <Text style={styles.fieldLabel}>اسم الحساب (إنجليزي) اختياري</Text>
              <TextInput style={styles.fieldInput} value={newAccount.nameEn} onChangeText={(v) => setNewAccount({ ...newAccount, nameEn: v })} placeholder="Account name" placeholderTextColor="#666" />

              <Text style={styles.fieldLabel}>العملة</Text>
              <View style={styles.currencySelector}>
                {currencyOptions.map(cur => (
                  <TouchableOpacity
                    key={cur}
                    style={[styles.currencyBtn, newAccount.currency === cur && styles.currencyBtnActive]}
                    onPress={() => setNewAccount({ ...newAccount, currency: cur })}
                  >
                    <Text style={[styles.currencyBtnText, newAccount.currency === cur && styles.currencyBtnTextActive]}>
                      {cur === 'ALL' ? 'الكل' : cur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>الرصيد الافتتاحي</Text>
              <TextInput style={styles.fieldInput} value={newAccount.balance} onChangeText={(v) => setNewAccount({ ...newAccount, balance: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />

              <TouchableOpacity style={styles.saveButton} onPress={handleAddAccount}>
                <Text style={styles.saveButtonText}>💾 حفظ</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal تفاصيل الحساب */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تفاصيل الحساب</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedAccount && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الكود</Text>
                  <Text style={styles.detailValue}>{selectedAccount.code}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الاسم</Text>
                  <Text style={styles.detailValue}>{selectedAccount.name}</Text>
                </View>
                {selectedAccount.nameEn ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>الاسم الإنجليزي</Text>
                    <Text style={styles.detailValue}>{selectedAccount.nameEn}</Text>
                  </View>
                ) : null}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>النوع</Text>
                  <Text style={[styles.detailValue, { color: getTypeColor(selectedAccount.type) }]}>{selectedAccount.type}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>العملة</Text>
                  <Text style={styles.detailValue}>{selectedAccount.currency}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الرصيد</Text>
                  <Text style={[styles.detailValue, { color: (selectedAccount.balance || 0) >= 0 ? '#10B981' : '#EF4444' }]}>
                    {(selectedAccount.balance || 0).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.detailActions}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}>
                    <Text style={styles.actionBtnText}>✏️ تعديل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF4444' }]} onPress={() => { setShowDetailModal(false); handleDelete(selectedAccount); }}>
                    <Text style={styles.actionBtnText}>🗑️ حذف</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.actionBtnText}>🖨️ طباعة</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  backBtn: { fontSize: 24, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', flex: 1 },
  count: { color: '#94a3b8', fontSize: 14 },
  controlBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 10, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14 },
  controlButtons: { flexDirection: 'row', gap: 4 },
  controlBtn: { backgroundColor: '#D4AF37' + '20', borderRadius: 10, padding: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37' + '40' },
  controlBtnText: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold' },
  groupsContainer: { marginBottom: 12 },
  groupCard: {
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, marginLeft: 8,
    backgroundColor: '#16213E', borderRadius: 12, borderWidth: 1, borderColor: '#2a3550',
    minWidth: 70,
  },
  groupCardActive: { backgroundColor: '#D4AF37' + '20', borderColor: '#D4AF37' },
  groupIcon: { fontSize: 20, marginBottom: 4 },
  groupText: { color: '#94a3b8', fontSize: 11 },
  groupTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  groupCount: { color: '#6B7280', fontSize: 10, marginTop: 2 },
  summary: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#16213E', borderRadius: 10, padding: 12, justifyContent: 'space-around', borderWidth: 1, borderColor: '#2a3550' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { color: '#94a3b8', fontSize: 11, marginBottom: 2 },
  summaryValue: { fontSize: 14, fontWeight: 'bold' },
  divider: { width: 1, backgroundColor: '#2a3550' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emptySubtext: { color: '#94a3b8', fontSize: 12 },
  accountCard: { backgroundColor: '#16213E', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a3550' },
  accountHeader: { flexDirection: 'row', alignItems: 'center' },
  typeIndicator: { width: 3, height: 40, borderRadius: 2, marginRight: 10 },
  accountInfo: { flex: 1 },
  accountCode: { color: '#94a3b8', fontSize: 10 },
  accountName: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  accountNameEn: { color: '#6B7280', fontSize: 11, fontStyle: 'italic' },
  balanceContainer: { alignItems: 'flex-end', marginRight: 8 },
  balanceValue: { fontSize: 14, fontWeight: 'bold' },
  currencyText: { color: '#6B7280', fontSize: 10 },
  subAddBtn: { color: '#10B981', fontSize: 11, fontWeight: 'bold', padding: 4, backgroundColor: '#10B98120', borderRadius: 6 },
  subAccountCard: {
    flexDirection: 'row', alignItems: 'center', marginLeft: 24, marginBottom: 4,
    backgroundColor: '#1a2240', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#2a3550',
  },
  subAccountCode: { color: '#94a3b8', fontSize: 11, width: 50 },
  subAccountName: { color: '#FFFFFF', fontSize: 13, flex: 1 },
  subBalance: { fontSize: 13, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550' },
  typeBtnActive: { backgroundColor: '#D4AF37' + '30', borderColor: '#D4AF37' },
  typeBtnText: { color: '#94a3b8', fontSize: 12 },
  typeBtnTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  currencySelector: { flexDirection: 'row', gap: 6 },
  currencyBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550' },
  currencyBtnActive: { backgroundColor: '#10B981' + '30', borderColor: '#10B981' },
  currencyBtnText: { color: '#94a3b8', fontSize: 12 },
  currencyBtnTextActive: { color: '#10B981', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  detailLabel: { color: '#94a3b8', fontSize: 14 },
  detailValue: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  detailActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, gap: 8 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
});
