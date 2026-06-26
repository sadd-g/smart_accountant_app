import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert, Modal, TextInput, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../hooks/useTranslation';
import { useLocalTable } from '../hooks/useLocalStore';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, lang, changeLanguage } = useTranslation();
  const { data: settingsData, add: addSetting, update: updateSetting } = useLocalTable('appSettings');
  
  const [currentScreen, setCurrentScreen] = useState('main');
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  
  // تحميل الإعدادات من قاعدة البيانات أو استخدام الافتراضية
  const [settings, setSettings] = useState({
    darkMode: true, showCurrency: true, noNegativeStock: true,
    showTransactionNumber: true, showTotalBelow: true, debtAlert: true,
    autoBackup: false, enablePassword: true, password: '1234',
    showHeader: true, showDate: true, shortFormat: false, showRemainingBalance: true,
    footerNote: '', voiceMode: false, showVoiceIcon: true, whatsappShare: false,
    fontSize: 'medium', sortBy: 'code',
    profile: { name: 'صدام بشير', address: '', phone: '736002798', email: 'saap1990@gmail.com', username: 'admin', location: '' },
    subscription: { active: true, daysLeft: 83, type: 'تجريبي', lastActivation: '2026-03-28' }
  });

  useEffect(() => {
    if (settingsData && settingsData.length > 0) {
      const saved = settingsData[0] as any;
      setSettings(prev => ({ ...prev, ...saved }));
    }
  }, [settingsData]);

  const updateSettingValue = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (settingsData && settingsData.length > 0) {
      await updateSetting((settingsData[0] as any).id, { [key]: value });
    } else {
      await addSetting(newSettings);
    }
  };

  const updateProfileValue = async (key: string, value: string) => {
    const newProfile = { ...settings.profile, [key]: value };
    updateSettingValue('profile', newProfile);
  };

  const handleChangeLanguage = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang as 'ar' | 'en');
  };

  const handleBackup = async () => {
    await addSetting({ ...settings, backupDate: new Date().toISOString() });
    Alert.alert('✅', lang === 'ar' ? 'تم حفظ النسخة الاحتياطية' : 'Backup saved successfully');
  };

  const handleRestore = () => Alert.alert('🔄', lang === 'ar' ? 'جاري استعادة البيانات...' : 'Restoring data...');
  const handleGoogleDrive = () => Alert.alert('☁️', lang === 'ar' ? 'جاري المزامنة مع Google Drive' : 'Syncing with Google Drive');
  const handleWhatsApp = () => Linking.openURL('https://wa.me/967736002798');
  const handleCall = () => Linking.openURL('tel:+967736002798');
  const handleEmail = () => Linking.openURL('mailto:saap1990@gmail.com');
  const handleShare = () => Alert.alert('🔗', 'https://smartaccountant.app');

  const screenTitle: any = {
    main: lang === 'ar' ? 'الإعدادات' : 'Settings',
    general: lang === 'ar' ? 'إعدادات عامة' : 'General',
    profile: lang === 'ar' ? 'البيانات الشخصية' : 'Profile',
    security: lang === 'ar' ? 'خيارات الأمان' : 'Security',
    printing: lang === 'ar' ? 'خيارات الطباعة' : 'Printing',
    backup: lang === 'ar' ? 'خيارات الحفظ' : 'Backup',
    advanced: lang === 'ar' ? 'خيارات أخرى' : 'Advanced',
  }[currentScreen] || 'Settings';

  const menuItem = (icon: string, label: string, onPress: () => void) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text><Text style={styles.menuText}>{label}</Text><Text style={styles.menuArrow}>→</Text>
    </TouchableOpacity>
  );

  const switchRow = (label: string, value: boolean, onToggle: (v: boolean) => void) => (
    <View style={styles.row}>
      <Text style={styles.rowText}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ true: '#10B981' }} />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => currentScreen === 'main' ? router.back() : setCurrentScreen('main')}>
          <Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>{screenTitle}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content}>
        {currentScreen === 'main' && (
          <View>
            {menuItem('💾', lang === 'ar' ? 'حفظ نسخة احتياطية' : 'Backup', handleBackup)}
            {menuItem('🔄', lang === 'ar' ? 'إسترجاع قاعدة البيانات' : 'Restore Database', handleRestore)}
            {menuItem('☁️', lang === 'ar' ? 'جوجل درايف' : 'Google Drive', handleGoogleDrive)}
            {menuItem('⚙️', lang === 'ar' ? 'الإعدادات العامة' : 'General Settings', () => setCurrentScreen('general'))}
            {menuItem('📞', lang === 'ar' ? 'تواصل والدعم' : 'Contact & Support', handleWhatsApp)}
            {menuItem('ℹ️', lang === 'ar' ? 'حول البرنامج' : 'About', () => router.push('/about'))}
            {menuItem('🔗', lang === 'ar' ? 'مشاركة البرنامج' : 'Share App', handleShare)}
            {menuItem('🚪', lang === 'ar' ? 'خروج' : 'Logout', () => router.push('/login'))}
          </View>
        )}

        {currentScreen === 'general' && (
          <View>
            {menuItem('👤', lang === 'ar' ? 'البيانات الشخصية' : 'Profile', () => setCurrentScreen('profile'))}
            {menuItem('🖨️', lang === 'ar' ? 'خيارات الطباعة' : 'Printing', () => setCurrentScreen('printing'))}
            {menuItem('🔒', lang === 'ar' ? 'خيارات الأمان' : 'Security', () => setCurrentScreen('security'))}
            {menuItem('💲', lang === 'ar' ? 'العملات' : 'Currencies', () => router.push('/ledger/currencies'))}
            {menuItem('💾', lang === 'ar' ? 'خيارات حفظ البيانات' : 'Backup Options', () => setCurrentScreen('backup'))}
            {menuItem('⚙️', lang === 'ar' ? 'خيارات أخرى' : 'Advanced', () => setCurrentScreen('advanced'))}
          </View>
        )}

        {currentScreen === 'profile' && (
          <View>
            {[
              { label: lang === 'ar' ? '👤 الاسم' : 'Name', key: 'name' },
              { label: lang === 'ar' ? '📍 العنوان' : 'Address', key: 'address' },
              { label: lang === 'ar' ? '📞 رقم التلفون' : 'Phone', key: 'phone' },
              { label: lang === 'ar' ? '📧 البريد الإلكتروني' : 'Email', key: 'email' },
              { label: lang === 'ar' ? '👤 اسم المستخدم' : 'Username', key: 'username' },
              { label: lang === 'ar' ? '🔑 كلمة المرور' : 'Password', key: 'password' },
              { label: lang === 'ar' ? '💾 الموقع' : 'Location', key: 'location' },
            ].map((field, i) => (
              <View key={i}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput style={styles.fieldInput} value={(settings.profile as any)[field.key]} onChangeText={v => updateProfileValue(field.key, v)} placeholderTextColor="#666" secureTextEntry={field.key === 'password'} />
              </View>
            ))}
          </View>
        )}

        {currentScreen === 'security' && (
          <View style={styles.card}>
            {switchRow(lang === 'ar' ? '🔑 تفعيل كلمة السر' : 'Enable Password', settings.enablePassword, v => updateSettingValue('enablePassword', v))}
            {settings.enablePassword && (
              <View style={{ padding: 14 }}>
                <Text style={styles.fieldLabel}>{lang === 'ar' ? '🔐 كلمة السر' : 'Password'}</Text>
                <TextInput style={styles.fieldInput} value={settings.password} onChangeText={v => updateSettingValue('password', v)} secureTextEntry keyboardType="numeric" maxLength={4} placeholderTextColor="#666" />
              </View>
            )}
          </View>
        )}

        {currentScreen === 'printing' && (
          <View style={styles.card}>
            {switchRow('📄 ' + (lang === 'ar' ? 'إظهار البيانات' : 'Show Header'), settings.showHeader, v => updateSettingValue('showHeader', v))}
            <View style={styles.divider} />
            {switchRow('📅 ' + (lang === 'ar' ? 'إظهار التاريخ' : 'Show Date'), settings.showDate, v => updateSettingValue('showDate', v))}
            <View style={styles.divider} />
            {switchRow('📝 ' + (lang === 'ar' ? 'طباعة مختصرة' : 'Short Format'), settings.shortFormat, v => updateSettingValue('shortFormat', v))}
            <View style={styles.divider} />
            {switchRow('💰 ' + (lang === 'ar' ? 'طباعة الرصيد' : 'Show Balance'), settings.showRemainingBalance, v => updateSettingValue('showRemainingBalance', v))}
            <View style={styles.divider} />
            <Text style={styles.fieldLabel}>{lang === 'ar' ? '💬 ترويسة/تذييل' : 'Footer Note'}</Text>
            <TextInput style={[styles.fieldInput, { height: 60 }]} value={settings.footerNote} onChangeText={v => updateSettingValue('footerNote', v)} placeholderTextColor="#666" multiline />
          </View>
        )}

        {currentScreen === 'backup' && (
          <View style={styles.card}>
            {switchRow('📆 ' + (lang === 'ar' ? 'حفظ يومي' : 'Daily Backup'), settings.autoBackup, v => updateSettingValue('autoBackup', v))}
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={handleRestore}><Text style={styles.rowText}>{lang === 'ar' ? '🔄 استعادة الصور' : 'Restore Images'}</Text></TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={handleGoogleDrive}><Text style={styles.rowText}>{lang === 'ar' ? '☁️ تغيير الحساب السحابي' : 'Change Cloud Account'}</Text></TouchableOpacity>
          </View>
        )}

        {currentScreen === 'advanced' && (
          <View style={styles.card}>
            {switchRow('💬 ' + (lang === 'ar' ? 'إرسال كشف واتساب' : 'WhatsApp Share'), settings.whatsappShare, v => updateSettingValue('whatsappShare', v))}
            <View style={styles.divider} />
            {switchRow('🗣️ ' + (lang === 'ar' ? 'الوضع الصوتي' : 'Voice Mode'), settings.voiceMode, v => updateSettingValue('voiceMode', v))}
            <View style={styles.divider} />
            {switchRow('💲 ' + (lang === 'ar' ? 'إظهار العملات' : 'Show Currency'), settings.showCurrency, v => updateSettingValue('showCurrency', v))}
            <View style={styles.divider} />
            {switchRow('🚫 ' + (lang === 'ar' ? 'إيقاف البيع بالسالب' : 'No Negative Stock'), settings.noNegativeStock, v => updateSettingValue('noNegativeStock', v))}
            <View style={styles.divider} />
            {switchRow('🔢 ' + (lang === 'ar' ? 'إظهار رقم العملية' : 'Show Transaction #'), settings.showTransactionNumber, v => updateSettingValue('showTransactionNumber', v))}
            <View style={styles.divider} />
            {switchRow('📉 ' + (lang === 'ar' ? 'إجمالي أسفل الحساب' : 'Total Below Account'), settings.showTotalBelow, v => updateSettingValue('showTotalBelow', v))}
            <View style={styles.divider} />
            {switchRow('🌙 ' + (lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode'), settings.darkMode, v => updateSettingValue('darkMode', v))}
            <View style={styles.divider} />
            {switchRow('🔔 ' + (lang === 'ar' ? 'تنبيه الديون' : 'Debt Alert'), settings.debtAlert, v => updateSettingValue('debtAlert', v))}
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={handleChangeLanguage}>
              <Text style={styles.rowText}>🌐 {lang === 'ar' ? 'تغيير لغة الواجهة' : 'Change Language'}</Text>
              <Text style={styles.valueText}>{lang === 'ar' ? 'العربية 🇾🇪' : 'English 🇬🇧'}</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={() => updateSettingValue('fontSize', settings.fontSize === 'medium' ? 'large' : 'medium')}>
              <Text style={styles.rowText}>🔤 {lang === 'ar' ? 'حجم الخط' : 'Font Size'}</Text>
              <Text style={styles.valueText}>{settings.fontSize}</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={() => updateSettingValue('sortBy', settings.sortBy === 'code' ? 'name' : 'code')}>
              <Text style={styles.rowText}>📋 {lang === 'ar' ? 'ترتيب الشاشة' : 'Sort Order'}</Text>
              <Text style={styles.valueText}>{settings.sortBy === 'code' ? (lang === 'ar' ? 'بالكود' : 'By Code') : (lang === 'ar' ? 'بالاسم' : 'By Name')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showActivationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{lang === 'ar' ? 'تفعيل النسخة' : 'Activate'}</Text><TouchableOpacity onPress={() => setShowActivationModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
          <View style={styles.modalBody}>
            <TextInput style={styles.fieldInput} value={activationCode} onChangeText={setActivationCode} placeholder={lang === 'ar' ? 'رمز التفعيل' : 'Activation Code'} placeholderTextColor="#666" />
            <TouchableOpacity style={styles.saveBtn} onPress={() => { setShowActivationModal(false); Alert.alert('✅', lang === 'ar' ? 'تم التفعيل' : 'Activated'); }}>
              <Text style={styles.saveBtnText}>✅ {lang === 'ar' ? 'تفعيل' : 'Activate'}</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { fontSize: 24, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#16213E', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a3550' },
  menuIcon: { fontSize: 22, marginRight: 10 },
  menuText: { color: '#FFFFFF', fontSize: 14, flex: 1 },
  menuArrow: { color: '#D4AF37', fontSize: 16 },
  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: '#2a3550' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  rowText: { color: '#FFFFFF', fontSize: 14 },
  valueText: { color: '#D4AF37', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#2a3550', marginHorizontal: 14 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12, paddingHorizontal: 14 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14, marginHorizontal: 14, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  saveBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
