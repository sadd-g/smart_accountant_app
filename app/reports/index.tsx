import { ControlButtons, ControlHeader } from '../../src/components/ui/ControlButtons';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

export default function ReportsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data: accounts } = useLocalTable('accounts');
  const { data: entries } = useLocalTable('journalEntries');
  const { data: invoices } = useLocalTable('salesInvoices');
  const { data: items } = useLocalTable('items');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const reports = [
    { icon: '⚖️', label: 'ميزان المراجعة', desc: 'ملخص الأرصدة المدينة والدائنة', route: '/ledger/trial-balance' },
    { icon: '📚', label: 'الأستاذ العام', desc: 'كشف حساب الأستاذ العام', route: '/ledger/account-statement' },
    { icon: '💱', label: 'تقارير العملات', desc: 'الأرصدة حسب العملة', route: '/ledger/currency-reports' },
    { icon: '📊', label: 'حركة الأصناف', desc: 'تقرير حركة المخزون', route: '/inventory/item-movement' },
    { icon: '📋', label: 'ملخص المبيعات', desc: 'إحصائيات المبيعات', route: '/sales/summary' },
    { icon: '👥', label: 'العملاء', desc: 'أرصدة العملاء', route: '/sales/customers' },
    { icon: '🏪', label: 'الموردين', desc: 'أرصدة الموردين', route: '/inventory/suppliers' },
  ];

  return (
    <View style={[styles.c,{paddingTop:insets.top}]}><StatusBar barStyle="light-content"/>
      <View style={styles.h}><TouchableOpacity onPress={()=>router.back()} style={styles.b}><Text style={styles.bt}>←</Text></TouchableOpacity><Text style={styles.t}>📊 التقارير والتنبيهات</Text><TouchableOpacity onPress={()=>setShowFilter(true)}><Text style={styles.fb}>📅</Text></TouchableOpacity></View>
      <ScrollView contentContainerStyle={styles.ct}>
        <View style={styles.sr}>
          <View style={styles.s}><Text style={styles.sv}>{accounts.length}</Text><Text style={styles.sl}>حسابات</Text></View>
          <View style={styles.s}><Text style={styles.sv}>{entries.length}</Text><Text style={styles.sl}>قيود</Text></View>
          <View style={styles.s}><Text style={styles.sv}>{invoices.length}</Text><Text style={styles.sl}>فواتير</Text></View>
          <View style={styles.s}><Text style={styles.sv}>{items.length}</Text><Text style={styles.sl}>أصناف</Text></View>
        </View>
        <Text style={styles.st}>📋 التقارير المتاحة</Text>
        {reports.map((r,i)=>(
          <TouchableOpacity key={i} style={styles.rc} onPress={()=>router.push(r.route)}>
            <Text style={styles.ri}>{r.icon}</Text><View style={{flex:1}}><Text style={styles.rl}>{r.label}</Text><Text style={styles.rd}>{r.desc}</Text></View><Text style={styles.ar}>›</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.st}>📤 تصدير ومشاركة</Text>
        <View style={styles.er}>
          <TouchableOpacity style={styles.e} onPress={()=>Alert.alert('PDF','جاري التصدير')}><Text style={styles.et}>📄 PDF</Text></TouchableOpacity>
          <TouchableOpacity style={styles.e} onPress={()=>Alert.alert('Excel','جاري التصدير')}><Text style={styles.et}>📋 Excel</Text></TouchableOpacity>
          <TouchableOpacity style={styles.e} onPress={()=>Alert.alert('🖨️','جاري الطباعة')}><Text style={styles.et}>🖨️ طباعة</Text></TouchableOpacity>
        </View>
        <View style={{height:30}}/>
      </ScrollView>
      <Modal visible={showFilter} animationType="slide" transparent>
        <View style={styles.mo}><View style={styles.mc}><View style={styles.mh}><Text style={styles.mt}>تحديد الفترة</Text><TouchableOpacity onPress={()=>setShowFilter(false)}><Text style={styles.mx}>✕</Text></TouchableOpacity></View>
          <View style={styles.mb}><Text style={styles.fl}>من تاريخ</Text><TextInput style={styles.fi} value={dateFrom} onChangeText={setDateFrom} placeholder="YYYY-MM-DD" placeholderTextColor="#666"/>
          <Text style={styles.fl}>إلى تاريخ</Text><TextInput style={styles.fi} value={dateTo} onChangeText={setDateTo} placeholder="YYYY-MM-DD" placeholderTextColor="#666"/>
          <TouchableOpacity style={styles.ab} onPress={()=>setShowFilter(false)}><Text style={styles.at}>✅ تطبيق</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
    </View>
  );
}
const styles=StyleSheet.create({c:{flex:1,backgroundColor:'#0A1128'},h:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:14},b:{width:40,height:40,borderRadius:20,backgroundColor:'#16213E',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#2a3550'},bt:{fontSize:20,color:'#D4AF37'},t:{flex:1,fontSize:18,fontWeight:'bold',color:'#FFF',textAlign:'center'},fb:{fontSize:22,color:'#D4AF37'},ct:{padding:14},
  sr:{flexDirection:'row',gap:6,marginBottom:16},s:{flex:1,backgroundColor:'#16213E',borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:'#2a3550'},sv:{color:'#D4AF37',fontSize:18,fontWeight:'bold',marginBottom:3},sl:{color:'#94a3b8',fontSize:10},
  st:{fontSize:15,fontWeight:'bold',color:'#D4AF37',marginBottom:10,marginTop:18},rc:{flexDirection:'row',alignItems:'center',backgroundColor:'#16213E',borderRadius:14,padding:14,marginBottom:8,borderWidth:1,borderColor:'#2a3550'},ri:{fontSize:26,marginRight:12},rl:{color:'#FFF',fontSize:14,fontWeight:'bold',marginBottom:3},rd:{color:'#94a3b8',fontSize:11},ar:{fontSize:20,color:'#D4AF37',fontWeight:'bold'},
  er:{flexDirection:'row',gap:8},e:{flex:1,backgroundColor:'#16213E',borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:'#2a3550'},et:{color:'#FFF',fontSize:13,fontWeight:'bold'},
  mo:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},mc:{backgroundColor:'#16213E',borderTopLeftRadius:20,borderTopRightRadius:20},mh:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#2a3550'},mt:{color:'#D4AF37',fontSize:18,fontWeight:'bold'},mx:{color:'#EF4444',fontSize:22,fontWeight:'bold'},mb:{padding:16},fl:{color:'#94a3b8',fontSize:13,marginBottom:6,marginTop:12},fi:{backgroundColor:'#0A1128',borderRadius:10,padding:12,color:'#FFF',borderWidth:1,borderColor:'#2a3550',fontSize:14},ab:{backgroundColor:'#D4AF37',borderRadius:12,padding:14,alignItems:'center',marginTop:20},at:{color:'#0A1128',fontSize:16,fontWeight:'bold',textAlign:'center'},
});
