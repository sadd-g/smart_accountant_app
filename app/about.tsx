import { Ionicons } from '@expo/vector-icons'; import { Stack } from 'expo-router'; import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColors } from '../hooks/useColors';

export default function AboutScreen() {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'ℹ️ حول التطبيق', headerStyle: { backgroundColor: '#0a0a1a' }, headerTintColor: '#e8b86d' }} />
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        <Ionicons name="diamond" size={60} color="#e8b86d" style={{ marginBottom: 16 }} />
        <Text style={[styles.title, { color: colors.foreground }]}>دفتر المحاسب الذكي</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Smart Accountant v1.0.0</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>نظام محاسبة ذكي متكامل للأعمال التجارية الصغيرة والمتوسطة في اليمن. متوافق مع قانون الحسابات اليمني والمعايير الدولية.</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>👨‍💻 المطور</Text>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>م/ صدام بشير</Text>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>WhatsApp: 736002798</Text>
        </View>
        <Text style={[styles.copy, { color: colors.mutedForeground }]}>© 2024 جميع الحقوق محفوظة</Text>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 }, title: { fontSize: 24, fontWeight: '800', marginBottom: 4 }, subtitle: { fontSize: 14, marginBottom: 20 },
  desc: { fontSize: 14, textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  infoCard: { borderRadius: 16, padding: 20, width: '100%', marginBottom: 20 },
  infoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, textAlign: 'right' },
  infoText: { fontSize: 14, textAlign: 'right', marginBottom: 4 },
  copy: { fontSize: 12, marginTop: 20 },
});
