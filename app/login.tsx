import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');
const CORRECT_PIN = '1234';

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const router = useRouter();
  
  const shakeAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    if (isLocked && lockTimer > 0) {
      const timer = setTimeout(() => setLockTimer(lockTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (isLocked && lockTimer === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
  }, [isLocked, lockTimer]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePin = (digit: string) => {
    if (isLocked) return;
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setError('');
    }
  };

  const handleDelete = () => {
    if (isLocked) return;
    setPin(prev => prev.slice(0, -1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogin = async () => {
    if (isLocked) return;
    if (pin.length !== 4) return;
    
    if (pin === CORRECT_PIN) {
      setIsLoading(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 600);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shake();
      setError('رمز PIN غير صحيح');
      setPin('');
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setLockTimer(30);
        Alert.alert('🔒 تم القفل', 'تم قفل التطبيق لمدة 30 ثانية بسبب المحاولات الخاطئة');
      }
    }
  };

  const handleFingerprint = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert('❌', 'جهازك لا يدعم البصمة');
        return;
      }
      
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert('❌', 'لم يتم تسجيل بصمة على هذا الجهاز');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'تسجيل الدخول بالبصمة',
        fallbackLabel: 'استخدام رمز PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Fingerprint error:', error);
    }
  };

  const handleForgotPin = () => {
    Alert.alert(
      '🔑 استعادة كلمة السر',
      'يرجى التواصل مع مدير النظام لاستعادة كلمة السر.\n\n📞 واتساب: 736002798\n📧 saap1990@gmail.com',
      [
        { text: 'حسناً', style: 'default' },
        { text: 'تواصل واتساب', onPress: () => {} },
      ]
    );
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['🔐', '0', '⌫'],
  ];

  if (isLocked) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0A1128', '#16213E', '#1A1A2E']} style={styles.bg} />
        <View style={styles.lockContent}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>تم قفل التطبيق</Text>
          <Text style={styles.lockDesc}>يرجى الانتظار {lockTimer} ثانية</Text>
          <Text style={styles.lockHint}>لأسباب أمنية، تم قفل التطبيق مؤقتاً</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A1128', '#16213E', '#1A1A2E']} style={styles.bg} />

      <View style={styles.content}>
        {/* الشعار */}
        <View style={styles.logoContainer}>
          <LinearGradient colors={['#D4AF37', '#FFD700']} style={styles.logoCircle}>
            <Text style={styles.logoText}>💎</Text>
          </LinearGradient>
        </View>

        {/* العنوان */}
        <Text style={styles.title}>دفتر المحاسب الذكي</Text>
        <Text style={styles.subtitle}>النظام المحاسبي المتكامل</Text>

        {/* نقاط PIN */}
        <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled, error && styles.dotError]} />
          ))}
        </Animated.View>

        {/* رسالة الخطأ */}
        {error ? <Text style={styles.errorText}>{error}</Text> : <View style={{ height: 20 }} />}
        
        {attempts > 0 && !isLocked && (
          <Text style={styles.attemptsText}>محاولات متبقية: {3 - attempts}</Text>
        )}

        {/* لوحة المفاتيح */}
        <View style={styles.keypad}>
          {keys.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key, ci) => {
                if (key === '🔐') {
                  return (
                    <TouchableOpacity key={ci} style={styles.key} onPress={handleFingerprint}>
                      <Text style={styles.keyIcon}>🖐️</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity key={ci} style={[styles.key, key === '⌫' && styles.keyDelete]} onPress={() => key === '⌫' ? handleDelete() : handlePin(key)}>
                    <Text style={[styles.keyText, key === '⌫' && styles.keyDeleteText]}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* زر الدخول */}
        <TouchableOpacity style={[styles.loginBtn, pin.length !== 4 && styles.loginBtnDisabled, isLoading && styles.loginBtnLoading]} onPress={handleLogin} disabled={pin.length !== 4 || isLoading}>
          <LinearGradient colors={pin.length === 4 ? ['#D4AF37', '#FFD700'] : ['#2a3550', '#1a2235']} style={styles.loginGrad}>
            <Text style={[styles.loginText, pin.length !== 4 && styles.loginTextDisabled]}>
              {isLoading ? '⏳ جاري الدخول...' : '🔐 تسجيل الدخول'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* نسيت كلمة السر */}
        <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPin}>
          <Text style={styles.forgotText}>📞 نسيت كلمة السر؟</Text>
        </TouchableOpacity>

        {/* توقيع المطور */}
        <Text style={styles.developer}>م/ صدام بشير | 736002798</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  
  logoContainer: { marginBottom: 24 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', shadowColor: '#D4AF37', shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  logoText: { fontSize: 40 },
  
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#D4AF37', textAlign: 'center', marginBottom: 28 },
  
  dotsContainer: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(212,175,55,0.5)', backgroundColor: 'transparent' },
  dotFilled: { backgroundColor: '#D4AF37', borderColor: '#D4AF37', shadowColor: '#D4AF37', shadowOpacity: 0.5, shadowRadius: 5, elevation: 3 },
  dotError: { borderColor: '#EF4444', backgroundColor: '#EF4444' },
  
  errorText: { color: '#EF4444', fontSize: 13, marginBottom: 4, textAlign: 'center' },
  attemptsText: { color: '#F59E0B', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  
  keypad: { width: 280, marginBottom: 20 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  key: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  keyDelete: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' },
  keyText: { fontSize: 24, color: '#FFFFFF', fontWeight: '600' },
  keyDeleteText: { color: '#EF4444', fontSize: 18 },
  keyIcon: { fontSize: 22 },
  
  loginBtn: { width: 280, borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#D4AF37', shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  loginBtnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  loginBtnLoading: { opacity: 0.8 },
  loginGrad: { paddingVertical: 15, alignItems: 'center' },
  loginText: { color: '#0A1128', fontSize: 17, fontWeight: 'bold' },
  loginTextDisabled: { color: '#6B7280' },
  
  forgotBtn: { padding: 10, marginBottom: 20 },
  forgotText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecorationLine: 'underline' },
  
  developer: { color: 'rgba(255,255,255,0.4)', fontSize: 11, position: 'absolute', bottom: 30 },
  
  lockContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  lockIcon: { fontSize: 64, marginBottom: 16 },
  lockTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  lockDesc: { color: '#F59E0B', fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  lockHint: { color: '#94a3b8', fontSize: 13 },
});
