import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme/colors';
import { GoldenButton } from '../../components/ui/GoldenButton';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    startAnimations();
  }, []);
  
  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setIsLoading(false);
        // هنا يتم الانتقال للشاشة الرئيسية
      }, 1500);
    } else {
      setError('الرجاء إدخال رمز PIN كامل');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });
  
  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };
  
  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete'],
    ];
    
    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, colIndex) => {
              if (key === '') {
                return <View key={colIndex} style={styles.keypadButton} />;
              }
              if (key === 'delete') {
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={styles.keypadButton}
                    onPress={handleDelete}
                  >
                    <Text style={styles.keypadButtonText}>⌫</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.keypadButton}
                  onPress={() => handlePinPress(key)}
                >
                  <Text style={styles.keypadButtonText}>{key}</Text>
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
        colors={Colors.gradients.login}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.particles}>
        {[...Array(30)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.1, 0.5, 0.1],
                }),
              },
            ]}
          />
        ))}
      </View>
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* الشعار */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={Colors.gradients.gold}
            style={styles.logoCircle}
          >
            <Text style={styles.logoEmoji}>💎</Text>
          </LinearGradient>
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerTranslateX }] },
            ]}
          />
        </View>
        
        {/* العنوان */}
        <Text style={styles.title}>دفتر المحاسب الذكي</Text>
        <Text style={styles.subtitle}>النظام المحاسبي المتكامل</Text>
        
        {/* PIN dots */}
        {renderPinDots()}
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        {/* Keypad */}
        {renderKeypad()}
        
        {/* زر تسجيل الدخول */}
        <GoldenButton
          title="تسجيل الدخول"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginButton}
        />
        
        {/* خيارات إضافية */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>🔐 تسجيل بالبصمة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>📞 نسيت الرمز؟</Text>
          </TouchableOpacity>
        </View>
        
        {/* توقيع المطور */}
        <Text style={styles.developerText}>م/ صدام بشير</Text>
        
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particles: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    backgroundColor: Colors.primary.gold,
    borderRadius: BorderRadius.full,
    width: 4,
    height: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.glow,
  },
  logoEmoji: {
    fontSize: 50,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.primary.gold,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary.gold,
    marginHorizontal: Spacing.sm,
  },
  pinDotFilled: {
    backgroundColor: Colors.primary.gold,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 14,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  keypad: {
    width: '100%',
    maxWidth: 300,
    marginBottom: Spacing.xl,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  keypadButton: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.ui.glass,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  keypadButtonText: {
    fontSize: 24,
    color: Colors.text.white,
    fontWeight: 'bold',
  },
  loginButton: {
    width: '100%',
    maxWidth: 300,
    marginBottom: Spacing.lg,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  optionButton: {
    padding: Spacing.sm,
  },
  optionText: {
    color: Colors.text.white,
    fontSize: 14,
  },
  developerText: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: Spacing.lg,
  },
});
