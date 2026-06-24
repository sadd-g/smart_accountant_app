import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppDrawer from '../components/AppDrawer';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import { useColors } from '../hooks/useColors';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, subscription, profile } = useApp();
  const { customers, items, salesInvoices, purchaseInvoices, notifications, vouchers, journalEntries } = useDatabase();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalSales = salesInvoices.reduce((s: number, inv: any) => s + (inv.total||0), 0);
  const totalPurchases = purchaseInvoices.reduce((s: number, inv: any) => s + (inv.total||0), 0);
  const netProfit = totalSales - totalPurchases;
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const sections = [
    { icon: 'wallet-outline', title: 'الحسابات', route: '/ledger', color: '#2196F3', desc: 'دليل الحسابات والقيود' },
    { icon: 'cube-outline', title: 'المخزون', route: '/inventory', color: '#FF9800', desc: 'الأصناف والمشتريات' },
    { icon: 'cart-outline', title: 'المبيعات', route: '/sales', color: '#E91E63', desc: 'العملاء والفواتير' },
    { icon: 'stats-chart-outline', title: 'التقارير', route: '/reports', color: '#9C27B0', desc: 'جميع التقارير' },
  ];

  const quickActions = [
    { icon: 'arrow-down-circle', label: 'قبض نقدي', route: '/ledger/cash-receipt', color: '#2E7D32' },
    { icon: 'arrow-up-circle', label: 'صرف نقدي', route: '/ledger/cash-payment', color: '#C62828' },
    { icon: 'receipt', label: 'فاتورة بيع', route: '/sales/sales-invoice', color: '#E91E63' },
    { icon: 'create', label: 'قيد يومية', route: '/ledger/journal-entry', color: '#0f3460' },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير ☀️';
    if (h < 18) return 'مساء الخير 🌤️';
    return 'مساء الخير 🌙';
  };

  return (
    <>
      <Modal visible={drawerOpen} animationType="none" transparent onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setDrawerOpen(false)} activeOpacity={1} />
          <View style={[styles.drawerContainer, { backgroundColor: colors.background }]}>
            <AppDrawer onClose={() => setDrawerOpen(false)} />
          </View>
        </View>
      </Modal>

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
        
        {/* الهيدر */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.menuBtn}>
              <Ionicons name="menu-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.headerTitle}>دفتر المحاسب الذكي</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          {/* بطاقة الترحيب */}
          <View style={styles.welcomeCard}>
            <View>
              <Text style={styles.welcomeText}>أهلاً بك، {profile.name || 'المستخدم'}</Text>
              <Text style={styles.welcomeSub}>تفقد ملخص أعمالك اليوم</Text>
            </View>
            <Ionicons name="diamond" size={40} color="#e8b86d" />
          </View>

          {/* الإحصائيات */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="trending-up" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{totalSales.toLocaleString()}</Text>
              <Text style={styles.statLabel}>المبيعات</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="trending-down" size={24} color="#FF9800" />
              <Text style={styles.statValue}>{totalPurchases.toLocaleString()}</Text>
              <Text style={styles.statLabel}>المشتريات</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: netProfit >= 0 ? '#E8F5E9' : '#FFEBEE' }]}>
              <Ionicons name="cash-outline" size={24} color={netProfit >= 0 ? '#2E7D32' : '#C62828'} />
              <Text style={[styles.statValue, { color: netProfit >= 0 ? '#2E7D32' : '#C62828' }]}>{netProfit.toLocaleString()}</Text>
              <Text style={styles.statLabel}>صافي الربح</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="people" size={24} color="#9C27B0" />
              <Text style={styles.statValue}>{customers.length}</Text>
              <Text style={styles.statLabel}>العملاء</Text>
            </View>
          </View>

          {/* عمليات سريعة */}
          <Text style={styles.sectionTitle}>⚡ عمليات سريعة</Text>
          <View style={styles.quickRow}>
            {quickActions.map((q, i) => (
              <TouchableOpacity key={i} style={[styles.quickBtn, { backgroundColor: q.color + '15' }]} onPress={() => router.push(q.route)} activeOpacity={0.7}>
                <Ionicons name={q.icon as any} size={28} color={q.color} />
                <Text style={[styles.quickLabel, { color: q.color }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* الأقسام */}
          <Text style={styles.sectionTitle}>📂 الأقسام الرئيسية</Text>
          <View style={styles.sectionsGrid}>
            {sections.map((s, i) => (
              <TouchableOpacity key={i} style={styles.sectionCard} onPress={() => router.push(s.route as any)} activeOpacity={0.7}>
                <View style={[styles.sectionIcon, { backgroundColor: s.color + '20' }]}>
                  <Ionicons name={s.icon as any} size={30} color={s.color} />
                </View>
                <Text style={styles.sectionTitle2}>{s.title}</Text>
                <Text style={styles.sectionDesc}>{s.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#0a0a1a', paddingHorizontal: 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  notifBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  badge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#ff4444', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 12 },
  welcomeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f3460', borderRadius: 20, padding: 20, marginTop: 12, marginBottom: 8 },
  welcomeText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  welcomeSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  statCard: { width: (width - 40) / 2, padding: 16, borderRadius: 16, alignItems: 'center', elevation: 3 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#333', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 24, marginBottom: 12, textAlign: 'right' },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 16, gap: 8 },
  quickLabel: { fontSize: 12, fontWeight: '600' },
  sectionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionCard: { width: (width - 40) / 2, backgroundColor: '#fff', borderRadius: 18, padding: 20, elevation: 4 },
  sectionIcon: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  sectionTitle2: { fontSize: 16, fontWeight: '700', color: '#333', textAlign: 'right' },
  sectionDesc: { fontSize: 12, color: '#888', textAlign: 'right', marginTop: 4 },
  drawerOverlay: { flex: 1, flexDirection: 'row' },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerContainer: { width: 285 },
});
