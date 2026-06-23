import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import { useColors } from '../hooks/useColors';

const MASTER_PASSWORD = 'SADDAM2024';

export default function OwnerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t, subscription } = useApp();
  const { customers, salesInvoices, purchaseInvoices, items, suppliers, journalEntries, vouchers, seedDemo, refresh } = useDatabase();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [seeding, setSeeding] = useState(false);

  const handleUnlock = () => {
    if (password === MASTER_PASSWORD) {
      setUnlocked(true);
      setPasswordError('');
    } else {
      setPasswordError(isRTL ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
    }
  };

  const handleSeedDemo = async () => {
    Alert.alert(
      isRTL ? 'تحميل بيانات تجريبية' : 'Load Demo Data',
      isRTL ? 'سيتم تحميل بيانات تجريبية شاملة (عملاء، موردون، أصناف، فواتير). هل تريد المتابعة؟' : 'This will load comprehensive demo data (customers, suppliers, items, invoices). Continue?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isRTL ? 'تحميل' : 'Load',
          onPress: async () => {
            setSeeding(true);
            try {
              await seedDemo();
              await refresh();
              Alert.alert('✅', isRTL ? 'تم تحميل البيانات التجريبية بنجاح' : 'Demo data loaded successfully');
            } catch (e) {
              Alert.alert('⚠️', String(e));
            } finally {
              setSeeding(false);
            }
          }
        }
      ]
    );
  };

  if (!unlocked) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: isRTL ? 'لوحة تحكم المالك' : 'Owner Dashboard', headerStyle: { backgroundColor: '#1a1a2e' }, headerTintColor: '#fff' }} />
        <View style={[styles.lockArea, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
          <View style={[styles.lockIcon, { backgroundColor: '#1a1a2e' }]}>
            <Ionicons name="shield-checkmark" size={40} color="#e8b86d" />
          </View>
          <Text style={[styles.lockTitle, { color: colors.foreground }]}>{isRTL ? 'لوحة تحكم المالك' : 'Owner Dashboard'}</Text>
          <Text style={[styles.lockSubtitle, { color: colors.mutedForeground }]}>{isRTL ? 'أدخل كلمة المرور الرئيسية' : 'Enter master password'}</Text>
          <View style={[styles.pwInput, { backgroundColor: colors.card, borderColor: passwordError ? colors.destructive : colors.border }]}>
            <TextInput
              style={[styles.pwTextInput, { color: colors.foreground }]}
              placeholder={isRTL ? 'كلمة المرور الرئيسية' : 'Master password'}
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleUnlock}
            />
          </View>
          {passwordError ? <Text style={[styles.pwError, { color: colors.destructive }]}>{passwordError}</Text> : null}
          <TouchableOpacity style={[styles.unlockBtn, { backgroundColor: '#1a1a2e' }]} onPress={handleUnlock}>
            <Text style={styles.unlockBtnText}>{isRTL ? 'دخول' : 'Enter'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalRevenue = salesInvoices.reduce((s, i) => s + i.total, 0);
  const totalExpenses = purchaseInvoices.reduce((s, i) => s + i.total, 0);
  const netProfit = totalRevenue - totalExpenses;

  const stats = [
    { label: isRTL ? 'إجمالي المبيعات' : 'Total Sales', value: totalRevenue.toLocaleString(), color: colors.section3, icon: 'trending-up' as const },
    { label: isRTL ? 'إجمالي المشتريات' : 'Total Purchases', value: totalExpenses.toLocaleString(), color: colors.section2, icon: 'trending-down' as const },
    { label: isRTL ? 'صافي الربح' : 'Net Profit', value: netProfit.toLocaleString(), color: netProfit >= 0 ? colors.success : colors.destructive, icon: 'cash-outline' as const },
    { label: isRTL ? 'العملاء' : 'Customers', value: customers.length.toString(), color: colors.section1, icon: 'people-outline' as const },
    { label: isRTL ? 'الموردون' : 'Suppliers', value: suppliers.length.toString(), color: colors.section4, icon: 'business-outline' as const },
    { label: isRTL ? 'الأصناف' : 'Items', value: items.length.toString(), color: colors.section5, icon: 'cube-outline' as const },
    { label: isRTL ? 'فواتير المبيعات' : 'Sales Invoices', value: salesInvoices.length.toString(), color: colors.section3, icon: 'receipt-outline' as const },
    { label: isRTL ? 'قيود اليومية' : 'Journal Entries', value: journalEntries.length.toString(), color: colors.section1, icon: 'book-outline' as const },
    { label: isRTL ? 'السندات' : 'Vouchers', value: vouchers.length.toString(), color: colors.info, icon: 'document-outline' as const },
  ];

  const actions = [
    { label: isRTL ? 'تحميل بيانات تجريبية' : 'Load Demo Data', icon: 'cloud-download-outline' as const, color: colors.primary, onPress: handleSeedDemo },
    { label: isRTL ? 'تفعيل اشتراك' : 'Activate Subscription', icon: 'checkmark-circle-outline' as const, color: colors.success, onPress: () => Alert.alert('', isRTL ? 'جاري التنفيذ...' : 'Processing...') },
    { label: isRTL ? 'إلغاء الاشتراك' : 'Deactivate', icon: 'close-circle-outline' as const, color: colors.destructive, onPress: () => Alert.alert('', isRTL ? 'جاري التنفيذ...' : 'Processing...') },
    { label: isRTL ? 'تجديد الاشتراك' : 'Renew Subscription', icon: 'refresh-outline' as const, color: colors.primary, onPress: () => Alert.alert('', isRTL ? 'جاري التنفيذ...' : 'Processing...') },
    { label: isRTL ? 'إشعار جماعي' : 'Broadcast Notification', icon: 'megaphone-outline' as const, color: colors.warning, onPress: () => Alert.alert('', isRTL ? 'جاري التنفيذ...' : 'Processing...') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'لوحة تحكم المالك' : 'Owner Dashboard', headerStyle: { backgroundColor: '#1a1a2e' }, headerTintColor: '#fff' }} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}>
        <View style={[styles.subCard, { backgroundColor: '#1a1a2e' }]}>
          <View style={[styles.subCardInner, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="shield-checkmark" size={28} color="#e8b86d" />
            <View style={{ flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
              <Text style={[styles.subCardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t.subscription.title}</Text>
              <Text style={[styles.subCardPlan, { textAlign: isRTL ? 'right' : 'left' }]}>
                {subscription.plan === 'trial' ? t.subscription.freeTrial : subscription.plan}
              </Text>
            </View>
            <View style={[styles.subDays, { backgroundColor: subscription.daysLeft > 30 ? colors.success + '30' : colors.warning + '30' }]}>
              <Text style={[styles.subDaysNum, { color: subscription.daysLeft > 30 ? colors.success : colors.warning }]}>{subscription.daysLeft}</Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>{isRTL ? 'يوم' : 'days'}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>{isRTL ? 'الإحصائيات' : 'Statistics'}</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '18' }]}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>{isRTL ? 'إجراءات' : 'Actions'}</Text>
        {actions.map((action, i) => (
          <TouchableOpacity key={i} style={[styles.actionRow, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]} onPress={action.onPress} activeOpacity={0.7} disabled={seeding && i === 0}>
            <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
              <Ionicons name={action.icon} size={22} color={action.color} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.foreground, marginLeft: isRTL ? 0 : 14, marginRight: isRTL ? 14 : 0 }]}>
              {i === 0 && seeding ? (isRTL ? 'جاري التحميل...' : 'Loading...') : action.label}
            </Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}

        <View style={[styles.devCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.devTitle, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{isRTL ? 'معلومات المطور' : 'Developer Info'}</Text>
          <Text style={[styles.devText, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>م/ صدام بشير</Text>
          <Text style={[styles.devText, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>WhatsApp: 736002798</Text>
          <Text style={[styles.devText, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>v2.0.0-SQLite</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lockArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  lockIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  lockTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  lockSubtitle: { fontSize: 14, marginBottom: 28 },
  pwInput: { width: '100%', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 },
  pwTextInput: { fontSize: 16, textAlign: 'center' },
  pwError: { fontSize: 13, marginBottom: 12 },
  unlockBtn: { width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  unlockBtnText: { color: '#e8b86d', fontSize: 16, fontWeight: '700' },
  subCard: { borderRadius: 16, padding: 18, marginBottom: 20 },
  subCardInner: { alignItems: 'center' },
  subCardTitle: { color: '#e8b86d', fontSize: 13, fontWeight: '600' },
  subCardPlan: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 2 },
  subDays: { borderRadius: 12, padding: 10, alignItems: 'center', minWidth: 56 },
  subDaysNum: { fontSize: 22, fontWeight: '800' },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '30%', borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center', gap: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, textAlign: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  actionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  devCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 8, gap: 4 },
  devTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  devText: { fontSize: 13 },
});
