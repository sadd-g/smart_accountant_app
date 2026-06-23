import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { useApp } from '../../context/AppContext';
import { InvoiceItem, useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function SalesInvoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t, settings } = useApp();
  const { customers, items: dbItems, salesInvoices, addSalesInvoice } = useDatabase();
  const color = colors.section3;

  const [tab, setTab] = useState<'new' | 'list'>('new');
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit' | 'bank'>('cash');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<InvoiceItem[]>([{ itemId: '', itemName: '', qty: 1, freeQty: 0, price: 0, discount: 0, tax: 0, total: 0, costPrice: 0, notes: '' }]);

  const calcTotal = (line: InvoiceItem) => (line.qty * line.price) * (1 - line.discount / 100) * (1 + line.tax / 100);

  const updateLine = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setLines(prev => prev.map((l, i) => {
      if (i !== index) return l;
      const updated = { ...l, [field]: value };
      updated.total = calcTotal(updated);
      return updated;
    }));
  };

  const subtotal = lines.reduce((s, l) => s + (l.qty * l.price), 0);
  const discountTotal = lines.reduce((s, l) => s + (l.qty * l.price * l.discount / 100), 0);
  const taxTotal = lines.reduce((s, l) => s + ((l.qty * l.price - l.qty * l.price * l.discount / 100) * l.tax / 100), 0);
  const total = subtotal - discountTotal + taxTotal;

  const handleSave = async () => {
    if (!customerName) return Alert.alert('', isRTL ? 'اختر العميل' : 'Select customer');
    if (settings.noNegativeStock) {
      for (const line of lines) {
        const item = dbItems.find(i => i.nameAr === line.itemName || i.name === line.itemName);
        if (item && item.quantity < line.qty) {
          return Alert.alert('⚠️', isRTL ? `الكمية المتوفرة من ${line.itemName}: ${item.quantity}` : `Available qty of ${line.itemName}: ${item.quantity}`);
        }
      }
    }
    const customer = customers.find(c => c.nameAr === customerName || c.name === customerName);
    await addSalesInvoice({
      date,
      customerId: customer?.id || '',
      customerName,
      repId: '',
      subtotal,
      discount: discountTotal,
      tax: taxTotal,
      total,
      paid: paymentType === 'cash' ? total : 0,
      remaining: paymentType === 'cash' ? 0 : total,
      paymentType,
      notes,
      items: lines,
    });
    Alert.alert('', t.common.success);
    setCustomerName(''); setNotes('');
    setLines([{ itemId: '', itemName: '', qty: 1, freeQty: 0, price: 0, discount: 0, tax: 0, total: 0, costPrice: 0, notes: '' }]);
    setTab('list');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'فاتورة مبيعات' : 'Sales Invoice', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['new', 'list'] as const).map(tabKey => (
          <TouchableOpacity key={tabKey} style={[styles.tab, tab === tabKey && { borderBottomColor: color, borderBottomWidth: 2 }]} onPress={() => setTab(tabKey)}>
            <Text style={[styles.tabText, { color: tab === tabKey ? color : colors.mutedForeground }]}>
              {tabKey === 'new' ? (isRTL ? 'فاتورة جديدة' : 'New Invoice') : (isRTL ? 'السجلات' : 'Records')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'new' ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 40 }}>
          <FormField label={isRTL ? 'العميل' : 'Customer'} value={customerName} onChangeText={setCustomerName} placeholder={isRTL ? 'اسم العميل' : 'Customer name'} required />
          <FormField label={isRTL ? 'التاريخ' : 'Date'} value={date} onChangeText={setDate} />
          <View style={[styles.paymentRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {(['cash', 'credit', 'bank'] as const).map(type => (
              <TouchableOpacity key={type} style={[styles.paymentBtn, { borderColor: paymentType === type ? color : colors.border, backgroundColor: paymentType === type ? color + '18' : colors.card }]} onPress={() => setPaymentType(type)}>
                <Text style={{ color: paymentType === type ? color : colors.mutedForeground, fontSize: 12, fontWeight: '600' }}>
                  {type === 'cash' ? (isRTL ? 'نقدي' : 'Cash') : type === 'credit' ? (isRTL ? 'آجل' : 'Credit') : (isRTL ? 'بنكي' : 'Bank')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.tableHeader, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>{isRTL ? 'أصناف الفاتورة' : 'Invoice Items'}</Text>
          {lines.map((line, index) => (
            <View key={index} style={[styles.lineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.lineHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.lineNum, { color: color }]}>#{index + 1}</Text>
                <TouchableOpacity onPress={() => lines.length > 1 && setLines(prev => prev.filter((_, i) => i !== index))}>
                  <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                </TouchableOpacity>
              </View>
              <FormField label={isRTL ? 'الصنف' : 'Item'} value={line.itemName} onChangeText={v => updateLine(index, 'itemName', v)} />
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
                <View style={{ flex: 1 }}><FormField label={isRTL ? 'الكمية' : 'Qty'} value={line.qty.toString()} onChangeText={v => updateLine(index, 'qty', parseFloat(v) || 0)} keyboardType="numeric" /></View>
                <View style={{ flex: 1 }}><FormField label={isRTL ? 'مجاني' : 'Free'} value={line.freeQty.toString()} onChangeText={v => updateLine(index, 'freeQty', parseFloat(v) || 0)} keyboardType="numeric" /></View>
                <View style={{ flex: 1 }}><FormField label={isRTL ? 'السعر' : 'Price'} value={line.price.toString()} onChangeText={v => updateLine(index, 'price', parseFloat(v) || 0)} keyboardType="numeric" /></View>
              </View>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
                <View style={{ flex: 1 }}><FormField label={isRTL ? 'خصم%' : 'Disc%'} value={line.discount.toString()} onChangeText={v => updateLine(index, 'discount', parseFloat(v) || 0)} keyboardType="numeric" /></View>
                <View style={{ flex: 1 }}><FormField label={isRTL ? 'ضريبة%' : 'Tax%'} value={line.tax.toString()} onChangeText={v => updateLine(index, 'tax', parseFloat(v) || 0)} keyboardType="numeric" /></View>
                <View style={{ flex: 1 }}><View style={[styles.totalBox, { backgroundColor: color + '10' }]}><Text style={{ color: color, fontWeight: '700', textAlign: 'center' }}>{calcTotal(line).toFixed(2)}</Text></View></View>
              </View>
            </View>
          ))}
          <TouchableOpacity style={[styles.addLineBtn, { borderColor: color }]} onPress={() => setLines(prev => [...prev, { itemId: '', itemName: '', qty: 1, freeQty: 0, price: 0, discount: 0, tax: 0, total: 0, costPrice: 0, notes: '' }])}>
            <Ionicons name="add" size={18} color={color} />
            <Text style={[styles.addLineTxt, { color: color }]}>{isRTL ? 'إضافة صنف' : 'Add Item'}</Text>
          </TouchableOpacity>
          <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryRow}><Text style={{ color: colors.mutedForeground }}>{isRTL ? 'المجموع الجزئي' : 'Subtotal'}</Text><Text style={{ color: colors.foreground, fontWeight: '600' }}>{subtotal.toFixed(2)}</Text></View>
            <View style={styles.summaryRow}><Text style={{ color: colors.destructive }}>{isRTL ? 'الخصم' : 'Discount'}</Text><Text style={{ color: colors.destructive, fontWeight: '600' }}>-{discountTotal.toFixed(2)}</Text></View>
            <View style={styles.summaryRow}><Text style={{ color: colors.warning }}>{isRTL ? 'الضريبة' : 'Tax'}</Text><Text style={{ color: colors.warning, fontWeight: '600' }}>{taxTotal.toFixed(2)}</Text></View>
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 6, paddingTop: 6 }]}>
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '700' }}>{isRTL ? 'الإجمالي' : 'Total'}</Text>
              <Text style={{ color: color, fontSize: 18, fontWeight: '800' }}>{total.toFixed(2)}</Text>
            </View>
          </View>
          <FormField label={isRTL ? 'ملاحظات' : 'Notes'} value={notes} onChangeText={setNotes} multiline />
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{t.common.save}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={salesInvoices.slice().reverse()}
          keyExtractor={i => i.id}
          scrollEnabled={salesInvoices.length > 0}
          contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 20 }}
          renderItem={({ item }) => (
            <View style={[styles.invCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.invHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.invNum, { color: color }]}>{item.number}</Text>
                <Text style={[styles.invDate, { color: colors.mutedForeground }]}>{item.date}</Text>
              </View>
              <Text style={[styles.invCustomer, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{item.customerName}</Text>
              <View style={[styles.invFooter, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={{ color: color, fontWeight: '700' }}>{item.total.toFixed(2)}</Text>
                <View style={[styles.badge, { backgroundColor: item.remaining > 0 ? colors.warning + '20' : colors.success + '20' }]}>
                  <Text style={{ color: item.remaining > 0 ? colors.warning : colors.success, fontSize: 11, fontWeight: '600' }}>
                    {item.remaining > 0 ? (isRTL ? 'آجل' : 'Credit') : (isRTL ? 'مدفوع' : 'Paid')}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="receipt-outline" size={40} color={colors.mutedForeground} /><Text style={{ color: colors.mutedForeground, marginTop: 8 }}>{t.common.noData}</Text></View>}
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
  paymentRow: { gap: 8, marginBottom: 14 },
  paymentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  tableHeader: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  lineCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  lineHeader: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lineNum: { fontSize: 13, fontWeight: '700' },
  totalBox: { height: 44, borderRadius: 8, justifyContent: 'center', marginTop: 22 },
  addLineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: 12, borderStyle: 'dashed', paddingVertical: 12, marginBottom: 16 },
  addLineTxt: { fontSize: 14, fontWeight: '600' },
  summaryBox: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14, gap: 6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  invCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  invHeader: { justifyContent: 'space-between', marginBottom: 4 },
  invNum: { fontSize: 13, fontWeight: '700' },
  invDate: { fontSize: 12 },
  invCustomer: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  invFooter: { justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  empty: { alignItems: 'center', marginTop: 60 },
});
