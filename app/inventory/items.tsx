import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import FormField from '../../components/FormField';
import FormModal from '../../components/FormModal';
import ListScreen, { ListItem } from '../../components/ListScreen';
import { useApp } from '../../context/AppContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useColors } from '../../hooks/useColors';

export default function ItemsScreen() {
  const colors = useColors();
  const { isRTL, t } = useApp();
  const { items, addItem, updateItem, deleteItem } = useDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', name: '', nameAr: '', categoryId: '', unitId: '', brandId: '', costPrice: '', salePrice: '', quantity: '', minQuantity: '', warehouseId: '', expiryDate: '', notes: '' });

  const listData: ListItem[] = items.map(item => ({
    id: item.id,
    primary: isRTL ? item.nameAr || item.name : item.name,
    secondary: `${isRTL ? 'كود' : 'Code'}: ${item.code}`,
    tertiary: `${isRTL ? 'كمية' : 'Qty'}: ${item.quantity}`,
    badge: item.quantity <= item.minQuantity ? (isRTL ? 'منخفض' : 'Low') : undefined,
    badgeColor: colors.warning,
  }));

  const openAdd = () => {
    setEditId(null);
    setForm({ code: '', name: '', nameAr: '', categoryId: '', unitId: '', brandId: '', costPrice: '', salePrice: '', quantity: '', minQuantity: '', warehouseId: '', expiryDate: '', notes: '' });
    setModalVisible(true);
  };

  const openEdit = (item: ListItem) => {
    const itm = items.find(i => i.id === item.id);
    if (!itm) return;
    setEditId(itm.id);
    setForm({ code: itm.code, name: itm.name, nameAr: itm.nameAr, categoryId: itm.categoryId, unitId: itm.unitId, brandId: itm.brandId, costPrice: itm.costPrice.toString(), salePrice: itm.salePrice.toString(), quantity: itm.quantity.toString(), minQuantity: itm.minQuantity.toString(), warehouseId: itm.warehouseId, expiryDate: itm.expiryDate, notes: itm.notes });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nameAr && !form.name) return Alert.alert('', isRTL ? 'الاسم مطلوب' : 'Name required');
    const data = { name: form.name, nameAr: form.nameAr, categoryId: form.categoryId, unitId: form.unitId, brandId: form.brandId, costPrice: parseFloat(form.costPrice) || 0, salePrice: parseFloat(form.salePrice) || 0, quantity: parseFloat(form.quantity) || 0, minQuantity: parseFloat(form.minQuantity) || 0, warehouseId: form.warehouseId, expiryDate: form.expiryDate, accountId: '', notes: form.notes };
    if (editId) {
      await updateItem(editId, data);
    } else {
      const ok = await addItem(data);
      if (!ok) return Alert.alert('⚠️', t.common.duplicate);
    }
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isRTL ? 'الأصناف' : 'Items', headerStyle: { backgroundColor: colors.section2 }, headerTintColor: '#fff' }} />
      <ListScreen title={isRTL ? 'الأصناف' : 'Items'} data={listData} onAdd={openAdd} onEdit={openEdit} onDelete={item => deleteItem(item.id)} accentColor={colors.section2} emptyText={isRTL ? 'لا توجد أصناف' : 'No items'} />
      <FormModal visible={modalVisible} title={isRTL ? (editId ? 'تعديل صنف' : 'إضافة صنف') : (editId ? 'Edit Item' : 'Add Item')} onClose={() => setModalVisible(false)} onSave={handleSave} accentColor={colors.section2}>
        <FormField label={isRTL ? 'كود الصنف' : 'Item Code'} value={form.code} onChangeText={v => setForm(f => ({ ...f, code: v }))} required />
        <FormField label={isRTL ? 'اسم الصنف (عربي)' : 'Item Name (AR)'} value={form.nameAr} onChangeText={v => setForm(f => ({ ...f, nameAr: v }))} required />
        <FormField label={isRTL ? 'اسم الصنف (إنجليزي)' : 'Item Name (EN)'} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
        <FormField label={isRTL ? 'سعر التكلفة' : 'Cost Price'} value={form.costPrice} onChangeText={v => setForm(f => ({ ...f, costPrice: v }))} keyboardType="numeric" />
        <FormField label={isRTL ? 'سعر البيع' : 'Sale Price'} value={form.salePrice} onChangeText={v => setForm(f => ({ ...f, salePrice: v }))} keyboardType="numeric" />
        <FormField label={isRTL ? 'الكمية الحالية' : 'Current Quantity'} value={form.quantity} onChangeText={v => setForm(f => ({ ...f, quantity: v }))} keyboardType="numeric" />
        <FormField label={isRTL ? 'الحد الأدنى' : 'Min Quantity'} value={form.minQuantity} onChangeText={v => setForm(f => ({ ...f, minQuantity: v }))} keyboardType="numeric" />
        <FormField label={isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'} value={form.expiryDate} onChangeText={v => setForm(f => ({ ...f, expiryDate: v }))} placeholder="YYYY-MM-DD" />
        <FormField label={isRTL ? 'ملاحظات' : 'Notes'} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} multiline />
      </FormModal>
    </View>
  );
}
