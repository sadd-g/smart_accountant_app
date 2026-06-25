import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [showCurrency, setShowCurrency] = useState(true);
  const [noNegativeStock, setNoNegativeStock] = useState(true);
  const [dailyBackup, setDailyBackup] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>الإعدادات</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>🔒 الأمان</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('تغيير الرمز', 'سيتم توجيهك لتغيير رمز PIN')}>
            <Text style={styles.rowText}>تغيير رمز PIN</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowText}>تفعيل البصمة</Text>
            <Switch value={false} onValueChange={() => {}} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🎨 المظهر</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowText}>الوضع الليلي</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowText}>إظهار العملة</Text>
            <Switch value={showCurrency} onValueChange={setShowCurrency} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>📦 المخزون</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowText}>منع المبيعات السالبة</Text>
            <Switch value={noNegativeStock} onValueChange={setNoNegativeStock} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>💾 النسخ الاحتياطي</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowText}>نسخ احتياطي يومي</Text>
            <Switch value={dailyBackup} onValueChange={setDailyBackup} />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('نسخ احتياطي', 'جاري إنشاء نسخة احتياطية...')}>
            <Text style={styles.rowText}>إنشاء نسخة الآن</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('استعادة', 'جاري استعادة البيانات...')}>
            <Text style={styles.rowText}>استعادة نسخة</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>📱 النظام</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/owner')}>
            <Text style={styles.rowText}>لوحة تحكم المالك</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => router.push('/about')}>
            <Text style={styles.rowText}>حول التطبيق</Text>
            <Text style={styles.arrow}>→</Text>
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37', marginBottom: 12 },
  card: { backgroundColor: '#16213E', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: '#2a3550' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  rowText: { color: '#FFFFFF', fontSize: 16 },
  arrow: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#2a3550', marginHorizontal: 16 },
});
