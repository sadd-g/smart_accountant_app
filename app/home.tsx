import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadows } from '../src/theme/colors';
import { StatsCard } from '../src/components/ui/StatsCard';
import { SearchBar } from '../src/components/ui/SearchBar';
import { QuickAction } from '../src/components/ui/QuickAction';
import { NotificationBar } from '../src/components/ui/NotificationBar';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const welcomeScale = useRef(new Animated.Value(0)).current;
  
  const statsData = [
    {
      title: 'إجمالي المبيعات',
      value: '2,450,000 ﷼',
      icon: '💰',
      gradient: ['#006B3F', '#008B4F'],
      delay: 0,
    },
    {
      title: 'المشتريات',
      value: '1,230,000 ﷼',
      icon: '📦',
      gradient: ['#1B2A4A', '#2A3F6A'],
      delay: 100,
    },
    {
      title: 'صافي الربح',
      value: '1,220,000 ﷼',
      icon: '📈',
      gradient: ['#D4AF37', '#FFD700'],
      delay: 200,
    },
    {
      title: 'العملاء',
      value: '145 عميل',
      icon: '👥',
      gradient: ['#7C3AED', '#9B6BFF'],
      delay: 300,
    },
  ];
  
  const quickActions = [
    { icon: '📄', label: 'فاتورة مبيعات', onPress: () => {}, color: '#10B981' },
    { icon: '📋', label: 'قيد محاسبي', onPress: () => {}, color: '#3B82F6' },
    { icon: '👤', label: 'عميل جديد', onPress: () => {}, color: '#7C3AED' },
    { icon: '📊', label: 'تقارير', onPress: () => {}, color: '#F59E0B' },
    { icon: '🏪', label: 'مخزون', onPress: () => {}, color: '#EF4444' },
  ];
  
  const notifications = [
    {
      id: '1',
      icon: '⚠️',
      title: 'تنبيه مخزون',
      message: 'صنف "أسمنت" وصل للحد الأدنى',
      time: 'منذ 5 دقائق',
    },
    {
      id: '2',
      icon: '💰',
      title: 'فاتورة جديدة',
      message: 'تم إصدار فاتورة مبيعات #SI-001',
      time: 'منذ 15 دقيقة',
    },
    {
      id: '3',
      icon: '🎯',
      title: 'هدف شهري',
      message: 'تم تحقيق 75% من هدف المبيعات',
      time: 'منذ ساعة',
    },
    {
      id: '4',
      icon: '📅',
      title: 'موعد تسليم',
      message: 'تسليم طلبية العميل أحمد غداً',
      time: 'منذ ساعتين',
    },
  ];
  
  useEffect(() => {
    startAnimations();
  }, []);
  
  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(welcomeScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // محاكاة تحديث البيانات
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* خلفية متدرجة */}
      <LinearGradient
        colors={Colors.gradients.dark}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.gold}
            colors={[Colors.primary.gold]}
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* الهيدر */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>مرحباً بك 👋</Text>
              <Text style={styles.userName}>صدام بشير</Text>
            </View>
            <Animated.View style={[styles.avatarContainer, { transform: [{ scale: welcomeScale }] }]}>
              <LinearGradient
                colors={Colors.gradients.gold}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>ص</Text>
              </LinearGradient>
            </Animated.View>
          </View>
          
          {/* شريط البحث */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onVoicePress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          />
          
          {/* البطاقات الإحصائية */}
          <View style={styles.statsContainer}>
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                {...stat}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              />
            ))}
          </View>
          
          {/* الإجراءات السريعة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ إجراءات سريعة</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickActionsScroll}
            >
              {quickActions.map((action, index) => (
                <QuickAction
                  key={index}
                  {...action}
                />
              ))}
            </ScrollView>
          </View>
          
          {/* الإشعارات */}
          <NotificationBar notifications={notifications} />
          
          {/* ملخص سريع */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['rgba(212,175,55,0.1)', 'rgba(0,107,63,0.1)']}
              style={styles.summaryGradient}
            >
              <Text style={styles.summaryTitle}>📊 ملخص اليوم</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>12</Text>
                  <Text style={styles.summaryLabel}>فاتورة مبيعات</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>5</Text>
                  <Text style={styles.summaryLabel}>فاتورة مشتريات</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>450,000</Text>
                  <Text style={styles.summaryLabel}>﷼ مبيعات</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          
        </Animated.View>
      </ScrollView>
    </View>
  );
}

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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  userName: {
    fontSize: 20,
    color: Colors.primary.gold,
    marginTop: Spacing.xs,
  },
  avatarContainer: {
    ...Shadows.glow,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: Spacing.md,
  },
  quickActionsScroll: {
    flexDirection: 'row',
  },
  summaryCard: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  summaryGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.gold,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
});

// أضف هذا داخل quickActions:
// موجود مسبقاً في الملف، فقط تأكد من وجود هذا الزر:
// { icon: '📚', label: 'الأستاذ العام', onPress: () => router.push('/accounts'), color: '#D4AF37' },
