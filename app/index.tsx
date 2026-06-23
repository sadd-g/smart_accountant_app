import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert, Image, Platform, StyleSheet, Text,
  TouchableOpacity, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useColors } from '../hooks/useColors';

const PIN_LENGTH = 4;

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, t, isRTL, settings, subscription } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPin = pin + digit;
    setPin(newPin);
    setError('');
    if (newPin.length === PIN_LENGTH) {
      setTimeout(() => attemptLogin(newPin), 100);
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin(p => p.slice(0, -1));
    setError('');
  };

  const attemptLogin = (enteredPin: string) => {
    const success = login(enteredPin);
    if (success) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/dashboard');
    } else {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(t.login.wrongPin);
      setPin('');
    }
  };

  const handleFingerprint = () => {
    if (Platform.OS === 'web') {
      Alert.alert('معلومة', 'البصمة غير متاحة على الويب');
      return;
    }
    Alert.alert('البصمة', 'قم بتفعيل البصمة في الإعدادات');
  };

  const keys = [['1','2','3'],['4','5','6'],['7','8','9'],['',  '0', 'del']];

  return (
    <View style={[styles.container, { backgroundColor: colors.primary, paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.logoArea}>
        <View style={[styles.logoCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appTitle}>{t.login.title}</Text>
        <Text style={styles.appSubtitle}>{t.login.subtitle}</Text>
      </View>

      <View style={[styles.pinCard, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dotRow}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i < pin.length ? colors.primary : colors.border,
                  borderColor: colors.primary,
                }
              ]}
            />
          ))}
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
        ) : (
          <Text style={[styles.pinHint, { color: colors.mutedForeground }]}>{t.login.pinPlaceholder}</Text>
        )}

        <View style={styles.keypad}>
          {keys.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key, ki) => (
                key === '' ? (
                  <View key={ki} style={styles.keyEmpty} />
                ) : key === 'del' ? (
                  <TouchableOpacity key={ki} style={[styles.key, { backgroundColor: colors.secondary + '20' }]} onPress={handleDelete} activeOpacity={0.7}>
                    <Ionicons name="backspace-outline" size={22} color={colors.foreground} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity key={ki} style={[styles.key, { backgroundColor: colors.muted }]} onPress={() => handleDigit(key)} activeOpacity={0.7}>
                    <Text style={[styles.keyText, { color: colors.foreground }]}>{key}</Text>
                  </TouchableOpacity>
                )
              ))}
            </View>
          ))}
        </View>

        {settings.fingerprint && (
          <TouchableOpacity style={styles.fingerprintBtn} onPress={handleFingerprint}>
            <Ionicons name="finger-print" size={28} color={colors.primary} />
            <Text style={[styles.fingerprintText, { color: colors.primary }]}>{t.login.fingerprint}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.ownerBtn} onPress={() => router.push('/owner')}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.developer, { color: colors.mutedForeground }]}>{t.login.developer}</Text>

        <View style={[styles.subBadge, { backgroundColor: colors.success + '18' }]}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={[styles.subText, { color: colors.success }]}>{t.subscription.freeTrial} • {t.subscription.trialDays}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoArea: { alignItems: 'center', paddingVertical: 32 },
  logoCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoImage: { width: 68, height: 68, borderRadius: 34 },
  appTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  appSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  pinCard: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 32, paddingHorizontal: 24, alignItems: 'center' },
  dotRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  errorText: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  pinHint: { fontSize: 14, marginBottom: 8 },
  keypad: { width: '100%', maxWidth: 280, marginTop: 8 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  key: { width: 80, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 24, fontWeight: '600' },
  keyEmpty: { width: 80, height: 64 },
  fingerprintBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingVertical: 10, paddingHorizontal: 20 },
  fingerprintText: { fontSize: 14, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginTop: 8 },
  ownerBtn: { padding: 8 },
  developer: { fontSize: 12, marginTop: 8 },
  subBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  subText: { fontSize: 12, fontWeight: '600' },
});
