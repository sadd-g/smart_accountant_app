import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function RecurringJournalScreen() {
  const colors = useColors();
  const { isRTL } = useApp();
  const listData: ListItem[] = [];
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'قيد يومية متكرر' : 'Recurring Journal', headerStyle: { backgroundColor: colors.section1 }, headerTintColor: '#fff' }} />
      <ListScreen title="" data={listData} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} accentColor={colors.section1} emptyText={isRTL ? 'لا توجد قيود متكررة' : 'No recurring entries'} />
    </View>
  );
}
