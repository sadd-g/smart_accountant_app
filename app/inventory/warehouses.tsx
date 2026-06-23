import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function WarehousesScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', nameAr: '', location: '' });
  const listData: ListItem[] = [
    { id: '1', primary: isRTL ? 'المستودع الرئيسي' : 'Main Warehouse', secondary: isRTL ? 'الموقع: المركزي' : 'Location: Central' },
  ];
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'المستودعات' : 'Warehouses', headerStyle: { backgroundColor: colors.section2 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => setModal(true)} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section2} />
      <FormModal visible={modal} title={isRTL ? 'إضافة مستودع' : 'Add Warehouse'} onClose={() => setModal(false)} onSave={() => setModal(false)} accentColor={colors.section2}>
        <FormField label={isRTL ? 'اسم المستودع (عربي)' : 'Name (AR)'} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label={isRTL ? 'اسم المستودع (إنجليزي)' : 'Name (EN)'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
        <FormField label={isRTL ? 'الموقع' : 'Location'} value={form.location} onChangeText={v => setForm(f => ({ ...f, location: v }))} />
      </FormModal>
    </View>
  );
}
