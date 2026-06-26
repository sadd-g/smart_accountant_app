import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';
import { PickerModal } from '../../src/components/ui/PickerModal';

export default function ItemMovementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: items } = useLocalTable('items');
  const { data: invoices } = useLocalTable('salesInvoices');
  const { data: purchases } = useLocalTable('purchaseInvoices');
  const { data: issues } = useLocalTable('inventoryIssues');
  const { data: receipts } = useLocalTable('inventoryReceipts');
  const { data: customers } = useLocalTable('customers');
  const { data: suppliers } = useLocalTable('suppliers');
  const { data: warehouses } = useLocalTable('warehouses');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = () => {
    let all: any[] = [];
    invoices.forEach((inv: any) => {
      inv.items?.forEach((line: any) => {
        if (!selectedItem || line.itemName?.includes(selectedItem.name)) {
          all.push({ date: inv.date, type: 'بيع', item: line.itemName, qty: line.qty, ref: inv.number, party: inv.customerName });
        }
      });
    });
    purchases.forEach((inv: any) => {
      inv.items?.forEach((line: any) => {
        if (!selectedItem || line.itemName?.includes(selectedItem.name)) {
          all.push({ date: inv.date, type: 'شراء', item: line.itemName, qty: line.qty, ref: inv.number, party: inv.supplierName });
        }
      });
    });
    setResults(all.slice(0, 50));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>حركة الأصناف</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.filterCard}>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowItemPicker(true)}>
          <Text style={selectedItem ? styles.pickerText : styles.pickerPlaceholder}>{selectedItem?.name || 'كل الأصناف'}</Text><Text>▼</Text></TouchableOpacity>
        <View style={styles.row}>
          <TextInput style={styles.dateInput} value={dateFrom} onChangeText={setDateFrom} placeholder="من" placeholderTextColor="#666" />
          <TextInput style={styles.dateInput} value={dateTo} onChangeText={setDateTo} placeholder="إلى" placeholderTextColor="#666" />
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}><Text style={styles.searchBtnText}>🔍 بحث</Text></TouchableOpacity>
      </View>
      {results.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>📊</Text><Text style={styles.emptyText}>اختر صنفاً وابحث</Text></View>
      ) : (
        <FlatList data={results} keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}><Text style={[styles.cardType, { color: item.type === 'بيع' ? '#10B981' : '#EF4444' }]}>{item.type}</Text><Text style={styles.cardDate}>{item.date}</Text></View>
              <Text style={styles.cardItem}>📦 {item.item} (الكمية: {item.qty})</Text>
              <Text style={styles.cardRef}>{item.ref} - {item.party}</Text>
            </View>
          )} contentContainerStyle={{ padding: 16 }} />
      )}
      <PickerModal visible={showItemPicker} title="اختيار الصنف" data={items||[]} displayField="name" subField="code" onSelect={(i: any) => { setSelectedItem(i); setShowItemPicker(false); }} onClose={() => setShowItemPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A1128'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},backBtn:{fontSize:24,color:'#D4AF37',fontWeight:'bold'},title:{fontSize:18,fontWeight:'bold',color:'#FFFFFF'},
  filterCard:{backgroundColor:'#16213E',borderRadius:14,padding:14,margin:16,borderWidth:1,borderColor:'#2a3550'},
  pickerButton:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#0A1128',borderRadius:10,padding:14,borderWidth:1,borderColor:'#2a3550',marginBottom:8},
  pickerText:{color:'#FFFFFF',fontSize:14,flex:1},pickerPlaceholder:{color:'#666',fontSize:14,flex:1},
  row:{flexDirection:'row',gap:8,marginBottom:8},dateInput:{flex:1,backgroundColor:'#0A1128',borderRadius:10,padding:12,color:'#FFFFFF',borderWidth:1,borderColor:'#2a3550',textAlign:'center',fontSize:14},
  searchBtn:{backgroundColor:'#D4AF37',borderRadius:10,padding:12,alignItems:'center'},searchBtnText:{color:'#0A1128',fontSize:14,fontWeight:'bold',textAlign:'center'},
  empty:{flex:1,justifyContent:'center',alignItems:'center'},emptyIcon:{fontSize:48,marginBottom:12},emptyText:{color:'#FFFFFF',fontSize:16},
  card:{backgroundColor:'#16213E',borderRadius:12,padding:14,marginBottom:8,borderWidth:1,borderColor:'#2a3550'},cardHeader:{flexDirection:'row',justifyContent:'space-between',marginBottom:6},cardType:{fontSize:14,fontWeight:'bold'},cardDate:{color:'#94a3b8',fontSize:11},cardItem:{color:'#FFFFFF',fontSize:13,marginBottom:4},cardRef:{color:'#94a3b8',fontSize:11},
});
