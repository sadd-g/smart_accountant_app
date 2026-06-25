import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TrialBalanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // بيانات تجريبية فارغة
  const trialData: any[] = [];

  const totalDebit = trialData.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = trialData.reduce((sum, item) => sum + item.credit, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ميزان المراجعة</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* المجاميع */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>إجمالي مدين</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {totalDebit.toLocaleString()} ﷼
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>إجمالي دائن</Text>
            <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
              {totalCredit.toLocaleString()} ﷼
            </Text>
          </View>
        </View>

        {/* جدول ميزان المراجعة */}
        {trialData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>لا توجد بيانات</Text>
            <Text style={styles.emptyDesc}>
              قم بإضافة قيود يومية ليظهر ميزان المراجعة
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/ledger/journal-entry')}
            >
              <Text style={styles.addButtonText}>+ إضافة قيد يومية</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.headerText, { flex: 2 }]}>الحساب</Text>
              <Text style={[styles.tableCell, styles.headerText]}>مدين</Text>
              <Text style={[styles.tableCell, styles.headerText]}>دائن</Text>
            </View>
            {trialData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2, color: '#FFF' }]}>{item.name}</Text>
                <Text style={[styles.tableCell, { color: '#10B981' }]}>{item.debit.toLocaleString()}</Text>
                <Text style={[styles.tableCell, { color: '#EF4444' }]}>{item.credit.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backBtn: { fontSize: 28, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  summaryCard: {
    backgroundColor: '#16213E', borderRadius: 16, padding: 20,
    flexDirection: 'row', justifyContent: 'space-around',
    marginBottom: 20, borderWidth: 1, borderColor: '#2a3550',
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  summaryValue: { fontSize: 22, fontWeight: 'bold' },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptyDesc: {
    color: '#94a3b8', fontSize: 14, textAlign: 'center',
    marginBottom: 24, paddingHorizontal: 40,
  },
  addButton: {
    backgroundColor: '#D4AF37' + '20', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 24,
    borderWidth: 1, borderColor: '#D4AF37' + '40',
  },
  addButtonText: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  table: {
    backgroundColor: '#16213E', borderRadius: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: '#2a3550',
  },
  tableRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2a3550',
  },
  tableHeader: {
    backgroundColor: '#1a2240',
  },
  tableCell: {
    flex: 1, padding: 14, fontSize: 14, color: '#94a3b8', textAlign: 'center',
  },
  headerText: {
    color: '#D4AF37', fontWeight: 'bold', fontSize: 14,
  },
});
