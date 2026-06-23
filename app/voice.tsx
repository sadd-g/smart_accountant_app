import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import { useApp } from '../context/AppContext';
import { useColors } from '../hooks/useColors';

interface DraftTransaction {
  type: 'sale' | 'purchase' | 'receipt' | 'payment' | 'unknown';
  customer?: string;
  supplier?: string;
  item?: string;
  qty?: number;
  amount?: number;
  paymentMethod?: 'cash' | 'credit' | 'bank';
  rawText: string;
}

function parseVoiceCommand(text: string): DraftTransaction {
  const lower = text.toLowerCase();
  const draft: DraftTransaction = { type: 'unknown', rawText: text };

  if (lower.includes('بيع') || lower.includes('sell') || lower.includes('فاتورة مبيعات')) {
    draft.type = 'sale';
    const qtyMatch = text.match(/(\d+)/);
    if (qtyMatch) draft.qty = parseInt(qtyMatch[1]);
    if (lower.includes('نقد') || lower.includes('cash')) draft.paymentMethod = 'cash';
    else if (lower.includes('بنك') || lower.includes('bank')) draft.paymentMethod = 'bank';
    else draft.paymentMethod = 'credit';
    const itemMatch = text.match(/(?:بيع|sell)\s+\d+\s+(?:من\s+)?(\S+(?:\s+\S+)?)/i);
    if (itemMatch) draft.item = itemMatch[1];
    const toMatch = text.match(/(?:ل|to)\s+(\S+)/i);
    if (toMatch) draft.customer = toMatch[1];
  } else if (lower.includes('شراء') || lower.includes('purchase') || lower.includes('مشتريات')) {
    draft.type = 'purchase';
    const qtyMatch = text.match(/(\d+)/);
    if (qtyMatch) draft.qty = parseInt(qtyMatch[1]);
    const fromMatch = text.match(/(?:من|from)\s+(\S+)/i);
    if (fromMatch) draft.supplier = fromMatch[1];
  } else if (lower.includes('استلام') || lower.includes('قبض') || lower.includes('receive') || lower.includes('receipt')) {
    draft.type = 'receipt';
    const amtMatch = text.match(/(\d+(?:\.\d+)?)/);
    if (amtMatch) draft.amount = parseFloat(amtMatch[1]);
    if (lower.includes('نقد') || lower.includes('cash')) draft.paymentMethod = 'cash';
    const fromMatch = text.match(/(?:من|from)\s+(\S+)/i);
    if (fromMatch) draft.customer = fromMatch[1];
  } else if (lower.includes('دفع') || lower.includes('صرف') || lower.includes('payment') || lower.includes('pay')) {
    draft.type = 'payment';
    const amtMatch = text.match(/(\d+(?:\.\d+)?)/);
    if (amtMatch) draft.amount = parseFloat(amtMatch[1]);
  }

  return draft;
}

export default function VoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t, subscription } = useApp();
  const color = colors.section5;
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [draft, setDraft] = useState<DraftTransaction | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const toggleListening = () => {
    if (!subscription.active) {
      Alert.alert('', t.voice.subscribedOnly);
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (listening) {
      setListening(false);
      stopPulse();
      if (transcript) {
        const parsedDraft = parseVoiceCommand(transcript);
        setDraft(parsedDraft);
      }
    } else {
      setListening(true);
      setTranscript('');
      setDraft(null);
      startPulse();
      setTimeout(() => {
        const demo = isRTL
          ? 'بيع 10 أكياس اسمنت لأحمد نقداً'
          : 'Sell 10 bags cement to Ahmed cash';
        setTranscript(demo);
        setListening(false);
        stopPulse();
        setDraft(parseVoiceCommand(demo));
      }, 3000);
    }
  };

  const handleSave = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('', t.common.success);
    setDraft(null);
    setTranscript('');
  };

  const typeLabel: Record<string, string> = {
    sale: isRTL ? 'فاتورة مبيعات' : 'Sales Invoice',
    purchase: isRTL ? 'فاتورة مشتريات' : 'Purchase Invoice',
    receipt: isRTL ? 'سند قبض' : 'Cash Receipt',
    payment: isRTL ? 'سند صرف' : 'Cash Payment',
    unknown: isRTL ? 'غير معروف' : 'Unknown',
  };

  const typeColor: Record<string, string> = {
    sale: colors.section3,
    purchase: colors.section2,
    receipt: colors.success,
    payment: colors.destructive,
    unknown: colors.mutedForeground,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isRTL ? 'مركز الأوامر الصوتية' : 'Voice Commands', headerStyle: { backgroundColor: color }, headerTintColor: '#fff' }} />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}>
        {!subscription.active && (
          <View style={[styles.subBanner, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
            <Ionicons name="lock-closed" size={18} color={colors.warning} />
            <Text style={[styles.subBannerText, { color: colors.warning }]}>{t.voice.subscribedOnly}</Text>
          </View>
        )}

        <View style={styles.micArea}>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{t.voice.subtitle}</Text>
          <Animated.View style={[styles.micOuter, { transform: [{ scale: pulseAnim }], backgroundColor: color + '20' }]}>
            <TouchableOpacity
              style={[styles.micBtn, { backgroundColor: listening ? colors.destructive : color }]}
              onPress={toggleListening}
              activeOpacity={0.8}
            >
              <Ionicons name={listening ? 'stop' : 'mic'} size={40} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
          <Text style={[styles.micLabel, { color: listening ? colors.destructive : color }]}>
            {listening ? t.voice.stopListening : t.voice.startListening}
          </Text>
        </View>

        {listening && (
          <View style={[styles.listeningCard, { backgroundColor: color + '10', borderColor: color }]}>
            <Ionicons name="radio" size={18} color={color} />
            <Text style={[styles.listeningText, { color: color }]}>{isRTL ? 'جاري الاستماع...' : 'Listening...'}</Text>
          </View>
        )}

        {transcript ? (
          <View style={[styles.transcriptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.transcriptLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? 'النص المُعرَّف:' : 'Recognized text:'}
            </Text>
            <Text style={[styles.transcriptText, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{transcript}</Text>
          </View>
        ) : null}

        {draft && (
          <View style={[styles.draftCard, { backgroundColor: colors.card, borderColor: typeColor[draft.type] }]}>
            <View style={[styles.draftHeader, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomColor: colors.border }]}>
              <View style={[styles.draftTypeBadge, { backgroundColor: typeColor[draft.type] + '20' }]}>
                <Text style={[styles.draftTypeText, { color: typeColor[draft.type] }]}>{typeLabel[draft.type]}</Text>
              </View>
              <Text style={[styles.draftTitle, { color: colors.foreground }]}>{t.voice.draft}</Text>
            </View>

            <View style={styles.draftBody}>
              {draft.customer && <FormField label={isRTL ? 'العميل' : 'Customer'} value={draft.customer} onChangeText={() => {}} />}
              {draft.supplier && <FormField label={isRTL ? 'المورد' : 'Supplier'} value={draft.supplier} onChangeText={() => {}} />}
              {draft.item && <FormField label={isRTL ? 'الصنف' : 'Item'} value={draft.item} onChangeText={() => {}} />}
              {draft.qty !== undefined && <FormField label={isRTL ? 'الكمية' : 'Quantity'} value={draft.qty.toString()} onChangeText={() => {}} keyboardType="numeric" />}
              {draft.amount !== undefined && <FormField label={isRTL ? 'المبلغ' : 'Amount'} value={draft.amount.toString()} onChangeText={() => {}} keyboardType="numeric" />}
              {draft.paymentMethod && (
                <FormField label={isRTL ? 'طريقة الدفع' : 'Payment'} value={
                  draft.paymentMethod === 'cash' ? (isRTL ? 'نقدي' : 'Cash') :
                  draft.paymentMethod === 'bank' ? (isRTL ? 'بنكي' : 'Bank') : (isRTL ? 'آجل' : 'Credit')
                } onChangeText={() => {}} />
              )}
            </View>

            <View style={[styles.draftActions, { flexDirection: isRTL ? 'row-reverse' : 'row', borderTopColor: colors.border }]}>
              <TouchableOpacity style={[styles.draftActionBtn, { borderColor: colors.destructive }]} onPress={() => setDraft(null)}>
                <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                <Text style={{ color: colors.destructive, fontSize: 13, fontWeight: '600' }}>{t.common.delete}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.draftActionBtn, { backgroundColor: typeColor[draft.type], borderColor: typeColor[draft.type] }]} onPress={handleSave}>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{t.common.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={[styles.examplesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.examplesHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="bulb-outline" size={18} color={color} />
            <Text style={[styles.examplesTitle, { color: color, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
              {isRTL ? 'أمثلة' : 'Examples'}
            </Text>
          </View>
          <Text style={[styles.examplesText, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>{t.voice.examples}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  subBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, padding: 12, borderRadius: 12, borderWidth: 1 },
  subBannerText: { fontSize: 13, fontWeight: '600' },
  micArea: { alignItems: 'center', paddingVertical: 40 },
  subtitle: { fontSize: 15, marginBottom: 32 },
  micOuter: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  micBtn: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  micLabel: { marginTop: 20, fontSize: 15, fontWeight: '700' },
  listeningCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  listeningText: { fontSize: 14, fontWeight: '600' },
  transcriptCard: { marginHorizontal: 16, marginBottom: 14, borderRadius: 14, borderWidth: 1, padding: 14 },
  transcriptLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  transcriptText: { fontSize: 15, lineHeight: 22 },
  draftCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 14, borderWidth: 2, overflow: 'hidden' },
  draftHeader: { justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  draftTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  draftTypeText: { fontSize: 12, fontWeight: '700' },
  draftTitle: { fontSize: 15, fontWeight: '700' },
  draftBody: { padding: 14 },
  draftActions: { gap: 10, padding: 14, borderTopWidth: 1 },
  draftActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  examplesCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14 },
  examplesHeader: { alignItems: 'center', marginBottom: 10 },
  examplesTitle: { fontSize: 14, fontWeight: '700' },
  examplesText: { fontSize: 13, lineHeight: 22 },
});
