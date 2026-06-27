import { Stack } from 'expo-router';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function CurrencyReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { currencies } = useDatabase();
  const color = colors.section1;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'تقارير العملات' : 'Currency Reports', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <FlatList
        data={currencies}
        keyExtractor={c => c.id}
        scrollEnabled={currencies.length > 0}
        contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.symbol, { backgroundColor: color + '18' }]}><Text style={[styles.symbolText, { color }]}>{item.symbol}</Text></View>
            <View style={{ flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
              <Text style={[styles.name, { color: colors.foreground }]}>{isRTL ? item.nameAr : item.name}</Text>
              <Text style={[styles.code, { color: colors.mutedForeground }]}>{item.code}</Text>
            </View>
            <Text style={[styles.rate, { color }]}>{item.rate}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  symbol: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  symbolText: { fontSize: 16, fontWeight: '700' },
  name: { fontSize: 14, fontWeight: '600' },
  code: { fontSize: 12, marginTop: 2 },
  rate: { fontSize: 16, fontWeight: '700' },
});
