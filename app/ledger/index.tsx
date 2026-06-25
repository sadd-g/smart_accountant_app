import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LedgerIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: '📚', label: 'الحسابات', route: '/ledger/accounts', color: '#D4AF37' },
    { icon: '📁', label: 'مجموعات الحسابات', route: '/ledger/account-groups', color: '#3B82F6' },
    { icon: '💱', label: 'العملات', route: '/ledger/currencies', color: '#10B981' },
    { icon: '📝', label: 'قيد يومية', route: '/ledger/journal-entry', color: '#7C3AED' },
    { icon: '🔄', label: 'قيد متكرر', route: '/ledger/recurring-journal', color: '#F59E0B' },
    { icon: '💰', label: 'سند قبض نقدي', route: '/ledger/cash-receipt', color: '#10B981' },
    { icon: '💳', label: 'سند صرف نقدي', route: '/ledger/cash-payment', color: '#EF4444' },
    { icon: '🏦', label: 'سند قبض بنكي', route: '/ledger/bank-receipt', color: '#3B82F6' },
    { icon: '🏧', label: 'سند صرف بنكي', route: '/ledger/bank-payment', color: '#EF4444' },
    { icon: '📊', label: 'ميزان المراجعة', route: '/ledger/trial-balance', color: '#D4AF37' },
    { icon: '📈', label: 'الأستاذ العام', route: '/ledger/general-ledger', color: '#7C3AED' },
    { icon: '🔍', label: 'كشف حساب', route: '/ledger/account-statement', color: '#10B981' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>دفتر الأستاذ العام</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => router.push(item.route as any)}
            >
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
  container: {
    flex: 1,
    backgroundColor: '#0A1128',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    fontSize: 28,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '30%',
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3550',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});
