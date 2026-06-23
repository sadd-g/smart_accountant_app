import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

interface MenuItem {
  labelAr: string;
  labelEn: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  category: 'masters' | 'operations' | 'reports';
}

const MENU_ITEMS: MenuItem[] = [
  { labelAr: 'الحسابات', labelEn: 'Accounts', icon: 'wallet-outline', route: '/ledger/accounts', category: 'masters' },
  { labelAr: 'مجموعات الحسابات', labelEn: 'Account Groups', icon: 'folder-outline', route: '/ledger/account-groups', category: 'masters' },
  { labelAr: 'العملات', labelEn: 'Currencies', icon: 'cash-outline', route: '/ledger/currencies', category: 'masters' },
  { labelAr: 'الصناديق', labelEn: 'Cash Boxes', icon: 'briefcase-outline', route: '/ledger/cash-boxes', category: 'masters' },
  { labelAr: 'البنوك', labelEn: 'Banks', icon: 'business-outline', route: '/ledger/banks', category: 'masters' },
  { labelAr: 'المحافظ الإلكترونية', labelEn: 'E-Wallets', icon: 'phone-portrait-outline', route: '/ledger/ewallets', category: 'masters' },
  { labelAr: 'سند قبض نقدي', labelEn: 'Cash Receipt', icon: 'add-circle-outline', route: '/ledger/cash-receipt', category: 'operations' },
  { labelAr: 'سند صرف نقدي', labelEn: 'Cash Payment', icon: 'remove-circle-outline', route: '/ledger/cash-payment', category: 'operations' },
  { labelAr: 'سند قبض بنكي', labelEn: 'Bank Receipt', icon: 'card-outline', route: '/ledger/bank-receipt', category: 'operations' },
  { labelAr: 'سند صرف بنكي', labelEn: 'Bank Payment', icon: 'card-outline', route: '/ledger/bank-payment', category: 'operations' },
  { labelAr: 'قيد يومية', labelEn: 'Journal Entry', icon: 'create-outline', route: '/ledger/journal-entry', category: 'operations' },
  { labelAr: 'قيد يومية متكرر', labelEn: 'Recurring Journal', icon: 'repeat-outline', route: '/ledger/recurring-journal', category: 'operations' },
  { labelAr: 'كشف حساب', labelEn: 'Account Statement', icon: 'document-text-outline', route: '/ledger/account-statement', category: 'reports' },
  { labelAr: 'ميزان المراجعة', labelEn: 'Trial Balance', icon: 'scale-outline', route: '/ledger/trial-balance', category: 'reports' },
  { labelAr: 'دفتر الأستاذ', labelEn: 'General Ledger', icon: 'book-outline', route: '/ledger/general-ledger', category: 'reports' },
  { labelAr: 'تقارير العملات', labelEn: 'Currency Reports', icon: 'analytics-outline', route: '/ledger/currency-reports', category: 'reports' },
];

export default function LedgerIndex() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useApp();
  const color = colors.section1;

  const masters = MENU_ITEMS.filter(m => m.category === 'masters');
  const operations = MENU_ITEMS.filter(m => m.category === 'operations');
  const reports = MENU_ITEMS.filter(m => m.category === 'reports');

  const renderItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.route}
      style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
      onPress={() => router.push(item.route as never)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={item.icon} size={20} color={color} />
      </View>
      <Text style={[styles.itemLabel, { color: colors.foreground, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
        {isRTL ? item.labelAr : item.labelEn}
      </Text>
      <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );

  const renderGroup = (label: string, items: MenuItem[]) => (
    <View key={label}>
      <Text style={[styles.groupLabel, { color: color, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
      {items.map(renderItem)}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'دفتر الأستاذ العام' : 'General Ledger', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 16 }}>
        {renderGroup(isRTL ? t.common.masters : 'Masters', masters)}
        {renderGroup(isRTL ? t.common.operations : 'Operations', operations)}
        {renderGroup(isRTL ? t.common.reports : 'Reports', reports)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  groupLabel: { fontSize: 12, fontWeight: '700', marginTop: 20, marginBottom: 8, paddingHorizontal: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 12, marginBottom: 6, borderRadius: 12, borderWidth: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});
