import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BackupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>النسخ الاحتياطي</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.icon}>💾</Text>
        <Text style={styles.infoTitle}>حافظ على بياناتك آمنة</Text>
        <Text style={styles.infoText}>قم بإنشاء نسخة احتياطية واستعدها عند الحاجة</Text>
        <TouchableOpacity style={styles.btn} onPress={() => Alert.alert('✅', 'تم إنشاء النسخة الاحتياطية')}>
          <Text style={styles.btnText}>📦 إنشاء نسخة احتياطية</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#3B82F6' }]} onPress={() => Alert.alert('🔄', 'جاري استعادة البيانات')}>
          <Text style={styles.btnText}>📥 استعادة نسخة</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#7C3AED' }]} onPress={() => Alert.alert('☁️', 'جاري المزامنة مع Google Drive')}>
          <Text style={styles.btnText}>☁️ مزامنة مع Google Drive</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { fontSize: 24, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 80, marginBottom: 20 },
  infoTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  infoText: { color: '#94a3b8', fontSize: 14, marginBottom: 32 },
  btn: { backgroundColor: '#10B981', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
