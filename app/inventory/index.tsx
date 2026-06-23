import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

interface MenuItem { labelAr: string; labelEn: string; icon: keyof typeof Ionicons.glyphMap; route: string; category: 'masters' | 'operations' | 'reports'; }

const ITEMS: MenuItem[] = [
  { labelAr: 'الموردون', labelEn: 'Suppliers', icon: 'people-outline', route: '/inventory/suppliers', category: 'masters' },
  { labelAr: 'المستودعات', labelEn: 'Warehouses', icon: 'business-outline', route: '/inventory/warehouses', category: 'masters' },
  { labelAr: 'الأصناف', labelEn: 'Items', icon: 'cube-outline', route: '/inventory/items', category: 'masters' },
  { labelAr: 'وحدات الأصناف', labelEn: 'Item Units', icon: 'resize-outline', route: '/inventory/units', category: 'masters' },
  { labelAr: 'الفئات', labelEn: 'Categories', icon: 'grid-outline', route: '/inventory/categories', category: 'masters' },
  { labelAr: 'الماركات', labelEn: 'Brands', icon: 'pricetag-outline', route: '/inventory/brands', category: 'masters' },
  { labelAr: 'فاتورة مشتريات', labelEn: 'Purchase Invoice', icon: 'receipt-outline', route: '/inventory/purchase-invoice', category: 'operations' },
  { labelAr: 'مرتجع مشتريات', labelEn: 'Purchase Return', icon: 'return-up-back-outline', route: '/inventory/purchase-return', category: 'operations' },
  { labelAr: 'صرف مخزون', labelEn: 'Inventory Issue', icon: 'arrow-up-outline', route: '/inventory/inventory-issue', category: 'operations' },
  { labelAr: 'استلام مخزون', labelEn: 'Inventory Receipt', icon: 'arrow-down-outline', route: '/inventory/inventory-receipt', category: 'operations' },
  { labelAr: 'تحويل مستودع', labelEn: 'Warehouse Transfer', icon: 'swap-horizontal-outline', route: '/inventory/warehouse-transfer', category: 'operations' },
  { labelAr: 'جرد مخزون', labelEn: 'Stock Count', icon: 'list-outline', route: '/inventory/stock-count', category: 'operations' },
  { labelAr: 'تسوية مخزون', labelEn: 'Stock Adjustment', icon: 'options-outline', route: '/inventory/stock-adjustment', category: 'operations' },
  { labelAr: 'كميات المخزون', labelEn: 'Inventory Quantities', icon: 'stats-chart-outline', route: '/inventory/qty-report', category: 'reports' },
  { labelAr: 'تكاليف المخزون', labelEn: 'Inventory Costs', icon: 'cash-outline', route: '/inventory/cost-report', category: 'reports' },
  { labelAr: 'حركة الأصناف', labelEn: 'Item Movement', icon: 'git-compare-outline', route: '/inventory/item-movement', category: 'reports' },
  { labelAr: 'حركة الموردين', labelEn: 'Supplier Movement', icon: 'people-outline', route: '/inventory/supplier-movement', category: 'reports' },
  { labelAr: 'الأصناف بطيئة الحركة', labelEn: 'Slow Moving Items', icon: 'hourglass-outline', route: '/inventory/slow-moving', category: 'reports' },
  { labelAr: 'الأصناف المنتهية', labelEn: 'Expired Items', icon: 'warning-outline', route: '/inventory/expired', category: 'reports' },
];

export default function InventoryIndex() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useApp();
  const color = colors.section2;

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
      <Stack.Screen options={{ title: isRTL ? 'المشتريات والمخزون' : 'Purchases & Inventory', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
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
