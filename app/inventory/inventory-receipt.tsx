import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function InventoryReceiptScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const listData: ListItem[] = [];
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'استلام مخزون' : 'Inventory Receipt', headerStyle: { backgroundColor: colors.section2 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section2} emptyText={isRTL ? 'لا توجد سجلات' : 'No records'} />
    </View>
  );
}
