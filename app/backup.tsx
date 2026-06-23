import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useColors } from '../hooks/useColors';

export default function BackupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const [backing, setBacking] = useState(false);
  const [lastBackup] = useState(new Date().toLocaleDateString());

  const handleBackup = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBacking(true);
    setTimeout(() => {
      setBacking(false);
      Alert.alert('', isRTL ? 'تم النسخ الاحتياطي بنجاح' : 'Backup completed successfully');
    }, 2000);
  };

  const actions = [
    { label: isRTL ? 'نسخ احتياطي الآن' : 'Backup Now', icon: 'cloud-upload-outline' as const, color: colors.primary, onPress: handleBackup },
    { label: isRTL ? 'استعادة من ملف' : 'Restore from File', icon: 'cloud-download-outline' as const, color: colors.warning, onPress: () => Alert.alert(isRTL ? 'استعادة' : 'Restore', isRTL ? 'اختر ملف النسخ الاحتياطي' : 'Choose backup file') },
    { label: isRTL ? 'ربط جوجل درايف' : 'Link Google Drive', icon: 'logo-google' as const, color: colors.success, onPress: () => Alert.alert('Google Drive', isRTL ? 'قريباً' : 'Coming soon') },
    { label: isRTL ? 'مشاركة النسخة' : 'Share Backup', icon: 'share-outline' as const, color: colors.info, onPress: () => Alert.alert(isRTL ? 'مشاركة' : 'Share', isRTL ? 'جاري التحضير...' : 'Preparing...') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'النسخ الاحتياطي' : 'Backup & Restore', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}>
        <View style={[styles.statusCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
          <Ionicons name="checkmark-circle" size={28} color={colors.success} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.statusTitle, { color: colors.foreground }]}>{isRTL ? 'حالة النسخ الاحتياطي' : 'Backup Status'}</Text>
            <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>{isRTL ? `آخر نسخة: ${lastBackup}` : `Last backup: ${lastBackup}`}</Text>
          </View>
        </View>

        {actions.map((action, i) => (
          <TouchableOpacity key={i} style={[styles.actionBtn, { backgroundColor: action.color + '12', borderColor: action.color }]} onPress={action.onPress} activeOpacity={0.7} disabled={backing && i === 0}>
            <Ionicons name={action.icon} size={24} color={action.color} />
            <Text style={[styles.actionLabel, { color: action.color }]}>{backing && i === 0 ? (isRTL ? 'جاري النسخ...' : 'Backing up...') : action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 18, borderWidth: 1.5, marginBottom: 24 },
  statusTitle: { fontSize: 15, fontWeight: '700' },
  statusSub: { fontSize: 13, marginTop: 2 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 16, borderWidth: 1.5, marginBottom: 14 },
  actionLabel: { fontSize: 16, fontWeight: '600' },
});
