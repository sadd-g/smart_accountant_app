import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function SalesRepsScreen() {
  const colors = useColors();
  const { isRTL, t } = useApp();
  const { salesReps, addSalesRep, updateSalesRep, deleteSalesRep } = useDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameAr: '', phone: '', monthlyTarget: '', yearlyTarget: '', collectionTarget: '', totalSales: 0, totalCollection: 0 });

  const listData: ListItem[] = salesReps.map(r => {
    const achievement = r.monthlyTarget > 0 ? Math.round((r.totalSales / r.monthlyTarget) * 100) : 0;
    return {
      id: r.id,
      primary: isRTL ? r.nameAr || r.name : r.name,
      secondary: r.phone,
      badge: `${achievement}%`,
      badgeColor: achievement >= 100 ? colors.success : achievement >= 75 ? colors.warning : colors.destructive,
    };
  });

  const openAdd = () => { setEditId(null); setForm({ name: '', nameAr: '', phone: '', monthlyTarget: '', yearlyTarget: '', collectionTarget: '', totalSales: 0, totalCollection: 0 }); setModalVisible(true); };
  const openEdit = (item: ListItem) => {
    const r = salesReps.find(r => r.id === item.id);
    if (!r) return;
    setEditId(r.id);
    setForm({ name: r.name, nameAr: r.nameAr, phone: r.phone, monthlyTarget: r.monthlyTarget.toString(), yearlyTarget: r.yearlyTarget.toString(), collectionTarget: r.collectionTarget.toString(), totalSales: r.totalSales, totalCollection: r.totalCollection });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nameAr && !form.name) return Alert.alert('', isRTL ? 'الاسم مطلوب' : 'Name required');
    const data = { name: form.name, nameAr: form.nameAr, phone: form.phone, monthlyTarget: parseFloat(form.monthlyTarget) || 0, yearlyTarget: parseFloat(form.yearlyTarget) || 0, collectionTarget: parseFloat(form.collectionTarget) || 0, totalSales: form.totalSales, totalCollection: form.totalCollection };
    if (editId) { await updateSalesRep(editId, data); } else {
      const ok = await addSalesRep(data);
      if (!ok) return Alert.alert('⚠️', t.common.duplicate);
    }
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'مندوبو المبيعات' : 'Sales Reps', headerStyle: { backgroundColor: colors.section3 }, headerTintColor: '#fff' }} />
      <ListScreen title={isRTL ? 'المندوبون' : 'Sales Reps'} data={listData} onAdd={openAdd} onEdit={openEdit} onDelete={item => deleteSalesRep(item.id)} accentColor={colors.section3} emptyText={isRTL ? 'لا يوجد مندوبون' : 'No reps'} />
      <FormModal visible={modalVisible} title={isRTL ? (editId ? 'تعديل مندوب' : 'إضافة مندوب') : (editId ? 'Edit Rep' : 'Add Rep')} onClose={() => setModalVisible(false)} onSave={handleSave} accentColor={colors.section3}>
        <FormField label={isRTL ? 'الاسم (عربي)' : 'Name (AR)'} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label={isRTL ? 'الاسم (إنجليزي)' : 'Name (EN)'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
        <FormField label={isRTL ? 'الهاتف' : 'Phone'} value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />
        <FormField label={isRTL ? 'هدف شهري' : 'Monthly Target'} value={form.monthlyTarget} onChangeText={v => setForm(f => ({ ...f, monthlyTarget: v }))} keyboardType="numeric" />
        <FormField label={isRTL ? 'هدف سنوي' : 'Yearly Target'} value={form.yearlyTarget} onChangeText={v => setForm(f => ({ ...f, yearlyTarget: v }))} keyboardType="numeric" />
        <FormField label={isRTL ? 'هدف التحصيل' : 'Collection Target'} value={form.collectionTarget} onChangeText={v => setForm(f => ({ ...f, collectionTarget: v }))} keyboardType="numeric" />
      </FormModal>
    </View>
  );
}
