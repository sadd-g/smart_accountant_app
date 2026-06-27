import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert, Modal, TextInput, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState('main');
  const [darkMode, setDarkMode] = useState(true);
  const [showCurrency, setShowCurrency] = useState(true);
  const [noNegativeStock, setNoNegativeStock] = useState(true);
  const [showTransactionNumber, setShowTransactionNumber] = useState(true);
  const [showTotalBelow, setShowTotalBelow] = useState(true);
  const [debtAlert, setDebtAlert] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [whatsappShare, setWhatsappShare] = useState(false);
  const [language, setLanguage] = useState('ar');
  const [fontSize, setFontSize] = useState('medium');
  const [sortBy, setSortBy] = useState('code');
  const [showActivation, setShowActivation] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [profile, setProfile] = useState({ name: 'صدام بشير', address: '', phone: '736002798', email: 'saap1990@gmail.com', username: 'admin', password: '1234', location: '' });

  const screenTitle: any = { main: '⚙️ الإعدادات', general: 'إعدادات عامة', profile: '👤 البيانات الشخصية', security: '🔒 خيارات الأمان', printing: '🖨️ خيارات الطباعة', backup: '💾 خيارات الحفظ', advanced: '⚙️ خيارات أخرى' }[currentScreen] || 'الإعدادات';

  const menuItem = (icon: string, label: string, onPress: () => void, sub?: string) => (
    <TouchableOpacity style={st.mi} onPress={onPress}>
      <Text style={st.mic}>{icon}</Text><View style={{flex:1}}><Text style={st.mt}>{label}</Text>{sub?<Text style={st.ms}>{sub}</Text>:null}</View><Text style={st.ma}>→</Text>
    </TouchableOpacity>
  );
  const switchRow = (label: string, value: boolean, onToggle: (v: boolean) => void) => (
    <View style={st.sr}><Text style={st.srt}>{label}</Text><Switch value={value} onValueChange={onToggle} trackColor={{true:'#10B981'}}/></View>
  );

  return (
    <View style={[st.c,{paddingTop:insets.top}]}><StatusBar barStyle="light-content"/>
      <View style={st.h}><TouchableOpacity onPress={()=>currentScreen==='main'?router.back():setCurrentScreen('main')}><Text style={st.bt}>←</Text></TouchableOpacity><Text style={st.tl}>{screenTitle}</Text><View style={{width:36}}/></View>
      <ScrollView style={st.ct}>
        {currentScreen==='main'&&<View>
          {menuItem('💾','حفظ نسخة احتياطية',()=>Alert.alert('✅','تم الحفظ'))}
          {menuItem('🔄','إسترجاع قاعدة البيانات',()=>Alert.alert('🔄','جاري الاستعادة'))}
          {menuItem('☁️','جوجل درايف',()=>Alert.alert('☁️','جاري المزامنة'))}
          {menuItem('⚙️','الإعدادات العامة',()=>setCurrentScreen('general'))}
          {menuItem('📞','تواصل والدعم',()=>Linking.openURL('https://wa.me/967736002798'),'736002798')}
          {menuItem('ℹ️','حول البرنامج',()=>router.push('/about'))}
          {menuItem('🔗','مشاركة البرنامج',()=>Alert.alert('🔗','https://smartaccountant.app'))}
          {menuItem('👑','لوحة تحكم المالك',()=>router.push('/owner'))}
          {menuItem('🚪','خروج',()=>router.push('/login'))}
        </View>}
        {currentScreen==='general'&&<View>
          {menuItem('👤','البيانات الشخصية',()=>setCurrentScreen('profile'))}
          {menuItem('🖨️','خيارات الطباعة',()=>setCurrentScreen('printing'))}
          {menuItem('🔒','خيارات الأمان',()=>setCurrentScreen('security'))}
          {menuItem('💲','العملات',()=>router.push('/ledger/currencies'))}
          {menuItem('💾','خيارات حفظ البيانات',()=>setCurrentScreen('backup'))}
          {menuItem('⚙️','خيارات أخرى',()=>setCurrentScreen('advanced'))}
        </View>}
        {currentScreen==='profile'&&<View style={st.card}>
          {['👤 الاسم','📍 العنوان','📞 رقم التلفون','📧 البريد الإلكتروني','👤 username','🔑 password','💾 الموقع'].map((l,i)=>(<View key={i}><Text style={st.fl}>{l}</Text><TextInput style={st.fi} value={Object.values(profile)[i]} onChangeText={v=>{const k=Object.keys(profile)[i];setProfile({...profile,[k]:v});}} placeholderTextColor="#666" secureTextEntry={l.includes('🔑')}/></View>))}
        </View>}
        {currentScreen==='security'&&<View style={st.card}>
          {switchRow('🔑 تفعيل كلمة السر',true,()=>{})}
          <View style={st.dv}/><Text style={st.fl}>🔐 كلمة السر</Text><TextInput style={st.fi} value="1234" placeholderTextColor="#666" secureTextEntry/>
        </View>}
        {currentScreen==='printing'&&<View style={st.card}>
          {switchRow('📄 إظهار البيانات',true,()=>{})}
          <View style={st.dv}/>{switchRow('📅 إظهار التاريخ',true,()=>{})}
          <View style={st.dv}/>{switchRow('📝 طباعة مختصرة',false,()=>{})}
          <View style={st.dv}/>{switchRow('💰 طباعة الرصيد',true,()=>{})}
          <View style={st.dv}/><Text style={st.fl}>💬 ترويسة/تذييل</Text><TextInput style={[st.fi,{height:60}]} placeholder="نص مخصص للتذييل" placeholderTextColor="#666" multiline/>
        </View>}
        {currentScreen==='backup'&&<View style={st.card}>
          {switchRow('📆 حفظ يومي تلقائي',autoBackup,setAutoBackup)}
          <View style={st.dv}/><TouchableOpacity style={st.sr} onPress={()=>Alert.alert('🔄','جاري استعادة الصور')}><Text style={st.srt}>🔄 استعادة الصور</Text></TouchableOpacity>
          <View style={st.dv}/><TouchableOpacity style={st.sr} onPress={()=>Alert.alert('☁️','تغيير الحساب السحابي')}><Text style={st.srt}>☁️ تغيير الحساب السحابي</Text></TouchableOpacity>
        </View>}
        {currentScreen==='advanced'&&<View style={st.card}>
          {switchRow('💬 إرسال كشف واتساب',whatsappShare,setWhatsappShare)}
          <View style={st.dv}/>{switchRow('🗣️ الوضع الصوتي',voiceMode,setVoiceMode)}
          <View style={st.dv}/>{switchRow('💲 إظهار العملات',showCurrency,setShowCurrency)}
          <View style={st.dv}/>{switchRow('🚫 إيقاف البيع بالسالب',noNegativeStock,setNoNegativeStock)}
          <View style={st.dv}/>{switchRow('🔢 إظهار رقم العملية',showTransactionNumber,setShowTransactionNumber)}
          <View style={st.dv}/>{switchRow('📉 إجمالي أسفل الحساب',showTotalBelow,setShowTotalBelow)}
          <View style={st.dv}/>{switchRow('🌙 الوضع الليلي',darkMode,setDarkMode)}
          <View style={st.dv}/>{switchRow('🔔 تنبيه الديون',debtAlert,setDebtAlert)}
          <View style={st.dv}/><TouchableOpacity style={st.sr} onPress={()=>setLanguage(language==='ar'?'en':'ar')}><Text style={st.srt}>🌐 تغيير لغة الواجهة</Text><Text style={st.val}>{language==='ar'?'العربية 🇾🇪':'English 🇬🇧'}</Text></TouchableOpacity>
          <View style={st.dv}/><TouchableOpacity style={st.sr} onPress={()=>setFontSize(fontSize==='medium'?'large':'medium')}><Text style={st.srt}>🔤 حجم الخط</Text><Text style={st.val}>{fontSize}</Text></TouchableOpacity>
          <View style={st.dv}/><TouchableOpacity style={st.sr} onPress={()=>setSortBy(sortBy==='code'?'name':'code')}><Text style={st.srt}>📋 ترتيب الشاشة</Text><Text style={st.val}>{sortBy==='code'?'بالكود':'بالاسم'}</Text></TouchableOpacity>
        </View>}
        <View style={{height:40}}/>
      </ScrollView>
      <Modal visible={showActivation} animationType="slide" transparent>
        <View style={st.mo}><View style={st.mc}><View style={st.mh}><Text style={st.mtt}>تفعيل النسخة</Text><TouchableOpacity onPress={()=>setShowActivation(false)}><Text style={st.mx}>✕</Text></TouchableOpacity></View>
        <View style={st.mb}><TextInput style={st.fi} value={activationCode} onChangeText={setActivationCode} placeholder="رمز التفعيل" placeholderTextColor="#666"/><TouchableOpacity style={st.ab} onPress={()=>{setShowActivation(false);Alert.alert('✅','تم التفعيل');}}><Text style={st.at}>✅ تفعيل</Text></TouchableOpacity></View></View></View>
      </Modal>
    </View>
  );
}
const st=StyleSheet.create({c:{flex:1,backgroundColor:'#0A1128'},h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},bt:{fontSize:24,color:'#D4AF37',fontWeight:'bold'},tl:{fontSize:18,fontWeight:'bold',color:'#FFF'},ct:{flex:1,padding:16},
  mi:{flexDirection:'row',alignItems:'center',padding:14,backgroundColor:'#16213E',borderRadius:12,marginBottom:8,borderWidth:1,borderColor:'#2a3550'},mic:{fontSize:22,marginRight:10},mt:{color:'#FFF',fontSize:14},ms:{color:'#94a3b8',fontSize:10,marginTop:2},ma:{color:'#D4AF37',fontSize:16},
  card:{backgroundColor:'#16213E',borderRadius:14,padding:4,borderWidth:1,borderColor:'#2a3550'},sr:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14},srt:{color:'#FFF',fontSize:14},val:{color:'#D4AF37',fontSize:13},dv:{height:1,backgroundColor:'#2a3550',marginHorizontal:14},
  fl:{color:'#94a3b8',fontSize:13,marginBottom:6,marginTop:12,paddingHorizontal:14},fi:{backgroundColor:'#0A1128',borderRadius:10,padding:12,color:'#FFF',borderWidth:1,borderColor:'#2a3550',fontSize:14,marginHorizontal:14,marginBottom:8},
  mo:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},mc:{backgroundColor:'#16213E',borderTopLeftRadius:20,borderTopRightRadius:20},mh:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#2a3550'},mtt:{color:'#D4AF37',fontSize:18,fontWeight:'bold'},mx:{color:'#EF4444',fontSize:22,fontWeight:'bold'},mb:{padding:16},
  ab:{backgroundColor:'#D4AF37',borderRadius:12,padding:14,alignItems:'center',marginTop:16},at:{color:'#0A1128',fontSize:16,fontWeight:'bold',textAlign:'center'},
});
