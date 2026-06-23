import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function BanksScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', accountNumber: '', balance: '' });
  const listData: ListItem[] = [];

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'البنوك' : 'Banks', headerStyle: { backgroundColor: colors.section1 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => setModal(true)} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section1} emptyText={isRTL ? 'لا توجد بنوك' : 'No banks'} />
      <FormModal visible={modal} title={isRTL ? 'إضافة بنك' : 'Add Bank'} onClose={() => setModal(false)} onSave={() => setModal(false)} accentColor={colors.section1}>
        <FormField label={isRTL ? 'اسم البنك' : 'Bank Name'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} required />
        <FormField label={isRTL ? 'رقم الحساب' : 'Account Number'} value={form.accountNumber} onChangeText={v => setForm(f => ({ ...f, accountNumber: v }))} />
        <FormField label={isRTL ? 'الرصيد الابتدائي' : 'Opening Balance'} value={form.balance} onChangeText={v => setForm(f => ({ ...f, balance: v }))} keyboardType="numeric" />
      </FormModal>
    </View>
  );
}
