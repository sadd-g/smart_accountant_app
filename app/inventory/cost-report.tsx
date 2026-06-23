import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function CostReportScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const { items } = useDatabase();
  const listData: ListItem[] = items.map(i => ({
    id: i.id,
    primary: isRTL ? i.nameAr : i.name,
    secondary: `${isRTL ? 'التكلفة' : 'Cost'}: ${i.costPrice} | ${isRTL ? 'البيع' : 'Sale'}: ${i.salePrice}`,
    badge: `${((i.salePrice - i.costPrice) / (i.costPrice || 1) * 100).toFixed(0)}%`,
    badgeColor: i.salePrice > i.costPrice ? colors.success : colors.destructive,
  }));
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'تكاليف المخزون' : 'Inventory Costs', headerStyle: { backgroundColor: colors.section2 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section2} emptyText={isRTL ? 'لا توجد بيانات' : 'No data'} />
    </View>
  );
}
