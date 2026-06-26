import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InventoryIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = [
    { icon: '🏪', label: 'الموردين', route: '/inventory/suppliers' },
    { icon: '🏭', label: 'المستودعات', route: '/inventory/warehouses' },
    { icon: '📦', label: 'الأصناف', route: '/inventory/items' },
    { icon: '📋', label: 'فاتورة مشتريات', route: '/inventory/purchase-invoice' },
    { icon: '📤', label: 'صرف مخزون', route: '/inventory/inventory-issue' },
    { icon: '📥', label: 'توريد مخزون', route: '/inventory/inventory-receipt' },
    { icon: '🔄', label: 'تحويل مخزني', route: '/inventory/warehouse-transfer' },
    { icon: '📐', label: 'وحدات القياس', route: '/inventory/units' },
    { icon: '🏷️', label: 'الفئات', route: '/inventory/categories' },
    { icon: '⭐', label: 'الماركات', route: '/inventory/brands' },
    { icon: '📊', label: 'حركة الأصناف', route: '/inventory/item-movement' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backText}>←</Text></TouchableOpacity>
          <Text style={styles.title}>📦 المخزون والمشتريات</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.grid}>
          {items.map((item, i) => (
            <TouchableOpacity key={i} style={styles.card} onPress={() => router.push(item.route)}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  content: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#16213E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  backText: { fontSize: 20, color: '#D4AF37' },
  title: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  card: { width: '30%', backgroundColor: '#16213E', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  cardIcon: { fontSize: 36, marginBottom: 10 },
  cardLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
