import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const router = useRouter();

  const handlePin = (d: string) => { if (pin.length < 4) setPin(pin + d); };
  const handleDelete = () => setPin(pin.slice(0, -1));
  const handleLogin = () => {
    if (pin.length === 4) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.replace('/(tabs)'); }
  };

  const keys = [['1','2','3'],['4','5','6'],['7','8','9'],['','0','⌫']];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A1128','#1B2A4A','#0F3460']} style={styles.bg} />
      <View style={styles.content}>
        <LinearGradient colors={['#D4AF37','#FFD700']} style={styles.logo}><Text style={styles.logoText}>💎</Text></LinearGradient>
        <Text style={styles.title}>دفتر المحاسب الذكي</Text>
        <Text style={styles.sub}>النظام المحاسبي المتكامل</Text>
        <View style={styles.dots}>{[0,1,2,3].map(i=><View key={i} style={[styles.dot, i<pin.length&&styles.dotFill]} />)}</View>
        <View style={styles.keypad}>
          {keys.map((row,ri)=>(
            <View key={ri} style={styles.keyRow}>
              {row.map((k,ci)=>k===''?<View key={ci} style={styles.key} />:
                <TouchableOpacity key={ci} style={styles.key} onPress={()=>k==='⌫'?handleDelete():handlePin(k)}>
                  <Text style={styles.keyText}>{k}</Text></TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}><LinearGradient colors={['#D4AF37','#B8960C']} style={styles.loginGrad}><Text style={styles.loginText}>🔐 تسجيل الدخول</Text></LinearGradient></TouchableOpacity>
        <Text style={styles.dev}>م/ صدام بشير</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1},bg:{position:'absolute',left:0,right:0,top:0,bottom:0},
  content:{flex:1,justifyContent:'center',alignItems:'center',padding:32},
  logo:{width:90,height:90,borderRadius:45,justifyContent:'center',alignItems:'center',marginBottom:20},logoText:{fontSize:40},
  title:{fontSize:28,fontWeight:'bold',color:'#FFF',textAlign:'center'},sub:{fontSize:14,color:'#D4AF37',marginBottom:24},
  dots:{flexDirection:'row',gap:10,marginBottom:24},
  dot:{width:14,height:14,borderRadius:7,borderWidth:2,borderColor:'#D4AF37'},dotFill:{backgroundColor:'#D4AF37'},
  keypad:{width:260,marginBottom:20},
  keyRow:{flexDirection:'row',justifyContent:'space-around',marginBottom:8},
  key:{width:65,height:65,borderRadius:33,backgroundColor:'rgba(255,255,255,0.1)',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'rgba(212,175,55,0.3)'},
  keyText:{fontSize:22,color:'#FFF',fontWeight:'bold'},
  loginBtn:{width:260,borderRadius:14,overflow:'hidden'},loginGrad:{padding:14,alignItems:'center'},loginText:{color:'#0A1128',fontSize:16,fontWeight:'bold'},
  dev:{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:24},
});
