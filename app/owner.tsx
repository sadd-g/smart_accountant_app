import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import { useColors } from '../hooks/useColors';
import { formatNumber } from '../db/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MASTER_PASSWORD = 'SADDAM2024';

export default function OwnerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL, subscription } = useApp();
  const { db, customers, suppliers, items, salesInvoices, purchaseInvoices, journalEntries, vouchers, notifications, seedDemo, refresh } = useDatabase() as any;
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    if (unlocked && db) loadStats();
  }, [unlocked, db]);

  const loadStats = async () => {
    try {
      const [acc, cust, supp, item, sales, purchase, entries] = await Promise.all([
        db.getAllAsync("SELECT COUNT(*) as c FROM accounts WHERE is_active=1"),
        db.getAllAsync("SELECT COUNT(*) as c FROM customers WHERE is_active=1"),
        db.getAllAsync("SELECT COUNT(*) as c FROM suppliers WHERE is_active=1"),
        db.getAllAsync("SELECT COUNT(*) as c FROM items WHERE is_active=1"),
        db.getAllAsync("SELECT COALESCE(SUM(total),0) as t FROM sales_invoices"),
        db.getAllAsync("SELECT COALESCE(SUM(total),0) as t FROM purchase_invoices"),
        db.getAllAsync("SELECT COUNT(*) as c FROM journal_entries"),
      ]);
      setStats({
        accounts: (acc[0] as any)?.c || 0, customers: (cust[0] as any)?.c || 0,
        suppliers: (supp[0] as any)?.c || 0, items: (item[0] as any)?.c || 0,
        sales: (sales[0] as any)?.t || 0, purchase: (purchase[0] as any)?.t || 0,
        entries: (entries[0] as any)?.c || 0, vouchers: vouchers?.length || 0,
      });
    } catch(e) {}
  };

  const handleUnlock = () => {
    if (password === MASTER_PASSWORD) {
      setUnlocked(true); setPasswordError('');
    } else {
      setPasswordError(isRTL ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
    }
  };

  const handleSeedDemo = async () => {
    Alert.alert('📊 بيانات تجريبية', isRTL ? 'سيتم تحميل بيانات تجريبية شاملة. هل تريد المتابعة؟' : 'Load demo data?', [
      { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
      { text: isRTL ? 'تحميل' : 'Load', onPress: async () => {
        setSeeding(true);
        try { await seedDemo(); await refresh(); await loadStats(); Alert.alert('✅', isRTL ? 'تم التحميل' : 'Loaded'); }
        catch(e) { Alert.alert('❌', String(e)); } finally { setSeeding(false); }
      }},
    ]);
  };

  const handleExportFull = async () => {
    if (!db) return;
    try {
      const tables = ['accounts', 'customers', 'suppliers', 'items', 'currencies', 'account_groups', 'cash_boxes', 'banks', 'ewallets', 'journal_entries', 'journal_lines', 'sales_invoices', 'sales_invoice_items', 'purchase_invoices', 'purchase_invoice_items', 'vouchers', 'sequences', 'notifications'];
      let data: any = { version: 1, date: new Date().toISOString(), app: 'دفتر المحاسب الذكي', data: {} };
      for (const t of tables) { try { data.data[t] = await db.getAllAsync(`SELECT * FROM ${t}`); } catch(e) {} }
      await AsyncStorage.setItem('full_backup', JSON.stringify(data));
      Alert.alert('✅', isRTL ? 'تم تصدير جميع البيانات' : 'Full backup exported');
    } catch(e) { Alert.alert('❌', String(e)); }
  };

  const handleClearData = () => {
    Alert.alert('⚠️ ' + (isRTL ? 'حذف جميع البيانات' : 'Delete All Data'), isRTL ? 'هذا الإجراء لا يمكن التراجع عنه!' : 'This cannot be undone!', [
      { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
      { text: isRTL ? 'حذف الكل' : 'Delete All', style: 'destructive', onPress: async () => {
        if (!db) return;
        const tables = ['journal_lines', 'journal_entries', 'sales_invoice_items', 'sales_invoices', 'purchase_invoice_items', 'purchase_invoices', 'vouchers', 'notifications'];
        for (const t of tables) { try { await db.execAsync(`DELETE FROM ${t}`); } catch(e) {} }
        await refresh(); await loadStats();
        Alert.alert('✅', isRTL ? 'تم حذف البيانات' : 'Data cleared');
      }},
    ]);
  };

  if (!unlocked) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: '🔒 لوحة المالك', headerStyle: { backgroundColor: '#0a0a1a' }, headerTintColor: '#e8b86d' }} />
        <View style={styles.lockArea}>
          <View style={styles.lockIcon}><Ionicons name="shield-checkmark" size={50} color="#e8b86d" /></View>
          <Text style={[styles.lockTitle, { color: colors.foreground }]}>لوحة تحكم المالك</Text>
          <Text style={[styles.lockSub, { color: colors.mutedForeground }]}>أدخل كلمة المرور الرئيسية</Text>
          <TextInput style={[styles.pwInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: passwordError ? colors.destructive : colors.border }]} placeholder="كلمة المرور" placeholderTextColor={colors.mutedForeground} secureTextEntry value={password} onChangeText={setPassword} onSubmitEditing={handleUnlock} textAlign="center" />
          {passwordError ? <Text style={[styles.pwError, { color: colors.destructive }]}>{passwordError}</Text> : null}
          <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}><Text style={styles.unlockText}>دخول</Text></TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 16 }} onPress={() => router.back()}><Text style={{ color: colors.mutedForeground }}>رجوع</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  const statCards = [
    { label: 'الحسابات', value: stats.accounts, icon: 'wallet-outline', color: '#2196F3' },
    { label: 'العملاء', value: stats.customers, icon: 'people-outline', color: '#E91E63' },
    { label: 'الموردين', value: stats.suppliers, icon: 'business-outline', color: '#FF9800' },
    { label: 'الأصناف', value: stats.items, icon: 'cube-outline', color: '#4CAF50' },
    { label: 'فواتير البيع', value: salesInvoices?.length || 0, icon: 'receipt-outline', color: '#9C27B0' },
    { label: 'فواتير الشراء', value: purchaseInvoices?.length || 0, icon: 'cart-outline', color: '#F44336' },
    { label: 'القيود', value: stats.entries, icon: 'book-outline', color: '#0D47A1' },
    { label: 'السندات', value: stats.vouchers, icon: 'document-text-outline', color: '#009688' },
  ];

  const actions = [
    { label: '📊 تحميل بيانات تجريبية', icon: 'cloud-download-outline', color: '#2196F3', onPress: handleSeedDemo, loading: seeding },
    { label: '💾 تصدير كامل للبيانات', icon: 'save-outline', color: '#4CAF50', onPress: handleExportFull },
    { label: '🗑️ حذف جميع البيانات', icon: 'trash-outline', color: '#C62828', onPress: handleClearData },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '🔒 لوحة المالك', headerStyle: { backgroundColor: '#0a0a1a' }, headerTintColor: '#e8b86d' }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        {/* بطاقة الاشتراك */}
        <View style={[styles.subCard, { backgroundColor: '#0a0a1a' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="diamond" size={30} color="#e8b86d" />
            <View style={{ flex: 1 }}>
              <Text style={styles.subTitle}>دفتر المحاسب الذكي</Text>
              <Text style={styles.subPlan}>{subscription?.plan === 'trial' ? 'نسخة تجريبية' : subscription?.plan || 'Basic'}</Text>
            </View>
            <View style={styles.subDays}><Text style={styles.subDaysNum}>{subscription?.daysLeft || 90}</Text><Text style={styles.subDaysLabel}>يوم</Text></View>
          </View>
        </View>

        {/* إحصائيات */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📊 إحصائيات النظام</Text>
        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* مبالغ */}
        <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>إجمالي المبيعات</Text>
          <Text style={[styles.amountValue, { color: '#2E7D32' }]}>{formatNumber(stats.sales)}</Text>
          <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>إجمالي المشتريات</Text>
          <Text style={[styles.amountValue, { color: '#C62828' }]}>{formatNumber(stats.purchase)}</Text>
        </View>

        {/* إجراءات */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>⚡ إجراءات المالك</Text>
        {actions.map((a, i) => (
          <TouchableOpacity key={i} style={[styles.actionBtn, { backgroundColor: a.color + '15', borderColor: a.color }]} onPress={a.onPress} disabled={a.loading}>
            {a.loading ? <ActivityIndicator color={a.color} /> : <Ionicons name={a.icon as any} size={22} color={a.color} />}
            <Text style={[styles.actionText, { color: a.color }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}

        {/* معلومات المطور */}
        <View style={[styles.devCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.devTitle, { color: colors.foreground }]}>👨‍💻 معلومات المطور</Text>
          <Text style={[styles.devText, { color: colors.mutedForeground }]}>م/ صدام بشير</Text>
          <Text style={[styles.devText, { color: colors.mutedForeground }]}>WhatsApp: 736002798</Text>
          <Text style={[styles.devText, { color: colors.mutedForeground }]}>Yemen - 2024</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lockArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  lockIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(232,184,109,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#e8b86d' },
  lockTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  lockSub: { fontSize: 14, marginBottom: 24 },
  pwInput: { width: '100%', borderRadius: 14, paddingVertical: 16, fontSize: 18, borderWidth: 2, textAlign: 'center' },
  pwError: { fontSize: 13, marginTop: 8 },
  unlockBtn: { width: '100%', backgroundColor: '#e8b86d', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  unlockText: { color: '#0a0a1a', fontSize: 16, fontWeight: '700' },
  subCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  subTitle: { color: '#e8b86d', fontSize: 16, fontWeight: '700' },
  subPlan: { color: '#fff', fontSize: 13, marginTop: 2 },
  subDays: { backgroundColor: 'rgba(232,184,109,0.2)', borderRadius: 12, padding: 10, alignItems: 'center', minWidth: 60 },
  subDaysNum: { color: '#e8b86d', fontSize: 24, fontWeight: '800' },
  subDaysLabel: { color: '#e8b86d', fontSize: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 10, textAlign: 'right' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '23%', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  amountCard: { borderRadius: 16, padding: 16, marginTop: 12 },
  amountLabel: { fontSize: 13, textAlign: 'right' },
  amountValue: { fontSize: 28, fontWeight: '800', textAlign: 'right', marginBottom: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, borderWidth: 2, marginBottom: 8 },
  actionText: { fontSize: 15, fontWeight: '700' },
  devCard: { borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1 },
  devTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, textAlign: 'right' },
  devText: { fontSize: 13, textAlign: 'right', marginBottom: 4 },
});
