import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VoiceCommandScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);

  const voiceCommands = [
    { phrase: 'بيع 10 أكياس أسمنت للعميل أحمد نقداً', action: 'فاتورة مبيعات نقدية' },
    { phrase: 'شراء 50 كرتون من المورد نقداً', action: 'فاتورة مشتريات نقدية' },
    { phrase: 'استلام 100 ألف ريال من العميل', action: 'سند قبض' },
    { phrase: 'صرف 50 ألف ريال للمورد', action: 'سند صرف' },
  ];

  const startListening = () => {
    setIsListening(true); setTranscript('');
    setTimeout(() => {
      const cmd = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
      setTranscript(cmd.phrase); setIsListening(false);
      processCommand(cmd.phrase);
    }, 3000);
  };

  const processCommand = (command: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      let draftData: any = null;
      if (command.includes('بيع')) draftData = { type: 'فاتورة مبيعات', total: 35000 };
      else if (command.includes('شراء')) draftData = { type: 'فاتورة مشتريات', total: 50000 };
      else if (command.includes('استلام')) draftData = { type: 'سند قبض', amount: 100000 };
      else if (command.includes('صرف')) draftData = { type: 'سند صرف', amount: 50000 };
      setDraft(draftData); setIsProcessing(false);
    }, 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity><Text style={styles.title}>🎤 الأوامر الصوتية</Text><TouchableOpacity onPress={() => setShowHelp(true)}><Text style={styles.helpBtn}>❓</Text></TouchableOpacity></View>
      <ScrollView style={styles.content} contentContainerStyle={{ alignItems: 'center' }}>
        <TouchableOpacity style={[styles.micButton, isListening && styles.micActive]} onPress={startListening} disabled={isListening || isProcessing}>
          {isListening ? <ActivityIndicator size="large" color="#FFF" /> : <Text style={styles.micIcon}>🎤</Text>}
        </TouchableOpacity>
        <Text style={styles.micLabel}>{isListening ? 'جاري الاستماع...' : isProcessing ? 'جاري المعالجة...' : 'اضغط للتحدث'}</Text>
        {transcript ? <View style={styles.card}><Text style={styles.cardTitle}>📝 النص:</Text><Text style={styles.cardText}>{transcript}</Text></View> : null}
        {draft ? <View style={styles.card}><Text style={styles.cardTitle}>📋 مسودة</Text><Text style={styles.cardText}>{draft.type}: {draft.total || draft.amount} ﷼</Text>
          <View style={styles.actions}><TouchableOpacity style={styles.saveBtn} onPress={() => { Alert.alert('✅', 'تم الحفظ'); setDraft(null); }}><Text style={styles.saveText}>✅ حفظ</Text></TouchableOpacity><TouchableOpacity style={styles.cancelBtn} onPress={() => setDraft(null)}><Text style={styles.cancelText}>❌ إلغاء</Text></TouchableOpacity></View></View> : null}
        <View style={styles.tips}><Text style={styles.tipsTitle}>💡 أمثلة:</Text>{voiceCommands.map((c, i) => <Text key={i} style={styles.tip}>• "{c.phrase}"</Text>)}</View>
      </ScrollView>
      <Modal visible={showHelp} animationType="slide" transparent><View style={styles.modalOverlay}><View style={styles.modalContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>كيفية الاستخدام</Text><TouchableOpacity onPress={() => setShowHelp(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View><ScrollView style={styles.modalBody}><Text style={styles.helpText}>🎤 تحدث بوضوح</Text><Text style={styles.helpText}>📝 اذكر نوع المعاملة</Text><Text style={styles.helpText}>💰 اذكر المبالغ</Text><Text style={styles.helpText}>✅ راجع المسودة قبل الحفظ</Text></ScrollView></View></View></Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A1128'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},backBtn:{fontSize:24,color:'#D4AF37',fontWeight:'bold'},title:{fontSize:18,fontWeight:'bold',color:'#FFFFFF'},helpBtn:{fontSize:22,color:'#D4AF37'},
  content:{flex:1,padding:16},micButton:{width:120,height:120,borderRadius:60,backgroundColor:'#D4AF37',justifyContent:'center',alignItems:'center',marginTop:20,marginBottom:10},micActive:{backgroundColor:'#EF4444'},micIcon:{fontSize:50},micLabel:{color:'#FFFFFF',fontSize:16,marginBottom:20},
  card:{backgroundColor:'#16213E',borderRadius:14,padding:16,width:'100%',marginBottom:16,borderWidth:1,borderColor:'#2a3550'},cardTitle:{color:'#D4AF37',fontSize:14,fontWeight:'bold',marginBottom:8},cardText:{color:'#FFFFFF',fontSize:14,textAlign:'center'},
  actions:{flexDirection:'row',gap:8,marginTop:12},saveBtn:{flex:1,backgroundColor:'#10B981',borderRadius:10,padding:10,alignItems:'center'},saveText:{color:'#FFF',fontSize:13,fontWeight:'bold'},cancelBtn:{flex:1,backgroundColor:'#EF4444',borderRadius:10,padding:10,alignItems:'center'},cancelText:{color:'#FFF',fontSize:13,fontWeight:'bold'},
  tips:{backgroundColor:'#16213E',borderRadius:14,padding:16,width:'100%',borderWidth:1,borderColor:'#2a3550'},tipsTitle:{color:'#D4AF37',fontSize:14,fontWeight:'bold',marginBottom:10},tip:{color:'#94a3b8',fontSize:12,marginBottom:4},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},modalContent:{backgroundColor:'#16213E',borderTopLeftRadius:20,borderTopRightRadius:20},modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#2a3550'},modalTitle:{color:'#D4AF37',fontSize:18,fontWeight:'bold'},modalClose:{color:'#EF4444',fontSize:22,fontWeight:'bold'},modalBody:{padding:16},helpText:{color:'#FFFFFF',fontSize:14,marginBottom:12},
});
