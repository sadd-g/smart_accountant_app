import { Stack } from 'expo-router';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function RepPerformanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { salesReps } = useDatabase();
  const color = colors.section3;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'أداء المندوبين' : 'Rep Performance', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <FlatList
        data={salesReps}
        keyExtractor={r => r.id}
        scrollEnabled={salesReps.length > 0}
        contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}
        renderItem={({ item }) => {
          const achievement = item.monthlyTarget > 0 ? Math.round((item.totalSales / item.monthlyTarget) * 100) : 0;
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomColor: colors.border }]}>
                <Text style={[styles.name, { color: colors.foreground }]}>{isRTL ? item.nameAr : item.name}</Text>
                <View style={[styles.badge, { backgroundColor: achievement >= 100 ? colors.success + '20' : colors.warning + '20' }]}>
                  <Text style={{ color: achievement >= 100 ? colors.success : colors.warning, fontWeight: '700' }}>{achievement}%</Text>
                </View>
              </View>
              <View style={[styles.bar, { backgroundColor: colors.border }]}>
                <View style={[styles.barFill, { backgroundColor: color, width: `${Math.min(achievement, 100)}%` as any }]} />
              </View>
              <View style={[styles.cardRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{isRTL ? `هدف: ${item.monthlyTarget}` : `Target: ${item.monthlyTarget}`}</Text>
                <Text style={{ color: color, fontSize: 12, fontWeight: '600' }}>{isRTL ? `مبيعات: ${item.totalSales}` : `Sales: ${item.totalSales}`}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<View style={styles.empty}><Text style={{ color: colors.mutedForeground }}>{isRTL ? 'لا يوجد مندوبون' : 'No reps'}</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  cardHeader: { justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bar: { height: 6, marginHorizontal: 14, borderRadius: 3, marginVertical: 8 },
  barFill: { height: 6, borderRadius: 3 },
  cardRow: { justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 12 },
  empty: { alignItems: 'center', marginTop: 60 },
});
