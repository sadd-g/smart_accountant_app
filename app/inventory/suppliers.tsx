import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function SuppliersScreen() {
  const colors = useColors();
  const { isRTL, t } = useApp();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameAr: '', phone: '', address: '', balance: 0, accountId: '', notes: '' });

  const listData: ListItem[] = suppliers.map(s => ({
    id: s.id,
    primary: isRTL ? s.nameAr || s.name : s.name,
    secondary: s.phone,
    badge: s.balance.toLocaleString(),
    badgeColor: s.balance >= 0 ? colors.success : colors.destructive,
  }));

  const openAdd = () => { setEditId(null); setForm({ name: '', nameAr: '', phone: '', address: '', balance: 0, accountId: '', notes: '' }); setModalVisible(true); };
  const openEdit = (item: ListItem) => {
    const s = suppliers.find(s => s.id === item.id);
    if (!s) return;
    setEditId(s.id);
    setForm({ name: s.name, nameAr: s.nameAr, phone: s.phone, address: s.address, balance: s.balance, accountId: s.accountId || '', notes: s.notes });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nameAr && !form.name) return Alert.alert('', isRTL ? 'الاسم مطلوب' : 'Name required');
    if (editId) { await updateSupplier(editId, form); } else {
      const ok = await addSupplier(form);
      if (!ok) return Alert.alert('⚠️', t.common.duplicate);
    }
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'الموردون' : 'Suppliers', headerStyle: { backgroundColor: colors.section2 }, headerTintColor: '#fff' }} />
      <ListScreen title={isRTL ? 'الموردون' : 'Suppliers'} data={listData} onAdd={openAdd} onEdit={openEdit} onDelete={item => deleteSupplier(item.id)} accentColor={colors.section2} />
      <FormModal visible={modalVisible} title={isRTL ? (editId ? 'تعديل مورد' : 'إضافة مورد') : (editId ? 'Edit Supplier' : 'Add Supplier')} onClose={() => setModalVisible(false)} onSave={handleSave} accentColor={colors.section2}>
        <FormField label={isRTL ? 'الاسم (عربي)' : 'Name (AR)'} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label={isRTL ? 'الاسم (إنجليزي)' : 'Name (EN)'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
        <FormField label={isRTL ? 'الهاتف' : 'Phone'} value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />
        <FormField label={isRTL ? 'العنوان' : 'Address'} value={form.address} onChangeText={v => setForm(f => ({ ...f, address: v }))} multiline />
        <FormField label={isRTL ? 'ملاحظات' : 'Notes'} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} multiline />
      </FormModal>
    </View>
  );
}
