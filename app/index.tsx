import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, KeyboardAvoidingView, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const addDigit = (d: string) => {
    if (pin.length < 4) {
      const n = pin + d;
      setPin(n);
      setError('');
      if (n.length === 4) {
        setLoading(true);
        setTimeout(async () => {
          if (n === '0000') {
            await AsyncStorage.setItem('is_logged_in', 'true');
            router.replace('/dashboard');
          } else {
            setError('رمز PIN غير صحيح');
            setPin('');
            shake();
          }
          setLoading(false);
        }, 300);
      }
    }
  };

  const removeDigit = () => { setPin(p => p.slice(0, -1)); setError(''); };

  const keys = [['1','2','3'], ['4','5','6'], ['7','8','9'], ['', '0', 'del']];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS==='ios'?'padding':'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      <Animated.View style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.logoSection}>
          <View style={styles.logoOuter}><View style={styles.logoInner}><Ionicons name="diamond" size={40} color="#e8b86d" /></View></View>
          <Text style={styles.appName}>دفتر المحاسب الذكي</Text>
          <Text style={styles.appNameEn}>Smart Accountant</Text>
          <View style={styles.divider} />
          <Text style={styles.appDesc}>النظام المحاسبي اليمني المتكامل</Text>
        </View>

        <View style={styles.pinCard}>
          <View style={styles.pinHeader}><Ionicons name="shield-checkmark" size={20} color="#e8b86d" /><Text style={styles.pinTitle}>أدخل رمز الدخول</Text></View>

          <View style={styles.dotsRow}>
            {[0,1,2,3].map(i => <View key={i} style={[styles.dot, i < pin.length && styles.dotActive, error && styles.dotError]}>{i < pin.length && <View style={styles.dotInner} />}</View>)}
          </View>

          {error ? <View style={styles.errorBox}><Ionicons name="alert-circle" size={16} color="#ff4444" /><Text style={styles.errorText}>{error}</Text></View> : <Text style={styles.pinHint}>{loading ? '⏳ جاري التحقق...' : '••••'}</Text>}

          <View style={styles.keypad}>
            {keys.map((row, ri) => (
              <View key={ri} style={styles.keyRow}>
                {row.map((key, ki) => {
                  if (key === '') return <View key={ki} style={styles.keyEmpty} />;
                  if (key === 'del') return (
                    <TouchableOpacity key={ki} style={[styles.key, styles.delKey]} onPress={removeDigit} disabled={pin.length===0}>
                      <Ionicons name="backspace-outline" size={24} color={pin.length===0?'#555':'#fff'} />
                    </TouchableOpacity>
                  );
                  return (
                    <TouchableOpacity key={ki} style={styles.key} onPress={() => addDigit(key)} disabled={loading}>
                      <Text style={styles.keyText}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/owner')}><Text style={styles.footerLink}>🔒 لوحة المالك</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/about')}><Text style={styles.footerLink}>ℹ️ حول التطبيق</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={styles.copyright}>© 2024 م/ صدام بشير | جميع الحقوق محفوظة</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoOuter: { width: 100, height: 100, borderRadius: 30, backgroundColor: 'rgba(232,184,109,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, transform: [{ rotate: '45deg' }] },
  logoInner: { width: 70, height: 70, borderRadius: 20, backgroundColor: 'rgba(15,52,96,0.8)', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-45deg' }], borderWidth: 2, borderColor: '#e8b86d' },
  appName: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center' },
  appNameEn: { fontSize: 14, color: '#e8b86d', textAlign: 'center', marginTop: 4, letterSpacing: 3 },
  divider: { width: 60, height: 2, backgroundColor: '#e8b86d', marginVertical: 12 },
  appDesc: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  pinCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 30, borderWidth: 1, borderColor: 'rgba(232,184,109,0.2)' },
  pinHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  pinTitle: { color: '#e8b86d', fontSize: 16, fontWeight: '600' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  dotActive: { borderColor: '#e8b86d', backgroundColor: 'rgba(232,184,109,0.2)' },
  dotError: { borderColor: '#ff4444' },
  dotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e8b86d' },
  errorBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20, backgroundColor: 'rgba(255,68,68,0.1)', paddingVertical: 8, borderRadius: 12 },
  errorText: { color: '#ff4444', fontSize: 13 },
  pinHint: { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 18, marginBottom: 20, letterSpacing: 8 },
  keypad: { width: '100%', maxWidth: 280, alignSelf: 'center' },
  keyRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  key: { width: 70, height: 60, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  keyEmpty: { width: 70, height: 60 },
  delKey: { backgroundColor: 'rgba(255,68,68,0.2)' },
  keyText: { fontSize: 26, fontWeight: '600', color: '#fff' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 24 },
  footerLink: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  copyright: { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, paddingBottom: 20, marginTop: 20 },
});
