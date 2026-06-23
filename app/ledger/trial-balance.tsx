import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function TrialBalanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { accounts } = useDatabase();
  const color = colors.section1;

  const totalDebits = accounts.filter(a => a.balance >= 0).reduce((s, a) => s + a.balance, 0);
  const totalCredits = accounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'ميزان المراجعة' : 'Trial Balance', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <View style={[styles.totalsBar, { backgroundColor: color, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.totalItem}><Text style={styles.totalLabel}>{isRTL ? 'مجموع المدين' : 'Total Debit'}</Text><Text style={styles.totalValue}>{totalDebits.toFixed(2)}</Text></View>
        <View style={styles.totalItem}><Text style={styles.totalLabel}>{isRTL ? 'مجموع الدائن' : 'Total Credit'}</Text><Text style={styles.totalValue}>{totalCredits.toFixed(2)}</Text></View>
      </View>
      <FlatList
        data={accounts}
        keyExtractor={a => a.id}
        scrollEnabled={accounts.length > 0}
        contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.accCode, { color: colors.mutedForeground }]}>{item.code}</Text>
            <Text style={[styles.accName, { color: colors.foreground }]}>{isRTL ? item.nameAr : item.name}</Text>
            <Text style={[styles.debit, { color: item.balance >= 0 ? colors.section3 : 'transparent' }]}>{item.balance >= 0 ? item.balance.toFixed(2) : '—'}</Text>
            <Text style={[styles.credit, { color: item.balance < 0 ? colors.destructive : 'transparent' }]}>{item.balance < 0 ? Math.abs(item.balance).toFixed(2) : '—'}</Text>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="scale-outline" size={40} color={colors.mutedForeground} /><Text style={{ color: colors.mutedForeground, marginTop: 8 }}>{isRTL ? 'لا توجد حسابات' : 'No accounts'}</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  totalsBar: { justifyContent: 'space-around', padding: 12 },
  totalItem: { alignItems: 'center' },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  totalValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6, gap: 8 },
  accCode: { width: 50, fontSize: 12 },
  accName: { flex: 1, fontSize: 13, fontWeight: '500' },
  debit: { width: 70, textAlign: 'right', fontSize: 13, fontWeight: '600' },
  credit: { width: 70, textAlign: 'right', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60 },
});
