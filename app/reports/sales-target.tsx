import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

const TARGET_KEY = '@sales_targets_v1';

interface TargetEntry {
  repId: string | null;
  monthly: number;
  annual: number;
  year: number;
  month: number;
}

export default function SalesTargetScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useApp();
  const { salesInvoices, salesReps } = useDatabase();
  const color = colors.section4;

  const now = new Date();
  const [tab, setTab] = useState<'input' | 'progress'>('progress');
  const [targets, setTargets] = useState<TargetEntry[]>([]);
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [monthly, setMonthly] = useState('');
  const [annual, setAnnual] = useState('');
  const [saving, setSaving] = useState(false);
  const [showRepPicker, setShowRepPicker] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TARGET_KEY).then(v => {
      if (v) setTargets(JSON.parse(v));
    });
  }, []);

  const saveTarget = async () => {
    if (!monthly && !annual) return Alert.alert('', isRTL ? 'أدخل الهدف الشهري أو السنوي' : 'Enter monthly or annual target');
    setSaving(true);
    const updated = targets.filter(t => !(t.repId === selectedRepId && t.year === now.getFullYear() && t.month === now.getMonth() + 1));
    updated.push({ repId: selectedRepId, monthly: parseFloat(monthly) || 0, annual: parseFloat(annual) || 0, year: now.getFullYear(), month: now.getMonth() + 1 });
    await AsyncStorage.setItem(TARGET_KEY, JSON.stringify(updated));
    setTargets(updated);
    setSaving(false);
    Alert.alert('✅', isRTL ? 'تم حفظ الهدف' : 'Target saved');
  };

  // Compute progress per entity (company overall + per rep)
  const progressItems = useMemo(() => {
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    const daysInMonth = new Date(thisYear, thisMonth, 0).getDate();
    const dayOfMonth = now.getDate();
    const monthFraction = dayOfMonth / daysInMonth;

    const items: {
      id: string | null;
      name: string;
      monthly: number;
      annual: number;
      achieved: number;
      pct: number;
      annualAchieved: number;
      annualPct: number;
    }[] = [];

    const addItem = (id: string | null, name: string) => {
      const tgt = targets.find(t => t.repId === id && t.year === thisYear && t.month === thisMonth);
      if (!tgt) return;
      const relevantInv = id === null
        ? salesInvoices.filter(inv => {
            const d = new Date(inv.date);
            return d.getFullYear() === thisYear && d.getMonth() + 1 === thisMonth;
          })
        : salesInvoices.filter(inv => {
            const d = new Date(inv.date);
            return d.getFullYear() === thisYear && d.getMonth() + 1 === thisMonth && inv.repId === id;
          });
      const achieved = relevantInv.reduce((s, inv) => s + inv.total, 0);
      const annualInv = id === null
        ? salesInvoices.filter(inv => new Date(inv.date).getFullYear() === thisYear)
        : salesInvoices.filter(inv => new Date(inv.date).getFullYear() === thisYear && inv.repId === id);
      const annualAchieved = annualInv.reduce((s, inv) => s + inv.total, 0);
      items.push({
        id, name,
        monthly: tgt.monthly, annual: tgt.annual,
        achieved, pct: tgt.monthly > 0 ? Math.min((achieved / tgt.monthly) * 100, 150) : 0,
        annualAchieved, annualPct: tgt.annual > 0 ? Math.min((annualAchieved / tgt.annual) * 100, 150) : 0,
      });
    };

    addItem(null, isRTL ? 'المؤسسة كاملة' : 'Company Overall');
    salesReps.forEach(r => addItem(r.id, isRTL ? r.nameAr || r.name : r.name));
    return items;
  }, [targets, salesInvoices, salesReps, isRTL]);

  const getStatusColor = (pct: number) => {
    if (pct >= 100) return colors.success;
    if (pct >= 80) return colors.warning;
    return colors.destructive;
  };

  const getStatusMsg = (pct: number, remaining: number) => {
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
    if (pct >= 100) return isRTL ? '🎉 مبروك! حققت التارجت' : '🎉 Congratulations! Target achieved!';
    if (pct >= 80) return isRTL ? '🔥 ممتاز! اقتربت من الهدف' : '🔥 Great! Almost there!';
    if (daysLeft <= 5 && remaining > 0) return isRTL ? `⚠️ تحذير: ${daysLeft} أيام متبقية والهدف لم يكتمل بعد` : `⚠️ Warning: ${daysLeft} days left, target not met`;
    return isRTL ? 'استمر في العمل نحو الهدف' : 'Keep working toward the goal';
  };

  const selectedRep = salesReps.find(r => r.id === selectedRepId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{
        title: isRTL ? 'هدف المبيعات' : 'Sales Target',
        headerStyle: { backgroundColor: color },
        headerTintColor: '#fff',
      }} />

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { key: 'progress' as const, labelAr: 'متابعة الأهداف', labelEn: 'Progress' },
          { key: 'input' as const, labelAr: 'إدخال الهدف', labelEn: 'Set Target' },
        ].map(t2 => (
          <TouchableOpacity key={t2.key} style={[styles.tab, tab === t2.key && { borderBottomColor: color, borderBottomWidth: 2 }]} onPress={() => setTab(t2.key)}>
            <Text style={[styles.tabText, { color: tab === t2.key ? color : colors.mutedForeground }]}>
              {isRTL ? t2.labelAr : t2.labelEn}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }}>
        {tab === 'input' ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? `إدخال هدف ${now.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}` : `Set Target for ${now.toLocaleString('en', { month: 'long', year: 'numeric' })}`}
            </Text>

            {/* Rep picker */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{isRTL ? 'المندوب / المؤسسة' : 'Sales Rep / Company'}</Text>
            <TouchableOpacity style={[styles.selectBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setShowRepPicker(!showRepPicker)}>
              <Text style={{ color: colors.foreground, flex: 1 }}>
                {selectedRepId === null ? (isRTL ? 'المؤسسة كاملة' : 'Company Overall') : (isRTL ? selectedRep?.nameAr || selectedRep?.name : selectedRep?.name) || '—'}
              </Text>
              <Ionicons name={showRepPicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            {showRepPicker && (
              <View style={[styles.pickerList, { borderColor: colors.border }]}>
                <TouchableOpacity style={[styles.pickerItem, { borderBottomColor: colors.border }, selectedRepId === null && { backgroundColor: color + '12' }]}
                  onPress={() => { setSelectedRepId(null); setShowRepPicker(false); }}>
                  <Text style={{ color: colors.foreground }}>{isRTL ? 'المؤسسة كاملة' : 'Company Overall'}</Text>
                  {selectedRepId === null && <Ionicons name="checkmark" size={16} color={color} />}
                </TouchableOpacity>
                {salesReps.map(r => (
                  <TouchableOpacity key={r.id} style={[styles.pickerItem, { borderBottomColor: colors.border }, r.id === selectedRepId && { backgroundColor: color + '12' }]}
                    onPress={() => { setSelectedRepId(r.id); setShowRepPicker(false); }}>
                    <Text style={{ color: colors.foreground }}>{isRTL ? r.nameAr || r.name : r.name}</Text>
                    {r.id === selectedRepId && <Ionicons name="checkmark" size={16} color={color} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <FormField label={isRTL ? 'الهدف الشهري' : 'Monthly Target'} value={monthly} onChangeText={setMonthly} keyboardType="numeric" placeholder="0" />
            <FormField label={isRTL ? 'الهدف السنوي' : 'Annual Target'} value={annual} onChangeText={setAnnual} keyboardType="numeric" placeholder="0" />

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: saving ? colors.mutedForeground : color }]} onPress={saveTarget} disabled={saving}>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الهدف' : 'Save Target')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {progressItems.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="trophy-outline" size={56} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 15 }}>
                  {isRTL ? 'لم يتم تحديد أهداف بعد' : 'No targets set yet'}
                </Text>
                <TouchableOpacity style={[styles.emptyBtn, { borderColor: color }]} onPress={() => setTab('input')}>
                  <Text style={{ color: color, fontWeight: '700' }}>{isRTL ? 'إضافة هدف' : 'Add Target'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              progressItems.map((item) => {
                const remaining = Math.max(0, item.monthly - item.achieved);
                const statusMsg = getStatusMsg(item.pct, remaining);
                const barColor = getStatusColor(item.pct);
                return (
                  <View key={item.id || 'company'} style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {/* Header */}
                    <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <View style={[styles.repIcon, { backgroundColor: color + '18' }]}>
                        <Ionicons name={item.id === null ? 'business-outline' : 'person-outline'} size={20} color={color} />
                      </View>
                      <View style={{ flex: 1, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }}>
                        <Text style={[styles.repName, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>{item.name}</Text>
                        <Text style={[styles.repMonth, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
                          {now.toLocaleString(isRTL ? 'ar-EG' : 'en', { month: 'long', year: 'numeric' })}
                        </Text>
                      </View>
                      <View style={[styles.pctBadge, { backgroundColor: barColor + '18', borderColor: barColor }]}>
                        <Text style={[styles.pctText, { color: barColor }]}>{item.pct.toFixed(0)}%</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                      <View style={[styles.barFill, { width: `${Math.min(item.pct, 100)}%` as any, backgroundColor: barColor }]} />
                    </View>

                    {/* Stats */}
                    <View style={[styles.statsGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{isRTL ? 'الهدف الشهري' : 'Monthly Target'}</Text>
                        <Text style={[styles.statValue, { color: color }]}>{item.monthly.toLocaleString()}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{isRTL ? 'المحقق' : 'Achieved'}</Text>
                        <Text style={[styles.statValue, { color: colors.success }]}>{item.achieved.toLocaleString()}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{isRTL ? 'المتبقي' : 'Remaining'}</Text>
                        <Text style={[styles.statValue, { color: remaining > 0 ? colors.destructive : colors.success }]}>{remaining.toLocaleString()}</Text>
                      </View>
                    </View>

                    {/* Status message */}
                    <View style={[styles.statusMsg, { backgroundColor: barColor + '0E', borderColor: barColor }]}>
                      <Text style={[styles.statusText, { color: barColor, textAlign: isRTL ? 'right' : 'left' }]}>{statusMsg}</Text>
                    </View>

                    {/* Annual row */}
                    {item.annual > 0 && (
                      <View style={[styles.annualRow, { borderTopColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.annualText, { color: colors.mutedForeground }]}>
                          {isRTL
                            ? `الهدف السنوي: ${item.annual.toLocaleString()} — محقق: ${item.annualAchieved.toLocaleString()} (${item.annualPct.toFixed(0)}%)`
                            : `Annual: ${item.annual.toLocaleString()} — Achieved: ${item.annualAchieved.toLocaleString()} (${item.annualPct.toFixed(0)}%)`}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 4 },
  pickerList: { borderWidth: 1, borderRadius: 10, marginBottom: 8, overflow: 'hidden' },
  pickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 0.5 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, borderWidth: 1.5 },
  progressCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardHeader: { alignItems: 'center', marginBottom: 14 },
  repIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  repName: { fontSize: 15, fontWeight: '700' },
  repMonth: { fontSize: 12, marginTop: 2 },
  pctBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5 },
  pctText: { fontSize: 16, fontWeight: '800' },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 14 },
  barFill: { height: '100%', borderRadius: 5 },
  statsGrid: { justifyContent: 'space-between', marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, marginBottom: 3 },
  statValue: { fontSize: 14, fontWeight: '800' },
  statusMsg: { borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8 },
  statusText: { fontSize: 13, fontWeight: '600' },
  annualRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, borderTopWidth: 1 },
  annualText: { fontSize: 12 },
});
