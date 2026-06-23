import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import type { JournalLine } from '../../db/repositories';
import { useColors } from '../../hooks/useColors';

export default function JournalEntryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useApp();
  const { accounts, journalEntries, addJournalEntry } = useDatabase();
  const color = colors.section1;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: '', accountName: '', debit: 0, credit: 0, notes: '' },
    { accountId: '', accountName: '', debit: 0, credit: 0, notes: '' },
  ]);
  const [tab, setTab] = useState<'new' | 'list'>('new');

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const updateLine = (index: number, field: keyof JournalLine, value: string | number) => {
    setLines(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  const addLine = () => setLines(prev => [...prev, { accountId: '', accountName: '', debit: 0, credit: 0, notes: '' }]);

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!description) return Alert.alert('', isRTL ? 'البيان مطلوب' : 'Description required');
    if (!isBalanced) return Alert.alert('', isRTL ? 'القيد غير متوازن' : 'Entry not balanced');
    await addJournalEntry({ date, description, descriptionAr: description, lines: lines.filter(l => l.accountId && (l.debit + l.credit) > 0), isRecurring: false, totalDebit, totalCredit, refType: '', refId: '' });
    setDescription('');
    setLines([
      { accountId: '', accountName: '', debit: 0, credit: 0, notes: '' },
      { accountId: '', accountName: '', debit: 0, credit: 0, notes: '' },
    ]);
    Alert.alert('', t.common.success);
    setTab('list');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'قيد يومية' : 'Journal Entry', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['new', 'list'] as const).map(tabKey => (
          <TouchableOpacity key={tabKey} style={[styles.tab, tab === tabKey && { borderBottomColor: color, borderBottomWidth: 2 }]} onPress={() => setTab(tabKey)}>
            <Text style={[styles.tabText, { color: tab === tabKey ? color : colors.mutedForeground }]}>
              {tabKey === 'new' ? (isRTL ? 'قيد جديد' : 'New Entry') : (isRTL ? 'السجلات' : 'Records')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'new' ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 40 }}>
          <FormField label={isRTL ? 'التاريخ' : 'Date'} value={date} onChangeText={setDate} />
          <FormField label={isRTL ? 'البيان' : 'Description'} value={description} onChangeText={setDescription} required />

          <Text style={[styles.tableHeader, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'بنود القيد' : 'Entry Lines'}
          </Text>

          {lines.map((line, index) => (
            <View key={index} style={[styles.lineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.lineHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.lineNum, { color: color }]}>#{index + 1}</Text>
                <TouchableOpacity onPress={() => removeLine(index)}>
                  <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                </TouchableOpacity>
              </View>
              <FormField
                label={isRTL ? 'الحساب' : 'Account'}
                value={line.accountName}
                onChangeText={v => updateLine(index, 'accountName', v)}
                placeholder={isRTL ? 'اختر حساباً...' : 'Select account...'}
              />
              <View style={[styles.debitCreditRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={{ flex: 1 }}>
                  <FormField label={isRTL ? 'مدين' : 'Debit'} value={line.debit > 0 ? line.debit.toString() : ''} onChangeText={v => updateLine(index, 'debit', parseFloat(v) || 0)} keyboardType="numeric" />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <FormField label={isRTL ? 'دائن' : 'Credit'} value={line.credit > 0 ? line.credit.toString() : ''} onChangeText={v => updateLine(index, 'credit', parseFloat(v) || 0)} keyboardType="numeric" />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={[styles.addLineBtn, { borderColor: color }]} onPress={addLine}>
            <Ionicons name="add" size={18} color={color} />
            <Text style={[styles.addLineTxt, { color: color }]}>{isRTL ? 'إضافة بند' : 'Add Line'}</Text>
          </TouchableOpacity>

          <View style={[styles.totals, { backgroundColor: isBalanced ? colors.success + '15' : colors.warning + '15', borderColor: isBalanced ? colors.success : colors.warning }]}>
            <Text style={{ color: isBalanced ? colors.success : colors.warning, fontWeight: '700' }}>
              {isRTL ? `مجموع مدين: ${totalDebit.toFixed(2)} | دائن: ${totalCredit.toFixed(2)}` : `Debit: ${totalDebit.toFixed(2)} | Credit: ${totalCredit.toFixed(2)}`}
            </Text>
            <Text style={{ color: isBalanced ? colors.success : colors.warning, fontSize: 12 }}>
              {isBalanced ? (isRTL ? 'القيد متوازن' : 'Balanced') : (isRTL ? 'القيد غير متوازن' : 'Not balanced')}
            </Text>
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: isBalanced ? color : colors.mutedForeground }]} onPress={handleSave} disabled={!isBalanced}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{t.common.save}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={journalEntries.slice().reverse()}
          keyExtractor={i => i.id}
          scrollEnabled={journalEntries.length > 0}
          contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 20 }}
          renderItem={({ item }) => (
            <View style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.entryHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.entryNum, { color: color }]}>{item.number}</Text>
                <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>{item.date}</Text>
              </View>
              <Text style={[styles.entryDesc, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{item.description}</Text>
              <Text style={[styles.entryTotal, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? `مدين: ${item.totalDebit.toFixed(2)}` : `Debit: ${item.totalDebit.toFixed(2)}`}
              </Text>
            </View>
          )}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="document-outline" size={40} color={colors.mutedForeground} /><Text style={{ color: colors.mutedForeground, marginTop: 8 }}>{t.common.noData}</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '600' },
  tableHeader: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  lineCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  lineHeader: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lineNum: { fontSize: 13, fontWeight: '700' },
  debitCreditRow: { gap: 0 },
  addLineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: 12, borderStyle: 'dashed', paddingVertical: 12, marginBottom: 16 },
  addLineTxt: { fontSize: 14, fontWeight: '600' },
  totals: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 16, alignItems: 'center', gap: 4 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  entryCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  entryHeader: { justifyContent: 'space-between', marginBottom: 4 },
  entryNum: { fontSize: 13, fontWeight: '700' },
  entryDate: { fontSize: 12 },
  entryDesc: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  entryTotal: { fontSize: 12 },
  empty: { alignItems: 'center', marginTop: 60 },
});
