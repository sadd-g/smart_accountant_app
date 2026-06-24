import { Ionicons } from '@expo/vector-icons'; import { Stack } from 'expo-router'; import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useColors } from '../hooks/useColors';

export default function Screen() {
  const colors = useColors();
  return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '💾 نسخ احتياطي', headerStyle: { backgroundColor: '#0f3460' }, headerTintColor: '#e8b86d' }} />
      <View style={st.empty}><Ionicons name="cloud-upload" size={60} color="#ccc" /><Text style={{ color: '#888', marginTop: 12, fontSize: 16 }}>💾 نسخ احتياطي</Text></View>
    </View>
  );
}
const st = StyleSheet.create({ container: { flex: 1 }, empty: { flex: 1, justifyContent: 'center', alignItems: 'center' } });
