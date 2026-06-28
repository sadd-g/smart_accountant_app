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
  const [showParentPicker, setShowParentPicker] = useState(false);
  
  // الحالة: هل هو حساب رئيسي جديد (يحتاج أب) أو فرعي
  const [mode, setMode] = useState<'main' | 'sub'>('main');
  
  const [formData, setFormData] = useState({ name: '', code: '', type: 'أصل', currency: 'YER', balance: '0', parentId: '' });
  const types = ['الكل', 'أصل', 'خصم', 'ملكية', 'إيراد', 'مصروف'];

  const mainAccounts = accounts.filter((a: any) => !a.parentId);
  const getSubAccounts = (parentId: string) => accounts.filter((a: any) => a.parentId === parentId);
  const filtered = accounts.filter((a: any) => (a.name || '').includes(searchQuery) && (selectedType === 'الكل' || a.type === selectedType));
  const getTypeColor = (t: string) => ({ 'أصل': '#D4AF37', 'خصم': '#EF4444', 'ملكية': '#3B82F6', 'إيراد': '#10B981', 'مصروف': '#F59E0B' }[t] || '#6B7280');

  // هل الحساب يمكن الترحيل عليه؟ (فرعي فقط)
  const isLeaf = (account: any) => !!account.parentId;

  // توليد كود تلقائي
  const generateCode = (): string => {
    if (parentAccount) {
      const siblings = accounts.filter((a: any) => a.parentId === parentAccount.id);
      const seq = (siblings.length + 1).toString().padStart(2, '0');
      return parentAccount.code + seq;
    }
    // حساب رئيسي جديد
    const prefix = (types.indexOf(formData.type)).toString();
    const siblings = accounts.filter((a: any) => a.type === formData.type && !a.parentId);
    return prefix + (siblings.length + 1).toString().padStart(2, '0');
  };

  const handleSave = async () => {
    if (!formData.name) { Alert.alert('خطأ', 'أدخل اسم الحساب'); return; }
    
    // إجبار اختيار الحساب الأب للحسابات الفرعية
    if (mode === 'sub' && !parentAccount) {
      Alert.alert('تنبيه', 'يجب اختيار الحساب الأب للحساب الفرعي');
      return;
    }
    
    const parentId = parentAccount?.id || '';
    const exists = accounts.find((a: any) => a.name === formData.name && (a.parentId || '') === parentId);
    if (exists && !editMode) { Alert.alert('تنبيه', 'هذا الحساب موجود بالفعل'); return; }
    
    const code = generateCode();
    const data = { ...formData, code, balance: parseFloat(formData.balance) || 0, parentId };
    
    if (editMode && selectedAccount) { await update(selectedAccount.id, data); } 
    else { await add(data); }
    
    setShowModal(false); setEditMode(false); setSelectedAccount(null); setParentAccount(null);
    Alert.alert('✅', 'تم حفظ الحساب: ' + code + (parentAccount ? ` (فرعي من ${parentAccount.name})` : ' (رئيسي)'));
  };

  const openAddSub = (account: any) => { 
    setFormData({ name: '', code: '', type: account.type, currency: account.currency || 'YER', balance: '0', parentId: account.id }); 
    setParentAccount(account); setMode('sub'); setEditMode(false); setSelectedAccount(null); setShowModal(true); 
  };

  const openAddMain = () => {
    setFormData({ name: '', code: '', type: 'أصل', currency: 'YER', balance: '0', parentId: '' });
    setParentAccount(null); setMode('main'); setEditMode(false); setSelectedAccount(null); setShowModal(true);
  };

  // عرض الحسابات: الرئيسية + الفرعية تحتها
  const displayAccounts: any[] = [];
  const addedSubs = new Set<string>();
  
  mainAccounts.forEach((main: any) => {
    if (filtered.some((f: any) => f.id === main.id)) {
      displayAccounts.push({ ...main, _level: 0, _isMain: true });
    }
    getSubAccounts(main.id).forEach((sub: any) => {
      if (filtered.some((f: any) => f.id === sub.id)) {
        displayAccounts.push({ ...sub, _level: 1, _isSub: true, _parentName: main.name });
        addedSubs.add(sub.id);
      }
      // الأحفاد
      getSubAccounts(sub.id).forEach((grand: any) => {
        if (filtered.some((f: any) => f.id === grand.id)) {
          displayAccounts.push({ ...grand, _level: 2, _isSub: true, _parentName: sub.name });
          addedSubs.add(grand.id);
        }
      });
    });
  });
  
  // أي حساب فرعي ما انضاف (إذا كان مفلتر بس)
  filtered.forEach((acc: any) => {
    if (acc.parentId && !addedSubs.has(acc.id)) {
      displayAccounts.push({ ...acc, _level: 1, _isSub: true });
    }
  });

  return (
    <View style={[st.c, { paddingTop: insets.top }]}><StatusBar barStyle="light-content" />
      <ControlHeader title="دليل الحسابات" count={accounts.length} onBack={() => router.back()} onAdd={openAddMain} />
      <ControlButtons showEdit={false} showDelete={false} />
      <TextInput style={st.si} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
      <View style={st.fr}>{types.map(t => <TouchableOpacity key={t} style={[st.fb, selectedType === t && st.fbA]} onPress={() => setSelectedType(t)}><Text style={[st.ft, selectedType === t && st.ftA]}>{t}</Text></TouchableOpacity>)}</View>
      
      {/* تنبيه: الحسابات الرئيسية للتجميع فقط */}
      <View style={st.infoBar}>
        <Text style={st.infoText}>💡 الحسابات الرئيسية للتجميع فقط | الحسابات الفرعية هي التي تستخدم في العمليات</Text>
      </View>
      
      {displayAccounts.length === 0 ? <View style={st.e}><Text style={st.ei}>📚</Text><Text style={st.et}>لا توجد حسابات</Text></View> :
        <FlatList 
          data={displayAccounts} 
          keyExtractor={(i: any) => i.id + (i._level || 0)}
          renderItem={({ item }: any) => {
            const margin = (item._level || 0) * 24;
            const isMain = item._isMain || !item.parentId;
            const isLeaf = !!item.parentId;
            
            return (
            <View style={{ marginLeft: margin }}>
              <TouchableOpacity 
                style={[st.rc, !isMain && st.subRc, isLeaf && st.leafRc]} 
                onPress={() => { 
                  setFormData({ name: item.name, code: item.code, type: item.type, currency: item.currency || 'YER', balance: item.balance?.toString() || '0', parentId: item.parentId || '' }); 
                  setSelectedAccount(item); setMode(isMain ? 'main' : 'sub');
                  if (item.parentId) setParentAccount(accounts.find((a: any) => a.id === item.parentId)); 
                  else setParentAccount(null);
                  setEditMode(true); setShowModal(true); 
                }} 
                onLongPress={() => { 
                  const subs = getSubAccounts(item.id); 
                  if (subs.length > 0) { Alert.alert('تنبيه', 'لا يمكن حذف حساب يحتوي على حسابات فرعية'); return; } 
                  Alert.alert('حذف', `حذف "${item.name}"؟`, [{ text: 'حذف', style: 'destructive', onPress: () => remove(item.id) }, { text: 'إلغاء' }]); 
                }}>
                <View style={st.rh}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.rcode}>{item.code}</Text>
                    <Text style={st.rn}>
                      {item._level > 0 ? '└ '.repeat(item._level) : ''}{item.name}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[st.badge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                      <Text style={[st.badgeText, { color: getTypeColor(item.type) }]}>{item.type}</Text>
                    </View>
                    {isMain && (
                      <View style={st.mainBadge}>
                        <Text style={st.mainBadgeText}>رئيسي</Text>
                      </View>
                    )}
                    {isLeaf && (
                      <View style={st.leafBadge}>
                        <Text style={st.leafBadgeText}>ترحيل</Text>
                      </View>
                    )}
                    <TouchableOpacity style={st.subBtn} onPress={() => openAddSub(item)}>
                      <Text style={st.subBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[st.rbal, { color: (item.balance || 0) >= 0 ? '#10B981' : '#EF4444' }]}>
                  {(item.balance || 0).toLocaleString()} ﷼
                </Text>
              </TouchableOpacity>
            </View>
          );}}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        />}
      
      {/* Modal الإضافة/التعديل */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={st.mo}><View style={[st.mc, { maxHeight: '85%' }]}><View style={st.mh}><Text style={st.mt}>{editMode ? 'تعديل حساب' : (mode === 'sub' ? 'حساب فرعي جديد' : 'حساب رئيسي جديد')}</Text><TouchableOpacity onPress={() => setShowModal(false)}><Text style={st.mx}>✕</Text></TouchableOpacity></View>
        <ScrollView style={st.mb}>
          
          {/* اختيار الحساب الأب - إجباري للفرعي */}
          <Text style={[st.fl, { color: '#D4AF37', fontSize: 14 }]}>
            {mode === 'sub' ? 'الحساب الأب * (إجباري)' : 'الحساب الأب (اختياري - اتركه فارغاً لحساب رئيسي)'}
          </Text>
          <TouchableOpacity style={[st.pk, mode === 'sub' && !parentAccount && st.pkRequired]} onPress={() => setShowParentPicker(true)}>
            <Text style={parentAccount ? st.pkt : st.pkp}>
              {parentAccount ? `${parentAccount.code} - ${parentAccount.name}` : 'اختيار الحساب الأب'}
            </Text>
            <Text style={st.pka}>▼</Text>
          </TouchableOpacity>
          
          {parentAccount && (
            <Text style={st.codePreview}>الكود المتوقع: {generateCode()}</Text>
          )}
          
          <Text style={st.fl}>اسم الحساب *</Text>
          <TextInput style={st.fi} value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} placeholder="اسم الحساب" placeholderTextColor="#666" />
          
          {!parentAccount && (
            <>
              <Text style={st.fl}>النوع</Text>
              <View style={st.tr}>{types.filter(t => t !== 'الكل').map(t => <TouchableOpacity key={t} style={[st.tb, formData.type === t && st.tbA]} onPress={() => setFormData({ ...formData, type: t })}><Text style={[st.tbt, formData.type === t && st.tbtA]}>{t}</Text></TouchableOpacity>)}</View>
            </>
          )}
          
          <Text style={st.fl}>العملة</Text>
          <TouchableOpacity style={st.pk} onPress={() => setShowCurrencyPicker(true)}>
            <Text style={st.pkt}>{(currencies || []).find((c: any) => c.code === formData.currency)?.name || formData.currency}</Text>
            <Text style={st.pka}>▼</Text>
          </TouchableOpacity>
          
          <Text style={st.fl}>الرصيد الافتتاحي</Text>
          <TextInput style={st.fi} value={formData.balance} onChangeText={v => setFormData({ ...formData, balance: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
          
          <View style={st.ma}>
            <TouchableOpacity style={st.sb} onPress={handleSave}>
              <Text style={st.sbt}>💾 {editMode ? 'تحديث' : 'حفظ'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.clb} onPress={() => setShowModal(false)}>
              <Text style={st.clt}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>
      
      <PickerModal visible={showCurrencyPicker} title="اختيار العملة" data={currencies || []} displayField="name" subField="code" onSelect={(i: any) => setFormData({ ...formData, currency: i.code })} onClose={() => setShowCurrencyPicker(false)} />
      <PickerModal visible={showParentPicker} title="اختيار الحساب الأب" data={accounts || []} displayField="name" subField="code" onSelect={(i: any) => { setParentAccount(i); setMode('sub'); if (i.type) setFormData({ ...formData, type: i.type, parentId: i.id }); }} onClose={() => setShowParentPicker(false)} />
    </View>
  );
}
const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0A1128' },
  si: { marginHorizontal: 16, marginBottom: 12, padding: 12, backgroundColor: '#16213E', borderRadius: 10, color: '#FFF', borderWidth: 1, borderColor: '#2a3550', textAlign: 'right', fontSize: 14 },
  fr: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 6 }, fb: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#16213E', borderWidth: 1, borderColor: '#2a3550' }, fbA: { backgroundColor: '#D4AF37' + '20', borderColor: '#D4AF37' }, ft: { color: '#94a3b8', fontSize: 12 }, ftA: { color: '#D4AF37', fontWeight: 'bold' },
  infoBar: { marginHorizontal: 16, marginBottom: 10, padding: 10, backgroundColor: '#D4AF37' + '10', borderRadius: 8, borderWidth: 1, borderColor: '#D4AF37' + '30' },
  infoText: { color: '#D4AF37', fontSize: 11, textAlign: 'center' },
  e: { flex: 1, justifyContent: 'center', alignItems: 'center' }, ei: { fontSize: 48, marginBottom: 12 }, et: { color: '#FFF', fontSize: 16 },
  rc: { backgroundColor: '#16213E', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2a3550', marginHorizontal: 16 }, subRc: { backgroundColor: '#1a2240' }, leafRc: { borderColor: '#10B981' + '40' },
  rh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, rcode: { color: '#94a3b8', fontSize: 11 }, rn: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }, badgeText: { fontSize: 10, fontWeight: 'bold' },
  mainBadge: { backgroundColor: '#D4AF37' + '30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }, mainBadgeText: { color: '#D4AF37', fontSize: 8, fontWeight: 'bold' },
  leafBadge: { backgroundColor: '#10B981' + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }, leafBadgeText: { color: '#10B981', fontSize: 8, fontWeight: 'bold' },
  subBtn: { backgroundColor: '#10B981' + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#10B981' + '40' }, subBtnText: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  rbal: { fontSize: 16, fontWeight: 'bold' },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }, mc: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' }, mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a3550' }, mt: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' }, mx: { color: '#EF4444', fontSize: 22, fontWeight: 'bold' }, mb: { padding: 16 },
  fl: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 }, fi: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  tr: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, tbA: { borderColor: '#D4AF37', backgroundColor: '#D4AF37' + '20' }, tbt: { color: '#94a3b8', fontSize: 11 }, tbtA: { color: '#D4AF37', fontWeight: 'bold' },
  pk: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A1128', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#2a3550' }, pkRequired: { borderColor: '#EF4444', borderWidth: 2 },
  pkt: { color: '#FFF', fontSize: 14, flex: 1 }, pkp: { color: '#666', fontSize: 14, flex: 1 }, pka: { color: '#D4AF37', fontSize: 12, marginLeft: 8 },
  codePreview: { color: '#10B981', fontSize: 12, textAlign: 'center', marginTop: 6 },
  ma: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 16 }, sb: { flex: 1, backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center' }, sbt: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' }, clb: { flex: 1, backgroundColor: '#2a3550', borderRadius: 12, padding: 14, alignItems: 'center' }, clt: { color: '#FFF', fontSize: 16 },
});
