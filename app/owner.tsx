import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../hooks/useLocalStore';

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: accounts } = useLocalTable('accounts');
  const { data: customers } = useLocalTable('customers');
  const { data: invoices } = useLocalTable('salesInvoices');
  const { data: items } = useLocalTable('items');
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [subscriptions, setSubscriptions] = useState([
    { id: '1', user: 'أحمد', type: 'نصف سنوي', startDate: '2026-01-01', endDate: '2026-07-01', active: true },
    { id: '2', user: 'محمد', type: 'سنوي', startDate: '2026-03-15', endDate: '2027-03-15', active: true },
  ]);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const MASTER_PASSWORD = 'admin123';

  const handleUnlock = () => {
    if (password === MASTER_PASSWORD) {
      setIsUnlocked(true);
      setPassword('');
    } else {
      Alert.alert('خطأ', 'كلمة المرور غير صحيحة');
    }
  };

  const generateActivationCode = () => {
    const code = 'ACT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setGeneratedCode(code);
  };

  const handleToggleSubscription = (id: string) => {
    setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  const handleBroadcast = () => {
    if (broadcastMsg) {
      Alert.alert('✅', 'تم إرسال الإشعار الجماعي');
      setBroadcastMsg('');
      setShowGenerateModal(false);
    }
  };

  if (!isUnlocked) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
          <Text style={styles.title}>🔒 لوحة تحكم المالك</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.lockScreen}>
          <Text style={styles.lockIcon}>🔐</Text>
          <Text style={styles.lockTitle}>كلمة مرور المالك</Text>
          <TextInput style={styles.lockInput} value={password} onChangeText={setPassword} placeholder="أدخل كلمة المرور" placeholderTextColor="#666" secureTextEntry />
          <TouchableOpacity style={styles.lockBtn} onPress={handleUnlock}>
            <Text style={styles.lockBtnText}>فتح</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>كلمة المرور الافتراضية: admin123</Text>
        </View>
      </View>
    );
  }

  const totalSales = invoices.reduce((s: number, i: any) => s + (i.total || 0), 0);
  const totalCustomers = customers.length;
  const totalItems = items.length;
  const activeSubscriptions = subscriptions.filter(s => s.active).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>👑 لوحة تحكم المالك</Text>
        <TouchableOpacity onPress={() => setIsUnlocked(false)}><Text style={styles.logoutBtn}>🔒</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* إحصائيات */}
        <Text style={styles.sectionTitle}>📊 إحصائيات النظام</Text>
        <View style={styles.statsGrid}>
          {[
            { icon: '📚', label: 'الحسابات', value: accounts.length, color: '#D4AF37' },
            { icon: '👥', label: 'العملاء', value: totalCustomers, color: '#10B981' },
            { icon: '📄', label: 'الفواتير', value: invoices.length, color: '#3B82F6' },
            { icon: '💰', label: 'المبيعات', value: totalSales.toLocaleString() + ' ﷼', color: '#7C3AED' },
            { icon: '📦', label: 'الأصناف', value: totalItems, color: '#F59E0B' },
            { icon: '💎', label: 'مشتركين', value: activeSubscriptions, color: '#EF4444' },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* إدارة الاشتراكات */}
        <Text style={styles.sectionTitle}>💎 إدارة الاشتراكات</Text>
        <View style={styles.card}>
          {subscriptions.map(sub => (
            <View key={sub.id} style={styles.subRow}>
              <View style={styles.subInfo}>
                <Text style={styles.subUser}>👤 {sub.user}</Text>
                <Text style={styles.subType}>{sub.type}</Text>
                <Text style={styles.subDate}>{sub.startDate} → {sub.endDate}</Text>
              </View>
              <View style={styles.subActions}>
                <TouchableOpacity style={[styles.subToggle, sub.active ? styles.subActive : styles.subInactive]} onPress={() => handleToggleSubscription(sub.id)}>
                  <Text style={styles.subToggleText}>{sub.active ? '✅' : '❌'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteSubscription(sub.id)}><Text>🗑️</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* توليد رموز التفعيل */}
        <TouchableOpacity style={styles.generateBtn} onPress={() => { generateActivationCode(); setShowGenerateModal(true); }}>
          <Text style={styles.generateBtnText}>🔑 توليد رمز تفعيل</Text>
        </TouchableOpacity>

        {/* إشعار جماعي */}
        <Text style={styles.sectionTitle}>📢 إشعار جماعي</Text>
        <View style={styles.card}>
          <TextInput style={styles.broadcastInput} value={broadcastMsg} onChangeText={setBroadcastMsg} placeholder="نص الإشعار..." placeholderTextColor="#666" multiline />
          <TouchableOpacity style={styles.broadcastBtn} onPress={handleBroadcast}>
            <Text style={styles.broadcastBtnText}>📤 إرسال للجميع</Text>
          </TouchableOpacity>
        </View>

        {/* تحديثات */}
        <Text style={styles.sectionTitle}>🔄 تحديثات النظام</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.updateRow} onPress={() => Alert.alert('تحديث', 'جاري رفع تحديث جديد...')}>
            <Text style={styles.updateText}>📤 رفع تحديث جديد</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.updateRow} onPress={() => Alert.alert('نسخة', 'جاري إنشاء نسخة احتياطية كاملة...')}>
            <Text style={styles.updateText}>💾 نسخ احتياطي كامل</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.updateRow} onPress={() => Alert.alert('حذف', '⚠️ هل أنت متأكد من حذف جميع البيانات؟', [{ text: 'نعم', style: 'destructive' }, { text: 'لا' }])}>
            <Text style={[styles.updateText, { color: '#EF4444' }]}>🗑️ مسح جميع البيانات</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal رمز التفعيل */}
      <Modal visible={showGenerateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔑 رمز التفعيل الجديد</Text>
              <TouchableOpacity onPress={() => setShowGenerateModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.codeText}>{generatedCode}</Text>
              <Text style={styles.codeHint}>انسخ هذا الرمز وأرسله للمستخدم للتفعيل</Text>
              <TouchableOpacity style={styles.saveModalBtn} onPress={() => { setShowGenerateModal(false); Alert.alert('✅', 'تم حفظ الرمز'); }}>
                <Text style={styles.saveModalBtnText}>✅ تم</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { fontSize: 24, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  logoutBtn: { fontSize: 22 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10, marginTop: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '30%', backgroundColor: '#16213E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { color: '#94a3b8', fontSize: 10 },
  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: '#2a3550' },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  subInfo: { flex: 1 },
  subUser: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  subType: { color: '#D4AF37', fontSize: 11 },
  subDate: { color: '#94a3b8', fontSize: 10 },
  subActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subToggle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  subActive: { backgroundColor: '#10B981' + '30' },
  subInactive: { backgroundColor: '#EF4444' + '30' },
  subToggleText: { fontSize: 16 },
  generateBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  generateBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  broadcastInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', height: 60, textAlignVertical: 'top', margin: 12 },
  broadcastBtn: { backgroundColor: '#3B82F6', borderRadius: 10, padding: 10, margin: 12, alignItems: 'center' },
  broadcastBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  updateRow: { padding: 14 },
  updateText: { color: '#FFFFFF', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#2a3550' },
  lockScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  lockIcon: { fontSize: 64, marginBottom: 16 },
  lockTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  lockInput: { backgroundColor: '#16213E', borderRadius: 12, padding: 14, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', width: '100%', textAlign: 'center', fontSize: 18, marginBottom: 16 },
  lockBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, width: '100%', alignItems: 'center' },
  lockBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  hint: { color: '#6B7280', fontSize: 11, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16, alignItems: 'center' },
  codeText: { color: '#10B981', fontSize: 22, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 },
  codeHint: { color: '#94a3b8', fontSize: 12, marginBottom: 20 },
  saveModalBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, width: '100%', alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
