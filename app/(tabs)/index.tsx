import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: accounts } = useLocalTable('accounts');
  const { data: customers } = useLocalTable('customers');
  const { data: invoices } = useLocalTable('salesInvoices');
  const { data: cashBoxes } = useLocalTable('cashBoxes');
  const totalSales = (invoices||[]).reduce((s,i)=>s+(i.total||0),0);
  const totalCash = (cashBoxes||[]).reduce((s,c)=>s+(c.balance||0),0);

  return (
    <View style={[styles.container,{paddingTop:insets.top}]}><StatusBar barStyle="light-content"/>
      <View style={styles.header}><Text style={styles.welcome}>💎 دفتر المحاسب الذكي</Text><TouchableOpacity onPress={()=>router.push('/settings')}><Text style={styles.settingsIcon}>⚙️</Text></TouchableOpacity></View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statVal}>💰 {totalSales.toLocaleString()}</Text><Text style={styles.statLbl}>المبيعات</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>📚 {accounts.length}</Text><Text style={styles.statLbl}>حسابات</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>👥 {customers.length}</Text><Text style={styles.statLbl}>عملاء</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>💵 {totalCash.toLocaleString()}</Text><Text style={styles.statLbl}>نقدية</Text></View>
        </View>
        <Text style={styles.secTitle}>⚡ إجراءات سريعة</Text>
        <View style={styles.quickRow}>
          {[{icon:'📄',label:'فاتورة مبيعات',route:'/sales/sales-invoice'},{icon:'📋',label:'فاتورة مشتريات',route:'/inventory/purchase-invoice'},{icon:'📝',label:'قيد يومية',route:'/ledger/journal-entry'},{icon:'🧾',label:'سند قبض/صرف',route:'/ledger/vouchers'}].map((q,i)=>
            <TouchableOpacity key={i} style={styles.quickCard} onPress={()=>router.push(q.route)}><Text style={styles.quickIcon}>{q.icon}</Text><Text style={styles.quickLabel}>{q.label}</Text></TouchableOpacity>
          )}
        </View>
        <Text style={styles.secTitle}>📊 الأقسام الرئيسية</Text>
        {[{icon:'📚',label:'دفتر الأستاذ العام',desc:'الحسابات، القيود، السندات',color:'#D4AF37',route:'/ledger/index'},
          {icon:'📦',label:'المخزون والمشتريات',desc:'الموردين، الأصناف، المستودعات',color:'#3B82F6',route:'/inventory/index'},
          {icon:'💰',label:'المبيعات والعملاء',desc:'الفواتير، العملاء، المندوبين',color:'#10B981',route:'/sales/index'},
          {icon:'📊',label:'التقارير والتنبيهات',desc:'جميع التقارير المالية',color:'#7C3AED',route:'/reports/index'}].map((s,i)=>
          <TouchableOpacity key={i} style={[styles.card,{borderLeftColor:s.color}]} onPress={()=>router.push(s.route)}>
            <Text style={styles.cardIcon}>{s.icon}</Text><View style={{flex:1}}><Text style={styles.cardLabel}>{s.label}</Text><Text style={styles.cardDesc}>{s.desc}</Text></View><Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.secTitle}>⚙️ النظام</Text>
        {[{icon:'⚙️',label:'الإعدادات',route:'/settings'},{icon:'👑',label:'لوحة المالك',route:'/owner'},{icon:'🎤',label:'الأوامر الصوتية',route:'/voice'},{icon:'💾',label:'النسخ الاحتياطي',route:'/backup'},{icon:'ℹ️',label:'حول التطبيق',route:'/about'},{icon:'🚪',label:'تسجيل الخروج',route:'/login'}].map((l,i)=>
          <TouchableOpacity key={i} style={styles.sysItem} onPress={()=>router.push(l.route)}><Text style={styles.sysIcon}>{l.icon}</Text><Text style={styles.sysLabel}>{l.label}</Text><Text style={styles.cardArrow}>→</Text></TouchableOpacity>
        )}
        <View style={{height:30}}/>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A1128'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:18,paddingVertical:14},welcome:{fontSize:19,fontWeight:'bold',color:'#FFF'},settingsIcon:{fontSize:24},
  scroll:{flex:1,paddingHorizontal:14},stats:{flexDirection:'row',gap:6,marginBottom:16,marginTop:4},stat:{flex:1,backgroundColor:'#16213E',borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:'#2a3550'},statVal:{fontSize:12,fontWeight:'bold',color:'#D4AF37',marginBottom:3},statLbl:{color:'#94a3b8',fontSize:10},
  secTitle:{fontSize:14,fontWeight:'bold',color:'#D4AF37',marginBottom:10,marginTop:16},quickRow:{flexDirection:'row',gap:8},quickCard:{flex:1,alignItems:'center'},quickIcon:{fontSize:22,marginBottom:4},quickLabel:{color:'#FFF',fontSize:10,textAlign:'center'},
  card:{flexDirection:'row',alignItems:'center',backgroundColor:'#16213E',borderRadius:14,padding:16,marginBottom:10,borderLeftWidth:4,borderWidth:1,borderColor:'#2a3550'},cardIcon:{fontSize:28,marginRight:12},cardLabel:{color:'#FFF',fontSize:14,fontWeight:'bold',marginBottom:3},cardDesc:{color:'#94a3b8',fontSize:11},cardArrow:{fontSize:20,color:'#D4AF37',fontWeight:'bold'},
  sysItem:{flexDirection:'row',alignItems:'center',backgroundColor:'#16213E',borderRadius:12,padding:14,marginBottom:6,borderWidth:1,borderColor:'#2a3550'},sysIcon:{fontSize:18,marginRight:10},sysLabel:{color:'#FFF',fontSize:13,flex:1},
});
