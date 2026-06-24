import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated, Alert, TextInput, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import { useColors } from '../hooks/useColors';
import { formatNumber, genId } from '../db/database';

// استخدام Web Speech API على الويب
const SpeechRecognitionAPI = (typeof window !== 'undefined' && (window as any).SpeechRecognition) || 
                              (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

type CommandType = 'sale' | 'purchase' | 'receipt' | 'payment' | 'journal' | 'unknown';

interface VoiceCommand {
  type: CommandType; rawText: string; confidence: number;
  details: { customer?: string; supplier?: string; item?: string; quantity?: number; price?: number; amount?: number; paymentMethod?: string; description?: string; accountName?: string; };
}

export default function VoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useApp();
  const { db, refresh } = useDatabase() as any;
  
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<VoiceCommand | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'voice' | 'history'>('voice');
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef<any>(null);

  // تحليل النص العربي
  const parseCommand = (text: string): VoiceCommand[] => {
    const results: VoiceCommand[] = [];
    const lower = text.toLowerCase().trim();
    
    if (lower.includes('بيع') || lower.includes('فاتورة')) {
      const qtyMatch = text.match(/(\d+)/);
      const priceMatch = text.match(/بـ?\s*(\d+)/) || text.match(/سعر\s*(\d+)/);
      const customerMatch = text.match(/(?:لـ|للعميل|للزبون)\s*(\S+)/);
      results.push({
        type: 'sale', rawText: text, confidence: 0.85,
        details: { item: text.split(' ')[1] || '', quantity: qtyMatch ? parseInt(qtyMatch[1]) : 1, price: priceMatch ? parseInt(priceMatch[1]) : 0, customer: customerMatch?.[1] || '', paymentMethod: 'cash', description: `فاتورة مبيعات - ${customerMatch?.[1] || 'عميل'}` }
      });
    } else if (lower.includes('شراء') || lower.includes('مشتريات')) {
      const qtyMatch = text.match(/(\d+)/);
      const priceMatch = text.match(/بـ?\s*(\d+)/);
      const supplierMatch = text.match(/(?:من|المورد)\s*(\S+)/);
      results.push({
        type: 'purchase', rawText: text, confidence: 0.8,
        details: { supplier: supplierMatch?.[1] || '', quantity: qtyMatch ? parseInt(qtyMatch[1]) : 1, price: priceMatch ? parseInt(priceMatch[1]) : 0, description: `فاتورة مشتريات - ${supplierMatch?.[1] || 'مورد'}` }
      });
    } else if (lower.includes('قبض') || lower.includes('استلام')) {
      const amtMatch = text.match(/(\d+)/);
      const fromMatch = text.match(/(?:من|العميل)\s*(\S+)/);
      results.push({
        type: 'receipt', rawText: text, confidence: 0.9,
        details: { amount: amtMatch ? parseInt(amtMatch[1]) : 0, customer: fromMatch?.[1] || '', description: `سند قبض - ${fromMatch?.[1] || ''}` }
      });
    } else if (lower.includes('صرف') || lower.includes('دفع')) {
      const amtMatch = text.match(/(\d+)/);
      const toMatch = text.match(/(?:لـ|للمورد)\s*(\S+)/);
      results.push({
        type: 'payment', rawText: text, confidence: 0.85,
        details: { amount: amtMatch ? parseInt(amtMatch[1]) : 0, supplier: toMatch?.[1] || '', description: `سند صرف - ${toMatch?.[1] || ''}` }
      });
    } else if (lower.includes('قيد') || lower.includes('تسجيل')) {
      results.push({ type: 'journal', rawText: text, confidence: 0.7, details: { description: text, amount: text.match(/(\d+)/)?.[1] ? parseInt(text.match(/(\d+)/)![1]) : 0 } });
    } else if (text.length > 3) {
      results.push({ type: 'unknown', rawText: text, confidence: 0.3, details: { description: text, amount: text.match(/(\d+)/)?.[1] ? parseInt(text.match(/(\d+)/)![1]) : 0 } });
    }
    return results;
  };

  // بدء الاستماع باستخدام Web Speech API أو محاكاة
  const startListening = () => {
    setListening(true);
    setTranscript('');
    setCommands([]);
    
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();

    // استخدام Web Speech API إذا كان متاحاً
    if (SpeechRecognitionAPI) {
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = 'ar-SA';
        recognition.interimResults = true;
        recognition.continuous = false;
        
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          const parsed = parseCommand(text);
          setCommands(parsed);
          stopListening();
        };
        
        recognition.onerror = () => { stopListening(); };
        recognition.onend = () => { stopListening(); };
        
        recognition.start();
        recognitionRef.current = recognition;
      } catch(e) {
        // إذا فشل Web Speech API، استخدم المحاكاة
        simulateVoice();
      }
    } else {
      // محاكاة للبيئات التي لا تدعم Web Speech API
      simulateVoice();
    }
  };

  // محاكاة الصوت للتجربة
  const simulateVoice = () => {
    const demoTexts = [
      'بيع 10 أكياس اسمنت للعميل أحمد نقداً بسعر 3500',
      'شراء 50 كرتون من المورد الجزيرة بـ 12000',
      'قبض 50000 من العميل محمد',
      'صرف 20000 للمورد الرشيد',
      'قيد مصروفات كهرباء 15000',
    ];
    setTimeout(() => {
      const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
      setTranscript(randomText);
      setCommands(parseCommand(randomText));
      stopListening();
    }, 2500);
  };

  const stopListening = () => {
    setListening(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
  };

  // حفظ العملية
  const saveCommand = async () => {
    if (!selectedCommand || !db) return;
    setSaving(true);
    try {
      const cmd = selectedCommand;
      const today = new Date().toISOString().split('T')[0];
      
      if (cmd.type === 'receipt' || cmd.type === 'payment') {
        const num = (cmd.type === 'receipt' ? 'CR-' : 'CP-') + Date.now().toString().slice(-6);
        await db.runAsync("INSERT INTO vouchers(id,number,type,date,account_id,account_name,amount,description,payment_method) VALUES(?,?,?,?,?,?,?,?,?)",
          [genId(), num, cmd.type === 'receipt' ? 'receipt' : 'payment', today, 'a1', cmd.details.customer || cmd.details.supplier || '', cmd.details.amount || 0, cmd.details.description || '', 'cash']);
      } else if (cmd.type === 'sale') {
        const num = 'INV-' + Date.now().toString().slice(-6);
        const custId = genId();
        await db.runAsync("INSERT OR IGNORE INTO customers(id,code,name,name_ar) VALUES(?,?,?,?)", [custId, 'CUST-' + Date.now().toString().slice(-6), cmd.details.customer, cmd.details.customer]);
        const total = (cmd.details.quantity || 1) * (cmd.details.price || 0);
        await db.runAsync("INSERT INTO sales_invoices(id,number,date,customer_id,customer_name,total,paid,remaining,status) VALUES(?,?,?,?,?,?,?,?,?)",
          [genId(), num, today, custId, cmd.details.customer, total, total, 0, 'posted']);
      } else if (cmd.type === 'purchase') {
        const num = 'PO-' + Date.now().toString().slice(-6);
        const suppId = genId();
        await db.runAsync("INSERT OR IGNORE INTO suppliers(id,code,name,name_ar) VALUES(?,?,?,?)", [suppId, 'SUP-' + Date.now().toString().slice(-6), cmd.details.supplier, cmd.details.supplier]);
        await db.runAsync("INSERT INTO purchase_invoices(id,number,date,supplier_id,supplier_name,total,status) VALUES(?,?,?,?,?,?,?)",
          [genId(), num, today, suppId, cmd.details.supplier, cmd.details.amount || 0, 'posted']);
      }
      
      setHistory(prev => [{ ...cmd, savedAt: new Date().toISOString(), status: 'saved' }, ...prev]);
      if (refresh) await refresh();
      Alert.alert('✅', 'تم حفظ العملية بنجاح');
    } catch(e: any) {
      Alert.alert('❌', 'فشل الحفظ: ' + e.message);
    } finally {
      setSaving(false); setShowReview(false); setSelectedCommand(null);
    }
  };

  const typeLabels: any = { sale: 'فاتورة مبيعات', purchase: 'فاتورة مشتريات', receipt: 'سند قبض', payment: 'سند صرف', journal: 'قيد يومية', unknown: 'غير معروف' };
  const typeColors: any = { sale: '#E91E63', purchase: '#FF9800', receipt: '#2E7D32', payment: '#C62828', journal: '#2196F3', unknown: '#888' };
  const typeIcons: any = { sale: 'receipt', purchase: 'cart', receipt: 'arrow-down-circle', payment: 'arrow-up-circle', journal: 'create', unknown: 'help-circle' };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '🎤 مركز الأوامر الصوتية', headerStyle: { backgroundColor: '#0a0a1a' }, headerTintColor: '#e8b86d' }} />
      
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={[styles.tab, activeTab === 'voice' && { borderBottomColor: '#e8b86d', borderBottomWidth: 2 }]} onPress={() => setActiveTab('voice')}>
          <Ionicons name="mic" size={18} color={activeTab === 'voice' ? '#e8b86d' : colors.mutedForeground} />
          <Text style={[styles.tabText, { color: activeTab === 'voice' ? '#e8b86d' : colors.mutedForeground }]}>أمر صوتي</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'history' && { borderBottomColor: '#e8b86d', borderBottomWidth: 2 }]} onPress={() => setActiveTab('history')}>
          <Ionicons name="time" size={18} color={activeTab === 'history' ? '#e8b86d' : colors.mutedForeground} />
          <Text style={[styles.tabText, { color: activeTab === 'history' ? '#e8b86d' : colors.mutedForeground }]}>السجل ({history.length})</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'voice' ? (
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {SpeechRecognitionAPI ? '🎙️ تحدث بالعربية...' : '📱 اضغط للتجربة (محاكاة)'}
          </Text>
          
          <View style={styles.micContainer}>
            <Animated.View style={[styles.micOuter, { transform: [{ scale: pulseAnim }] }]}>
              <TouchableOpacity style={[styles.micBtn, { backgroundColor: listening ? '#C62828' : '#e8b86d' }]} onPress={listening ? stopListening : startListening} activeOpacity={0.8}>
                <Ionicons name={listening ? 'stop' : 'mic'} size={40} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          <Text style={[styles.micLabel, { color: listening ? '#C62828' : '#e8b86d' }]}>
            {listening ? '🎙️ جاري الاستماع...' : 'اضغط للتحدث'}
          </Text>

          {transcript ? (
            <View style={[styles.transcriptCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.transcriptLabel, { color: colors.mutedForeground }]}>📝 النص:</Text>
              <Text style={[styles.transcriptText, { color: colors.foreground }]}>{transcript}</Text>
            </View>
          ) : null}

          {commands.map((cmd, i) => (
            <TouchableOpacity key={i} style={[styles.commandCard, { backgroundColor: colors.card, borderLeftColor: typeColors[cmd.type] }]} onPress={() => { setSelectedCommand(cmd); setShowReview(true); }} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.typeBadge, { backgroundColor: typeColors[cmd.type] + '20' }]}>
                  <Ionicons name={typeIcons[cmd.type]} size={20} color={typeColors[cmd.type]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cmdType, { color: typeColors[cmd.type] }]}>{typeLabels[cmd.type]}</Text>
                  <Text style={[styles.cmdDetails, { color: colors.mutedForeground }]}>
                    {cmd.details.customer ? `👤 ${cmd.details.customer} ` : ''}
                    {cmd.details.supplier ? `🏭 ${cmd.details.supplier} ` : ''}
                    {cmd.details.amount ? `💰 ${formatNumber(cmd.details.amount)}` : ''}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View style={[styles.examplesCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.examplesTitle, { color: colors.foreground }]}>💡 أمثلة:</Text>
            <Text style={[styles.example, { color: colors.mutedForeground }]}>🗣️ "بيع 10 أكياس اسمنت للعميل أحمد نقداً"</Text>
            <Text style={[styles.example, { color: colors.mutedForeground }]}>🗣️ "شراء 50 كرتون من المورد الجزيرة"</Text>
            <Text style={[styles.example, { color: colors.mutedForeground }]}>🗣️ "قبض 50000 من العميل محمد"</Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList data={history} keyExtractor={(_, i) => i.toString()} contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="time-outline" size={60} color="#ccc" /><Text style={{ color: '#888', marginTop: 12 }}>لا يوجد سجل</Text></View>}
          renderItem={({ item }) => (
            <View style={[styles.historyCard, { backgroundColor: colors.card, borderLeftColor: typeColors[item.type] }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name={typeIcons[item.type]} size={18} color={typeColors[item.type]} />
                <Text style={[styles.historyType, { color: typeColors[item.type] }]}>{typeLabels[item.type]}</Text>
                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{new Date(item.savedAt).toLocaleTimeString('ar')}</Text>
              </View>
              <Text style={[styles.historyText, { color: colors.mutedForeground }]}>{item.rawText}</Text>
            </View>
          )}
        />
      )}

      <Modal visible={showReview} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>📋 مراجعة العملية</Text>
            <TouchableOpacity onPress={() => setShowReview(false)}><Ionicons name="close" size={24} color={colors.foreground} /></TouchableOpacity>
          </View>
          {selectedCommand && (
            <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
              <View style={[styles.reviewBadge, { backgroundColor: typeColors[selectedCommand.type] + '20', borderColor: typeColors[selectedCommand.type] }]}>
                <Ionicons name={typeIcons[selectedCommand.type]} size={30} color={typeColors[selectedCommand.type]} />
                <Text style={[styles.reviewType, { color: typeColors[selectedCommand.type] }]}>{typeLabels[selectedCommand.type]}</Text>
              </View>
              <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>النص: {selectedCommand.rawText}</Text>
                {selectedCommand.details.customer && <Text style={{ color: colors.foreground, textAlign: 'right' }}>👤 العميل: {selectedCommand.details.customer}</Text>}
                {selectedCommand.details.supplier && <Text style={{ color: colors.foreground, textAlign: 'right' }}>🏭 المورد: {selectedCommand.details.supplier}</Text>}
                {selectedCommand.details.amount ? <Text style={{ color: colors.foreground, textAlign: 'right', fontSize: 20, fontWeight: '800' }}>💰 {formatNumber(selectedCommand.details.amount)}</Text> : null}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setShowReview(false)}><Text style={{ color: colors.mutedForeground }}>إلغاء</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#2E7D32' }]} onPress={saveCommand} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark" size={20} color="#fff" />}
                  <Text style={styles.saveBtnText}>{saving ? 'جاري الحفظ...' : 'حفظ العملية'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '600' }, infoText: { fontSize: 16, marginBottom: 30, textAlign: 'center' },
  micContainer: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  micOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(232,184,109,0.2)', justifyContent: 'center', alignItems: 'center' },
  micBtn: { width: 75, height: 75, borderRadius: 38, justifyContent: 'center', alignItems: 'center' },
  micLabel: { fontSize: 16, fontWeight: '700', marginBottom: 20 },
  transcriptCard: { borderRadius: 14, padding: 16, width: '100%', marginBottom: 16 },
  transcriptLabel: { fontSize: 12, marginBottom: 8 }, transcriptText: { fontSize: 18, fontWeight: '600', textAlign: 'right' },
  commandCard: { borderRadius: 14, padding: 16, width: '100%', marginBottom: 10, borderLeftWidth: 5, elevation: 2 },
  typeBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cmdType: { fontSize: 15, fontWeight: '700' }, cmdDetails: { fontSize: 13, marginTop: 4, textAlign: 'right' },
  examplesCard: { borderRadius: 14, padding: 16, width: '100%', marginTop: 16 },
  examplesTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, textAlign: 'right' },
  example: { fontSize: 13, textAlign: 'right', marginBottom: 6 }, empty: { alignItems: 'center', marginTop: 80 },
  historyCard: { borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, elevation: 2 },
  historyType: { fontSize: 13, fontWeight: '700' }, historyDate: { fontSize: 11 },
  historyText: { fontSize: 13, textAlign: 'right', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 19, fontWeight: '700' },
  reviewBadge: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1 },
  reviewType: { fontSize: 18, fontWeight: '700' }, reviewCard: { borderRadius: 14, padding: 16, marginBottom: 16 },
  reviewLabel: { fontSize: 14, marginBottom: 8, textAlign: 'right' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  saveBtn: { flex: 2, flexDirection: 'row', paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
