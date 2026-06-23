import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function EWalletsScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', balance: '' });
  const listData: ListItem[] = [];

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'المحافظ الإلكترونية' : 'E-Wallets', headerStyle: { backgroundColor: colors.section1 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => setModal(true)} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section1} emptyText={isRTL ? 'لا توجد محافظ' : 'No wallets'} />
      <FormModal visible={modal} title={isRTL ? 'إضافة محفظة' : 'Add E-Wallet'} onClose={() => setModal(false)} onSave={() => setModal(false)} accentColor={colors.section1}>
        <FormField label={isRTL ? 'اسم المحفظة' : 'Wallet Name'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} required />
        <FormField label={isRTL ? 'الهاتف' : 'Phone'} value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />
        <FormField label={isRTL ? 'الرصيد' : 'Balance'} value={form.balance} onChangeText={v => setForm(f => ({ ...f, balance: v }))} keyboardType="numeric" />
      </FormModal>
    </View>
  );
}
