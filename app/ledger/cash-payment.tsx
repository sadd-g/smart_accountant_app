import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function cashpaymentScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity><Text style={styles.title}>cash-payment</Text><View style={{width:36}}/></View>
      <View style={styles.content}><Text style={styles.icon}>🧾</Text><Text style={styles.text}>تم دمجها مع سندات القبض والصرف الموحدة</Text></View>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A1128'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},backBtn:{fontSize:24,color:'#D4AF37',fontWeight:'bold'},title:{fontSize:18,fontWeight:'bold',color:'#FFFFFF'},
  content:{flex:1,justifyContent:'center',alignItems:'center',padding:20},icon:{fontSize:48,marginBottom:12},text:{color:'#94a3b8',fontSize:14,textAlign:'center'},
});
