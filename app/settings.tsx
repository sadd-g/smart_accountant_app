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
  const [debtAlert, setDebtAlert] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [showActivation, setShowActivation] = useState(false);
  const [activationCode, setActivationCode] = useState('');

  const screenTitle: any = { main: 'الإعدادات', general: 'إعدادات عامة', profile: 'البيانات الشخصية', security: 'خيارات الأمان', printing: 'خيارات الطباعة', backup: 'خيارات الحفظ', advanced: 'خيارات أخرى' }[currentScreen] || 'الإعدادات';

  const menuItem = (icon: string, label: string, onPress: () => void) => (
    <TouchableOpacity style={styles.mi} onPress={onPress}><Text style={styles.mic}>{icon}</Text><Text style={styles.mt}>{label}</Text><Text style={styles.ma}>→</Text></TouchableOpacity>
  );
  const switchRow = (label: string, value: boolean, onToggle: (v: boolean) => void) => (
    <View style={styles.sr}><Text style={styles.srt}>{label}</Text><Switch value={value} onValueChange={onToggle} trackColor={{true:'#10B981'}}/></View>
  );
  const fieldRow = (label: string, value: string, onChange: (v: string) => void, secure?: boolean) => (
    <View><Text style={styles.fl}>{label}</Text><TextInput style={styles.fi} value={value} onChangeText={onChange} placeholderTextColor="#666" secureTextEntry={secure}/></View>
  );

  return (
    <View style={[styles.c,{paddingTop:insets.top}]}><StatusBar barStyle="light-content"/>
      <View style={styles.h}><TouchableOpacity onPress={()=>currentScreen==='main'?router.back():setCurrentScreen('main')}><Text style={styles.bt}>←</Text></TouchableOpacity><Text style={styles.tl}>{screenTitle}</Text><View style={{width:36}}/></View>
      <ScrollView style={styles.ct}>
        {currentScreen==='main'&&<View>
          {menuItem('💾','حفظ نسخة احتياطية',()=>Alert.alert('✅','تم الحفظ'))}
          {menuItem('🔄','إسترجاع قاعدة البيانات',()=>Alert.alert('🔄','جاري الاستعادة'))}
          {menuItem('☁️','جوجل درايف',()=>Alert.alert('☁️','جاري المزامنة'))}
          {menuItem('⚙️','الإعدادات العامة',()=>setCurrentScreen('general'))}
          {menuItem('📞','تواصل والدعم',()=>Linking.openURL('https://wa.me/967736002798'))}
          {menuItem('ℹ️','حول البرنامج',()=>router.push('/about'))}
          {menuItem('🔗','مشاركة البرنامج',()=>Alert.alert('🔗','https://smartaccountant.app'))}
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
        {currentScreen==='profile'&&<View style={styles.card}>
          {fieldRow('👤 الاسم','صدام بشير',()=>{})}
          {fieldRow('📍 العنوان','',()=>{})}
          {fieldRow('📞 رقم التلفون','736002798',()=>{})}
          {fieldRow('📧 البريد الإلكتروني','saap1990@gmail.com',()=>{})}
          {fieldRow('👤 username','admin',()=>{})}
          {fieldRow('🔑 password','1234',()=>{},true)}
        </View>}
        {currentScreen==='security'&&<View style={styles.card}>
          {switchRow('🔑 تفعيل كلمة السر',true,()=>{})}
          {fieldRow('🔐 كلمة السر','1234',()=>{},true)}
        </View>}
        {currentScreen==='printing'&&<View style={styles.card}>
          {switchRow('📄 إظهار البيانات',true,()=>{})}
          <View style={styles.dv}/>{switchRow('📅 إظهار التاريخ',true,()=>{})}
          <View style={styles.dv}/>{switchRow('📝 طباعة مختصرة',false,()=>{})}
          <View style={styles.dv}/>{switchRow('💰 طباعة الرصيد',true,()=>{})}
          <View style={styles.dv}/><Text style={styles.fl}>💬 ترويسة/تذييل</Text><TextInput style={[styles.fi,{height:60}]} placeholder="نص مخصص" placeholderTextColor="#666" multiline/>
        </View>}
        {currentScreen==='backup'&&<View style={styles.card}>
          {switchRow('📆 حفظ يومي',false,()=>{})}
          <View style={styles.dv}/><TouchableOpacity style={styles.sr} onPress={()=>Alert.alert('🔄','استعادة')}><Text style={styles.srt}>🔄 استعادة الصور</Text></TouchableOpacity>
          <View style={styles.dv}/><TouchableOpacity style={styles.sr} onPress={()=>Alert.alert('☁️','تغيير الحساب')}><Text style={styles.srt}>☁️ تغيير الحساب السحابي</Text></TouchableOpacity>
        </View>}
        {currentScreen==='advanced'&&<View style={styles.card}>
          {switchRow('💬 إرسال كشف واتساب',false,()=>{})}
          <View style={styles.dv}/>{switchRow('🗣️ الوضع الصوتي',voiceMode,setVoiceMode)}
          <View style={styles.dv}/>{switchRow('💲 إظهار العملات',showCurrency,setShowCurrency)}
          <View style={styles.dv}/>{switchRow('🚫 إيقاف البيع بالسالب',noNegativeStock,setNoNegativeStock)}
          <View style={styles.dv}/>{switchRow('🔢 إظهار رقم العملية',showTransactionNumber,setShowTransactionNumber)}
          <View style={styles.dv}/>{switchRow('📉 إجمالي أسفل الحساب',false,()=>{})}
          <View style={styles.dv}/>{switchRow('🌙 الوضع الليلي',darkMode,setDarkMode)}
          <View style={styles.dv}/>{switchRow('🔔 تنبيه الديون',debtAlert,setDebtAlert)}
        </View>}
        <View style={{height:40}}/>
      </ScrollView>
      <Modal visible={showActivation} animationType="slide" transparent>
        <View style={styles.mo}><View style={styles.mc}><View style={styles.mh}><Text style={styles.mtt}>تفعيل النسخة</Text><TouchableOpacity onPress={()=>setShowActivation(false)}><Text style={styles.mx}>✕</Text></TouchableOpacity></View>
        <View style={styles.mb}><TextInput style={styles.fi} value={activationCode} onChangeText={setActivationCode} placeholder="رمز التفعيل" placeholderTextColor="#666"/>
        <TouchableOpacity style={styles.ab} onPress={()=>{setShowActivation(false);Alert.alert('✅','تم التفعيل');}}><Text style={styles.at}>✅ تفعيل</Text></TouchableOpacity></View></View></View>
      </Modal>
    </View>
  );
}
const styles=StyleSheet.create({c:{flex:1,backgroundColor:'#0A1128'},h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},bt:{fontSize:24,color:'#D4AF37',fontWeight:'bold'},tl:{fontSize:18,fontWeight:'bold',color:'#FFF'},ct:{flex:1,padding:16},
  mi:{flexDirection:'row',alignItems:'center',padding:14,backgroundColor:'#16213E',borderRadius:12,marginBottom:8,borderWidth:1,borderColor:'#2a3550'},mic:{fontSize:22,marginRight:10},mt:{color:'#FFF',fontSize:14,flex:1},ma:{color:'#D4AF37',fontSize:16},
  card:{backgroundColor:'#16213E',borderRadius:14,padding:4,borderWidth:1,borderColor:'#2a3550'},sr:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14},srt:{color:'#FFF',fontSize:14},dv:{height:1,backgroundColor:'#2a3550',marginHorizontal:14},
  fl:{color:'#94a3b8',fontSize:13,marginBottom:6,marginTop:12,paddingHorizontal:14},fi:{backgroundColor:'#0A1128',borderRadius:10,padding:12,color:'#FFF',borderWidth:1,borderColor:'#2a3550',fontSize:14,marginHorizontal:14,marginBottom:8},
  mo:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},mc:{backgroundColor:'#16213E',borderTopLeftRadius:20,borderTopRightRadius:20},mh:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#2a3550'},mtt:{color:'#D4AF37',fontSize:18,fontWeight:'bold'},mx:{color:'#EF4444',fontSize:22,fontWeight:'bold'},mb:{padding:16},
  ab:{backgroundColor:'#D4AF37',borderRadius:12,padding:14,alignItems:'center',marginTop:16},at:{color:'#0A1128',fontSize:16,fontWeight:'bold',textAlign:'center'},
});
