import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

export default function QtyReportScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data: items } = useLocalTable('items');
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity><Text style={styles.title}>تقرير الكميات</Text><TouchableOpacity onPress={() => Alert.alert('🖨️', 'جاري الطباعة')}><Text>🖨️</Text></TouchableOpacity></View>
      <FlatList data={items||[]} keyExtractor={(i:any)=>i.id} renderItem={({item})=>(<View style={styles.card}><Text style={styles.name}>{item.name}</Text><Text style={styles.qty}>الكمية: {item.quantity||0} | الحد الأدنى: {item.minQuantity||0}</Text></View>)} contentContainerStyle={{padding:16}} />
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A1128'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},backBtn:{fontSize:24,color:'#D4AF37',fontWeight:'bold'},title:{fontSize:18,fontWeight:'bold',color:'#FFFFFF'},
  card:{backgroundColor:'#16213E',borderRadius:12,padding:14,marginBottom:8,borderWidth:1,borderColor:'#2a3550'},name:{color:'#FFFFFF',fontSize:15,fontWeight:'bold'},qty:{color:'#94a3b8',fontSize:12,marginTop:4},
});
