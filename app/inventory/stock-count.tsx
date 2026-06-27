import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function StockCountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { items } = useDatabase();
  const color = colors.section2;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'جرد مخزون' : 'Stock Count', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        scrollEnabled={items.length > 0}
        contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{isRTL ? item.nameAr : item.name}</Text>
              <Text style={[styles.code, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>{item.code}</Text>
            </View>
            <View style={[styles.qty, { backgroundColor: item.quantity <= item.minQuantity ? colors.warning + '20' : colors.success + '20' }]}>
              <Text style={[styles.qtyText, { color: item.quantity <= item.minQuantity ? colors.warning : colors.success }]}>{item.quantity}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="cube-outline" size={40} color={colors.mutedForeground} /><Text style={{ color: colors.mutedForeground, marginTop: 8 }}>{isRTL ? 'لا توجد أصناف' : 'No items'}</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: '600' },
  code: { fontSize: 12, marginTop: 2 },
  qty: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  qtyText: { fontSize: 15, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
});
