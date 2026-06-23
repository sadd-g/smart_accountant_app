import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import { useColors } from '../hooks/useColors';

const NOTIF_SETTINGS_KEY = '@notif_settings_v1';

interface NotifSettings {
  debtAlert: boolean;
  preventDuplicateNames: boolean;
  errorAlert: boolean;
  dailyAutoSave: boolean;
  lowBalanceAlert: boolean;
  invoiceDueAlert: boolean;
  salesTargetAlert: boolean;
  lowStockAlert: boolean;
}

const defaults: NotifSettings = {
  debtAlert: true,
  preventDuplicateNames: true,
  errorAlert: true,
  dailyAutoSave: true,
  lowBalanceAlert: true,
  invoiceDueAlert: true,
  salesTargetAlert: true,
  lowStockAlert: true,
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDatabase();
  const color = colors.warning;

  const [tab, setTab] = useState<'settings' | 'list'>('list');
  const [ns, setNs] = useState<NotifSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_SETTINGS_KEY).then(v => {
      if (v) setNs({ ...defaults, ...JSON.parse(v) });
      setLoading(false);
    });
  }, []);

  const toggle = async (key: keyof NotifSettings) => {
    const updated = { ...ns, [key]: !ns[key] };
    setNs(updated);
    await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(updated));
  };

  const saveAll = async () => {
    setSaving(true);
    await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(ns));
    setSaving(false);
    Alert.alert('✅', isRTL ? 'تم حفظ الإعدادات' : 'Settings saved');
  };

  const notifIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    subscription: 'card-outline',
    expiry: 'warning-outline',
    reminder: 'alarm-outline',
    system: 'information-circle-outline',
  };
  const notifColorMap: Record<string, string> = {
    subscription: colors.section3,
    expiry: colors.warning,
    reminder: colors.info,
    system: colors.section1,
  };

  const unread = notifications.filter(n => !n.read).length;

  const switchItems: { key: keyof NotifSettings; labelAr: string; labelEn: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
    { key: 'debtAlert', labelAr: 'تنبيه الديون', labelEn: 'Debt Alerts', icon: 'warning-outline', desc: isRTL ? 'تنبيه عند تجاوز حد الديون' : 'Alert when debt limit exceeded' },
    { key: 'preventDuplicateNames', labelAr: 'منع تكرار الأسماء', labelEn: 'Prevent Duplicates', icon: 'copy-outline', desc: isRTL ? 'منع إدخال أسماء مكررة' : 'Block duplicate name entries' },
    { key: 'errorAlert', labelAr: 'تنبيه عند الخطأ', labelEn: 'Error Alerts', icon: 'close-circle-outline', desc: isRTL ? 'إشعار عند حدوث خطأ في البيانات' : 'Notify on data errors' },
    { key: 'dailyAutoSave', labelAr: 'حفظ يومي تلقائي', labelEn: 'Daily Auto-Save', icon: 'save-outline', desc: isRTL ? 'نسخ احتياطي تلقائي يومياً' : 'Automatic daily backup' },
    { key: 'lowBalanceAlert', labelAr: 'تنبيه الرصيد المنخفض', labelEn: 'Low Balance Alert', icon: 'cash-outline', desc: isRTL ? 'تحذير عند انخفاض رصيد الصندوق أو البنك' : 'Warn when cashbox/bank balance is low' },
    { key: 'invoiceDueAlert', labelAr: 'استحقاق فواتير العملاء', labelEn: 'Invoice Due Alerts', icon: 'calendar-outline', desc: isRTL ? 'تنبيه عند اقتراب موعد استحقاق الفاتورة' : 'Alert on upcoming invoice due dates' },
    { key: 'salesTargetAlert', labelAr: 'تنبيه هدف المبيعات', labelEn: 'Sales Target Alert', icon: 'trophy-outline', desc: isRTL ? 'إشعارات تقدم هدف المبيعات' : 'Sales target progress notifications' },
    { key: 'lowStockAlert', labelAr: 'تنبيه المخزون المنخفض', labelEn: 'Low Stock Alert', icon: 'cube-outline', desc: isRTL ? 'تحذير عند انخفاض مستوى المخزون' : 'Warn when stock level is low' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{
        title: isRTL ? 'التنبيهات والإشعارات' : 'Notifications',
        headerStyle: { backgroundColor: color },
        headerTintColor: '#fff',
      }} />

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'list' && { borderBottomColor: color, borderBottomWidth: 2 }]}
          onPress={() => setTab('list')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.tabText, { color: tab === 'list' ? color : colors.mutedForeground }]}>
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </Text>
            {unread > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'settings' && { borderBottomColor: color, borderBottomWidth: 2 }]}
          onPress={() => setTab('settings')}
        >
          <Text style={[styles.tabText, { color: tab === 'settings' ? color : colors.mutedForeground }]}>
            {isRTL ? 'الإعدادات' : 'Settings'}
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'list' ? (
        <>
          {unread > 0 && (
            <TouchableOpacity
              style={[styles.markAllBtn, { backgroundColor: color + '14', borderColor: color }]}
              onPress={() => markAllNotificationsRead()}
            >
              <Ionicons name="checkmark-done-outline" size={18} color={color} />
              <Text style={[styles.markAllText, { color: color }]}>{isRTL ? 'تعيين الكل مقروء' : 'Mark all as read'}</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={notifications.slice().reverse()}
            keyExtractor={n => n.id}
            contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={56} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 15 }}>
                  {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: item.read ? colors.card : color + '0C',
                    borderColor: item.read ? colors.border : color,
                  },
                ]}
                onPress={() => markNotificationRead(item.id)}
              >
                <View style={[styles.notifRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.notifIcon, { backgroundColor: (notifColorMap[item.type] || color) + '18' }]}>
                    <Ionicons name={notifIconMap[item.type] || 'notifications-outline'} size={22} color={notifColorMap[item.type] || color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
                    <Text style={[styles.notifTitle, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{item.title}</Text>
                    <Text style={[styles.notifMsg, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>{item.message}</Text>
                    <Text style={[styles.notifTime, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
                      {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                    </Text>
                  </View>
                  {!item.read && <View style={[styles.unreadDot, { backgroundColor: color }]} />}
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <FlatList
          data={switchItems}
          keyExtractor={i => i.key}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 80 }}
          ListHeaderComponent={
            loading ? (
              <ActivityIndicator color={color} style={{ marginVertical: 20 }} />
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.switchIcon, { backgroundColor: color + '14' }]}>
                <Ionicons name={item.icon} size={20} color={color} />
              </View>
              <View style={{ flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
                <Text style={[styles.switchLabel, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL ? item.labelAr : item.labelEn}
                </Text>
                <Text style={[styles.switchDesc, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.desc}
                </Text>
              </View>
              <Switch
                value={ns[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: colors.border, true: color + '80' }}
                thumbColor={ns[item.key] ? color : colors.mutedForeground}
              />
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={saveAll} disabled={saving}>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الإعدادات' : 'Save Settings')}</Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '600' },
  badge: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 12, padding: 10, borderRadius: 10, borderWidth: 1 },
  markAllText: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 80 },
  notifCard: { borderRadius: 14, borderWidth: 1, marginBottom: 8, padding: 14 },
  notifRow: { alignItems: 'center' },
  notifIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  notifMsg: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5 },
  switchRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  switchIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  switchLabel: { fontSize: 15, fontWeight: '600' },
  switchDesc: { fontSize: 12, marginTop: 2 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
