import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import { useColors } from '../hooks/useColors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL, settings, subscription, profile, updateSettings, updateProfile, toggleLanguage } = useApp();
  const { db } = useDatabase() as any;
  const [activeTab, setActiveTab] = useState('profile');
  const [exporting, setExporting] = useState(false);
  const [localProfile, setLocalProfile] = useState({ ...profile, name: profile.name || '', phone: profile.phone || '', address: profile.address || '', email: profile.email || '', location: profile.location || '' });
  const [saved, setSaved] = useState(false);
  const [pin, setPin] = useState(settings.pin || '');
  const [fingerprint, setFingerprint] = useState(settings.fingerprint || false);
  const [darkMode, setDarkMode] = useState(settings.darkMode || false);
  const [voiceMode, setVoiceMode] = useState(settings.voiceMode || false);
  const [noNegativeStock, setNoNegativeStock] = useState(settings.noNegativeStock || false);
  const [whatsappIntegration, setWhatsappIntegration] = useState(settings.whatsappIntegration || false);
  const [printHeader, setPrintHeader] = useState(settings.printHeader || 'دفتر المحاسب الذكي');
  const [printFooter, setPrintFooter] = useState(settings.printFooter || 'شكراً لتعاملكم معنا');
  const [showDate, setShowDate] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [monthlyTarget, setMonthlyTarget] = useState('');
  const [yearlyTarget, setYearlyTarget] = useState('');
  const [collectionTarget, setCollectionTarget] = useState('');

  useEffect(() => {
    (async () => {
      setMonthlyTarget(await AsyncStorage.getItem('monthlyTarget') || '');
      setYearlyTarget(await AsyncStorage.getItem('yearlyTarget') || '');
      setCollectionTarget(await AsyncStorage.getItem('collectionTarget') || '');
    })();
  }, []);

  const handleSaveProfile = async () => {
    await updateProfile(localProfile);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveTargets = async () => {
    await AsyncStorage.setItem('monthlyTarget', monthlyTarget);
    await AsyncStorage.setItem('yearlyTarget', yearlyTarget);
    await AsyncStorage.setItem('collectionTarget', collectionTarget);
    Alert.alert('✅', 'تم حفظ الأهداف');
  };

  const handleExport = async () => {
    if (!db) { Alert.alert('', 'قاعدة البيانات غير متصلة'); return; }
    setExporting(true);
    try {
      const tables = ['accounts', 'customers', 'suppliers', 'items', 'currencies', 'account_groups', 'cash_boxes', 'banks', 'ewallets', 'journal_entries', 'journal_lines', 'sales_invoices', 'purchase_invoices', 'sequences', 'notifications'];
      let data: any = { version: 1, date: new Date().toISOString(), app: 'دفتر المحاسب الذكي', data: {} };
      for (const t of tables) { try { data.data[t] = await db.getAllAsync(`SELECT * FROM ${t}`); } catch(e) {} }
      const json = JSON.stringify(data, null, 2);
      await AsyncStorage.setItem('backup_data', json);
      Alert.alert('✅', 'تم تصدير النسخة الاحتياطية بنجاح\nحجم البيانات: ' + (json.length / 1024).toFixed(1) + ' KB');
    } catch(e) { Alert.alert('❌', 'فشل التصدير: ' + (e as any)?.message); } finally { setExporting(false); }
  };

  const handleLogout = () => {
    Alert.alert('🚪 تسجيل الخروج', 'هل تريد حفظ نسخة احتياطية قبل الخروج؟', [
      { text: '💾 نسخ احتياطي ثم خروج', onPress: async () => { await handleExport(); await AsyncStorage.removeItem('is_logged_in'); router.replace('/'); } },
      { text: '🚶 خروج مباشر', style: 'destructive', onPress: async () => { await AsyncStorage.removeItem('is_logged_in'); router.replace('/'); } },
      { text: 'إلغاء', style: 'cancel' },
    ]);
  };

  const tabs = [
    { key: 'profile', icon: 'person-outline', label: isRTL ? 'الملف' : 'Profile' },
    { key: 'targets', icon: 'flag-outline', label: isRTL ? 'الأهداف' : 'Targets' },
    { key: 'security', icon: 'shield-outline', label: isRTL ? 'الأمان' : 'Security' },
    { key: 'printing', icon: 'print-outline', label: isRTL ? 'الطباعة' : 'Printing' },
    { key: 'backup', icon: 'cloud-upload-outline', label: isRTL ? 'النسخ' : 'Backup' },
    { key: 'advanced', icon: 'settings-outline', label: isRTL ? 'متقدم' : 'Advanced' },
  ];

  const Toggle = ({ label, value, onToggle, desc }: { label: string; value: boolean; onToggle: () => void; desc?: string }) => (
    <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{label}</Text>
        {desc && <Text style={[styles.toggleDesc, { color: colors.mutedForeground }]}>{desc}</Text>}
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={value ? colors.primary : colors.mutedForeground} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? '⚙️ الإعدادات' : '⚙️ Settings', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabBar, { backgroundColor: colors.card }]} contentContainerStyle={{ paddingHorizontal: 4 }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} onPress={() => setActiveTab(tab.key)}>
            <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.primary : colors.mutedForeground }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && (
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{isRTL ? 'الاسم' : 'Name'}</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={localProfile.name} onChangeText={v => setLocalProfile(p => ({ ...p, name: v }))} placeholder={isRTL ? 'الاسم' : 'Name'} placeholderTextColor={colors.mutedForeground} textAlign={isRTL ? 'right' : 'left'} />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{isRTL ? 'الهاتف' : 'Phone'}</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={localProfile.phone} onChangeText={v => setLocalProfile(p => ({ ...p, phone: v }))} placeholder={isRTL ? 'الهاتف' : 'Phone'} placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" textAlign={isRTL ? 'right' : 'left'} />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={localProfile.email} onChangeText={v => setLocalProfile(p => ({ ...p, email: v }))} placeholder="email@example.com" placeholderTextColor={colors.mutedForeground} keyboardType="email-address" textAlign={isRTL ? 'right' : 'left'} />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveProfile}>
              <Ionicons name={saved ? 'checkmark-circle' : 'save'} size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{saved ? (isRTL ? '✅ تم الحفظ' : '✅ Saved') : (isRTL ? '💾 حفظ' : '💾 Save')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'targets' && (
          <View>
            <View style={[styles.tipCard, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
              <Ionicons name="flag" size={20} color={colors.warning} />
              <Text style={[styles.tipText, { color: colors.warning }]}>{isRTL ? 'حدد أهدافك الشهرية والسنوية لتتبع أداء المبيعات' : 'Set your monthly and yearly targets'}</Text>
            </View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{isRTL ? 'الهدف الشهري' : 'Monthly Target'}</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, fontSize: 22, fontWeight: '800', textAlign: 'center' }]} value={monthlyTarget} onChangeText={setMonthlyTarget} placeholder="0" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{isRTL ? 'الهدف السنوي' : 'Yearly Target'}</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, fontSize: 22, fontWeight: '800', textAlign: 'center' }]} value={yearlyTarget} onChangeText={setYearlyTarget} placeholder="0" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{isRTL ? 'هدف التحصيلات' : 'Collection Target'}</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, fontSize: 22, fontWeight: '800', textAlign: 'center' }]} value={collectionTarget} onChangeText={setCollectionTarget} placeholder="0" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveTargets}>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{isRTL ? '💾 حفظ الأهداف' : '💾 Save Targets'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'security' && (
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>🔐 {isRTL ? 'رمز PIN' : 'PIN Code'}</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, fontSize: 22, fontWeight: '800', textAlign: 'center' }]} value={pin} onChangeText={v => { setPin(v); updateSettings({ pin: v }); }} placeholder="****" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" maxLength={6} secureTextEntry />
            <Toggle label={isRTL ? '👆 تفعيل البصمة' : '👆 Enable Fingerprint'} value={fingerprint} onToggle={() => { setFingerprint(!fingerprint); updateSettings({ fingerprint: !fingerprint }); }} />
          </View>
        )}

        {activeTab === 'printing' && (
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{isRTL ? 'رأس الصفحة' : 'Header'}</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={printHeader} onChangeText={v => { setPrintHeader(v); updateSettings({ printHeader: v }); }} placeholderTextColor={colors.mutedForeground} textAlign={isRTL ? 'right' : 'left'} />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{isRTL ? 'تذييل الصفحة' : 'Footer'}</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={printFooter} onChangeText={v => { setPrintFooter(v); updateSettings({ printFooter: v }); }} placeholderTextColor={colors.mutedForeground} textAlign={isRTL ? 'right' : 'left'} />
            <Toggle label={isRTL ? 'إظهار التاريخ' : 'Show Date'} value={showDate} onToggle={() => { setShowDate(!showDate); updateSettings({ showDate: !showDate }); }} />
            <Toggle label={isRTL ? 'إظهار الأرصدة' : 'Show Balance'} value={showBalance} onToggle={() => { setShowBalance(!showBalance); updateSettings({ showBalance: !showBalance }); }} />
          </View>
        )}

        {activeTab === 'backup' && (
          <View>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={handleExport} disabled={exporting}>
              {exporting ? <ActivityIndicator color="#fff" /> : <Ionicons name="cloud-upload" size={22} color="#fff" />}
              <Text style={styles.actionText}>{exporting ? (isRTL ? 'جاري التصدير...' : 'Exporting...') : (isRTL ? '📤 تصدير نسخة احتياطية' : '📤 Export Backup')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1565C0' }]} onPress={() => Alert.alert('📥', isRTL ? 'الاستيراد قيد التطوير' : 'Import under development')}>
              <Ionicons name="cloud-download" size={22} color="#fff" />
              <Text style={styles.actionText}>{isRTL ? '📥 استيراد نسخة احتياطية' : '📥 Import Backup'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'advanced' && (
          <View>
            <Toggle label={isRTL ? '🌙 الوضع الداكن' : '🌙 Dark Mode'} value={darkMode} onToggle={() => setDarkMode(!darkMode)} />
            <Toggle label={isRTL ? '🎤 الأوامر الصوتية' : '🎤 Voice Commands'} value={voiceMode} onToggle={() => setVoiceMode(!voiceMode)} />
            <Toggle label={isRTL ? '🚫 منع البيع بالسالب' : '🚫 No Negative Stock'} value={noNegativeStock} onToggle={() => setNoNegativeStock(!noNegativeStock)} desc={isRTL ? 'يمنع البيع إذا كانت الكمية غير متوفرة' : 'Prevent sales when stock is negative'} />
            <Toggle label={isRTL ? '💬 تكامل واتساب' : '💬 WhatsApp'} value={whatsappIntegration} onToggle={() => setWhatsappIntegration(!whatsappIntegration)} />

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out" size={22} color="#C62828" />
              <Text style={styles.logoutText}>{isRTL ? '🚪 تسجيل الخروج' : '🚪 Logout'}</Text>
            </TouchableOpacity>
            <Text style={styles.version}>Smart Accountant v1.0.0 | © 2024</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { borderBottomWidth: 1, borderBottomColor: '#e0e0e0', maxHeight: 50 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 14 },
  tabText: { fontSize: 13, fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6, marginTop: 14, textAlign: 'right' },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1.5 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14, marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  toggleLabel: { fontSize: 16, fontWeight: '600', textAlign: 'right' },
  toggleDesc: { fontSize: 12, textAlign: 'right', marginTop: 2 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  tipCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  tipText: { flex: 1, fontSize: 13, textAlign: 'right' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 2, borderColor: '#FFCDD2', marginTop: 24 },
  logoutText: { color: '#C62828', fontSize: 16, fontWeight: '700' },
  version: { textAlign: 'center', color: '#aaa', marginTop: 16, fontSize: 12 },
});
