import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

export default function SalesSummaryScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data: invoices } = useLocalTable('salesInvoices');
  const totalSales = (invoices||[]).reduce((s:number,i:any)=>s+(i.total||0),0);
  const totalCash = (invoices||[]).filter((i:any)=>i.type==='cash').reduce((s:number,i:any)=>s+(i.total||0),0);
  const totalCredit = (invoices||[]).filter((i:any)=>i.type==='credit').reduce((s:number,i:any)=>s+(i.total||0),0);
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity><Text style={styles.title}>ملخص المبيعات</Text><TouchableOpacity onPress={() => Alert.alert('🖨️', 'جاري الطباعة')}><Text>🖨️</Text></TouchableOpacity></View>
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statLabel}>إجمالي المبيعات</Text><Text style={[styles.statValue,{color:'#D4AF37'}]}>{totalSales.toLocaleString()} ﷼</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>نقدي</Text><Text style={[styles.statValue,{color:'#10B981'}]}>{totalCash.toLocaleString()} ﷼</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>آجل</Text><Text style={[styles.statValue,{color:'#F59E0B'}]}>{totalCredit.toLocaleString()} ﷼</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>عدد الفواتير</Text><Text style={[styles.statValue,{color:'#3B82F6'}]}>{invoices.length}</Text></View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A1128'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},backBtn:{fontSize:24,color:'#D4AF37',fontWeight:'bold'},title:{fontSize:18,fontWeight:'bold',color:'#FFFFFF'},
  stats:{padding:16,gap:10},stat:{backgroundColor:'#16213E',borderRadius:14,padding:20,alignItems:'center',borderWidth:1,borderColor:'#2a3550'},statLabel:{color:'#94a3b8',fontSize:14,marginBottom:8},statValue:{fontSize:24,fontWeight:'bold'},
});
