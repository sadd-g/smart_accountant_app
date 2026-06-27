import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';
import { PickerModal } from '../../src/components/ui/PickerModal';
import { ControlButtons, ControlHeader } from '../../src/components/ui/ControlButtons';

export default function AccountsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data: accounts, add, remove, update } = useLocalTable('accounts');
  const { data: currencies } = useLocalTable('currencies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('الكل');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [parentAccount, setParentAccount] = useState<any>(null);
  const [isSubAccount, setIsSubAccount] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', type: 'أصل', currency: 'YER', balance: '0', parentId: '' });
  const types = ['الكل', 'أصل', 'خصم', 'ملكية', 'إيراد', 'مصروف'];

  const mainAccounts = accounts.filter((a: any) => !a.parentId);
  const getSubAccounts = (parentId: string) => accounts.filter((a: any) => a.parentId === parentId);
  const filtered = accounts.filter((a: any) => (a.name || '').includes(searchQuery) && (selectedType === 'الكل' || a.type === selectedType));
  const getTypeColor = (t: string) => ({ 'أصل': '#D4AF37', 'خصم': '#EF4444', 'ملكية': '#3B82F6', 'إيراد': '#10B981', 'مصروف': '#F59E0B' }[t] || '#6B7280');

  const handleSave = async () => {
    if (!formData.name) { Alert.alert('خطأ', 'أدخل اسم الحساب'); return; }
    const code = formData.code || `${types.indexOf(formData.type)}${(accounts.length + 1).toString().padStart(2, '0')}`;
    const data = { ...formData, code, balance: parseFloat(formData.balance) || 0, parentId: isSubAccount ? parentAccount?.id || '' : '' };
    if (editMode && selectedAccount) { await update(selectedAccount.id, data); } else { await add(data); }
    setShowModal(false); setEditMode(false); setSelectedAccount(null); setIsSubAccount(false); setParentAccount(null);
  };

  const openAddSub = (account: any) => { setFormData({ name: '', code: '', type: account.type, currency: account.currency || 'YER', balance: '0', parentId: account.id }); setParentAccount(account); setIsSubAccount(true); setEditMode(false); setSelectedAccount(null); setShowModal(true); };

  const displayAccounts: any[] = []; const addedSubs = new Set<string>();
  filtered.forEach((acc: any) => {
    if (!acc.parentId) { displayAccounts.push(acc); getSubAccounts(acc.id).filter((s: any) => (s.name || '').includes(searchQuery)).forEach((s: any) => { displayAccounts.push({ ...s, _isSub: true }); addedSubs.add(s.id); }); }
    else if (!addedSubs.has(acc.id)) { displayAccounts.push({ ...acc, _isSub: true }); }
  });

  return (
    <View style={[st.c, { paddingTop: insets.top }]}><StatusBar barStyle="light-content" />
      <ControlHeader title="دليل الحسابات" count={accounts.length} onBack={() => router.back()} onAdd={() => { setEditMode(false); setSelectedAccount(null); setIsSubAccount(false); setParentAccount(null); setFormData({ name: '', code: '', type: 'أصل', currency: 'YER', balance: '0', parentId: '' }); setShowModal(true); }} />
      <ControlButtons showEdit={false} showDelete={false} onPrint={() => Alert.alert('🖨️', 'جاري الطباعة')} onRefresh={() => {}} />
      <TextInput style={st.si} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
      <View style={st.fr}>{types.map(t => <TouchableOpacity key={t} style={[st.fb, selectedType === t && st.fbA]} onPress={() => setSelectedType(t)}><Text style={[st.ft, selectedType === t && st.ftA]}>{t}</Text></TouchableOpacity>)}</View>
      {filtered.length === 0 ? <View style={st.e}><Text style={st.ei}>📚</Text><Text style={st.et}>لا توجد حسابات</Text></View> :
        <FlatList data={displayAccounts} keyExtractor={(i: any) => i.id + (i._isSub ? '_sub' : '')}
          renderItem={({ item }: any) => (
            <View style={item._isSub ? { marginLeft: 20 } : {}}>
              <TouchableOpacity style={[st.rc, item._isSub && st.subRc]} onPress={() => { setFormData({ name: item.name, code: item.code, type: item.type, currency: item.currency || 'YER', balance: item.balance?.toString() || '0', parentId: item.parentId || '' }); setSelectedAccount(item); setIsSubAccount(!!item.parentId); if (item.parentId) setParentAccount(accounts.find((a: any) => a.id === item.parentId)); setEditMode(true); setShowModal(true); }} onLongPress={() => { const subs = getSubAccounts(item.id); if (subs.length > 0) { Alert.alert('تنبيه', 'لا يمكن حذف حساب يحتوي على حسابات فرعية'); return; } Alert.alert('حذف', `حذف "${item.name}"؟`, [{ text: 'حذف', style: 'destructive', onPress: () => remove(item.id) }, { text: 'إلغاء' }]); }}>
                <View style={st.rh}><View style={{ flex: 1 }}><Text style={st.rcode}>{item.code}</Text><Text style={st.rn}>{item._isSub ? '└ ' : ''}{item.name}</Text></View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={[st.tb, { backgroundColor: getTypeColor(item.type) + '20' }]}><Text style={[st.tt, { color: getTypeColor(item.type) }]}>{item.type}</Text></View>{!item._isSub && <TouchableOpacity style={st.subBtn} onPress={() => openAddSub(item)}><Text style={st.subBtnText}>+ فرعي</Text></TouchableOpacity>}</View>
                </View>
                <Text style={[st.rbal, { color: (item.balance || 0) >= 0 ? '#10B981' : '#EF4444' }]}>{(item.balance || 0).toLocaleString()} ﷼</Text>
              </TouchableOpacity>
            </View>
          )} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} />}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={st.mo}><View style={[st.mc, { maxHeight: '85%' }]}><View style={st.mh}><Text style={st.mt}>{editMode ? 'تعديل' : (isSubAccount ? `حساب فرعي لـ ${parentAccount?.name || ''}` : 'حساب رئيسي جديد')}</Text><TouchableOpacity onPress={() => setShowModal(false)}><Text style={st.mx}>✕</Text></TouchableOpacity></View>
        <ScrollView style={st.mb}>
          {isSubAccount && <View style={st.parentInfo}><Text style={st.parentLabel}>الحساب الرئيسي:</Text><Text style={st.parentName}>{parentAccount?.name}</Text></View>}
          <Text style={st.fl}>اسم الحساب *</Text><TextInput style={st.fi} value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} placeholder="اسم الحساب" placeholderTextColor="#666" />
          <Text style={st.fl}>كود الحساب</Text><TextInput style={st.fi} value={formData.code} onChangeText={v => setFormData({ ...formData, code: v })} placeholder="تلقائي" placeholderTextColor="#666" />
          {!isSubAccount && <><Text style={st.fl}>النوع</Text><View style={st.tr}>{types.filter(t => t !== 'الكل').map(t => <TouchableOpacity key={t} style={[st.tb, formData.type === t && st.tbA]} onPress={() => setFormData({ ...formData, type: t })}><Text style={[st.tbt, formData.type === t && st.tbtA]}>{t}</Text></TouchableOpacity>)}</View></>}
          <Text style={st.fl}>العملة</Text>
          <TouchableOpacity style={st.pk} onPress={() => setShowCurrencyPicker(true)}>
            <Text style={st.pkt}>{(currencies || []).find((c: any) => c.code === formData.currency)?.name || formData.currency || 'اختيار العملة'}</Text>
            <Text style={st.pka}>▼</Text>
          </TouchableOpacity>
          <Text style={st.fl}>الرصيد الافتتاحي</Text><TextInput style={st.fi} value={formData.balance} onChangeText={v => setFormData({ ...formData, balance: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
          <View style={st.ma}><TouchableOpacity style={st.sb} onPress={handleSave}><Text style={st.sbt}>💾 {editMode ? 'تحديث' : 'حفظ'}</Text></TouchableOpacity><TouchableOpacity style={st.clb} onPress={() => setShowModal(false)}><Text style={st.clt}>إلغاء</Text></TouchableOpacity></View>
        </ScrollView></View></View>
      </Modal>
      <PickerModal visible={showCurrencyPicker} title="اختيار العملة" data={currencies || []} displayField="name" subField="code" onSelect={(i: any) => setFormData({ ...formData, currency: i.code })} onClose={() => setShowCurrencyPicker(false)} />
    </View>
  );
}
const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0A1128' },
  si: { marginHorizontal: 16, marginBottom: 12, padding: 12, backgroundColor: '#16213E', borderRadius: 10, color: '#FFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14 },
  fr: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 6 }, fb: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#16213E', borderWidth: 1, borderColor: '#2a3550' }, fbA: { backgroundColor: '#D4AF37' + '20', borderColor: '#D4AF37' }, ft: { color: '#94a3b8', fontSize: 12 }, ftA: { color: '#D4AF37', fontWeight: 'bold' },
  e: { flex: 1, justifyContent: 'center', alignItems: 'center' }, ei: { fontSize: 48, marginBottom: 12 }, et: { color: '#FFF', fontSize: 16 },
  rc: { backgroundColor: '#16213E', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2a3550', marginHorizontal: 16 }, subRc: { backgroundColor: '#1a2240' },
  rh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, rcode: { color: '#94a3b8', fontSize: 11 }, rn: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 2 }, tb: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }, tt: { fontSize: 10, fontWeight: 'bold' },
  subBtn: { backgroundColor: '#10B981' + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#10B981' + '40' }, subBtnText: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
  rbal: { fontSize: 16, fontWeight: 'bold' },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }, mc: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' }, mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' }, mt: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' }, mx: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' }, mb: { padding: 16 },
  fl: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 }, fi: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  parentInfo: { backgroundColor: '#D4AF37' + '15', borderRadius: 10, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }, parentLabel: { color: '#94a3b8', fontSize: 12 }, parentName: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  tr: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, tbA: { borderColor: '#D4AF37', backgroundColor: '#D4AF37' + '20' }, tbt: { color: '#94a3b8', fontSize: 12 }, tbtA: { color: '#D4AF37', fontWeight: 'bold' },
  pk: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A1128', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#2a3550' }, pkt: { color: '#FFF', fontSize: 14, flex: 1 }, pka: { color: '#D4AF37', fontSize: 12, marginLeft: 8 },
  ma: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 }, sb: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' }, sbt: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' }, clb: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' }, clt: { color: '#FFF', fontSize: 16 },
});
