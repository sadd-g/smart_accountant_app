import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';
import { ControlButtons, ControlHeader } from '../../src/components/ui/ControlButtons';

export default function TrialBalanceScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data: accounts } = useLocalTable('accounts');

  const mainAccounts = accounts.filter((a: any) => !a.parentId);
  
  const totalDebit = accounts.filter((a: any) => ['أصل', 'مصروف'].includes(a.type)).reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const totalCredit = accounts.filter((a: any) => ['خصم', 'ملكية', 'إيراد'].includes(a.type)).reduce((s: number, a: any) => s + (a.balance || 0), 0);

  return (
    <View style={[st.c, { paddingTop: insets.top }]}><StatusBar barStyle="light-content" />
      <ControlHeader title="ميزان المراجعة" onBack={() => router.back()} />
      <ControlButtons showAdd={false} showEdit={false} showDelete={false} onPrint={() => Alert.alert('🖨️', 'جاري الطباعة')} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.ct}>
        <View style={st.summary}>
          <View style={st.sumItem}><Text style={st.sumLabel}>مدين</Text><Text style={[st.sumVal, { color: '#10B981' }]}>{totalDebit.toLocaleString()}</Text></View>
          <View style={st.sumItem}><Text style={st.sumLabel}>دائن</Text><Text style={[st.sumVal, { color: '#EF4444' }]}>{totalCredit.toLocaleString()}</Text></View>
          <View style={st.sumItem}><Text style={st.sumLabel}>الفرق</Text><Text style={[st.sumVal, { color: totalDebit === totalCredit ? '#10B981' : '#EF4444' }]}>{(totalDebit - totalCredit).toLocaleString()}</Text></View>
        </View>
        
        <Text style={st.tt}>الحسابات الرئيسية</Text>
        {mainAccounts.map((acc: any, i: number) => {
          const subs = accounts.filter((a: any) => a.parentId === acc.id);
          const totalSubBalance = subs.reduce((s: number, a: any) => s + (a.balance || 0), 0);
          const isDebit = ['أصل', 'مصروف'].includes(acc.type);
          
          return (
            <View key={i} style={st.card}>
              <View style={st.cardHead}>
                <View style={{ flex: 1 }}>
                  <Text style={st.code}>{acc.code}</Text>
                  <Text style={st.name}>{acc.name}</Text>
                </View>
                <View style={st.amounts}>
                  {isDebit ? (
                    <Text style={[st.amount, { color: '#10B981' }]}>{(acc.balance || 0).toLocaleString()} مدين</Text>
                  ) : (
                    <Text style={[st.amount, { color: '#EF4444' }]}>{(acc.balance || 0).toLocaleString()} دائن</Text>
                  )}
                </View>
              </View>
              {subs.length > 0 && (
                <View style={st.subs}>
                  {subs.map((sub: any, j: number) => (
                    <View key={j} style={st.subRow}>
                      <Text style={st.subCode}>{sub.code}</Text>
                      <Text style={st.subName}>{sub.name}</Text>
                      <Text style={[st.subBal, { color: isDebit ? '#10B981' : '#EF4444' }]}>{(sub.balance || 0).toLocaleString()}</Text>
                    </View>
                  ))}
                  <View style={st.totalSub}>
                    <Text style={st.totalSubText}>إجمالي الفروع: {totalSubBalance.toLocaleString()}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}
const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0A1128' }, ct: { padding: 14 },
  summary: { flexDirection: 'row', backgroundColor: '#16213E', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2a3550' }, sumItem: { flex: 1, alignItems: 'center' }, sumLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 4 }, sumVal: { fontSize: 18, fontWeight: 'bold' },
  tt: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10, marginTop: 10 },
  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, code: { color: '#94a3b8', fontSize: 11 }, name: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  amounts: {}, amount: { fontSize: 14, fontWeight: 'bold' },
  subs: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#2a3550', paddingTop: 10 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }, subCode: { color: '#94a3b8', fontSize: 10, width: 50 }, subName: { color: '#FFF', fontSize: 12, flex: 1 }, subBal: { fontSize: 12, fontWeight: 'bold' },
  totalSub: { marginTop: 6, alignItems: 'flex-end' }, totalSubText: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },
});
