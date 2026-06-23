import { Stack } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function GeneralLedgerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const color = colors.section1;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'دفتر الأستاذ' : 'General Ledger', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <View style={[styles.center, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) }]}>
        <Text style={{ color: colors.mutedForeground }}>{isRTL ? 'اختر حساباً لعرض حركته' : 'Select an account to view its ledger'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
