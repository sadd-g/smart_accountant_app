import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SalesIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: '👥', label: 'العملاء', route: '/sales/customers', color: '#D4AF37' },
    { icon: '📄', label: 'فاتورة مبيعات', route: '/sales/sales-invoice', color: '#10B981' },
    { icon: '👨‍💼', label: 'المندوبين', route: '/sales/reps', color: '#3B82F6' },
    { icon: '📋', label: 'عرض سعر', route: '/sales/quotation', color: '#7C3AED' },
    { icon: '🔄', label: 'مرتجع مبيعات', route: '/sales/sales-return', color: '#EF4444' },
    { icon: '📊', label: 'ملخص المبيعات', route: '/sales/summary', color: '#F59E0B' },
    { icon: '📈', label: 'أداء المندوبين', route: '/sales/rep-performance', color: '#D4AF37' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>المبيعات والعملاء</Text>
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
  card: { width: '45%', backgroundColor: '#16213E', borderRadius: 16, padding: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  icon: { fontSize: 28 },
  label: { fontSize: 14, color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
});
