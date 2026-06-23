import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function CashBoxesScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', balance: '' });

  const listData: ListItem[] = [
    { id: '1', primary: isRTL ? 'الصندوق الرئيسي' : 'Main Cash Box', secondary: isRTL ? 'رصيد: 0' : 'Balance: 0' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'الصناديق' : 'Cash Boxes', headerStyle: { backgroundColor: colors.section1 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => setModal(true)} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section1} />
      <FormModal visible={modal} title={isRTL ? 'إضافة صندوق' : 'Add Cash Box'} onClose={() => setModal(false)} onSave={() => setModal(false)} accentColor={colors.section1}>
        <FormField label={isRTL ? 'اسم الصندوق' : 'Box Name'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} required />
        <FormField label={isRTL ? 'الرصيد الابتدائي' : 'Opening Balance'} value={form.balance} onChangeText={v => setForm(f => ({ ...f, balance: v }))} keyboardType="numeric" />
      </FormModal>
    </View>
  );
}
