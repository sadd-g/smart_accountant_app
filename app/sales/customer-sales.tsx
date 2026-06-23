import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function CustomerSalesScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const { customers, salesInvoices } = useDatabase();
  const listData: ListItem[] = customers.map(c => {
    const total = salesInvoices.filter(i => i.customerId === c.id).reduce((s, i) => s + i.total, 0);
    return { id: c.id, primary: isRTL ? c.nameAr : c.name, secondary: c.phone, badge: total.toLocaleString(), badgeColor: colors.section3 };
  });
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'مبيعات العملاء' : 'Customer Sales', headerStyle: { backgroundColor: colors.section3 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section3} emptyText={isRTL ? 'لا توجد بيانات' : 'No data'} />
    </View>
  );
}
