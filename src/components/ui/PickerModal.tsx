import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';

interface PickerModalProps {
  visible: boolean; title: string; data: any[];
  searchPlaceholder?: string; displayField?: string; subField?: string;
  onSelect: (item: any) => void; onClose: () => void;
}

export const PickerModal: React.FC<PickerModalProps> = ({
  visible, title, data, searchPlaceholder = '🔍 بحث...',
  displayField = 'name', subField = 'code', onSelect, onClose
}) => {
  const [search, setSearch] = useState('');
  const filtered = (data || []).filter((item: any) => {
    const d = item[displayField] || ''; const s = item[subField] || '';
    return d.includes(search) || s.includes(search);
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}><Text style={styles.title}>{title}</Text><TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity></View>
          <View style={styles.body}>
            <TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder={searchPlaceholder} placeholderTextColor="#666" />
            <ScrollView style={{ maxHeight: 400 }}>
              {filtered.map((item: any, i: number) => (
                <TouchableOpacity key={item.id || i} style={styles.item} onPress={() => { onSelect(item); onClose(); }}>
                  <Text style={styles.itemText}>{item[displayField]}</Text>
                  {item[subField] ? <Text style={styles.itemSub}>{item[subField]}</Text> : null}
                </TouchableOpacity>
              ))}
              {filtered.length === 0 && <Text style={styles.noData}>لا توجد نتائج</Text>}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  content: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  title: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  close: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  body: { padding: 16 },
  search: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14, marginBottom: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  itemText: { color: '#FFFFFF', fontSize: 14 },
  itemSub: { color: '#94a3b8', fontSize: 11 },
  noData: { color: '#94a3b8', textAlign: 'center', padding: 20 },
});
