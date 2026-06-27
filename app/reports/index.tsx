import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Modal, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';
import { ControlButtons, ControlHeader } from '../../src/components/ui/ControlButtons';

export default function ReportsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data: accounts } = useLocalTable('accounts');
  const { data: entries } = useLocalTable('journalEntries');
  const { data: invoices } = useLocalTable('salesInvoices');
  const { data: purchases } = useLocalTable('purchaseInvoices');
  const { data: items } = useLocalTable('items');
  const { data: customers } = useLocalTable('customers');
  const { data: suppliers } = useLocalTable('suppliers');
  const { data: warehouses } = useLocalTable('warehouses');
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showItemReport, setShowItemReport] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [reportResults, setReportResults] = useState<any[]>([]);
  const [reportTitle, setReportTitle] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [reportType, setReportType] = useState<'summary' | 'detail'>('summary');
  const [itemSearch, setItemSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [warehouseSearch, setWarehouseSearch] = useState('');

  const reports = [
    { icon: '⚖️', label: 'ميزان المراجعة', desc: 'ملخص الأرصدة المدينة والدائنة', route: '/ledger/trial-balance', color: '#D4AF37' },
    { icon: '📚', label: 'الأستاذ العام', desc: 'كشف حساب الأستاذ العام', route: '/ledger/account-statement', color: '#3B82F6' },
    { icon: '💱', label: 'تقارير العملات', desc: 'الأرصدة حسب العملة', route: '/ledger/currency-reports', color: '#10B981' },
    { icon: '📊', label: 'حركة الأصناف', desc: 'تقرير حركة المخزون', route: '/inventory/item-movement', color: '#7C3AED' },
    { icon: '📋', label: 'ملخص المبيعات', desc: 'إحصائيات المبيعات', route: '/sales/summary', color: '#F59E0B' },
    { icon: '👥', label: 'العملاء', desc: 'أرصدة العملاء', route: '/sales/customers', color: '#EF4444' },
    { icon: '🏪', label: 'الموردين', desc: 'أرصدة الموردين', route: '/inventory/suppliers', color: '#06B6D4' },
  ];

  const generateItemReport = () => {
    if (!selectedItem) { Alert.alert('تنبيه', 'اختر صنفاً أولاً'); return; }
    let results: any[] = [];
    const itemName = selectedItem.name;

    invoices.forEach((inv: any) => {
      inv.items?.forEach((line: any) => {
        if (line.itemName?.includes(itemName)) {
          if (selectedCustomer && inv.customerName !== selectedCustomer.name) return;
          if (dateFrom && inv.date < dateFrom) return;
          if (dateTo && inv.date > dateTo) return;
          results.push({ date: inv.date, type: 'بيع', party: inv.customerName, ref: inv.number, qty: parseFloat(line.qty) || 0, price: parseFloat(line.price) || 0, total: parseFloat(line.total) || 0 });
        }
      });
    });

    purchases.forEach((inv: any) => {
      inv.items?.forEach((line: any) => {
        if (line.itemName?.includes(itemName)) {
          if (selectedSupplier && inv.supplierName !== selectedSupplier.name) return;
          if (dateFrom && inv.date < dateFrom) return;
          if (dateTo && inv.date > dateTo) return;
          results.push({ date: inv.date, type: 'شراء', party: inv.supplierName, ref: inv.number, qty: parseFloat(line.qty) || 0, price: parseFloat(line.price) || 0, total: parseFloat(line.total) || 0 });
        }
      });
    });

    results.sort((a, b) => b.date.localeCompare(a.date));

    if (reportType === 'summary') {
      const totalSold = results.filter(r => r.type === 'بيع').reduce((s, r) => s + r.qty, 0);
      const totalPurchased = results.filter(r => r.type === 'شراء').reduce((s, r) => s + r.qty, 0);
      const totalSoldValue = results.filter(r => r.type === 'بيع').reduce((s, r) => s + r.total, 0);
      const totalPurchasedValue = results.filter(r => r.type === 'شراء').reduce((s, r) => s + r.total, 0);
      results = [{ _summary: true, totalSold, totalPurchased, totalSoldValue, totalPurchasedValue, netQty: totalSold - totalPurchased, netValue: totalSoldValue - totalPurchasedValue }];
    }

    setReportTitle(`تقرير حركة الصنف: ${itemName}`);
    setReportResults(results);
    setShowResults(true);
    setShowItemReport(false);
  };

  return (
    <View style={[st.c, { paddingTop: insets.top }]}><StatusBar barStyle="light-content" />
      <ControlHeader title="التقارير والتنبيهات" onBack={() => router.back()} />
      <ControlButtons onAdd={() => setShowItemReport(true)} showEdit={false} showDelete={false} title="التقارير" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.ct}>
        <View style={st.sr}>
          <View style={st.s}><Text style={st.sv}>{accounts.length}</Text><Text style={st.sl}>حسابات</Text></View>
          <View style={st.s}><Text style={st.sv}>{entries.length}</Text><Text style={st.sl}>قيود</Text></View>
          <View style={st.s}><Text style={st.sv}>{invoices.length}</Text><Text style={st.sl}>فواتير</Text></View>
          <View style={st.s}><Text style={st.sv}>{items.length}</Text><Text style={st.sl}>أصناف</Text></View>
        </View>

        <TouchableOpacity style={st.filterBtn} onPress={() => setShowFilter(true)}>
          <Text style={st.filterText}>📅 تصفية بالفترة: {dateFrom || 'من'} - {dateTo || 'إلى'}</Text>
        </TouchableOpacity>

        <Text style={st.tt}>📋 التقارير المتاحة</Text>
        {reports.map((r, i) => (
          <TouchableOpacity key={i} style={st.rc} onPress={() => router.push(r.route as any)}>
            <Text style={st.ri}>{r.icon}</Text><View style={{ flex: 1 }}><Text style={st.rl}>{r.label}</Text><Text style={st.rd}>{r.desc}</Text></View><Text style={st.ar}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={st.tt}>📤 تصدير ومشاركة</Text>
        <View style={st.er}>
          {['📄 PDF','📋 Excel','🖨️ طباعة','📤 مشاركة'].map((e, i) => (
            <TouchableOpacity key={i} style={st.e} onPress={() => Alert.alert('تصدير', `جاري ${e.split(' ')[1]}`)}><Text style={st.et}>{e}</Text></TouchableOpacity>
          ))}
        </View>

        <Text style={st.tt}>🔔 التنبيهات</Text>
        {items.filter((i: any) => (i.quantity || 0) <= (i.minQuantity || 10)).length > 0 && (
          <View style={[st.ac, { borderLeftColor: '#F59E0B' }]}>
            <Text style={st.at}>⚠️ أصناف منخفضة المخزون</Text>
            {items.filter((i: any) => (i.quantity || 0) <= (i.minQuantity || 10)).slice(0, 3).map((i: any, idx: number) => (
              <Text key={idx} style={st.ai}>📦 {i.name}: {i.quantity || 0} متبقي</Text>
            ))}
          </View>
        )}
        <View style={[st.ac, { borderLeftColor: '#3B82F6' }]}>
          <Text style={st.at}>💎 حالة الاشتراك</Text>
          <Text style={st.ai}>📅 متبقي: 83 يوم | 🗓️ ينتهي: 2026-09-16</Text>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal فلتر التاريخ */}
      <Modal visible={showFilter} animationType="slide" transparent>
        <View style={st.mo}><View style={st.mc}><View style={st.mh}><Text style={st.mt}>تحديد الفترة</Text><TouchableOpacity onPress={() => setShowFilter(false)}><Text style={st.mx}>✕</Text></TouchableOpacity></View>
          <View style={st.mb}>
            <Text style={st.fl}>من تاريخ</Text><TextInput style={st.fi} value={dateFrom} onChangeText={setDateFrom} placeholder="YYYY-MM-DD" placeholderTextColor="#666"/>
            <Text style={st.fl}>إلى تاريخ</Text><TextInput style={st.fi} value={dateTo} onChangeText={setDateTo} placeholder="YYYY-MM-DD" placeholderTextColor="#666"/>
            <View style={st.qd}>{['اليوم','الشهر','السنة'].map((d, i) => {
              const now = new Date();
              const dates: any = {'اليوم':[now.toISOString().split('T')[0],now.toISOString().split('T')[0]],'الشهر':[new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0],now.toISOString().split('T')[0]],'السنة':[new Date(now.getFullYear(),0,1).toISOString().split('T')[0],now.toISOString().split('T')[0]]};
              return <TouchableOpacity key={i} style={st.qb} onPress={()=>{setDateFrom(dates[d][0]);setDateTo(dates[d][1]);}}><Text style={st.qt}>{d}</Text></TouchableOpacity>;
            })}</View>
            <TouchableOpacity style={st.ab} onPress={() => setShowFilter(false)}><Text style={st.atx}>✅ تطبيق</Text></TouchableOpacity>
          </View></View></View>
      </Modal>

      {/* Modal تقرير حركة الصنف */}
      <Modal visible={showItemReport} animationType="slide" transparent>
        <View style={st.mo}><View style={[st.mc, { maxHeight: '90%' }]}><View style={st.mh}><Text style={st.mt}>📊 تقرير حركة الصنف</Text><TouchableOpacity onPress={() => setShowItemReport(false)}><Text style={st.mx}>✕</Text></TouchableOpacity></View>
          <ScrollView style={st.mb}>
            <Text style={st.fl}>الصنف *</Text>
            <TextInput style={st.fi} value={selectedItem?.name || ''} onChangeText={setItemSearch} placeholder="🔍 بحث عن صنف..." placeholderTextColor="#666"/>
            <ScrollView horizontal style={{maxHeight:40,marginBottom:8}}>
              {items.filter((i:any)=>i.name?.includes(itemSearch)).slice(0,10).map((i:any)=>(
                <TouchableOpacity key={i.id} style={[st.chip, selectedItem?.id===i.id&&st.chipA]} onPress={()=>{setSelectedItem(i);setItemSearch(i.name);}}><Text style={[st.chipT,selectedItem?.id===i.id&&st.chipTA]}>{i.name}</Text></TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={st.fl}>العميل (اختياري)</Text>
            <TextInput style={st.fi} value={selectedCustomer?.name || ''} onChangeText={setCustomerSearch} placeholder="🔍 بحث عن عميل..." placeholderTextColor="#666"/>
            <ScrollView horizontal style={{maxHeight:40,marginBottom:8}}>
              {customers.filter((c:any)=>c.name?.includes(customerSearch)).slice(0,10).map((c:any)=>(
                <TouchableOpacity key={c.id} style={[st.chip, selectedCustomer?.id===c.id&&st.chipA]} onPress={()=>{setSelectedCustomer(c);setCustomerSearch(c.name);}}><Text style={[st.chipT,selectedCustomer?.id===c.id&&st.chipTA]}>{c.name}</Text></TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={st.fl}>المورد (اختياري)</Text>
            <TextInput style={st.fi} value={selectedSupplier?.name || ''} onChangeText={setSupplierSearch} placeholder="🔍 بحث عن مورد..." placeholderTextColor="#666"/>
            <ScrollView horizontal style={{maxHeight:40,marginBottom:8}}>
              {suppliers.filter((s:any)=>s.name?.includes(supplierSearch)).slice(0,10).map((s:any)=>(
                <TouchableOpacity key={s.id} style={[st.chip, selectedSupplier?.id===s.id&&st.chipA]} onPress={()=>{setSelectedSupplier(s);setSupplierSearch(s.name);}}><Text style={[st.chipT,selectedSupplier?.id===s.id&&st.chipTA]}>{s.name}</Text></TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={st.fl}>نوع التقرير</Text>
            <View style={st.tr}><TouchableOpacity style={[st.tb,reportType==='summary'&&st.tbA]} onPress={()=>setReportType('summary')}><Text style={[st.tbt,reportType==='summary'&&st.tbtA]}>📊 إجمالي</Text></TouchableOpacity><TouchableOpacity style={[st.tb,reportType==='detail'&&st.tbA]} onPress={()=>setReportType('detail')}><Text style={[st.tbt,reportType==='detail'&&st.tbtA]}>📋 تحليلي</Text></TouchableOpacity></View>
            <TouchableOpacity style={[st.sb,{marginTop:20}]} onPress={generateItemReport}><Text style={st.sbt}>🔍 عرض التقرير</Text></TouchableOpacity>
          </ScrollView></View></View>
      </Modal>

      {/* Modal عرض النتائج */}
      <Modal visible={showResults} animationType="slide" transparent>
        <View style={st.mo}><View style={[st.mc,{maxHeight:'90%'}]}><View style={st.mh}><Text style={st.mt}>{reportTitle}</Text><TouchableOpacity onPress={()=>setShowResults(false)}><Text style={st.mx}>✕</Text></TouchableOpacity></View>
          <View style={st.mb}>
            {reportResults[0]?._summary ? (
              <View style={st.summaryCard}>
                <Text style={st.summaryTitle}>📊 ملخص إجمالي</Text>
                {[
                  ['الكمية المباعة',reportResults[0].totalSold,'#10B981'],
                  ['الكمية المشتراة',reportResults[0].totalPurchased,'#EF4444'],
                  ['صافي الكمية',reportResults[0].netQty,'#FFF'],
                  ['قيمة المبيعات',reportResults[0].totalSoldValue.toLocaleString()+' ﷼','#10B981'],
                  ['قيمة المشتريات',reportResults[0].totalPurchasedValue.toLocaleString()+' ﷼','#EF4444'],
                  ['صافي القيمة',reportResults[0].netValue.toLocaleString()+' ﷼','#D4AF37'],
                ].map((r,i)=>(<View key={i} style={st.sumRow}><Text style={st.sumL}>{r[0]}</Text><Text style={[st.sumV,{color:r[2]}]}>{r[1]}</Text></View>))}
              </View>
            ) : (
              <FlatList data={reportResults} keyExtractor={(_,i)=>i.toString()} renderItem={({item})=>(
                <View style={st.rr}><View style={st.rrh}><Text style={[st.rrt,{color:item.type==='بيع'?'#10B981':'#EF4444'}]}>{item.type}</Text><Text style={st.rrd}>{item.date}</Text></View><Text style={st.rrp}>{item.party}</Text><View style={st.rri}><Text>الكمية: {item.qty}</Text><Text>السعر: {item.price?.toLocaleString()}</Text><Text style={{fontWeight:'bold'}}>الإجمالي: {item.total?.toLocaleString()} ﷼</Text></View><Text style={st.rrf}>📄 {item.ref}</Text></View>
              )} style={{maxHeight:400}}/>
            )}
          </View></View></View>
      </Modal>
    </View>
  );
}
const st = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},ct:{padding:14},
  sr:{flexDirection:'row',gap:6,marginBottom:14},s:{flex:1,backgroundColor:'#16213E',borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:'#2a3550'},sv:{color:'#D4AF37',fontSize:18,fontWeight:'bold',marginBottom:3},sl:{color:'#94a3b8',fontSize:10},
  filterBtn:{backgroundColor:'#16213E',borderRadius:12,padding:12,alignItems:'center',marginBottom:14,borderWidth:1,borderColor:'#2a3550'},filterText:{color:'#D4AF37',fontSize:13},
  tt:{fontSize:15,fontWeight:'bold',color:'#D4AF37',marginBottom:10,marginTop:18},
  rc:{flexDirection:'row',alignItems:'center',backgroundColor:'#16213E',borderRadius:14,padding:14,marginBottom:8,borderWidth:1,borderColor:'#2a3550'},ri:{fontSize:26,marginRight:12},rl:{color:'#FFF',fontSize:14,fontWeight:'bold',marginBottom:3},rd:{color:'#94a3b8',fontSize:11},ar:{fontSize:20,color:'#D4AF37',fontWeight:'bold'},
  er:{flexDirection:'row',gap:6,marginBottom:14},e:{flex:1,backgroundColor:'#16213E',borderRadius:10,padding:10,alignItems:'center',borderWidth:1,borderColor:'#2a3550'},et:{color:'#FFF',fontSize:11,fontWeight:'bold'},
  ac:{backgroundColor:'#16213E',borderRadius:14,padding:14,marginBottom:10,borderLeftWidth:4,borderWidth:1,borderColor:'#2a3550'},at:{color:'#FFF',fontSize:14,fontWeight:'bold',marginBottom:8},ai:{color:'#94a3b8',fontSize:12,marginBottom:4},
  mo:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},mc:{backgroundColor:'#16213E',borderTopLeftRadius:20,borderTopRightRadius:20,maxHeight:'90%'},mh:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#2a3550'},mt:{color:'#D4AF37',fontSize:18,fontWeight:'bold'},mx:{color:'#EF4444',fontSize:22,fontWeight:'bold'},mb:{padding:16},
  fl:{color:'#94a3b8',fontSize:13,marginBottom:6,marginTop:12},fi:{backgroundColor:'#0A1128',borderRadius:10,padding:12,color:'#FFF',borderWidth:1,borderColor:'#2a3550',fontSize:14},
  qd:{flexDirection:'row',gap:8,marginTop:12},qb:{flex:1,backgroundColor:'#0A1128',borderRadius:10,padding:10,alignItems:'center',borderWidth:1,borderColor:'#2a3550'},qt:{color:'#94a3b8',fontSize:12},
  ab:{backgroundColor:'#D4AF37',borderRadius:12,padding:14,alignItems:'center',marginTop:20},atx:{color:'#0A1128',fontSize:16,fontWeight:'bold',textAlign:'center'},
  chip:{paddingHorizontal:10,paddingVertical:6,borderRadius:12,backgroundColor:'#0A1128',borderWidth:1,borderColor:'#2a3550',marginRight:4},chipA:{borderColor:'#D4AF37',backgroundColor:'#D4AF37'+'20'},chipT:{color:'#94a3b8',fontSize:11},chipTA:{color:'#D4AF37',fontWeight:'bold'},
  tr:{flexDirection:'row',gap:8},tb:{flex:1,paddingVertical:10,borderRadius:10,backgroundColor:'#0A1128',borderWidth:1,borderColor:'#2a3550',alignItems:'center'},tbA:{borderColor:'#D4AF37',backgroundColor:'#D4AF37'+'20'},tbt:{color:'#94a3b8',fontSize:13},tbtA:{color:'#D4AF37',fontWeight:'bold'},
  sb:{backgroundColor:'#D4AF37',borderRadius:12,padding:14,alignItems:'center'},sbt:{color:'#0A1128',fontSize:16,fontWeight:'bold'},
  summaryCard:{backgroundColor:'#0A1128',borderRadius:14,padding:16,marginTop:10},summaryTitle:{color:'#D4AF37',fontSize:16,fontWeight:'bold',marginBottom:12,textAlign:'center'},
  sumRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:6},sumL:{color:'#94a3b8',fontSize:13},sumV:{color:'#FFF',fontSize:14,fontWeight:'bold'},
  rr:{backgroundColor:'#0A1128',borderRadius:10,padding:12,marginBottom:8,borderWidth:1,borderColor:'#2a3550'},rrh:{flexDirection:'row',justifyContent:'space-between',marginBottom:6},rrt:{fontSize:14,fontWeight:'bold'},rrd:{color:'#94a3b8',fontSize:11},rrp:{color:'#FFF',fontSize:13,marginBottom:4},rri:{flexDirection:'row',justifyContent:'space-between',marginBottom:4},rrf:{color:'#94a3b8',fontSize:10},
});
