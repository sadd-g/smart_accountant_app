import { ControlButtons, ControlHeader } from '../../src/components/ui/ControlButtons';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

interface JournalLine {
  id: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  notes: string;
}

interface JournalEntry {
  id: string;
  number: string;
  date: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  lines: JournalLine[];
  createdAt: string;
}

export default function JournalEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: entries, add, remove } = useLocalTable<JournalEntry>('journalEntries');
  const { data: accounts } = useLocalTable('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', accountId: '', accountName: '', debit: 0, credit: 0, notes: '' },
    { id: '2', accountId: '', accountName: '', debit: 0, credit: 0, notes: '' },
  ]);

  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), accountId: '', accountName: '', debit: 0, credit: 0, notes: '' }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 2) setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: string, value: any) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSave = async () => {
    if (!description) { Alert.alert('خطأ', 'الرجاء إدخال وصف القيد'); return; }
    if (!isBalanced) { Alert.alert('خطأ', 'القيد غير متوازن! يجب أن يتساوى المدين مع الدائن'); return; }

    const entryNumber = `JV-${(entries.length + 1).toString().padStart(6, '0')}`;
    await add({
      number: entryNumber,
      date,
      description,
      totalDebit,
      totalCredit,
      lines: lines.filter(l => l.accountName && (l.debit > 0 || l.credit > 0)),
    });

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (entry: JournalEntry) => {
    Alert.alert('تأكيد الحذف', `هل تريد حذف القيد "${entry.number}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(entry.id) },
    ]);
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setLines([
      { id: '1', accountId: '', accountName: '', debit: 0, credit: 0, notes: '' },
      { id: '2', accountId: '', accountName: '', debit: 0, credit: 0, notes: '' },
    ]);
  };

  const filtered = entries.filter((e: JournalEntry) => 
    e.number?.includes(searchQuery) || e.description?.includes(searchQuery)
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>القيود اليومية</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlBar}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.printBtn}><Text style={styles.printBtnText}>🖨️</Text></TouchableOpacity>
      </View>

      {/* ملخص */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>عدد القيود</Text>
          <Text style={styles.summaryValue}>{entries.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>آخر قيد</Text>
          <Text style={styles.summaryValue}>{entries[0]?.number || '-'}</Text>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>لا توجد قيود يومية</Text>
          <Text style={styles.emptySubtext}>اضغط + لإضافة قيد جديد</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: JournalEntry) => item.id}
          renderItem={({ item }: { item: JournalEntry }) => (
            <TouchableOpacity style={styles.entryCard} onPress={() => { setSelectedEntry(item); setShowDetailModal(true); }} onLongPress={() => handleDelete(item)}>
              <View style={styles.entryHeader}>
                <View>
                  <Text style={styles.entryNumber}>{item.number}</Text>
                  <Text style={styles.entryDate}>{item.date}</Text>
                </View>
                <View style={styles.entryAmounts}>
                  <Text style={[styles.amountText, { color: '#10B981' }]}>مدين: {item.totalDebit?.toLocaleString()}</Text>
                  <Text style={[styles.amountText, { color: '#EF4444' }]}>دائن: {item.totalCredit?.toLocaleString()}</Text>
                </View>
              </View>
              <Text style={styles.entryDescription}>{item.description}</Text>
              <View style={styles.entryFooter}>
                <Text style={styles.entryLines}>{item.lines?.length || 0} أسطر</Text>
                {item.totalDebit === item.totalCredit && <Text style={styles.balancedTag}>✅ متوازن</Text>}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        />
      )}

      {/* Modal إضافة قيد جديد */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>قيد يومية جديد</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>التاريخ</Text>
              <TextInput style={styles.fieldInput} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="#666" />

              <Text style={styles.fieldLabel}>الوصف *</Text>
              <TextInput style={[styles.fieldInput, { height: 60 }]} value={description} onChangeText={setDescription} placeholder="وصف القيد المحاسبي" placeholderTextColor="#666" multiline textAlignVertical="top" />

              <Text style={styles.sectionTitle}>تفاصيل القيد</Text>
              
              {lines.map((line, index) => (
                <View key={line.id} style={styles.lineCard}>
                  <View style={styles.lineHeader}>
                    <Text style={styles.lineNumber}>سطر #{index + 1}</Text>
                    {lines.length > 2 && (
                      <TouchableOpacity onPress={() => removeLine(line.id)}>
                        <Text style={styles.removeLineBtn}>🗑️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <TextInput
                    style={styles.fieldInput}
                    value={line.accountName}
                    onChangeText={(v) => updateLine(line.id, 'accountName', v)}
                    placeholder="اسم الحساب"
                    placeholderTextColor="#666"
                  />
                  
                  <View style={styles.amountRow}>
                    <View style={styles.amountHalf}>
                      <Text style={styles.amountLabel}>مدين</Text>
                      <TextInput
                        style={[styles.fieldInput, { color: '#10B981' }]}
                        value={line.debit > 0 ? line.debit.toString() : ''}
                        onChangeText={(v) => updateLine(line.id, 'debit', parseFloat(v) || 0)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666"
                      />
                    </View>
                    <View style={styles.amountHalf}>
                      <Text style={styles.amountLabel}>دائن</Text>
                      <TextInput
                        style={[styles.fieldInput, { color: '#EF4444' }]}
                        value={line.credit > 0 ? line.credit.toString() : ''}
                        onChangeText={(v) => updateLine(line.id, 'credit', parseFloat(v) || 0)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666"
                      />
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addLineBtn} onPress={addLine}>
                <Text style={styles.addLineBtnText}>+ إضافة سطر</Text>
              </TouchableOpacity>

              {/* ملخص المدين والدائن */}
              <View style={styles.balanceCard}>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>إجمالي مدين</Text>
                  <Text style={[styles.balanceValue, { color: '#10B981' }]}>{totalDebit.toLocaleString()} ﷼</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>إجمالي دائن</Text>
                  <Text style={[styles.balanceValue, { color: '#EF4444' }]}>{totalCredit.toLocaleString()} ﷼</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>الفرق</Text>
                  <Text style={[styles.balanceValue, { color: isBalanced ? '#10B981' : '#EF4444' }]}>
                    {(totalDebit - totalCredit).toLocaleString()} ﷼
                  </Text>
                </View>
                {isBalanced && <Text style={styles.balancedMsg}>✅ القيد متوازن</Text>}
                {!isBalanced && totalDebit > 0 && <Text style={styles.unbalancedMsg}>❌ القيد غير متوازن</Text>}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}>
                  <Text style={styles.saveModalBtnText}>💾 حفظ القيد</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelModalBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal تفاصيل القيد */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تفاصيل القيد</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedEntry && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>رقم القيد</Text>
                  <Text style={styles.detailValue}>{selectedEntry.number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>التاريخ</Text>
                  <Text style={styles.detailValue}>{selectedEntry.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الوصف</Text>
                  <Text style={styles.detailValue}>{selectedEntry.description}</Text>
                </View>
                
                <Text style={styles.sectionTitle}>الأسطر</Text>
                {selectedEntry.lines?.map((line, i) => (
                  <View key={i} style={styles.lineDetail}>
                    <Text style={styles.lineAccount}>{line.accountName}</Text>
                    <View style={styles.lineAmounts}>
                      {line.debit > 0 && <Text style={[styles.lineAmount, { color: '#10B981' }]}>مدين: {line.debit.toLocaleString()}</Text>}
                      {line.credit > 0 && <Text style={[styles.lineAmount, { color: '#EF4444' }]}>دائن: {line.credit.toLocaleString()}</Text>}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { fontSize: 24, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D4AF37' + '20', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37' },
  addBtnText: { fontSize: 20, color: '#D4AF37', fontWeight: 'bold' },
  controlBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 10, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14 },
  printBtn: { backgroundColor: '#16213E', borderRadius: 10, padding: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#2a3550' },
  printBtnText: { fontSize: 18 },
  summaryRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 10 },
  summaryItem: { flex: 1, backgroundColor: '#16213E', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  summaryLabel: { color: '#94a3b8', fontSize: 11, marginBottom: 4 },
  summaryValue: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emptySubtext: { color: '#94a3b8', fontSize: 12 },
  entryCard: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  entryNumber: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  entryDate: { color: '#94a3b8', fontSize: 11 },
  entryAmounts: { alignItems: 'flex-end' },
  amountText: { fontSize: 12, fontWeight: 'bold' },
  entryDescription: { color: '#FFFFFF', fontSize: 14, marginBottom: 8 },
  entryFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 8 },
  entryLines: { color: '#94a3b8', fontSize: 11 },
  balancedTag: { color: '#10B981', fontSize: 11, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  modalClose: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' },
  modalBody: { padding: 16 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  fieldInput: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37', marginTop: 16, marginBottom: 10 },
  lineCard: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a3550' },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lineNumber: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },
  removeLineBtn: { fontSize: 16 },
  amountRow: { flexDirection: 'row', gap: 8 },
  amountHalf: { flex: 1 },
  amountLabel: { color: '#94a3b8', fontSize: 11, marginBottom: 4 },
  addLineBtn: { backgroundColor: '#D4AF37' + '20', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#D4AF37' + '40' },
  addLineBtnText: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  balanceCard: { backgroundColor: '#0A1128', borderRadius: 12, padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#2a3550' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  balanceLabel: { color: '#94a3b8', fontSize: 13 },
  balanceValue: { fontSize: 15, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#2a3550', marginVertical: 6 },
  balancedMsg: { color: '#10B981', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginTop: 8 },
  unbalancedMsg: { color: '#EF4444', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginTop: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 },
  saveModalBtn: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveModalBtnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  cancelModalBtn: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelModalBtnText: { color: '#FFFFFF', fontSize: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  detailLabel: { color: '#94a3b8', fontSize: 14 },
  detailValue: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', flex: 1, textAlign: 'right' },
  lineDetail: { backgroundColor: '#0A1128', borderRadius: 8, padding: 10, marginBottom: 6 },
  lineAccount: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  lineAmounts: { flexDirection: 'row', gap: 12 },
  lineAmount: { fontSize: 12, fontWeight: 'bold' },
});
