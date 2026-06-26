import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';

const CORRECT_PIN = '1234';

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [timer, setTimer] = useState(0);
  const router = useRouter();
  const shake = new Animated.Value(0);

  const shakeAnim = () => {
    Animated.sequence([...Array(4)].map((_, i) => 
      Animated.timing(shake, { toValue: (i%2===0?10:-10), duration: 50, useNativeDriver: true })
    )).start(() => shake.setValue(0));
  };

  const handlePin = (d: string) => { if (pin.length < 4 && !locked) { setPin(pin+d); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } };
  const handleDelete = () => { setPin(pin.slice(0,-1)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const handleLogin = () => {
    if (pin === CORRECT_PIN) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.replace('/(tabs)'); }
    else { shakeAnim(); setError('رمز PIN غير صحيح'); setPin(''); const a = attempts+1; setAttempts(a); if (a>=3) { setLocked(true); setTimer(30); setTimeout(()=>{setLocked(false);setAttempts(0);},30000); } }
  };

  const handleBio = async () => {
    try {
      const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'تسجيل الدخول بالبصمة' });
      if (r.success) router.replace('/(tabs)');
    } catch(e) {}
  };

  if (locked) return (
    <View style={styles.container}><LinearGradient colors={['#0A1128','#16213E']} style={styles.bg}/>
      <View style={styles.lockContent}><Text style={styles.lockIcon}>🔒</Text><Text style={styles.lockTitle}>تم القفل</Text><Text style={styles.lockTimer}>{timer} ثانية</Text></View>
    </View>
  );

  const keys = [['1','2','3'],['4','5','6'],['7','8','9'],['🖐️','0','⌫']];

  return (
    <View style={styles.container}><StatusBar barStyle="light-content"/><LinearGradient colors={['#0A1128','#16213E']} style={styles.bg}/>
      <View style={styles.content}>
        <LinearGradient colors={['#D4AF37','#FFD700']} style={styles.logo}><Text style={styles.logoText}>💎</Text></LinearGradient>
        <Text style={styles.title}>دفتر المحاسب الذكي</Text>
        <Text style={styles.sub}>النظام المحاسبي المتكامل</Text>
        <Animated.View style={[styles.dots, {transform:[{translateX:shake}]}]}>{[0,1,2,3].map(i=><View key={i} style={[styles.dot, i<pin.length&&styles.dotFill, error&&styles.dotErr]}/>)}</Animated.View>
        {error?<Text style={styles.error}>{error}</Text>:<View style={{height:20}}/>}
        <View style={styles.keypad}>{keys.map((r,ri)=><View key={ri} style={styles.keyRow}>{r.map((k,ci)=>k==='🖐️'?<TouchableOpacity key={ci} style={styles.key} onPress={handleBio}><Text style={styles.keyIcon}>🖐️</Text></TouchableOpacity>:<TouchableOpacity key={ci} style={[styles.key,k==='⌫'&&styles.keyDel]} onPress={()=>k==='⌫'?handleDelete():handlePin(k)}><Text style={[styles.keyText,k==='⌫'&&styles.keyDelText]}>{k}</Text></TouchableOpacity>)}</View>)}</View>
        <TouchableOpacity style={[styles.loginBtn,pin.length!==4&&styles.loginBtnOff]} onPress={handleLogin} disabled={pin.length!==4}><LinearGradient colors={pin.length===4?['#D4AF37','#FFD700']:['#2a3550','#1a2235']} style={styles.loginGrad}><Text style={[styles.loginText,pin.length!==4&&styles.loginTextOff]}>{'🔐 تسجيل الدخول'}</Text></LinearGradient></TouchableOpacity>
        <TouchableOpacity onPress={()=>Alert.alert('نسيت كلمة السر','تواصل مع: 736002798\nsaap1990@gmail.com')}><Text style={styles.forgot}>📞 نسيت كلمة السر؟</Text></TouchableOpacity>
        <Text style={styles.dev}>م/ صدام بشير | 736002798</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1},bg:{position:'absolute',left:0,right:0,top:0,bottom:0},
  content:{flex:1,justifyContent:'center',alignItems:'center',paddingHorizontal:32},
  logo:{width:90,height:90,borderRadius:45,justifyContent:'center',alignItems:'center',marginBottom:20},logoText:{fontSize:40},
  title:{fontSize:28,fontWeight:'bold',color:'#FFF',textAlign:'center'},sub:{fontSize:14,color:'#D4AF37',marginBottom:24},
  dots:{flexDirection:'row',gap:12,marginBottom:8},dot:{width:14,height:14,borderRadius:7,borderWidth:2,borderColor:'rgba(212,175,55,0.5)'},dotFill:{backgroundColor:'#D4AF37',borderColor:'#D4AF37'},dotErr:{borderColor:'#EF4444'},
  error:{color:'#EF4444',fontSize:13,marginBottom:4},keypad:{width:280,marginBottom:20},keyRow:{flexDirection:'row',justifyContent:'space-around',marginBottom:8},
  key:{width:68,height:68,borderRadius:34,backgroundColor:'rgba(255,255,255,0.08)',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'rgba(212,175,55,0.2)'},keyDel:{backgroundColor:'rgba(239,68,68,0.15)'},keyText:{fontSize:24,color:'#FFF',fontWeight:'600'},keyDelText:{color:'#EF4444'},keyIcon:{fontSize:22},
  loginBtn:{width:280,borderRadius:16,overflow:'hidden',marginBottom:16},loginBtnOff:{opacity:0.6},loginGrad:{paddingVertical:15,alignItems:'center'},loginText:{color:'#0A1128',fontSize:17,fontWeight:'bold'},loginTextOff:{color:'#6B7280'},
  forgot:{color:'rgba(255,255,255,0.7)',fontSize:13,marginBottom:20,textDecorationLine:'underline'},
  dev:{color:'rgba(255,255,255,0.4)',fontSize:11,position:'absolute',bottom:30},
  lockContent:{flex:1,justifyContent:'center',alignItems:'center'},lockIcon:{fontSize:64,marginBottom:16},lockTitle:{color:'#FFF',fontSize:22,fontWeight:'bold'},lockTimer:{color:'#F59E0B',fontSize:48,fontWeight:'bold'},
});
