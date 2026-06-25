import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InventoryIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: '🏪', label: 'الموردين', route: '/inventory/suppliers', color: '#D4AF37' },
    { icon: '🏭', label: 'المستودعات', route: '/inventory/warehouses', color: '#3B82F6' },
    { icon: '📦', label: 'الأصناف', route: '/inventory/items', color: '#10B981' },
    { icon: '📋', label: 'فاتورة مشتريات', route: '/inventory/purchase-invoice', color: '#7C3AED' },
    { icon: '📐', label: 'وحدات القياس', route: '/inventory/units', color: '#F59E0B' },
    { icon: '🏷️', label: 'الفئات', route: '/inventory/categories', color: '#EF4444' },
    { icon: '⭐', label: 'الماركات', route: '/inventory/brands', color: '#3B82F6' },
    { icon: '🔄', label: 'مرتجع مشتريات', route: '/inventory/purchase-return', color: '#10B981' },
    { icon: '📊', label: 'تقرير الكميات', route: '/inventory/qty-report', color: '#D4AF37' },
    { icon: '💰', label: 'تقرير التكاليف', route: '/inventory/cost-report', color: '#7C3AED' },
    { icon: '🔍', label: 'حركة الأصناف', route: '/inventory/item-movement', color: '#F59E0B' },
    { icon: '⚠️', label: 'أصناف بطيئة', route: '/inventory/slow-moving', color: '#EF4444' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>المخزون والمشتريات</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.card} onPress={() => router.push(item.route as any)}>
              <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { fontSize: 28, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '30%', backgroundColor: '#16213E', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 22 },
  label: { fontSize: 11, color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
});
