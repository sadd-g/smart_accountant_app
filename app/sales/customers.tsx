import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function CustomersScreen() {
  const colors = useColors();
  const { isRTL, t } = useApp();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameAr: '', phone: '', address: '', groupId: '', balance: 0, creditLimit: 0, accountId: '', notes: '' });

  const listData: ListItem[] = customers.map(c => ({
    id: c.id,
    primary: isRTL ? c.nameAr || c.name : c.name,
    secondary: c.phone,
    badge: c.balance.toLocaleString(),
    badgeColor: c.balance >= 0 ? colors.success : colors.destructive,
  }));

  const openAdd = () => { setEditId(null); setForm({ name: '', nameAr: '', phone: '', address: '', groupId: '', balance: 0, creditLimit: 0, accountId: '', notes: '' }); setModalVisible(true); };
  const openEdit = (item: ListItem) => {
    const c = customers.find(c => c.id === item.id);
    if (!c) return;
    setEditId(c.id);
    setForm({ name: c.name, nameAr: c.nameAr, phone: c.phone, address: c.address, groupId: c.groupId, balance: c.balance, creditLimit: c.creditLimit, accountId: c.accountId || '', notes: c.notes });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nameAr && !form.name) return Alert.alert('', isRTL ? 'الاسم مطلوب' : 'Name required');
    if (editId) { await updateCustomer(editId, form); } else {
      const ok = await addCustomer(form);
      if (!ok) return Alert.alert('⚠️', t.common.duplicate);
    }
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'العملاء' : 'Customers', headerStyle: { backgroundColor: colors.section3 }, headerTintColor: '#fff' }} />
      <ListScreen title={isRTL ? 'العملاء' : 'Customers'} data={listData} onAdd={openAdd} onEdit={openEdit} onDelete={item => deleteCustomer(item.id)} accentColor={colors.section3} emptyText={isRTL ? 'لا يوجد عملاء' : 'No customers'} />
      <FormModal visible={modalVisible} title={isRTL ? (editId ? 'تعديل عميل' : 'إضافة عميل') : (editId ? 'Edit Customer' : 'Add Customer')} onClose={() => setModalVisible(false)} onSave={handleSave} accentColor={colors.section3}>
        <FormField label={isRTL ? 'الاسم (عربي)' : 'Name (AR)'} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label={isRTL ? 'الاسم (إنجليزي)' : 'Name (EN)'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
        <FormField label={isRTL ? 'الهاتف' : 'Phone'} value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />
        <FormField label={isRTL ? 'العنوان' : 'Address'} value={form.address} onChangeText={v => setForm(f => ({ ...f, address: v }))} multiline />
        <FormField label={isRTL ? 'حد الائتمان' : 'Credit Limit'} value={form.creditLimit.toString()} onChangeText={v => setForm(f => ({ ...f, creditLimit: parseFloat(v) || 0 }))} keyboardType="numeric" />
        <FormField label={isRTL ? 'ملاحظات' : 'Notes'} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} multiline />
      </FormModal>
    </View>
  );
}
