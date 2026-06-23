import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function CategoriesScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', nameAr: '' });
  const listData: ListItem[] = [];
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'الفئات' : 'Categories', headerStyle: { backgroundColor: colors.section2 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => setModal(true)} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section2} emptyText={isRTL ? 'لا توجد فئات' : 'No categories'} />
      <FormModal visible={modal} title={isRTL ? 'إضافة فئة' : 'Add Category'} onClose={() => setModal(false)} onSave={() => setModal(false)} accentColor={colors.section2}>
        <FormField label={isRTL ? 'الاسم (عربي)' : 'Name (AR)'} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label={isRTL ? 'الاسم (إنجليزي)' : 'Name (EN)'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
      </FormModal>
    </View>
  );
}
