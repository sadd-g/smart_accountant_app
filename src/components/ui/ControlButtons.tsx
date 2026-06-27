import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';

interface Props {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSearch?: () => void;
  onPrint?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showSearch?: boolean;
  showPrint?: boolean;
  showRefresh?: boolean;
  showExport?: boolean;
  title?: string;
}

export const ControlButtons: React.FC<Props> = ({
  onAdd, onEdit, onDelete, onSearch, onPrint, onRefresh, onExport,
  showAdd = true, showEdit = true, showDelete = true,
  showSearch = true, showPrint = true, showRefresh = true, showExport = true,
  title = 'التقرير'
}) => {

  const handlePrint = () => {
    if (onPrint) { onPrint(); return; }
    Alert.alert('🖨️ طباعة', 'جاري الطباعة...');
  };

  const handleExport = async () => {
    if (onExport) { onExport(); return; }
    try {
      await Share.share({ message: `${title} - دفتر المحاسب الذكي`, title: title });
    } catch (e) {
      Alert.alert('تصدير', 'جاري التصدير...');
    }
  };

  const handleRefresh = () => {
    if (onRefresh) { onRefresh(); return; }
    Alert.alert('تحديث', 'جاري تحديث البيانات...');
  };

  const buttons = [
    { show: showAdd, icon: '➕', label: 'إضافة', color: '#10B981', bg: '#10B98120', border: '#10B98140', onPress: onAdd || (() => Alert.alert('إضافة', 'إضافة عنصر جديد')) },
    { show: showEdit, icon: '✏️', label: 'تعديل', color: '#3B82F6', bg: '#3B82F620', border: '#3B82F640', onPress: onEdit || (() => Alert.alert('تعديل', 'اختر عنصراً لتعديله')) },
    { show: showDelete, icon: '🗑️', label: 'حذف', color: '#EF4444', bg: '#EF444420', border: '#EF444440', onPress: onDelete || (() => Alert.alert('حذف', 'اختر عنصراً لحذفه')) },
    { show: showSearch, icon: '🔍', label: 'بحث', color: '#7C3AED', bg: '#7C3AED20', border: '#7C3AED40', onPress: onSearch || (() => {}) },
    { show: showPrint, icon: '🖨️', label: 'طباعة', color: '#F59E0B', bg: '#F59E0B20', border: '#F59E0B40', onPress: handlePrint },
    { show: showRefresh, icon: '🔄', label: 'تحديث', color: '#06B6D4', bg: '#06B6D420', border: '#06B6D440', onPress: handleRefresh },
    { show: showExport, icon: '📤', label: 'تصدير', color: '#8B5CF6', bg: '#8B5CF620', border: '#8B5CF640', onPress: handleExport },
  ].filter(b => b.show);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {buttons.map((btn, i) => (
          <TouchableOpacity key={i} style={[styles.btn, { backgroundColor: btn.bg, borderColor: btn.border }]} onPress={btn.onPress}>
            <Text style={styles.icon}>{btn.icon}</Text>
            <Text style={[styles.label, { color: btn.color }]}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const ControlHeader: React.FC<{ title: string; count?: number; onAdd?: () => void; onBack?: () => void }> = ({ title, count, onAdd, onBack }) => (
  <View style={styles.header}>
    {onBack && <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>←</Text></TouchableOpacity>}
    <Text style={styles.headerTitle}>{title}{count !== undefined ? ` (${count})` : ''}</Text>
    {onAdd && <TouchableOpacity onPress={onAdd} style={styles.addBtn}><Text style={styles.addText}>+</Text></TouchableOpacity>}
  </View>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 10, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'center' },
  btn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 7, borderRadius: 8, borderWidth: 1, gap: 3 },
  icon: { fontSize: 13 },
  label: { fontSize: 10, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#16213E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  backText: { fontSize: 20, color: '#D4AF37', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D4AF37' + '20', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37' },
  addText: { fontSize: 20, color: '#D4AF37', fontWeight: 'bold' },
});
