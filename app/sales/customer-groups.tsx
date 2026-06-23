import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function CustomerGroupsScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', nameAr: '' });
  const listData: ListItem[] = [];
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'مجموعات العملاء' : 'Customer Groups', headerStyle: { backgroundColor: colors.section3 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => setModal(true)} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section3} emptyText={isRTL ? 'لا توجد مجموعات' : 'No groups'} />
      <FormModal visible={modal} title={isRTL ? 'إضافة مجموعة' : 'Add Group'} onClose={() => setModal(false)} onSave={() => setModal(false)} accentColor={colors.section3}>
        <FormField label={isRTL ? 'الاسم (عربي)' : 'Name (AR)'} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label={isRTL ? 'الاسم (إنجليزي)' : 'Name (EN)'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
      </FormModal>
    </View>
  );
}
