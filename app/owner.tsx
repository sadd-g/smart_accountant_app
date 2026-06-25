import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../hooks/useLocalStore';

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: accounts } = useLocalTable('accounts');
  const { data: customers } = useLocalTable('customers');
  const { data: suppliers } = useLocalTable('suppliers');
  const { data: items } = useLocalTable('items');
  const { data: journalEntries } = useLocalTable('journalEntries');
  const [subscription, setSubscription] = useState({ active: true, daysLeft: 90, type: 'تجريبي' });

  const stats = [
    { icon: '📚', label: 'الحسابات', value: accounts.length, color: '#D4AF37' },
    { icon: '👥', label: 'العملاء', value: customers.length, color: '#10B981' },
    { icon: '🏪', label: 'الموردين', value: suppliers.length, color: '#3B82F6' },
    { icon: '📦', label: 'الأصناف', value: items.length, color: '#7C3AED' },
    { icon: '📝', label: 'القيود', value: journalEntries.length, color: '#F59E0B' },
  ];

  const totalAssets = accounts.filter((a: any) => a.type === 'أصل').reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const totalLiabilities = accounts.filter((a: any) => a.type === 'خصم').reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const totalEquity = totalAssets - totalLiabilities;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>لوحة تحكم المالك</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* حالة الاشتراك */}
        <View style={[styles.subscriptionCard, { backgroundColor: subscription.active ? '#10B98120' : '#EF444420' }]}>
          <Text style={styles.subscriptionTitle}>حالة الاشتراك</Text>
          <Text style={[styles.subscriptionStatus, { color: subscription.active ? '#10B981' : '#EF4444' }]}>
            {subscription.active ? '✅ نشط' : '❌ منتهي'}
          </Text>
          <Text style={styles.subscriptionType}>{subscription.type} - {subscription.daysLeft} يوم متبقي</Text>
        </View>

        {/* الإحصائيات */}
        <Text style={styles.sectionTitle}>📊 إحصائيات النظام</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* الوضع المالي */}
        <Text style={styles.sectionTitle}>💰 الوضع المالي</Text>
        <View style={styles.financeCard}>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>إجمالي الأصول</Text>
            <Text style={[styles.financeValue, { color: '#D4AF37' }]}>{totalAssets.toLocaleString()} ﷼</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>إجمالي الخصوم</Text>
            <Text style={[styles.financeValue, { color: '#EF4444' }]}>{totalLiabilities.toLocaleString()} ﷼</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>حقوق الملكية</Text>
            <Text style={[styles.financeValue, { color: '#10B981' }]}>{totalEquity.toLocaleString()} ﷼</Text>
          </View>
        </View>

        {/* إجراءات المالك */}
        <Text style={styles.sectionTitle}>⚡ إجراءات المالك</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('تجديد', 'سيتم توجيهك لتجديد الاشتراك')}>
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>تجديد الاشتراك</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('إشعار جماعي', 'إرسال إشعار لجميع المستخدمين')}>
            <Text style={styles.actionIcon}>📢</Text>
            <Text style={styles.actionText}>إشعار جماعي</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/backup')}>
            <Text style={styles.actionIcon}>💾</Text>
            <Text style={styles.actionText}>نسخ احتياطي كامل</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('حذف', 'حذف جميع البيانات؟', [
            { text: 'إلغاء' }, { text: 'حذف الكل', style: 'destructive' }
          ])}>
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={[styles.actionText, { color: '#EF4444' }]}>مسح جميع البيانات</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
  subscriptionCard: { borderRadius: 16, padding: 20, marginBottom: 20, alignItems: 'center' },
  subscriptionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subscriptionStatus: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subscriptionType: { color: '#94a3b8', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37', marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '30%', backgroundColor: '#16213E', borderRadius: 16, padding: 16,
    marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550',
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#94a3b8', fontSize: 11 },
  financeCard: { backgroundColor: '#16213E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2a3550', marginBottom: 20 },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  financeLabel: { color: '#FFFFFF', fontSize: 16 },
  financeValue: { fontSize: 20, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#2a3550', marginVertical: 8 },
  card: { backgroundColor: '#16213E', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: '#2a3550' },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  actionIcon: { fontSize: 24, marginRight: 12 },
  actionText: { color: '#FFFFFF', fontSize: 16 },
});
