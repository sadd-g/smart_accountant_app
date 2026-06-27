import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import { useColors } from '../hooks/useColors';

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDatabase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '🔔 الإشعارات', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }} />
      <View style={[styles.topBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={markAllNotificationsRead}>
          <Text style={[styles.markAll, { color: colors.primary }]}>تعليم الكل كمقروء</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(n: any) => n.id}
        contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 40 }}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="notifications-off-outline" size={60} color="#ccc" /><Text style={{ color: '#888', marginTop: 12, fontSize: 16 }}>لا توجد إشعارات</Text></View>}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderLeftColor: item.read ? colors.mutedForeground : colors.primary }]} onPress={() => markNotificationRead(item.id)} activeOpacity={0.7}>
            <View style={styles.cardRow}>
              <Ionicons name={item.type === 'system' ? 'information-circle' : 'notifications'} size={22} color={item.read ? colors.mutedForeground : colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.foreground, fontWeight: item.read ? '400' : '700' }]}>{item.title}</Text>
                <Text style={[styles.msg, { color: colors.mutedForeground }]}>{item.message}</Text>
                <Text style={[styles.date, { color: colors.mutedForeground }]}>{item.created_at}</Text>
              </View>
              {!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { padding: 12, alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  markAll: { fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 80 },
  card: { borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: { fontSize: 15, textAlign: 'right' },
  msg: { fontSize: 13, textAlign: 'right', marginTop: 4 },
  date: { fontSize: 10, textAlign: 'right', marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
});
