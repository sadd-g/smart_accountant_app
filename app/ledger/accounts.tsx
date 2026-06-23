import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import { useApp } from '../../context/AppContext';
import type { Account } from '../../context/DatabaseContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function AccountsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useApp();
  const { accounts, accountGroups, currencies, addAccount, updateAccount, deleteAccount } = useDatabase();
  const color = colors.section1;

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', nameAr: '', groupId: '1', type: 'asset' as Account['type'],
    currencyId: '1', notes: '', balance: '0', isActive: true,
  });
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // Compute auto-code preview based on group
  const autoCodePreview = useMemo(() => {
    const group = accountGroups.find(g => g.id === form.groupId);
    if (!group) return '—';
    const prefix = group.code || group.id;
    const siblings = accounts.filter(a => a.groupId === form.groupId);
    const nextNum = (siblings.length + 1).toString().padStart(3, '0');
    return `${prefix}${nextNum}`;
  }, [form.groupId, accounts, accountGroups]);

  const accountTypes: { value: Account['type']; labelAr: string; labelEn: string }[] = [
    { value: 'asset', labelAr: 'أصول', labelEn: 'Asset' },
    { value: 'liability', labelAr: 'التزامات', labelEn: 'Liability' },
    { value: 'equity', labelAr: 'حقوق الملكية', labelEn: 'Equity' },
    { value: 'income', labelAr: 'إيرادات', labelEn: 'Income' },
    { value: 'expense', labelAr: 'مصروفات', labelEn: 'Expense' },
  ];

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.trim().toLowerCase();
    return accounts.filter(a =>
      a.code?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q) ||
      a.nameAr?.includes(q)
    );
  }, [accounts, search]);

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', nameAr: '', groupId: accountGroups[0]?.id || '1', type: 'asset', currencyId: currencies[0]?.id || '1', notes: '', balance: '0', isActive: true });
    setShowGroupPicker(false);
    setShowTypePicker(false);
    setShowCurrencyPicker(false);
    setModalVisible(true);
  };

  const openEdit = (acc: Account) => {
    setEditId(acc.id);
    setForm({ name: acc.name, nameAr: acc.nameAr, groupId: acc.groupId, type: acc.type, currencyId: acc.currencyId, notes: acc.notes, balance: acc.balance.toString(), isActive: acc.isActive });
    setShowGroupPicker(false);
    setShowTypePicker(false);
    setShowCurrencyPicker(false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nameAr && !form.name) return Alert.alert('', isRTL ? 'الاسم مطلوب' : 'Name required');
    if (editId) {
      await updateAccount(editId, {
        name: form.name, nameAr: form.nameAr, groupId: form.groupId,
        type: form.type, currencyId: form.currencyId, notes: form.notes,
        balance: parseFloat(form.balance) || 0, isActive: form.isActive,
      });
    } else {
      const ok = await addAccount({
        name: form.name, nameAr: form.nameAr, groupId: form.groupId, type: form.type,
        currencyId: form.currencyId, notes: form.notes, balance: parseFloat(form.balance) || 0, isActive: true,
      });
      if (!ok) return Alert.alert('⚠️', t.common.duplicate);
    }
    setModalVisible(false);
  };

  const handleDelete = (acc: Account) => {
    Alert.alert(
      isRTL ? 'حذف الحساب' : 'Delete Account',
      isRTL ? `هل تريد حذف "${acc.nameAr}"؟` : `Delete "${acc.name}"?`,
      [{ text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' }, { text: isRTL ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteAccount(acc.id) }]
    );
  };

  const selectedGroup = accountGroups.find(g => g.id === form.groupId);
  const selectedCurrency = currencies.find(c => c.id === form.currencyId);
  const selectedType = accountTypes.find(tp => tp.value === form.type);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'الحسابات' : 'Accounts', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />

      {/* Search + Add Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={isRTL ? 'بحث بالرقم أو الاسم...' : 'Search by code or name...'}
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: color }]} onPress={openAdd}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Summary bar */}
      <View style={[styles.summaryBar, { backgroundColor: color + '10', borderBottomColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
          {isRTL ? `${filtered.length} حساب` : `${filtered.length} accounts`}
        </Text>
        <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
          {isRTL ? `إجمالي الأرصدة: ${accounts.reduce((s, a) => s + a.balance, 0).toLocaleString()}` : `Total: ${accounts.reduce((s, a) => s + a.balance, 0).toLocaleString()}`}
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={a => a.id}
        contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>
              {search ? (isRTL ? 'لا نتائج' : 'No results') : (isRTL ? 'لا توجد حسابات' : 'No accounts')}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const group = accountGroups.find(g => g.id === item.groupId);
          return (
            <TouchableOpacity
              style={[styles.accCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => openEdit(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.accRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.codeBox, { backgroundColor: color + '14' }]}>
                  <Text style={[styles.codeText, { color: color }]}>{item.code}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }}>
                  <Text style={[styles.accName, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? item.nameAr || item.name : item.name || item.nameAr}
                  </Text>
                  <Text style={[styles.accGroup, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? group?.nameAr || '' : group?.name || ''}
                  </Text>
                </View>
                <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                  <Text style={[styles.accBalance, { color: item.balance >= 0 ? colors.success : colors.destructive }]}>
                    {item.balance.toLocaleString()}
                  </Text>
                  {!item.isActive && (
                    <Text style={[styles.inactiveTag, { color: colors.mutedForeground }]}>
                      {isRTL ? 'غير نشط' : 'Inactive'}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <FormModal
        visible={modalVisible}
        title={isRTL ? (editId ? 'تعديل حساب' : 'إضافة حساب') : (editId ? 'Edit Account' : 'Add Account')}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        accentColor={color}
      >
        {/* Auto-code preview */}
        {!editId && (
          <View style={[styles.codePreview, { backgroundColor: color + '10', borderColor: color }]}>
            <Ionicons name="code-slash-outline" size={16} color={color} />
            <Text style={[styles.codePreviewText, { color: color }]}>
              {isRTL ? `الكود المقترح: ${autoCodePreview}` : `Auto code: ${autoCodePreview}`}
            </Text>
          </View>
        )}

        <FormField label={isRTL ? 'اسم الحساب (عربي) *' : 'Account Name (AR) *'} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label={isRTL ? 'اسم الحساب (إنجليزي)' : 'Account Name (EN)'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />

        {/* Group picker */}
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{isRTL ? 'المجموعة *' : 'Group *'}</Text>
        <TouchableOpacity style={[styles.selectBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setShowGroupPicker(!showGroupPicker)}>
          <Text style={{ color: colors.foreground, flex: 1 }}>{isRTL ? selectedGroup?.nameAr : selectedGroup?.name}</Text>
          <Ionicons name={showGroupPicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
        {showGroupPicker && (
          <View style={[styles.pickerList, { borderColor: colors.border }]}>
            {accountGroups.map(g => (
              <TouchableOpacity key={g.id} style={[styles.pickerItem, { borderBottomColor: colors.border }, g.id === form.groupId && { backgroundColor: color + '12' }]}
                onPress={() => { setForm(f => ({ ...f, groupId: g.id })); setShowGroupPicker(false); }}>
                <Text style={{ color: colors.foreground }}>{isRTL ? g.nameAr : g.name}</Text>
                {g.id === form.groupId && <Ionicons name="checkmark" size={16} color={color} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Type picker */}
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{isRTL ? 'النوع *' : 'Type *'}</Text>
        <TouchableOpacity style={[styles.selectBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setShowTypePicker(!showTypePicker)}>
          <Text style={{ color: colors.foreground, flex: 1 }}>{isRTL ? selectedType?.labelAr : selectedType?.labelEn}</Text>
          <Ionicons name={showTypePicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
        {showTypePicker && (
          <View style={[styles.pickerList, { borderColor: colors.border }]}>
            {accountTypes.map(tp => (
              <TouchableOpacity key={tp.value} style={[styles.pickerItem, { borderBottomColor: colors.border }, tp.value === form.type && { backgroundColor: color + '12' }]}
                onPress={() => { setForm(f => ({ ...f, type: tp.value })); setShowTypePicker(false); }}>
                <Text style={{ color: colors.foreground }}>{isRTL ? tp.labelAr : tp.labelEn}</Text>
                {tp.value === form.type && <Ionicons name="checkmark" size={16} color={color} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Currency picker */}
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{isRTL ? 'العملة' : 'Currency'}</Text>
        <TouchableOpacity style={[styles.selectBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}>
          <Text style={{ color: colors.foreground, flex: 1 }}>{selectedCurrency?.nameAr || selectedCurrency?.name || '—'}</Text>
          <Ionicons name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
        {showCurrencyPicker && (
          <View style={[styles.pickerList, { borderColor: colors.border }]}>
            {currencies.map(c => (
              <TouchableOpacity key={c.id} style={[styles.pickerItem, { borderBottomColor: colors.border }, c.id === form.currencyId && { backgroundColor: color + '12' }]}
                onPress={() => { setForm(f => ({ ...f, currencyId: c.id })); setShowCurrencyPicker(false); }}>
                <Text style={{ color: colors.foreground }}>{isRTL ? c.nameAr : c.name} ({c.symbol})</Text>
                {c.id === form.currencyId && <Ionicons name="checkmark" size={16} color={color} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <FormField label={isRTL ? 'الرصيد الافتتاحي' : 'Opening Balance'} value={form.balance} onChangeText={v => setForm(f => ({ ...f, balance: v }))} keyboardType="numeric" />
        <FormField label={isRTL ? 'ملاحظات' : 'Notes'} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} multiline />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8, borderBottomWidth: 1 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  addBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1 },
  summaryText: { fontSize: 12 },
  empty: { alignItems: 'center', marginTop: 60 },
  accCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  accRow: { alignItems: 'center', gap: 8 },
  codeBox: { width: 52, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  codeText: { fontSize: 12, fontWeight: '800' },
  accName: { fontSize: 14, fontWeight: '600' },
  accGroup: { fontSize: 12, marginTop: 2 },
  accBalance: { fontSize: 14, fontWeight: '700' },
  inactiveTag: { fontSize: 11 },
  deleteBtn: { padding: 6 },
  codePreview: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  codePreviewText: { fontSize: 13, fontWeight: '700' },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 4 },
  pickerList: { borderWidth: 1, borderRadius: 10, marginBottom: 8, overflow: 'hidden' },
  pickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 0.5 },
});
