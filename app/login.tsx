import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogin = async () => {
    if (pin.length === 4) {
      setIsLoading(true);
      setError('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/home');
      }, 1000);
    } else {
      setError('الرجاء إدخال رمز PIN كامل');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', '⌫'],
    ];

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, colIndex) => {
              if (key === '') {
                return <View key={colIndex} style={styles.keypadButton} />;
              }
              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.keypadButton}
                  onPress={() => key === '⌫' ? handleDelete() : handlePinPress(key)}
                >
                  <Text style={styles.keypadText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0A1128', '#1B2A4A', '#0F3460']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        {/* الشعار */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#D4AF37', '#FFD700', '#B8960C']}
            style={styles.logo}
          >
            <Text style={styles.logoText}>💎</Text>
          </LinearGradient>
        </View>

        {/* العنوان */}
        <Text style={styles.title}>دفتر المحاسب الذكي</Text>
        <Text style={styles.subtitle}>النظام المحاسبي المتكامل</Text>

        {/* نقاط PIN */}
        <View style={styles.pinDots}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.pinDot,
                i < pin.length && styles.pinDotFilled,
              ]}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* لوحة المفاتيح */}
        {renderKeypad()}

        {/* زر الدخول */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#D4AF37', '#B8960C']}
            style={styles.loginGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.loginText}>
              {isLoading ? '⏳ جاري الدخول...' : '🔐 تسجيل الدخول'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* خيارات */}
        <View style={styles.options}>
          <TouchableOpacity>
            <Text style={styles.optionText}>🔐 تسجيل بالبصمة</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.optionText}>📞 نسيت الرمز؟</Text>
          </TouchableOpacity>
        </View>

        {/* توقيع */}
        <Text style={styles.developer}>م/ صدام بشير</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: { marginBottom: 24 },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: { fontSize: 48 },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 32,
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#D4AF37',
    marginHorizontal: 8,
  },
  pinDotFilled: {
    backgroundColor: '#D4AF37',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 32,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  keypadButton: {
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 33,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  keypadText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loginButton: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#0A1128',
    fontSize: 18,
    fontWeight: 'bold',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  optionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  developer: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
});
