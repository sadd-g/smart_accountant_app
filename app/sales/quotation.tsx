import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function QuotationScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const listData: ListItem[] = [];
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'عرض سعر' : 'Quotation', headerStyle: { backgroundColor: colors.section3 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section3} emptyText={isRTL ? 'لا توجد عروض أسعار' : 'No quotations'} />
    </View>
  );
}
