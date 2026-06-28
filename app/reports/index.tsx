import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Modal, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';
import { PickerModal } from '../../src/components/ui/PickerModal';
import { ControlButtons, ControlHeader } from '../../src/components/ui/ControlButtons';

export default function ReportsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data: accounts } = useLocalTable('accounts');
  const { data: entries } = useLocalTable('journalEntries');
  const { data: invoices } = useLocalTable('salesInvoices');
  const { data: purchases } = useLocalTable('purchaseInvoices');
  const { data: items } = useLocalTable('items');
  const { data: customers } = useLocalTable('customers');
  const { data: suppliers } = useLocalTable('suppliers');
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showAccountReport, setShowAccountReport] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportResults, setReportResults] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  // إحصائيات مالية
  const totalAssets = accounts.filter((a: any) => a.type === 'أصل').reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const totalLiabilities = accounts.filter((a: any) => a.type === 'خصم').reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const totalEquity = accounts.filter((a: any) => a.type === 'ملكية').reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const totalIncome = accounts.filter((a: any) => a.type === 'إيراد').reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const totalExpenses = accounts.filter((a: any) => a.type === 'مصروف').reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const totalSales = (invoices || []).reduce((s: number, i: any) => s + (i.total || 0), 0);
  const totalPurchases = (purchases || []).reduce((s: number, p: any) => s + (p.total || 0), 0);

  const reports = [
    { icon: '⚖️', label: 'ميزان المراجعة', route: '/ledger/trial-balance' },
    { icon: '📚', label: 'الأستاذ العام', route: '/ledger/account-statement' },
    { icon: '💰', label: 'قائمة الدخل', route: '' },
    { icon: '🏛️', label: 'الميزانية العمومية', route: '' },
    { icon: '💱', label: 'تقارير العملات', route: '/ledger/currency-reports' },
  ];

  const generateAccountReport = () => {
    if (!selectedAccount) { Alert.alert('تنبيه', 'اختر حساباً'); return; }
    
    const mainAccount = accounts.find((a: any) => a.id === selectedAccount.id);
    const subAccounts = accounts.filter((a: any) => a.parentId === selectedAccount.id);
    
    const totalBalance = (mainAccount?.balance || 0) + subAccounts.reduce((s: number, a: any) => s + (a.balance || 0), 0);
    
    setReportTitle(`تقرير: ${selectedAccount.name}`);
    setReportResults({
      main: mainAccount,
      subs: subAccounts,
      totalBalance,
      totalSubs: subAccounts.length,
    });
    setShowResults(true);
    setShowAccountReport(false);
  };

  return (
    <View style={[st.c, { paddingTop: insets.top }]}><StatusBar barStyle="light-content" />
      <ControlHeader title="التقارير والتنبيهات" onBack={() => router.back()} />
      <ControlButtons onAdd={() => setShowAccountReport(true)} showEdit={false} showDelete={false} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.ct}>
        
        {/* إحصائيات مالية */}
        <Text style={st.tt}>📊 ملخص مالي</Text>
        <View style={st.sr}>
          <View style={st.s}><Text style={st.sv}>{totalAssets.toLocaleString()}</Text><Text style={st.sl}>الأصول</Text></View>
          <View style={st.s}><Text style={st.sv}>{totalLiabilities.toLocaleString()}</Text><Text style={st.sl}>الخصوم</Text></View>
          <View style={st.s}><Text style={st.sv}>{netProfit.toLocaleString()}</Text><Text style={st.sl}>صافي الربح</Text></View>
        </View>
        
        <View style={st.sr}>
          <View style={st.s}><Text style={[st.sv, { color: '#10B981' }]}>{totalIncome.toLocaleString()}</Text><Text style={st.sl}>الإيرادات</Text></View>
          <View style={st.s}><Text style={[st.sv, { color: '#EF4444' }]}>{totalExpenses.toLocaleString()}</Text><Text style={st.sl}>المصروفات</Text></View>
          <View style={st.s}><Text style={st.sv}>{totalSales.toLocaleString()}</Text><Text style={st.sl}>المبيعات</Text></View>
        </View>

        {/* التقارير */}
        <Text style={st.tt}>📋 التقارير</Text>
        {reports.map((r, i) => (
          <TouchableOpacity key={i} style={st.rc} onPress={() => r.route ? router.push(r.route as any) : Alert.alert(r.label, 'قيد التطوير')}>
            <Text style={st.ri}>{r.icon}</Text><View style={{ flex: 1 }}><Text style={st.rl}>{r.label}</Text></View><Text style={st.ar}>›</Text>
          </TouchableOpacity>
        ))}
        
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal تقرير حساب */}
      <Modal visible={showAccountReport} animationType="slide" transparent>
        <View style={st.mo}><View style={[st.mc, { maxHeight: '70%' }]}><View style={st.mh}><Text style={st.mt}>تقرير حساب</Text><TouchableOpacity onPress={() => setShowAccountReport(false)}><Text style={st.mx}>✕</Text></TouchableOpacity></View>
        <View style={st.mb}>
          <Text style={st.fl}>اختيار الحساب</Text>
          <TouchableOpacity style={st.pk} onPress={() => setShowAccountPicker(true)}>
            <Text style={selectedAccount ? st.pkt : st.pkp}>{selectedAccount?.name || 'اختيار الحساب'}</Text><Text style={st.pka}>▼</Text></TouchableOpacity>
          <TouchableOpacity style={st.sb} onPress={generateAccountReport}><Text style={st.sbt}>🔍 عرض التقرير</Text></TouchableOpacity>
        </View></View></View>
      </Modal>

      {/* Modal عرض النتائج */}
      <Modal visible={showResults} animationType="slide" transparent>
        <View style={st.mo}><View style={[st.mc, { maxHeight: '80%' }]}><View style={st.mh}><Text style={st.mt}>{reportTitle}</Text><TouchableOpacity onPress={() => setShowResults(false)}><Text style={st.mx}>✕</Text></TouchableOpacity></View>
        <ScrollView style={st.mb}>
          {reportResults && (
            <View>
              <View style={st.sumCard}>
                <Text style={st.sumTitle}>الحساب الرئيسي</Text>
                <Text style={st.sumVal}>{reportResults.main?.name} ({reportResults.main?.code})</Text>
                <Text style={st.sumVal}>الرصيد: {(reportResults.main?.balance || 0).toLocaleString()} ﷼</Text>
              </View>
              <Text style={st.tt}>الحسابات الفرعية ({reportResults.totalSubs})</Text>
              {reportResults.subs?.map((sub: any, i: number) => (
                <View key={i} style={st.subRow}>
                  <Text style={st.subName}>{sub.code} - {sub.name}</Text>
                  <Text style={[st.subBal, { color: (sub.balance || 0) >= 0 ? '#10B981' : '#EF4444' }]}>{(sub.balance || 0).toLocaleString()} ﷼</Text>
                </View>
              ))}
              <View style={st.totalRow}>
                <Text style={st.totalLabel}>الإجمالي</Text>
                <Text style={st.totalVal}>{reportResults.totalBalance.toLocaleString()} ﷼</Text>
              </View>
            </View>
          )}
        </ScrollView></View></View>
      </Modal>

      <PickerModal visible={showAccountPicker} title="اختيار الحساب" data={accounts || []} displayField="name" subField="code" onSelect={(i: any) => { setSelectedAccount(i); setShowAccountPicker(false); }} onClose={() => setShowAccountPicker(false)} />
    </View>
  );
}
const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0A1128' }, ct: { padding: 14 },
  sr: { flexDirection: 'row', gap: 6, marginBottom: 8 }, s: { flex: 1, backgroundColor: '#16213E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' }, sv: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginBottom: 3 }, sl: { color: '#94a3b8', fontSize: 10 },
  tt: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10, marginTop: 16 },
  rc: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213E', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2a3550' }, ri: { fontSize: 26, marginRight: 12 }, rl: { color: '#FFF', fontSize: 14, fontWeight: 'bold' }, ar: { fontSize: 20, color: '#D4AF37' },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }, mc: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' }, mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' }, mt: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' }, mx: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' }, mb: { padding: 16 },
  fl: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 }, pk: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A1128', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#2a3550' }, pkt: { color: '#FFF', fontSize: 14, flex: 1 }, pkp: { color: '#666', fontSize: 14, flex: 1 }, pka: { color: '#D4AF37', fontSize: 12 },
  sb: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 }, sbt: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
  sumCard: { backgroundColor: '#0A1128', borderRadius: 14, padding: 16, marginBottom: 12 }, sumTitle: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }, sumVal: { color: '#FFF', fontSize: 13, marginBottom: 4 },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#0A1128', borderRadius: 8, marginBottom: 4 }, subName: { color: '#FFF', fontSize: 12 }, subBal: { fontSize: 13, fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: '#D4AF37' + '20', borderRadius: 10, marginTop: 8 }, totalLabel: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' }, totalVal: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
