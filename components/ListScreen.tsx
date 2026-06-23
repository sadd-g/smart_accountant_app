import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert, FlatList, Platform, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useColors } from '../hooks/useColors';

export interface ListItem {
  id: string;
  primary: string;
  secondary?: string;
  tertiary?: string;
  badge?: string;
  badgeColor?: string;
}

interface Props {
  title: string;
  data: ListItem[];
  onAdd: () => void;
  onEdit: (item: ListItem) => void;
  onDelete: (item: ListItem) => void;
  onView?: (item: ListItem) => void;
  accentColor?: string;
  emptyText?: string;
}

export default function ListScreen({ title, data, onAdd, onEdit, onDelete, onView, accentColor, emptyText }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useApp();
  const [search, setSearch] = useState('');

  const accent = accentColor || colors.primary;

  const filtered = data.filter(item =>
    item.primary.toLowerCase().includes(search.toLowerCase()) ||
    (item.secondary || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (item: ListItem) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      t.common.delete,
      `${isRTL ? 'هل تريد حذف' : 'Delete'} "${item.primary}"?`,
      [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.common.delete, style: 'destructive', onPress: () => onDelete(item) },
      ]
    );
  };

  const renderItem = ({ item }: { item: ListItem }) => (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <TouchableOpacity style={styles.rowContent} onPress={() => onView ? onView(item) : onEdit(item)} activeOpacity={0.7}>
        <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          <Text style={[styles.primary, { color: colors.foreground }]}>{item.primary}</Text>
          {item.secondary && <Text style={[styles.secondary, { color: colors.mutedForeground }]}>{item.secondary}</Text>}
          {item.tertiary && <Text style={[styles.tertiary, { color: colors.mutedForeground }]}>{item.tertiary}</Text>}
        </View>
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: item.badgeColor || accent }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: accent + '18' }]} onPress={() => onEdit(item)}>
          <Ionicons name="pencil" size={16} color={accent} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.destructive + '18' }]} onPress={() => handleDelete(item)}>
          <Ionicons name="trash" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t.common.search}
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        scrollEnabled={filtered.length > 0}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="documents-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{emptyText || t.common.noData}</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: accent, bottom: insets.bottom + 20 }]}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onAdd();
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  row: { marginHorizontal: 12, marginBottom: 8, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  rowContent: { flex: 1, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  primary: { fontSize: 15, fontWeight: '600' },
  secondary: { fontSize: 13, marginTop: 2 },
  tertiary: { fontSize: 12, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'column', gap: 4, padding: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
});
