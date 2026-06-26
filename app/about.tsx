import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleWhatsApp = () => Linking.openURL('https://wa.me/967736002798');
  const handleCall = () => Linking.openURL('tel:+967736002798');
  const handleEmail = () => Linking.openURL('mailto:saap1990@gmail.com');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>حول التطبيق</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ alignItems: 'center' }}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💎</Text>
        </View>
        <Text style={styles.appName}>دفتر المحاسب الذكي</Text>
        <Text style={styles.version}>الإصدار 1.0.0</Text>
        
        <View style={styles.card}>
          <Text style={styles.descTitle}>📋 وصف التطبيق</Text>
          <Text style={styles.descText}>
            دفتر المحاسب الذكي هو نظام محاسبي متكامل لإجراء العمليات المحاسبية بسهولة ومرونة. يتميز بواجهة سهلة الاستخدام وتصميم يمني أصيل، مع ميزة الأوامر الصوتية التي تعمل باتصال الإنترنت لتحويل صوتك إلى معاملات محاسبية فوراً.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.descTitle}>👨‍💻 معلومات المطور</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>الاسم</Text><Text style={styles.infoValue}>م/ صدام بشير</Text></View>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>رقم الهاتف</Text><Text style={styles.infoValue}>736002798</Text></View>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>البريد الإلكتروني</Text><Text style={styles.infoValue}>saap1990@gmail.com</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.descTitle}>📞 تواصل معنا</Text>
          <TouchableOpacity style={styles.contactBtn} onPress={handleWhatsApp}>
            <Text style={styles.contactBtnText}>💬 واتساب</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#3B82F6' }]} onPress={handleCall}>
            <Text style={styles.contactBtnText}>📞 اتصل الآن</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#EF4444' }]} onPress={handleEmail}>
            <Text style={styles.contactBtnText}>📧 بريد إلكتروني</Text></TouchableOpacity>
        </View>

        <Text style={styles.copyright}>© 2026 جميع الحقوق محفوظة</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { fontSize: 24, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  logoContainer: { marginTop: 20 },
  logo: { fontSize: 80 },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 },
  version: { color: '#D4AF37', fontSize: 14, marginBottom: 20 },
  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 16, width: '100%', marginBottom: 12, borderWidth: 1, borderColor: '#2a3550' },
  descTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  descText: { color: '#94a3b8', fontSize: 13, lineHeight: 22, textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { color: '#94a3b8', fontSize: 13 },
  infoValue: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#2a3550' },
  contactBtn: { backgroundColor: '#25D366', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 8 },
  contactBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  copyright: { color: '#6B7280', fontSize: 12, marginTop: 8 },
});
