import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function SalesSummaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { salesInvoices } = useDatabase();
  const color = colors.section3;

  const totalSales = salesInvoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = salesInvoices.reduce((s, i) => s + i.paid, 0);
  const totalRemaining = salesInvoices.reduce((s, i) => s + i.remaining, 0);
  const cashSales = salesInvoices.filter(i => i.paymentType === 'cash').reduce((s, i) => s + i.total, 0);
  const creditSales = salesInvoices.filter(i => i.paymentType === 'credit').reduce((s, i) => s + i.total, 0);

  const cards = [
    { label: isRTL ? 'إجمالي المبيعات' : 'Total Sales', value: totalSales.toFixed(2), color },
    { label: isRTL ? 'المحصّل' : 'Collected', value: totalPaid.toFixed(2), color: colors.success },
    { label: isRTL ? 'المتبقي' : 'Remaining', value: totalRemaining.toFixed(2), color: colors.warning },
    { label: isRTL ? 'نقدي' : 'Cash', value: cashSales.toFixed(2), color: colors.info },
    { label: isRTL ? 'آجل' : 'Credit', value: creditSales.toFixed(2), color: colors.destructive },
    { label: isRTL ? 'عدد الفواتير' : 'Invoice Count', value: salesInvoices.length.toString(), color: colors.section1 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'ملخص المبيعات' : 'Sales Summary', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}>
        <View style={styles.grid}>
          {cards.map((card, i) => (
            <View key={i} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
              <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>{card.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4 },
  cardValue: { fontSize: 20, fontWeight: '800' },
  cardLabel: { fontSize: 12, textAlign: 'center' },
});
