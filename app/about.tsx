import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useColors } from '../hooks/useColors';

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'حول التطبيق' : 'About', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 32, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <Ionicons name="book" size={40} color="#e8b86d" />
        </View>
        <Text style={[styles.appName, { color: colors.foreground }]}>دفتر المحاسب الذكي</Text>
        <Text style={[styles.appNameEn, { color: colors.mutedForeground }]}>Smart Accountant</Text>
        <View style={[styles.versionBadge, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[styles.versionText, { color: colors.primary }]}>v1.0.0</Text>
        </View>
        <Text style={[styles.desc, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'center' }]}>
          {isRTL ? 'نظام محاسبة ذكي متكامل للأعمال التجارية الصغيرة والمتوسطة. يعمل بالكامل دون إنترنت مع دعم كامل للغة العربية.' : 'A complete intelligent accounting system for small and medium businesses. Works fully offline with complete Arabic language support.'}
        </Text>

        {[
          { icon: 'person-outline' as const, label: isRTL ? 'المطور' : 'Developer', value: 'م/ صدام بشير' },
          { icon: 'logo-whatsapp' as const, label: 'WhatsApp', value: '736002798' },
          { icon: 'code-slash-outline' as const, label: isRTL ? 'التقنية' : 'Technology', value: 'React Native / Expo' },
          { icon: 'phone-portrait-outline' as const, label: isRTL ? 'المنصات' : 'Platforms', value: 'Android / iOS' },
          { icon: 'wifi-outline' as const, label: isRTL ? 'العمل دون إنترنت' : 'Offline First', value: isRTL ? 'نعم' : 'Yes' },
        ].map((item, i) => (
          <View key={i} style={[styles.infoRow, { borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name={item.icon} size={20} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>{item.label}</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{item.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoCircle: { width: 90, height: 90, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  appName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  appNameEn: { fontSize: 15, marginBottom: 12 },
  versionBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  versionText: { fontSize: 13, fontWeight: '700' },
  desc: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 14, borderBottomWidth: 1 },
  infoLabel: { flex: 1, fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
});
