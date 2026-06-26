import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert, Modal, TextInput, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // الشاشة الحالية
  const [currentScreen, setCurrentScreen] = useState('main');
  const screenTitle = {
    main: 'الإعدادات', general: 'إعدادات عامة', profile: 'البيانات الشخصية',
    security: 'خيارات الأمان', printing: 'خيارات الطباعة', backup: 'خيارات حفظ البيانات',
    advanced: 'خيارات أخرى', activation: 'تفعيل النسخة'
  }[currentScreen] || 'الإعدادات';

  // جميع المفاتيح
  const [settings, setSettings] = useState({
    darkMode: true, showCurrency: true, noNegativeStock: true,
    showTransactionNumber: true, showTotalBelow: true, debtAlert: true,
    autoBackup: false, enablePassword: true, password: '1234',
    showHeader: true, showDate: true, shortFormat: false, showRemainingBalance: true,
    footerNote: '', voiceMode: false, showVoiceIcon: true, whatsappShare: false,
    language: 'ar', fontSize: 'medium', sortBy: 'code',
    profile: { name: 'صدام بشير', address: '', phone: '', email: '', username: 'admin', location: '' },
    subscription: { active: true, daysLeft: 83, type: 'تجريبي', lastActivation: '2026-03-28' }
  });

  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const updateProfile = (key: string, value: string) => {
    setSettings({ ...settings, profile: { ...settings.profile, [key]: value } });
  };

  const handleYearEndClosing = () => {
    Alert.alert('⚠️ تحذير', 'الإغلاق السنوي سيؤدي إلى تصفير الإيرادات والمصروفات ونقلها لحقوق الملكية.', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تنفيذ', style: 'destructive', onPress: () => Alert.alert('✅', 'تم الإغلاق السنوي') }
    ]);
  };

  const handleBackup = () => Alert.alert('✅', 'تم حفظ النسخة الاحتياطية بنجاح');
  const handleRestore = () => Alert.alert('🔄', 'جاري استعادة قاعدة البيانات...');
  const handleGoogleDrive = () => Alert.alert('☁️', 'جاري الاتصال بـ Google Drive...');

  const renderMainScreen = () => (
    <View>
      {[
        { icon: '💾', label: 'حفظ نسخة احتياطية', onPress: handleBackup },
        { icon: '🔄', label: 'إسترجاع قاعدة البيانات', onPress: handleRestore },
        { icon: '☁️', label: 'جوجل درايف', onPress: handleGoogleDrive },
        { icon: '⚙️', label: 'الإعدادات العامة', onPress: () => setCurrentScreen('general') },
        { icon: '📞', label: 'تواصل والدعم', onPress: () => Alert.alert('📞', 'واتساب: +967XXXXXXXXX') },
        { icon: 'ℹ️', label: 'حول البرنامج', onPress: () => router.push('/about') },
        { icon: '🔗', label: 'مشاركة البرنامج', onPress: () => Alert.alert('🔗', 'رابط المشاركة: https://smartaccountant.app') },
        { icon: '🚪', label: 'خروج', onPress: () => router.push('/login') },
      ].map((item, i) => (
        <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <Text style={styles.menuText}>{item.label}</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGeneralScreen = () => (
    <View>
      {[
        { icon: '👤', label: 'البيانات الشخصية', onPress: () => setCurrentScreen('profile') },
        { icon: '🖨️', label: 'خيارات الطباعة', onPress: () => setCurrentScreen('printing') },
        { icon: '🔒', label: 'خيارات الأمان', onPress: () => setCurrentScreen('security') },
        { icon: '🔄', label: 'التحديثات', onPress: () => Alert.alert('🔄', 'الإصدار 1.0.0 - محدث') },
        { icon: '💲', label: 'العملات', onPress: () => router.push('/ledger/currencies') },
        { icon: '💾', label: 'خيارات حفظ البيانات', onPress: () => setCurrentScreen('backup') },
        { icon: '💻', label: 'استعراض البيانات من الكمبيوتر', onPress: () => Alert.alert('💻', 'افتح المتصفح على: http://localhost:19006') },
        { icon: '🗂️', label: 'خيارات الإشعارات', onPress: () => setCurrentScreen('advanced') },
        { icon: '⚙️', label: 'خيارات أخرى', onPress: () => setCurrentScreen('advanced') },
        { icon: '👑', label: 'شراء النسخة الكاملة', onPress: () => setCurrentScreen('activation'), subtitle: `آخر تفعيل: ${settings.subscription.lastActivation}` },
      ].map((item, i) => (
        <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuText}>{item.label}</Text>
            {item.subtitle ? <Text style={styles.menuSubtitle}>{item.subtitle}</Text> : null}
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProfileScreen = () => (
    <View>
      <Text style={styles.fieldLabel}>👤 الاسم</Text>
      <TextInput style={styles.fieldInput} value={settings.profile.name} onChangeText={(v) => updateProfile('name', v)} placeholder="الاسم" placeholderTextColor="#666" />
      <Text style={styles.fieldLabel}>📍 العنوان</Text>
      <TextInput style={styles.fieldInput} value={settings.profile.address} onChangeText={(v) => updateProfile('address', v)} placeholder="العنوان" placeholderTextColor="#666" />
      <Text style={styles.fieldLabel}>📞 رقم التلفون</Text>
      <TextInput style={styles.fieldInput} value={settings.profile.phone} onChangeText={(v) => updateProfile('phone', v)} placeholder="رقم الهاتف" placeholderTextColor="#666" keyboardType="phone-pad" />
      <Text style={styles.fieldLabel}>📧 البريد الإلكتروني</Text>
      <TextInput style={styles.fieldInput} value={settings.profile.email} onChangeText={(v) => updateProfile('email', v)} placeholder="البريد الإلكتروني" placeholderTextColor="#666" keyboardType="email-address" />
      <Text style={styles.fieldLabel}>👤 username</Text>
      <TextInput style={styles.fieldInput} value={settings.profile.username} onChangeText={(v) => updateProfile('username', v)} placeholder="اسم المستخدم" placeholderTextColor="#666" />
      <Text style={styles.fieldLabel}>🔑 password</Text>
      <TextInput style={styles.fieldInput} value={settings.profile.password || ''} onChangeText={(v) => updateProfile('password', v)} placeholder="كلمة المرور" placeholderTextColor="#666" secureTextEntry />
      <Text style={styles.fieldLabel}>💾 الموقع / إحداثياتك</Text>
      <TextInput style={styles.fieldInput} value={settings.profile.location} onChangeText={(v) => updateProfile('location', v)} placeholder="الموقع" placeholderTextColor="#666" />
    </View>
  );

  const renderSecurityScreen = () => (
    <View>
      <View style={styles.row}><Text style={styles.rowText}>🔑 تفعيل كلمة السر</Text><Switch value={settings.enablePassword} onValueChange={(v) => updateSetting('enablePassword', v)} trackColor={{ true: '#10B981' }} /></View>
      {settings.enablePassword && (
        <View>
          <Text style={styles.fieldLabel}>🔐 كلمة السر</Text>
          <TextInput style={styles.fieldInput} value={settings.password} onChangeText={(v) => updateSetting('password', v)} placeholder="كلمة السر" placeholderTextColor="#666" secureTextEntry keyboardType="numeric" maxLength={4} />
        </View>
      )}
    </View>
  );

  const renderPrintingScreen = () => (
    <View>
      <View style={styles.row}><Text style={styles.rowText}>📄 إظهار البيانات</Text><Switch value={settings.showHeader} onValueChange={(v) => updateSetting('showHeader', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>📅 إظهار التاريخ</Text><Switch value={settings.showDate} onValueChange={(v) => updateSetting('showDate', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>📝 طباعة مختصرة</Text><Switch value={settings.shortFormat} onValueChange={(v) => updateSetting('shortFormat', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>💰 طباعة الرصيد المتبقي</Text><Switch value={settings.showRemainingBalance} onValueChange={(v) => updateSetting('showRemainingBalance', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <Text style={styles.fieldLabel}>💬 ملاحظة أسفل التعهد (ترويسة/تذييل)</Text>
      <TextInput style={[styles.fieldInput, { height: 60 }]} value={settings.footerNote} onChangeText={(v) => updateSetting('footerNote', v)} placeholder="نص مخصص للتذييل" placeholderTextColor="#666" multiline />
      <View style={styles.row}>
        <Text style={styles.rowText}>🔻 مدين</Text>
        <Text style={styles.rowText}>🔺 دائن</Text>
      </View>
    </View>
  );

  const renderBackupScreen = () => (
    <View>
      <View style={styles.row}><Text style={styles.rowText}>📆 حفظ البيانات يومياً</Text><Switch value={settings.autoBackup} onValueChange={(v) => updateSetting('autoBackup', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <Text style={styles.fieldLabel}>📁 مجلد حفظ البيانات</Text>
      <TextInput style={styles.fieldInput} value="" placeholder="/storage/emulated/0/SmartAccountant/" placeholderTextColor="#666" />
      <View style={styles.divider} />
      <TouchableOpacity style={styles.row} onPress={() => Alert.alert('🔄', 'جاري استعادة الصور...')}><Text style={styles.rowText}>🔄 إستعادة الصور</Text></TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.row}><Text style={styles.rowText}>☁️ وقت حفظ البيانات</Text></TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.row} onPress={() => Alert.alert('☁️', 'تغيير الحساب السحابي')}><Text style={styles.rowText}>🌐 تغيير الحساب السحابي</Text></TouchableOpacity>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>🔔 تنبيه تلقائي عند الخطأ</Text><Switch value={true} onValueChange={() => {}} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>👑 إظهار إشعار عند الإغلاق</Text><Switch value={true} onValueChange={() => {}} trackColor={{ true: '#10B981' }} /></View>
    </View>
  );

  const renderAdvancedScreen = () => (
    <View>
      <View style={styles.row}><Text style={styles.rowText}>💬 إرسال كشف حساب واتساب</Text><Switch value={settings.whatsappShare} onValueChange={(v) => updateSetting('whatsappShare', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>🗣️ وضع الحساب الذكي الصوتي</Text><Switch value={settings.voiceMode} onValueChange={(v) => updateSetting('voiceMode', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>📌 أيقونة الموجه بالشاشة الرئيسية</Text><Switch value={settings.showVoiceIcon} onValueChange={(v) => updateSetting('showVoiceIcon', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>💲 إظهار العملات</Text><Switch value={settings.showCurrency} onValueChange={(v) => updateSetting('showCurrency', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>🚫 إيقاف البيع بالسالب</Text><Switch value={settings.noNegativeStock} onValueChange={(v) => updateSetting('noNegativeStock', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>🔢 إظهار رقم العملية</Text><Switch value={settings.showTransactionNumber} onValueChange={(v) => updateSetting('showTransactionNumber', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>📉 إجمالي العمليات أسفل الحساب</Text><Switch value={settings.showTotalBelow} onValueChange={(v) => updateSetting('showTotalBelow', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>🌙 الوضع الليلي</Text><Switch value={settings.darkMode} onValueChange={(v) => updateSetting('darkMode', v)} trackColor={{ true: '#D4AF37' }} /></View>
      <View style={styles.divider} />
      <View style={styles.row}><Text style={styles.rowText}>🔔 تنبيه الديون</Text><Switch value={settings.debtAlert} onValueChange={(v) => updateSetting('debtAlert', v)} trackColor={{ true: '#10B981' }} /></View>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.row} onPress={() => updateSetting('language', settings.language === 'ar' ? 'en' : 'ar')}>
        <Text style={styles.rowText}>🌐 تغيير لغة الواجهة</Text><Text style={styles.valueText}>{settings.language === 'ar' ? 'العربية' : 'English'}</Text></TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.row} onPress={() => updateSetting('fontSize', settings.fontSize === 'medium' ? 'large' : settings.fontSize === 'large' ? 'small' : 'medium')}>
        <Text style={styles.rowText}>🔤 حجم الخط</Text><Text style={styles.valueText}>{settings.fontSize}</Text></TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.row} onPress={() => updateSetting('sortBy', settings.sortBy === 'code' ? 'name' : 'code')}>
        <Text style={styles.rowText}>📋 ترتيب الشاشة الرئيسية</Text><Text style={styles.valueText}>{settings.sortBy === 'code' ? 'بالكود' : 'بالاسم'}</Text></TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.row} onPress={handleYearEndClosing}>
        <Text style={[styles.rowText, { color: '#EF4444' }]}>🗓️ الإغلاق السنوي للحسابات</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => currentScreen === 'main' ? router.back() : setCurrentScreen('main')}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{screenTitle}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentScreen === 'main' && renderMainScreen()}
        {currentScreen === 'general' && renderGeneralScreen()}
        {currentScreen === 'profile' && renderProfileScreen()}
        {currentScreen === 'security' && renderSecurityScreen()}
        {currentScreen === 'printing' && renderPrintingScreen()}
        {currentScreen === 'backup' && renderBackupScreen()}
        {currentScreen === 'advanced' && renderAdvancedScreen()}
        {currentScreen === 'activation' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.subStatus}>{settings.subscription.active ? '✅ نشط' : '❌ منتهي'}</Text>
              <Text style={styles.subType}>{settings.subscription.type} - {settings.subscription.daysLeft} يوم</Text>
              <Text style={styles.subDate}>آخر تفعيل: {settings.subscription.lastActivation}</Text>
            </View>
            <TouchableOpacity style={styles.activateBtn} onPress={() => setShowActivationModal(true)}>
              <Text style={styles.activateBtnText}>🔑 تفعيل النسخة الكاملة</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showActivationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>تفعيل النسخة الكاملة</Text><TouchableOpacity onPress={() => setShowActivationModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>رمز التفعيل</Text>
              <TextInput style={styles.fieldInput} value={activationCode} onChangeText={setActivationCode} placeholder="أدخل رمز التفعيل" placeholderTextColor="#666" />
              <TouchableOpacity style={styles.saveBtn} onPress={() => { setShowActivationModal(false); Alert.alert('✅', 'تم تفعيل النسخة الكاملة'); }}>
                <Text style={styles.saveBtnText}>✅ تفعيل</Text></TouchableOpacity>
            </View>
          </View>
        </View>
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
  menuSubtitle: { color: '#94a3b8', fontSize: 10, marginTop: 2 },
  menuArrow: { color: '#D4AF37', fontSize: 16 },
  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2a3550', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  rowText: { color: '#FFFFFF', fontSize: 14 },
  valueText: { color: '#D4AF37', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#2a3550', marginHorizontal: 14 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  subStatus: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
  subType: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  subDate: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  activateBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  activateBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  saveBtn: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
