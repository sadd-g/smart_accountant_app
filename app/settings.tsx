import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // جميع المفاتيح
  const [darkMode, setDarkMode] = useState(true);
  const [showCurrency, setShowCurrency] = useState(true);
  const [noNegativeStock, setNoNegativeStock] = useState(true);
  const [showTransactionNumber, setShowTransactionNumber] = useState(true);
  const [showTotalBelow, setShowTotalBelow] = useState(false);
  const [debtAlert, setDebtAlert] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [language, setLanguage] = useState('ar');
  const [fontSize, setFontSize] = useState('medium');
  const [yearEndClosing, setYearEndClosing] = useState(false);
  const [subscription, setSubscription] = useState({ active: true, daysLeft: 90, type: 'تجريبي' });
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');

  const handleYearEndClosing = () => {
    Alert.alert('⚠️ تحذير', 'الإغلاق السنوي سيؤدي إلى تصفير حسابات الإيرادات والمصروفات ونقل الأرباح إلى حقوق الملكية. هل تريد المتابعة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تنفيذ الإغلاق', style: 'destructive', onPress: () => Alert.alert('✅', 'تم الإغلاق السنوي بنجاح') }
    ]);
  };

  const handleActivate = () => {
    Alert.alert('تفعيل', 'جاري التحقق من رمز التفعيل...');
    setShowActivationModal(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>الإعدادات</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* الاشتراك */}
        <Text style={styles.sectionTitle}>👑 الاشتراك</Text>
        <View style={styles.card}>
          <View style={styles.subscriptionRow}>
            <Text style={styles.subStatus}>{subscription.active ? '✅ نشط' : '❌ منتهي'}</Text>
            <Text style={styles.subDays}>{subscription.daysLeft} يوم متبقي</Text>
          </View>
          <TouchableOpacity style={styles.activateBtn} onPress={() => setShowActivationModal(true)}>
            <Text style={styles.activateBtnText}>🔑 تفعيل الاشتراك</Text>
          </TouchableOpacity>
        </View>

        {/* الأمان */}
        <Text style={styles.sectionTitle}>🔒 الأمان والرقابة</Text>
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.rowText}>🚫 إيقاف البيع بالسالب</Text><Switch value={noNegativeStock} onValueChange={setNoNegativeStock} /></View>
          <View style={styles.divider} />
          <View style={styles.row}><Text style={styles.rowText}>🔢 إظهار رقم العملية</Text><Switch value={showTransactionNumber} onValueChange={setShowTransactionNumber} /></View>
          <View style={styles.divider} />
          <View style={styles.row}><Text style={styles.rowText}>📉 إجمالي العمليات أسفل الحساب</Text><Switch value={showTotalBelow} onValueChange={setShowTotalBelow} /></View>
          <View style={styles.divider} />
          <View style={styles.row}><Text style={styles.rowText}>🔔 تنبيه الديون</Text><Switch value={debtAlert} onValueChange={setDebtAlert} /></View>
        </View>

        {/* المظهر */}
        <Text style={styles.sectionTitle}>🎨 المظهر</Text>
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.rowText}>🌙 الوضع الليلي</Text><Switch value={darkMode} onValueChange={setDarkMode} /></View>
          <View style={styles.divider} />
          <View style={styles.row}><Text style={styles.rowText}>💱 إظهار العملة</Text><Switch value={showCurrency} onValueChange={setShowCurrency} /></View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}><Text style={styles.rowText}>🌐 اللغة الحالية</Text><Text style={styles.valueText}>العربية</Text></TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => setFontSize(fontSize === 'medium' ? 'large' : 'medium')}>
            <Text style={styles.rowText}>🔤 حجم الخط</Text><Text style={styles.valueText}>{fontSize === 'medium' ? 'متوسط' : 'كبير'}</Text>
          </TouchableOpacity>
        </View>

        {/* النسخ الاحتياطي */}
        <Text style={styles.sectionTitle}>💾 النسخ الاحتياطي</Text>
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.rowText}>نسخ احتياطي تلقائي</Text><Switch value={autoBackup} onValueChange={setAutoBackup} /></View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('✅', 'تم إنشاء النسخة الاحتياطية')}>
            <Text style={styles.rowText}>إنشاء نسخة الآن</Text></TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}><Text style={styles.rowText}>استعادة نسخة</Text></TouchableOpacity>
        </View>

        {/* الإغلاق السنوي */}
        <Text style={styles.sectionTitle}>🗓️ الإغلاق السنوي</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleYearEndClosing}>
            <Text style={[styles.rowText, { color: '#EF4444' }]}>تنفيذ الإغلاق السنوي للحسابات</Text>
          </TouchableOpacity>
        </View>

        {/* لوحة تحكم المالك */}
        <Text style={styles.sectionTitle}>👑 المالك</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/owner')}>
            <Text style={styles.rowText}>لوحة تحكم المالك</Text></TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal تفعيل الاشتراك */}
      <Modal visible={showActivationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تفعيل الاشتراك</Text>
              <TouchableOpacity onPress={() => setShowActivationModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>رمز التفعيل</Text>
              <TextInput style={styles.fieldInput} value={activationCode} onChangeText={setActivationCode} placeholder="أدخل رمز التفعيل" placeholderTextColor="#666" />
              <TouchableOpacity style={styles.saveBtn} onPress={handleActivate}>
                <Text style={styles.saveBtnText}>✅ تفعيل</Text>
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
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10, marginTop: 20 },
  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: '#2a3550' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  rowText: { color: '#FFFFFF', fontSize: 14 },
  valueText: { color: '#D4AF37', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#2a3550', marginHorizontal: 14 },
  subscriptionRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  subStatus: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
  subDays: { color: '#94a3b8', fontSize: 14 },
  activateBtn: { backgroundColor: '#D4AF37', borderRadius: 10, padding: 12, margin: 14, alignItems: 'center' },
  activateBtnText: { color: '#0A1128', fontSize: 14, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  saveBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
