import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { AccountGroup, useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function AccountGroupsScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const { accountGroups } = useDatabase();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', nameAr: '', type: '' });

  const listData: ListItem[] = accountGroups.map(g => ({
    id: g.id, primary: isRTL ? g.nameAr : g.name, secondary: g.code,
  }));

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'مجموعات الحسابات' : 'Account Groups', headerStyle: { backgroundColor: colors.section1 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => setModal(true)} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section1} emptyText={isRTL ? 'لا توجد مجموعات' : 'No groups'} />
      <FormModal visible={modal} title={isRTL ? 'إضافة مجموعة' : 'Add Group'} onClose={() => setModal(false)} onSave={() => setModal(false)} accentColor={colors.section1}>
        <FormField label={isRTL ? 'الكود' : 'Code'} value={form.code} onChangeText={v => setForm(f => ({ ...f, code: v }))} />
        <FormField label={isRTL ? 'الاسم (عربي)' : 'Name (AR)'} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label={isRTL ? 'الاسم (إنجليزي)' : 'Name (EN)'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
      </FormModal>
    </View>
  );
}
