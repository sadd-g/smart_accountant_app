import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

interface MenuItem { labelAr: string; labelEn: string; icon: keyof typeof Ionicons.glyphMap; route: string; category: 'masters' | 'operations' | 'reports'; }

const ITEMS: MenuItem[] = [
  { labelAr: 'العملاء', labelEn: 'Customers', icon: 'people-outline', route: '/sales/customers', category: 'masters' },
  { labelAr: 'مندوبو المبيعات', labelEn: 'Sales Reps', icon: 'person-outline', route: '/sales/reps', category: 'masters' },
  { labelAr: 'مجموعات العملاء', labelEn: 'Customer Groups', icon: 'folder-outline', route: '/sales/customer-groups', category: 'masters' },
  { labelAr: 'فاتورة مبيعات', labelEn: 'Sales Invoice', icon: 'receipt-outline', route: '/sales/sales-invoice', category: 'operations' },
  { labelAr: 'مرتجع مبيعات', labelEn: 'Sales Return', icon: 'return-up-back-outline', route: '/sales/sales-return', category: 'operations' },
  { labelAr: 'عرض سعر', labelEn: 'Quotation', icon: 'document-text-outline', route: '/sales/quotation', category: 'operations' },
  { labelAr: 'مبيعات العملاء', labelEn: 'Customer Sales', icon: 'stats-chart-outline', route: '/sales/customer-sales', category: 'reports' },
  { labelAr: 'مبيعات الأصناف', labelEn: 'Item Sales', icon: 'cube-outline', route: '/sales/item-sales', category: 'reports' },
  { labelAr: 'ملخص المبيعات', labelEn: 'Sales Summary', icon: 'pie-chart-outline', route: '/sales/summary', category: 'reports' },
  { labelAr: 'أداء المندوبين', labelEn: 'Rep Performance', icon: 'trophy-outline', route: '/sales/rep-performance', category: 'reports' },
];

export default function SalesIndex() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useApp();
  const color = colors.section3;

  const masters = ITEMS.filter(m => m.category === 'masters');
  const operations = ITEMS.filter(m => m.category === 'operations');
  const reports = ITEMS.filter(m => m.category === 'reports');

  const renderItem = (item: MenuItem) => (
    <TouchableOpacity key={item.route} style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]} onPress={() => router.push(item.route as never)} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}><Ionicons name={item.icon} size={20} color={color} /></View>
      <Text style={[styles.itemLabel, { color: colors.foreground, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>{isRTL ? item.labelAr : item.labelEn}</Text>
      <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'المبيعات والعملاء' : 'Sales & Customers', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 16 }}>
        {[['masters', masters], ['operations', operations], ['reports', reports]].map(([key, items]) => (
          <View key={key as string}>
            <Text style={[styles.groupLabel, { color: color, textAlign: isRTL ? 'right' : 'left' }]}>
              {key === 'masters' ? (isRTL ? t.common.masters : 'Masters') : key === 'operations' ? (isRTL ? t.common.operations : 'Operations') : (isRTL ? t.common.reports : 'Reports')}
            </Text>
            {(items as MenuItem[]).map(renderItem)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  groupLabel: { fontSize: 12, fontWeight: '700', marginTop: 20, marginBottom: 8, paddingHorizontal: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 12, marginBottom: 6, borderRadius: 12, borderWidth: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});
