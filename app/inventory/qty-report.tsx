import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function QtyReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { items } = useDatabase();
  const color = colors.section2;
  const totalValue = items.reduce((s, i) => s + i.quantity * i.costPrice, 0);
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'كميات المخزون' : 'Inventory Quantities', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <View style={[styles.header, { backgroundColor: color }]}>
        <Text style={styles.headerLabel}>{isRTL ? 'إجمالي قيمة المخزون' : 'Total Inventory Value'}</Text>
        <Text style={styles.headerValue}>{totalValue.toLocaleString()}</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        scrollEnabled={items.length > 0}
        contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{isRTL ? item.nameAr : item.name}</Text>
              <Text style={[styles.price, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>{isRTL ? `التكلفة: ${item.costPrice}` : `Cost: ${item.costPrice}`}</Text>
            </View>
            <View style={styles.qtyBox}>
              <Text style={[styles.qty, { color }]}>{item.quantity}</Text>
              <Text style={[styles.total, { color: colors.mutedForeground }]}>{(item.quantity * item.costPrice).toFixed(0)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="stats-chart-outline" size={40} color={colors.mutedForeground} /><Text style={{ color: colors.mutedForeground, marginTop: 8 }}>{isRTL ? 'لا توجد بيانات' : 'No data'}</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, alignItems: 'center' },
  headerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  headerValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: '600' },
  price: { fontSize: 12, marginTop: 2 },
  qtyBox: { alignItems: 'flex-end' },
  qty: { fontSize: 16, fontWeight: '700' },
  total: { fontSize: 11, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 60 },
});
