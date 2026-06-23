import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function CurrenciesScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const { currencies } = useDatabase();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', nameAr: '', symbol: '', rate: '' });

  const listData: ListItem[] = currencies.map(c => ({
    id: c.id, primary: isRTL ? c.nameAr : c.name, secondary: `${c.symbol} — ${c.code}`,
    badge: c.isDefault ? (isRTL ? 'افتراضي' : 'Default') : undefined, badgeColor: colors.success,
  }));

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'العملات' : 'Currencies', headerStyle: { backgroundColor: colors.section1 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => setModal(true)} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section1} />
      <FormModal visible={modal} title={isRTL ? 'إضافة عملة' : 'Add Currency'} onClose={() => setModal(false)} onSave={() => setModal(false)} accentColor={colors.section1}>
        <FormField label={isRTL ? 'الكود' : 'Code'} value={form.code} onChangeText={v => setForm(f => ({ ...f, code: v }))} />
        <FormField label={isRTL ? 'الاسم (عربي)' : 'Name (AR)'} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label={isRTL ? 'الرمز' : 'Symbol'} value={form.symbol} onChangeText={v => setForm(f => ({ ...f, symbol: v }))} />
        <FormField label={isRTL ? 'سعر الصرف' : 'Exchange Rate'} value={form.rate} onChangeText={v => setForm(f => ({ ...f, rate: v }))} keyboardType="numeric" />
      </FormModal>
    </View>
  );
}
