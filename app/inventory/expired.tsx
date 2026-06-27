import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function ExpiredScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const { items } = useDatabase();
  const now = new Date();
  const expiredItems = items.filter(i => i.expiryDate && new Date(i.expiryDate) < now);
  const listData: ListItem[] = expiredItems.map(i => ({
    id: i.id, primary: isRTL ? i.nameAr : i.name,
    secondary: `${isRTL ? 'انتهاء' : 'Expiry'}: ${i.expiryDate}`, badge: isRTL ? 'منتهي' : 'Expired', badgeColor: colors.destructive,
  }));
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'الأصناف المنتهية' : 'Expired Items', headerStyle: { backgroundColor: colors.section2 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section2} emptyText={isRTL ? 'لا توجد أصناف منتهية' : 'No expired items'} />
    </View>
  );
}
