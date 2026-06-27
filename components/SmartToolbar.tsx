import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SmartToolbar({ onAction }) {
  const actions = [
    { name: 'عرض', icon: 'eye' },
    { name: 'بحث', icon: 'search' },
    { name: 'تعديل', icon: 'create' },
    { name: 'حذف', icon: 'trash' },
    { name: 'حفظ', icon: 'save' },
    { name: 'طباعة', icon: 'print' },
  ];

  return (
    <View style={styles.toolbar}>
      {actions.map((item, index) => (
        <TouchableOpacity key={index} style={styles.iconBtn} onPress={() => onAction(item.name)}>
          <Ionicons name={item.icon as any} size={22} color="#0A1128" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10, margin: 5 },
  iconBtn: { padding: 8 }
});
