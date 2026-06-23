import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function ItemSalesScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const { items, salesInvoices } = useDatabase();
  const listData: ListItem[] = items.map(item => {
    let totalQty = 0, totalValue = 0;
    salesInvoices.forEach(inv => {
      inv.items.forEach(line => {
        if (line.itemId === item.id) { totalQty += line.qty; totalValue += line.total; }
      });
    });
    return { id: item.id, primary: isRTL ? item.nameAr : item.name, secondary: `${isRTL ? 'الكمية المباعة' : 'Sold Qty'}: ${totalQty}`, badge: totalValue.toLocaleString(), badgeColor: colors.section3 };
  });
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'مبيعات الأصناف' : 'Item Sales', headerStyle: { backgroundColor: colors.section3 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section3} emptyText={isRTL ? 'لا توجد بيانات' : 'No data'} />
    </View>
  );
}
