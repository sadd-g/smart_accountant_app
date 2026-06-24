import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';
import { formatNumber, genId } from '../../db/database';

export default function CurrenciesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { db } = useDatabase() as any;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', name: '', nameAr: '', symbol: '', rate: '', isDefault: false });

  useEffect(() => { loadData(); }, [db]);

  const loadData = async () => {
    if (!db) return;
    try {
      const rows = await db.getAllAsync("SELECT * FROM currencies WHERE is_active=1 ORDER BY is_default DESC, code");
      setData(rows || []);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const openAdd = () => { setEditId(null); setForm({ code: '', name: '', nameAr: '', symbol: '', rate: '', isDefault: false }); setModalVisible(true); };
  const openEdit = (c: any) => { setEditId(c.id); setForm({ code: c.code, name: c.name, nameAr: c.name_ar, symbol: c.symbol, rate: c.rate?.toString() || '', isDefault: c.is_default === 1 }); setModalVisible(true); };

  const handleSave = async () => {
    if (!form.code || !form.nameAr) return Alert.alert('', 'الكود والاسم مطلوبان');
    if (!db) return Alert.alert('', 'قاعدة البيانات غير متصلة');
    
    try {
      if (form.isDefault) {
        await db.runAsync("UPDATE currencies SET is_default = 0");
      }
      
      if (editId) {
        await db.runAsync(
          "UPDATE currencies SET code=?, name=?, name_ar=?, symbol=?, rate=?, is_default=? WHERE id=?",
          [form.code, form.name, form.nameAr, form.symbol, parseFloat(form.rate) || 1, form.isDefault ? 1 : 0, editId]
        );
        Alert.alert('✅', 'تم تعديل العملة');
      } else {
        await db.runAsync(
          "INSERT INTO currencies(id,code,name,name_ar,symbol,rate,is_default) VALUES(?,?,?,?,?,?,?)",
          [genId(), form.code, form.name, form.nameAr, form.symbol, parseFloat(form.rate) || 1, form.isDefault ? 1 : 0]
        );
        Alert.alert('✅', 'تم إضافة العملة');
      }
      setModalVisible(false);
      await loadData();
    } catch(e: any) {
      Alert.alert('❌', e.message || 'فشل الحفظ');
    }
  };

  const handleDelete = async (c: any) => {
    Alert.alert('🗑️ حذف', `حذف "${c.name_ar}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        if (db) { await db.runAsync("UPDATE currencies SET is_active=0 WHERE id=?", [c.id]); await loadData(); }
      }},
    ]);
  };

  const handleToggleDefault = async (c: any) => {
    if (!db) return;
    await db.runAsync("UPDATE currencies SET is_default = 0");
    await db.runAsync("UPDATE currencies SET is_default = 1 WHERE id=?", [c.id]);
    await loadData();
    Alert.alert('✅', `تم تعيين ${c.name_ar} كعملة أساسية`);
  };

  const currencyColors: any = { YER: '#4CAF50', USD: '#2196F3', SAR: '#FF9800', default: '#e8b86d' };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '💱 العملات', headerStyle: { backgroundColor: '#0a0a1a' }, headerTintColor: '#e8b86d' }} />
      
      <View style={[styles.topBar, { backgroundColor: colors.card }]}>
        <Text style={[styles.titleText, { color: colors.foreground }]}>💰 أسعار الصرف والعملات</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add-circle" size={40} color="#e8b86d" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(c: any) => c.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="cash-outline" size={60} color="#ccc" /><Text style={{ color: '#888', marginTop: 12 }}>لا توجد عملات</Text></View>}
        renderItem={({ item }) => {
          const cColor = currencyColors[item.code] || currencyColors.default;
          return (
            <TouchableOpacity style={[styles.card, { borderLeftColor: cColor }]} onPress={() => openEdit(item)} activeOpacity={0.7}>
              <View style={styles.cardContent}>
                <View style={[styles.symbolCircle, { backgroundColor: cColor + '20', borderColor: cColor }]}>
                  <Text style={[styles.symbolText, { color: cColor }]}>{item.symbol}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardName, { color: colors.foreground }]}>{item.name_ar}</Text>
                  <Text style={[styles.cardCode, { color: colors.mutedForeground }]}>{item.code} • {item.name}</Text>
                  {item.is_default === 1 && <Text style={styles.defaultBadge}>⭐ العملة الأساسية</Text>}
                </View>
                <View style={styles.rateSection}>
                  <Text style={[styles.rateValue, { color: cColor }]}>{formatNumber(item.rate)}</Text>
                  <Text style={[styles.rateLabel, { color: colors.mutedForeground }]}>سعر الصرف</Text>
                </View>
                {/* أزرار التحكم */}
                <View style={{ flexDirection: 'column', gap: 4 }}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                    <Ionicons name="create-outline" size={18} color="#2196F3" />
                  </TouchableOpacity>
                  {item.is_default !== 1 && (
                    <TouchableOpacity onPress={() => handleToggleDefault(item)} style={styles.iconBtn}>
                      <Ionicons name="star-outline" size={18} color="#FF9800" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={18} color="#C62828" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ color: '#C62828', fontSize: 16 }}>إلغاء</Text></TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{editId ? '✏️ تعديل عملة' : '➕ إضافة عملة'}</Text>
            <TouchableOpacity onPress={handleSave}><Text style={{ color: '#2E7D32', fontSize: 16, fontWeight: '700' }}>حفظ</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>الكود *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={form.code} onChangeText={v => setForm(f => ({ ...f, code: v }))} placeholder="YER" placeholderTextColor={colors.mutedForeground} />
            
            <Text style={[styles.label, { color: colors.mutedForeground }]}>الاسم العربي *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} placeholder="ريال يمني" placeholderTextColor={colors.mutedForeground} textAlign="right" />
            
            <Text style={[styles.label, { color: colors.mutedForeground }]}>الاسم الإنجليزي</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="Yemeni Rial" placeholderTextColor={colors.mutedForeground} />
            
            <Text style={[styles.label, { color: colors.mutedForeground }]}>الرمز</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]} value={form.symbol} onChangeText={v => setForm(f => ({ ...f, symbol: v }))} placeholder="ر.ي" placeholderTextColor={colors.mutedForeground} textAlign="right" />
            
            <Text style={[styles.label, { color: colors.mutedForeground }]}>سعر الصرف</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, fontSize: 22, fontWeight: '800', textAlign: 'center' }]} value={form.rate} onChangeText={v => setForm(f => ({ ...f, rate: v }))} placeholder="1" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
            
            <TouchableOpacity style={styles.checkRow} onPress={() => setForm(f => ({ ...f, isDefault: !f.isDefault }))}>
              <Ionicons name={form.isDefault ? 'checkbox' : 'square-outline'} size={24} color="#e8b86d" />
              <Text style={[styles.checkText, { color: colors.foreground }]}>عملة أساسية</Text>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
          </ScrollView>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  titleText: { fontSize: 18, fontWeight: '700' },
  addBtn: { padding: 4 },
  empty: { alignItems: 'center', marginTop: 80 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderLeftWidth: 5, elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  symbolCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  symbolText: { fontSize: 20, fontWeight: '900' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  cardCode: { fontSize: 11, textAlign: 'right', marginTop: 2 },
  defaultBadge: { fontSize: 10, color: '#e8b86d', marginTop: 4, textAlign: 'right' },
  rateSection: { alignItems: 'center' },
  rateValue: { fontSize: 20, fontWeight: '800' },
  rateLabel: { fontSize: 10, marginTop: 2 },
  iconBtn: { padding: 6, backgroundColor: '#f0f0f0', borderRadius: 6 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6, marginTop: 14, textAlign: 'right' },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1.5 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  checkText: { fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 19, fontWeight: '700' },
});
