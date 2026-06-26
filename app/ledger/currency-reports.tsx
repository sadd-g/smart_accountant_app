import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function Screen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  return (
    <View style={[styles.c,{paddingTop:insets.top}]}><StatusBar barStyle="light-content"/>
      <View style={styles.h}><TouchableOpacity onPress={()=>router.back()} style={styles.b}><Text style={styles.bt}>←</Text></TouchableOpacity><Text style={styles.t}>💱 تقارير العملات</Text><View style={{width:40}}/></View>
      <View style={styles.cc}><Text style={styles.i}>🚧</Text><Text style={styles.tt}>تقارير العملات</Text><Text style={styles.st}>قيد التطوير</Text></View>
    </View>
  );
}
const styles=StyleSheet.create({c:{flex:1,backgroundColor:'#0A1128'},h:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:14},b:{width:40,height:40,borderRadius:20,backgroundColor:'#16213E',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#2a3550'},bt:{fontSize:20,color:'#D4AF37',fontWeight:'bold'},t:{flex:1,fontSize:18,fontWeight:'bold',color:'#FFF',textAlign:'center'},cc:{flex:1,justifyContent:'center',alignItems:'center'},i:{fontSize:64,marginBottom:16},tt:{color:'#FFF',fontSize:18,fontWeight:'bold'},st:{color:'#94a3b8',fontSize:14,marginTop:8}});
