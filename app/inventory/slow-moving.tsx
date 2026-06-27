import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function SlowMovingScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const { items } = useDatabase();
  const slowItems = items.filter(i => i.quantity > 0 && i.quantity <= i.minQuantity * 2);
  const listData: ListItem[] = slowItems.map(i => ({
    id: i.id, primary: isRTL ? i.nameAr : i.name,
    secondary: `${isRTL ? 'الكمية' : 'Qty'}: ${i.quantity}`, badge: isRTL ? 'بطيء' : 'Slow', badgeColor: colors.warning,
  }));
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'الأصناف بطيئة الحركة' : 'Slow Moving Items', headerStyle: { backgroundColor: colors.section2 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section2} emptyText={isRTL ? 'لا توجد أصناف بطيئة' : 'No slow moving items'} />
    </View>
  );
}
