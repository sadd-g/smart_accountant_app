import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';
import { PickerModal } from '../../src/components/ui/PickerModal';

interface IssueItem { id: string; itemId: string; itemName: string; unit: string; qty: string; price: string; total: string; }
interface InventoryIssue { id: string; number: string; date: string; warehouseId: string; warehouseName: string; accountId: string; accountName: string; description: string; refNumber: string; totalAmount: number; items: IssueItem[]; }

export default function InventoryIssueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: issues, add, remove } = useLocalTable<InventoryIssue>('inventoryIssues');
  const { data: warehouses } = useLocalTable('warehouses');
  const { data: items } = useLocalTable('items');
  const { data: accounts } = useLocalTable('accounts');
  const { data: units } = useLocalTable('units');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [currentLineId, setCurrentLineId] = useState('');
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], warehouseId: '', warehouseName: '', accountId: '', accountName: '', description: '', refNumber: '' });
  const [lines, setLines] = useState<IssueItem[]>([{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0', price: '0', total: '0' }]);

  const addLine = () => setLines([...lines, { id: Date.now().toString(), itemId: '', itemName: '', unit: 'قطعة', qty: '0', price: '0', total: '0' }]);
  const removeLine = (id: string) => { if (lines.length > 1) setLines(lines.filter(l => l.id !== id)); };
  const updateLine = (id: string, field: string, value: string) => {
    setLines(lines.map(l => { if (l.id !== id) return l; const u = { ...l, [field]: value }; if (['qty', 'price'].includes(field)) u.total = ((parseFloat(u.qty)||0)*(parseFloat(u.price)||0)).toString(); return u; }));
  };
  const totalAmount = lines.reduce((s, l) => s + (parseFloat(l.total) || 0), 0);
  const generateNumber = () => `ISS-${(issues.length + 1).toString().padStart(6, '0')}`;

  const handleSave = async () => {
    if (!formData.warehouseName) { Alert.alert('خطأ', 'الرجاء اختيار المخزن'); return; }
    await add({ ...formData, number: generateNumber(), totalAmount, items: lines.filter(l => l.itemName) });
    setShowModal(false);
  };

  const filtered = (issues || []).filter((i: InventoryIssue) => i.number?.includes(searchQuery));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity><Text style={styles.title}>صرف مخزون</Text><TouchableOpacity style={styles.addBtn} onPress={() => { setFormData({ date: new Date().toISOString().split('T')[0], warehouseId: '', warehouseName: '', accountId: '', accountName: '', description: '', refNumber: '' }); setLines([{ id: '1', itemId: '', itemName: '', unit: 'قطعة', qty: '0', price: '0', total: '0' }]); setShowModal(true); }}><Text style={styles.addBtnText}>+</Text></TouchableOpacity></View>
      <View style={styles.controlBar}><TextInput style={styles.searchInput} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} /><TouchableOpacity style={styles.printBtn}><Text>🖨️</Text></TouchableOpacity></View>
      {filtered.length === 0 ? (<View style={styles.empty}><Text style={styles.emptyIcon}>📤</Text><Text style={styles.emptyText}>لا توجد عمليات</Text></View>) : (
        <FlatList data={filtered} keyExtractor={(i: InventoryIssue) => i.id} renderItem={({ item }: { item: InventoryIssue }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => Alert.alert('حذف', `حذف "${item.number}"؟`, [{ text: 'حذف', style: 'destructive', onPress: () => remove(item.id) }, { text: 'إلغاء' }])}>
            <Text style={styles.cardNumber}>{item.number}</Text><Text style={styles.cardDetail}>🏭 {item.warehouseName} → {item.accountName}</Text><Text style={styles.cardTotal}>{item.totalAmount?.toLocaleString()} ﷼</Text>
          </TouchableOpacity>
        )} contentContainerStyle={{ padding: 16 }} />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { maxHeight: '95%' }]}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>صرف مخزون</Text><TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>رقم الأمر</Text><TextInput style={[styles.fieldInput, { color: '#D4AF37' }]} value={generateNumber()} editable={false} />
            <Text style={styles.fieldLabel}>المخزن *</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowWarehousePicker(true)}><Text style={formData.warehouseName ? styles.pickerText : styles.pickerPlaceholder}>{formData.warehouseName || 'اختيار المخزن'}</Text><Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>
            <Text style={styles.fieldLabel}>جهة الصرف</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowAccountPicker(true)}><Text style={formData.accountName ? styles.pickerText : styles.pickerPlaceholder}>{formData.accountName || 'اختيار الحساب'}</Text><Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>
            <Text style={styles.fieldLabel}>التاريخ</Text><TextInput style={styles.fieldInput} value={formData.date} onChangeText={v => setFormData({ ...formData, date: v })} />
            <Text style={styles.fieldLabel}>البيان</Text><TextInput style={[styles.fieldInput, { height: 50 }]} value={formData.description} onChangeText={v => setFormData({ ...formData, description: v })} placeholder="بيان" placeholderTextColor="#666" multiline />
            <Text style={styles.fieldLabel}>رقم المرجع</Text><TextInput style={styles.fieldInput} value={formData.refNumber} onChangeText={v => setFormData({ ...formData, refNumber: v })} placeholder="اختياري" placeholderTextColor="#666" />
            <Text style={styles.sectionTitle}>📦 الأصناف</Text>
            {lines.map((line, i) => (
              <View key={line.id} style={styles.lineCard}>
                <View style={styles.lineHeader}><Text>#{i+1}</Text>{lines.length>1&&<TouchableOpacity onPress={()=>removeLine(line.id)}><Text>🗑️</Text></TouchableOpacity>}</View>
                <TouchableOpacity style={styles.pickerButton} onPress={()=>{setCurrentLineId(line.id);setShowItemPicker(true);}}><Text style={line.itemName?styles.pickerText:styles.pickerPlaceholder}>{line.itemName||'اختيار الصنف'}</Text><Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>
                <TouchableOpacity style={styles.pickerButton} onPress={()=>{setCurrentLineId(line.id);setShowUnitPicker(true);}}><Text style={styles.pickerText}>{line.unit||'الوحدة'}</Text><Text style={styles.pickerArrow}>▼</Text></TouchableOpacity>
                <View style={styles.row}><TextInput style={[styles.fieldInput, styles.half]} value={line.qty} onChangeText={v=>updateLine(line.id,'qty',v)} placeholder="كمية" placeholderTextColor="#666" keyboardType="numeric" /><TextInput style={[styles.fieldInput, styles.half]} value={line.price} onChangeText={v=>updateLine(line.id,'price',v)} placeholder="سعر" placeholderTextColor="#666" keyboardType="numeric" /></View>
                <Text style={styles.lineTotal}>{parseFloat(line.total||'0').toLocaleString()} ﷼</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addLineBtn} onPress={addLine}><Text>+ إضافة صنف</Text></TouchableOpacity>
            <Text style={styles.totalText}>الإجمالي: {totalAmount.toLocaleString()} ﷼</Text>
            <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}><Text style={styles.saveModalBtnText}>💾 حفظ</Text></TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>
      <PickerModal visible={showWarehousePicker} title="اختيار المخزن" data={warehouses||[]} displayField="name" subField="code" onSelect={(i: any) => setFormData({...formData,warehouseId:i.id,warehouseName:i.name})} onClose={()=>setShowWarehousePicker(false)} />
      <PickerModal visible={showAccountPicker} title="اختيار الحساب" data={accounts||[]} displayField="name" subField="code" onSelect={(i: any) => setFormData({...formData,accountId:i.id,accountName:i.name})} onClose={()=>setShowAccountPicker(false)} />
      <PickerModal visible={showItemPicker} title="اختيار الصنف" data={items||[]} displayField="name" subField="code" onSelect={(i: any) => {updateLine(currentLineId,'itemId',i.id);updateLine(currentLineId,'itemName',i.name);updateLine(currentLineId,'price',i.costPrice?.toString()||'0');}} onClose={()=>setShowItemPicker(false)} />
      <PickerModal visible={showUnitPicker} title="اختيار الوحدة" data={units||[]} displayField="name" subField="code" onSelect={(i: any) => updateLine(currentLineId,'unit',i.name)} onClose={()=>setShowUnitPicker(false)} />
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A1128'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},backBtn:{fontSize:24,color:'#D4AF37',fontWeight:'bold'},title:{fontSize:18,fontWeight:'bold',color:'#FFFFFF'},addBtn:{width:36,height:36,borderRadius:18,backgroundColor:'#D4AF37'+'20',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#D4AF37'},addBtnText:{fontSize:20,color:'#D4AF37',fontWeight:'bold'},
  controlBar:{flexDirection:'row',paddingHorizontal:16,marginBottom:12,gap:8},searchInput:{flex:1,backgroundColor:'#16213E',borderRadius:10,padding:10,color:'#FFFFFF',borderWidth:1,borderColor:'#2a3550',textAlign:'right',fontSize:14},printBtn:{backgroundColor:'#16213E',borderRadius:10,padding:10,justifyContent:'center',borderWidth:1,borderColor:'#2a3550'},
  empty:{flex:1,justifyContent:'center',alignItems:'center'},emptyIcon:{fontSize:48,marginBottom:12},emptyText:{color:'#FFFFFF',fontSize:16},
  card:{backgroundColor:'#16213E',borderRadius:14,padding:14,marginBottom:10,borderWidth:1,borderColor:'#2a3550'},cardNumber:{color:'#D4AF37',fontSize:14,fontWeight:'bold'},cardDetail:{color:'#FFFFFF',fontSize:13},cardTotal:{color:'#EF4444',fontSize:16,fontWeight:'bold',marginTop:4},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},modalContent:{backgroundColor:'#16213E',borderTopLeftRadius:20,borderTopRightRadius:20,maxHeight:'95%'},modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#2a3550'},modalTitle:{color:'#D4AF37',fontSize:18,fontWeight:'bold'},modalClose:{color:'#EF4444',fontSize:22,fontWeight:'bold'},modalBody:{padding:16},
  fieldLabel:{color:'#94a3b8',fontSize:13,marginBottom:6,marginTop:12},fieldInput:{backgroundColor:'#0A1128',borderRadius:10,padding:12,color:'#FFFFFF',borderWidth:1,borderColor:'#2a3550',fontSize:14},
  pickerButton:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#0A1128',borderRadius:10,padding:14,borderWidth:1,borderColor:'#2a3550'},pickerText:{color:'#FFFFFF',fontSize:14,flex:1},pickerPlaceholder:{color:'#666',fontSize:14,flex:1},pickerArrow:{color:'#D4AF37',fontSize:12,marginLeft:8},
  sectionTitle:{fontSize:16,fontWeight:'bold',color:'#D4AF37',marginTop:16,marginBottom:10},lineCard:{backgroundColor:'#0A1128',borderRadius:10,padding:12,marginBottom:8,borderWidth:1,borderColor:'#2a3550'},lineHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},row:{flexDirection:'row',gap:8},half:{flex:1},lineTotal:{color:'#EF4444',fontSize:13,fontWeight:'bold',textAlign:'right',marginTop:4},
  addLineBtn:{backgroundColor:'#D4AF37'+'20',borderRadius:10,padding:12,alignItems:'center',marginTop:8,borderWidth:1,borderColor:'#D4AF37'+'40'},totalText:{color:'#F59E0B',fontSize:16,fontWeight:'bold',textAlign:'center',marginTop:12},
  saveModalBtn:{backgroundColor:'#D4AF37',borderRadius:12,padding:14,alignItems:'center',marginTop:20},saveModalBtnText:{color:'#0A1128',fontSize:16,fontWeight:'bold'},
});
