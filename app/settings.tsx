import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import { useApp } from '../context/AppContext';
import { useColors } from '../hooks/useColors';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t, settings, profile, updateSettings, updateProfile, toggleLanguage, toggleDarkMode } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'printing' | 'backup' | 'advanced' | 'csv'>('profile');
  const [localProfile, setLocalProfile] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const tabs = [
    { key: 'profile' as const, labelAr: 'الملف', labelEn: 'Profile', icon: 'person-outline' as const },
    { key: 'security' as const, labelAr: 'الأمان', labelEn: 'Security', icon: 'shield-outline' as const },
    { key: 'printing' as const, labelAr: 'الطباعة', labelEn: 'Printing', icon: 'print-outline' as const },
    { key: 'backup' as const, labelAr: 'النسخ', labelEn: 'Backup', icon: 'cloud-upload-outline' as const },
    { key: 'advanced' as const, labelAr: 'متقدم', labelEn: 'Advanced', icon: 'settings-outline' as const },
    { key: 'csv' as const, labelAr: 'CSV', labelEn: 'CSV', icon: 'document-text-outline' as const },
  ];

  const handleSave = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateProfile(localProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onToggle, label, desc }: { value: boolean; onToggle: () => void; label: string; desc?: string }) => (
    <View style={[styles.toggleRow, { borderBottomColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
        {desc && <Text style={[styles.toggleDesc, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>{desc}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : colors.mutedForeground}
      />
    </View>
  );

  const ActionBtn = ({ icon, label, color, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; onPress: () => void }) => (
    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: color + '12', borderColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.actionBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'الإعدادات' : 'Settings', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 6 }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} onPress={() => setActiveTab(tab.key)}>
            <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.primary : colors.mutedForeground }]}>
              {isRTL ? tab.labelAr : tab.labelEn}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 40 }}>

        {/* ── PROFILE ──────────────────────────────── */}
        {activeTab === 'profile' && (
          <View>
            <FormField label={t.settings.name} value={localProfile.name} onChangeText={v => setLocalProfile(p => ({ ...p, name: v }))} />
            <FormField label={t.settings.phone} value={localProfile.phone} onChangeText={v => setLocalProfile(p => ({ ...p, phone: v }))} keyboardType="phone-pad" />
            <FormField label={t.settings.address} value={localProfile.address} onChangeText={v => setLocalProfile(p => ({ ...p, address: v }))} multiline />
            <FormField label={t.settings.email} value={localProfile.email} onChangeText={v => setLocalProfile(p => ({ ...p, email: v }))} keyboardType="email-address" />
            <FormField label={t.settings.location} value={localProfile.location} onChangeText={v => setLocalProfile(p => ({ ...p, location: v }))} />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Ionicons name={saved ? 'checkmark' : 'save-outline'} size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{saved ? t.settings.saved : t.settings.save}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── SECURITY ─────────────────────────────── */}
        {activeTab === 'security' && (
          <View>
            <FormField label={t.settings.pin} value={settings.pin} onChangeText={v => updateSettings({ pin: v })} secureTextEntry keyboardType="numeric" maxLength={6} />
            <Toggle value={settings.fingerprint} onToggle={() => updateSettings({ fingerprint: !settings.fingerprint })} label={t.settings.fingerprint} />
            <Toggle value={settings.rememberSession} onToggle={() => updateSettings({ rememberSession: !settings.rememberSession })} label={t.settings.rememberSession} />
          </View>
        )}

        {/* ── PRINTING ─────────────────────────────── */}
        {activeTab === 'printing' && (
          <View>
            <FormField label={t.settings.printHeader} value={settings.printHeader} onChangeText={v => updateSettings({ printHeader: v })} />
            <FormField label={t.settings.printFooter} value={settings.printFooter} onChangeText={v => updateSettings({ printFooter: v })} />
            <Toggle value={settings.showDate} onToggle={() => updateSettings({ showDate: !settings.showDate })} label={t.settings.showDate} />
            <Toggle value={settings.showBalance} onToggle={() => updateSettings({ showBalance: !settings.showBalance })} label={t.settings.showBalance} />
            <Toggle value={settings.shortFormat} onToggle={() => updateSettings({ shortFormat: !settings.shortFormat })} label={t.settings.shortFormat} />
            <Toggle value={settings.showTransactionNumber} onToggle={() => updateSettings({ showTransactionNumber: !settings.showTransactionNumber })}
              label={isRTL ? 'إظهار رقم العملية' : 'Show Transaction Number'}
              desc={isRTL ? 'يظهر رقم العملية في كل سجل' : 'Show transaction number on each record'} />
          </View>
        )}

        {/* ── BACKUP ───────────────────────────────── */}
        {activeTab === 'backup' && (
          <View>
            <Toggle value={settings.dailyBackup} onToggle={() => updateSettings({ dailyBackup: !settings.dailyBackup })}
              label={isRTL ? 'حفظ يومي تلقائي' : 'Auto Daily Backup'}
              desc={isRTL ? 'يحفظ النسخة الاحتياطية تلقائياً كل يوم' : 'Automatically saves a backup every day'} />

            <ActionBtn icon="cloud-upload-outline" label={isRTL ? 'نسخ احتياطي الآن' : 'Backup Now'} color={colors.primary}
              onPress={() => Alert.alert(isRTL ? 'نسخ احتياطي' : 'Backup', isRTL ? 'جاري النسخ...' : 'Backing up...')} />
            <ActionBtn icon="share-social-outline" label={isRTL ? 'مشاركة النسخة' : 'Share Backup'} color={colors.section3}
              onPress={() => Alert.alert(isRTL ? 'مشاركة' : 'Share', isRTL ? 'جاري المشاركة...' : 'Sharing...')} />
            <ActionBtn icon="cloud-download-outline" label={isRTL ? 'استعادة البيانات' : 'Restore Data'} color={colors.warning}
              onPress={() => Alert.alert(isRTL ? 'استعادة' : 'Restore', isRTL ? 'اختر ملف النسخ الاحتياطي' : 'Choose backup file')} />
            <ActionBtn icon="logo-google" label={isRTL ? 'ربط بجوجل درايف' : 'Google Drive'} color={colors.success}
              onPress={() => Alert.alert('Google Drive', isRTL ? 'ربط جوجل درايف قريباً' : 'Google Drive integration coming soon')} />

            <View style={[styles.infoBox, { backgroundColor: colors.info + '10', borderColor: colors.info }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.info} />
              <Text style={[styles.infoText, { color: colors.info, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL
                  ? 'يتم حفظ البيانات تلقائياً في قاعدة البيانات المحلية. استخدم النسخ الاحتياطي للحفاظ على البيانات عند تغيير الجهاز.'
                  : 'Data is automatically saved to the local database. Use backup to preserve data when changing devices.'}
              </Text>
            </View>
          </View>
        )}

        {/* ── ADVANCED ─────────────────────────────── */}
        {activeTab === 'advanced' && (
          <View>
            <Toggle value={settings.darkMode} onToggle={toggleDarkMode} label={t.settings.darkMode} />

            <View style={[styles.toggleRow, { borderBottomColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{t.settings.language}</Text>
              <TouchableOpacity style={[styles.langBtn, { backgroundColor: colors.primary + '12', borderColor: colors.primary }]} onPress={toggleLanguage}>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{isRTL ? 'English' : 'العربية'}</Text>
              </TouchableOpacity>
            </View>

            <Toggle value={settings.voiceMode} onToggle={() => updateSettings({ voiceMode: !settings.voiceMode })}
              label={isRTL ? 'المساعد الصوتي' : 'Voice Assistant'}
              desc={isRTL ? 'تفعيل إدخال العمليات بالصوت' : 'Enable voice-based transaction entry'} />
            <Toggle value={settings.showCurrency} onToggle={() => updateSettings({ showCurrency: !settings.showCurrency })}
              label={isRTL ? 'إظهار العملات' : 'Show Currencies'}
              desc={isRTL ? 'إظهار رمز العملة مع كل مبلغ' : 'Show currency symbol with amounts'} />
            <Toggle value={settings.noNegativeStock} onToggle={() => updateSettings({ noNegativeStock: !settings.noNegativeStock })}
              label={isRTL ? 'إيقاف البيع بالسالب' : 'Prevent Negative Stock'}
              desc={isRTL ? 'لا يسمح بالبيع أكثر من المتوفر بالمخزون' : 'Block sales when stock goes negative'} />
            <Toggle value={settings.showTransactionNumber} onToggle={() => updateSettings({ showTransactionNumber: !settings.showTransactionNumber })}
              label={isRTL ? 'إظهار رقم العملية' : 'Show Transaction Number'} />
            <Toggle value={settings.whatsappIntegration} onToggle={() => updateSettings({ whatsappIntegration: !settings.whatsappIntegration })}
              label={isRTL ? 'إرسال كشف واتساب' : 'Send Statement via WhatsApp'}
              desc={isRTL ? 'إرسال الكشوفات والفواتير عبر واتساب' : 'Send statements and invoices via WhatsApp'} />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.destructive + '12', borderColor: colors.destructive, marginTop: 8 }]}
              onPress={() => Alert.alert(isRTL ? 'إغلاق السنة' : 'Year End', isRTL ? 'هل تريد إغلاق السنة المحاسبية؟' : 'Close fiscal year?', [{ text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' }, { text: isRTL ? 'إغلاق' : 'Close', style: 'destructive', onPress: () => {} }])}>
              <Ionicons name="calendar-outline" size={20} color={colors.destructive} />
              <Text style={[styles.actionBtnText, { color: colors.destructive }]}>{t.settings.yearEndClosing}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── CSV IMPORT/EXPORT ─────────────────────── */}
        {activeTab === 'csv' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? 'تصدير البيانات' : 'Export Data'}
            </Text>
            {[
              { label: isRTL ? 'تصدير العملاء CSV' : 'Export Customers CSV', icon: 'people-outline' as const, color: colors.section3 },
              { label: isRTL ? 'تصدير الموردين CSV' : 'Export Suppliers CSV', icon: 'business-outline' as const, color: colors.section2 },
              { label: isRTL ? 'تصدير الأصناف CSV' : 'Export Items CSV', icon: 'cube-outline' as const, color: colors.section5 },
              { label: isRTL ? 'تصدير الفواتير CSV' : 'Export Invoices CSV', icon: 'receipt-outline' as const, color: colors.section4 },
              { label: isRTL ? 'تصدير الحسابات CSV' : 'Export Accounts CSV', icon: 'book-outline' as const, color: colors.section1 },
              { label: isRTL ? 'تصدير كل الجداول' : 'Export All Tables', icon: 'download-outline' as const, color: colors.primary },
            ].map((item, i) => (
              <ActionBtn key={i} icon={item.icon} label={item.label} color={item.color} onPress={() => Alert.alert(isRTL ? 'تصدير' : 'Export', isRTL ? `جاري تصدير ${item.label}...` : `Exporting ${item.label}...`)} />
            ))}

            <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 16 }]} />

            <Text style={[styles.sectionHeading, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? 'استيراد البيانات' : 'Import Data'}
            </Text>

            <View style={[styles.infoBox, { backgroundColor: colors.warning + '10', borderColor: colors.warning, marginBottom: 12 }]}>
              <Ionicons name="warning-outline" size={16} color={colors.warning} />
              <Text style={[styles.infoText, { color: colors.warning, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL
                  ? 'الاستيراد يضيف البيانات فقط ولا يحذف الموجود. افتح ملف CSV في Excel باستخدام UTF-8.'
                  : 'Import only adds new records — it does not delete existing data. Open CSV files in Excel using UTF-8 encoding.'}
              </Text>
            </View>

            {[
              { label: isRTL ? 'استيراد العملاء' : 'Import Customers', icon: 'people-outline' as const, color: colors.section3 },
              { label: isRTL ? 'استيراد الموردين' : 'Import Suppliers', icon: 'business-outline' as const, color: colors.section2 },
              { label: isRTL ? 'استيراد الأصناف' : 'Import Items', icon: 'cube-outline' as const, color: colors.section5 },
            ].map((item, i) => (
              <ActionBtn key={i} icon={item.icon} label={item.label} color={item.color} onPress={() => Alert.alert(isRTL ? 'استيراد' : 'Import', isRTL ? 'اختر ملف CSV للاستيراد' : 'Choose CSV file to import')} />
            ))}

            <ActionBtn icon="cloud-download-outline" label={isRTL ? 'تنزيل قالب CSV' : 'Download CSV Template'} color={colors.info}
              onPress={() => Alert.alert(isRTL ? 'القالب' : 'Template', isRTL ? 'يتم تنزيل القالب...' : 'Downloading template...')} />

            <View style={[styles.infoBox, { backgroundColor: colors.info + '10', borderColor: colors.info, marginTop: 8 }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.info} />
              <Text style={[styles.infoText, { color: colors.info, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL
                  ? 'نصيحة: قم بتنزيل القالب أولاً، ثم امله بالبيانات واستورده. تأكد من حفظ الملف بترميز UTF-8 لدعم اللغة العربية.'
                  : 'Tip: Download the template first, fill it with your data, then import. Save the file with UTF-8 encoding for Arabic support.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { borderBottomWidth: 1 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 13 },
  tabText: { fontSize: 12, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '500' },
  toggleDesc: { fontSize: 12, marginTop: 2 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 14, borderWidth: 1.5, marginBottom: 10 },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  langBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  sectionHeading: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  divider: { height: 1, marginVertical: 8 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
