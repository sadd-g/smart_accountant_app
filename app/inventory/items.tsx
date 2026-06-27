import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';
import { PickerModal } from '../../src/components/ui/PickerModal';

export default function ItemsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data: items, add, remove, update } = useLocalTable('items');
  const { data: units } = useLocalTable('units');
  const { data: categories } = useLocalTable('categories');
  const { data: brands } = useLocalTable('brands');
  const { data: warehouses } = useLocalTable('warehouses');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: 'قطعة', category: '', brand: '', warehouse: '', costPrice: '0', salePrice: '0', quantity: '0', minQuantity: '0' });

  const filtered = items.filter((i:any) => (i.name||'').includes(searchQuery));
  const totalValue = items.reduce((s:number,i:any)=>s+((i.quantity||0)*(i.costPrice||0)),0);

  const handleSave = async () => {
    if(!formData.name){Alert.alert('خطأ','أدخل اسم الصنف');return;}
    const data = {...formData,costPrice:parseFloat(formData.costPrice)||0,salePrice:parseFloat(formData.salePrice)||0,quantity:parseFloat(formData.quantity)||0};
    if(editMode&&selectedItem){await update(selectedItem.id,data);}else{await add(data);}
    setShowModal(false);setEditMode(false);setSelectedItem(null);
  };

  return (
    <View style={[st.c,{paddingTop:insets.top}]}><StatusBar barStyle="light-content"/>
      <View style={st.h}><TouchableOpacity onPress={()=>router.back()}><Text style={st.bt}>←</Text></TouchableOpacity><Text style={st.t}>الأصناف ({items.length})</Text><TouchableOpacity style={st.ab} onPress={()=>{setEditMode(false);setSelectedItem(null);setFormData({name:'',unit:'قطعة',category:'',brand:'',warehouse:'',costPrice:'0',salePrice:'0',quantity:'0',minQuantity:'0'});setShowModal(true);}}><Text style={st.atx}>+</Text></TouchableOpacity></View>
      <TextInput style={st.si} placeholder="🔍 بحث..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery}/>
      <View style={st.sm}><Text style={st.sl}>قيمة المخزون</Text><Text style={st.sv}>{totalValue.toLocaleString()} ﷼</Text></View>
      {filtered.length===0?<View style={st.e}><Text style={st.ei}>📦</Text><Text style={st.et}>لا توجد أصناف</Text></View>:
        <FlatList data={filtered} keyExtractor={(i:any)=>i.id} renderItem={({item}:any)=>(
          <TouchableOpacity style={st.rc} onPress={()=>{setFormData({name:item.name,unit:item.unit||'قطعة',category:item.category||'',brand:item.brand||'',warehouse:item.warehouse||'',costPrice:item.costPrice?.toString()||'0',salePrice:item.salePrice?.toString()||'0',quantity:item.quantity?.toString()||'0',minQuantity:item.minQuantity?.toString()||'0'});setSelectedItem(item);setEditMode(true);setShowModal(true);}} onLongPress={()=>Alert.alert('حذف',`حذف "${item.name}"؟`,[{text:'حذف',style:'destructive',onPress:()=>remove(item.id)},{text:'إلغاء'}])}>
            <View style={st.rh}><Text style={st.ri}>📦</Text><View style={{flex:1}}><Text style={st.rn}>{item.name}</Text><Text style={st.ru}>{item.unit}</Text></View><View style={st.qb}><Text style={st.q}>{item.quantity||0}</Text></View></View>
            <View style={st.rp}><Text style={st.rpv}>تكلفة: {(item.costPrice||0).toLocaleString()}</Text><Text style={[st.rpv,{color:'#10B981'}]}>بيع: {(item.salePrice||0).toLocaleString()}</Text></View>
          </TouchableOpacity>
        )} contentContainerStyle={{padding:16,paddingBottom:32}}/>
      }
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={st.mo}><View style={[st.mc,{maxHeight:'90%'}]}><View style={st.mh}><Text style={st.mt}>{editMode?'تعديل':'إضافة'} صنف</Text><TouchableOpacity onPress={()=>setShowModal(false)}><Text style={st.mx}>✕</Text></TouchableOpacity></View>
        <ScrollView style={st.mb}>
          <Text style={st.fl}>اسم الصنف *</Text><TextInput style={st.fi} value={formData.name} onChangeText={v=>setFormData({...formData,name:v})} placeholder="اسم الصنف" placeholderTextColor="#666"/>
          <Text style={st.fl}>الوحدة</Text><TouchableOpacity style={st.pk} onPress={()=>setShowUnitPicker(true)}><Text style={st.pkt}>{formData.unit||'اختيار الوحدة'}</Text><Text style={st.pka}>▼</Text></TouchableOpacity>
          <Text style={st.fl}>الفئة</Text><TouchableOpacity style={st.pk} onPress={()=>setShowCategoryPicker(true)}><Text style={st.pkt}>{formData.category||'اختيار الفئة'}</Text><Text style={st.pka}>▼</Text></TouchableOpacity>
          <Text style={st.fl}>الماركة</Text><TouchableOpacity style={st.pk} onPress={()=>setShowBrandPicker(true)}><Text style={st.pkt}>{formData.brand||'اختيار الماركة'}</Text><Text style={st.pka}>▼</Text></TouchableOpacity>
          <Text style={st.fl}>المستودع</Text><TouchableOpacity style={st.pk} onPress={()=>setShowWarehousePicker(true)}><Text style={st.pkt}>{formData.warehouse||'اختيار المستودع'}</Text><Text style={st.pka}>▼</Text></TouchableOpacity>
          <View style={st.rw}><View style={st.hf}><Text style={st.fl}>سعر التكلفة</Text><TextInput style={st.fi} value={formData.costPrice} onChangeText={v=>setFormData({...formData,costPrice:v})} keyboardType="numeric"/></View><View style={st.hf}><Text style={st.fl}>سعر البيع</Text><TextInput style={st.fi} value={formData.salePrice} onChangeText={v=>setFormData({...formData,salePrice:v})} keyboardType="numeric"/></View></View>
          <View style={st.rw}><View style={st.hf}><Text style={st.fl}>الكمية</Text><TextInput style={st.fi} value={formData.quantity} onChangeText={v=>setFormData({...formData,quantity:v})} keyboardType="numeric"/></View><View style={st.hf}><Text style={st.fl}>الحد الأدنى</Text><TextInput style={st.fi} value={formData.minQuantity} onChangeText={v=>setFormData({...formData,minQuantity:v})} keyboardType="numeric"/></View></View>
          <View style={st.ma}><TouchableOpacity style={st.sb} onPress={handleSave}><Text style={st.sbt}>💾 {editMode?'تحديث':'حفظ'}</Text></TouchableOpacity><TouchableOpacity style={st.clb} onPress={()=>setShowModal(false)}><Text style={st.clt}>إلغاء</Text></TouchableOpacity></View>
        </ScrollView></View></View>
      </Modal>
      <PickerModal visible={showUnitPicker} title="اختيار الوحدة" data={units||[]} displayField="name" subField="code" onSelect={(i:any)=>setFormData({...formData,unit:i.name})} onClose={()=>setShowUnitPicker(false)}/>
      <PickerModal visible={showCategoryPicker} title="اختيار الفئة" data={categories||[]} displayField="name" onSelect={(i:any)=>setFormData({...formData,category:i.name})} onClose={()=>setShowCategoryPicker(false)}/>
      <PickerModal visible={showBrandPicker} title="اختيار الماركة" data={brands||[]} displayField="name" onSelect={(i:any)=>setFormData({...formData,brand:i.name})} onClose={()=>setShowBrandPicker(false)}/>
      <PickerModal visible={showWarehousePicker} title="اختيار المستودع" data={warehouses||[]} displayField="name" onSelect={(i:any)=>setFormData({...formData,warehouse:i.name})} onClose={()=>setShowWarehousePicker(false)}/>
    </View>
  );
}
const st=StyleSheet.create({c:{flex:1,backgroundColor:'#0A1128'},h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},bt:{fontSize:24,color:'#D4AF37',fontWeight:'bold'},t:{fontSize:18,fontWeight:'bold',color:'#FFF'},ab:{width:36,height:36,borderRadius:18,backgroundColor:'#D4AF37'+'20',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#D4AF37'},atx:{fontSize:20,color:'#D4AF37',fontWeight:'bold'},
  si:{marginHorizontal:16,marginBottom:12,padding:12,backgroundColor:'#16213E',borderRadius:10,color:'#FFF',borderWidth:1,borderColor:'#2a3550',textAlign:'right',fontSize:14},
  sm:{marginHorizontal:16,marginBottom:12,padding:16,backgroundColor:'#16213E',borderRadius:14,alignItems:'center',borderWidth:1,borderColor:'#2a3550'},sl:{color:'#94a3b8',fontSize:13,marginBottom:6},sv:{color:'#D4AF37',fontSize:24,fontWeight:'bold'},
  e:{flex:1,justifyContent:'center',alignItems:'center'},ei:{fontSize:48,marginBottom:12},et:{color:'#FFF',fontSize:16},
  rc:{backgroundColor:'#16213E',borderRadius:14,padding:14,marginBottom:10,borderWidth:1,borderColor:'#2a3550',marginHorizontal:16},rh:{flexDirection:'row',alignItems:'center',marginBottom:10},ri:{fontSize:28,marginRight:10},rn:{color:'#FFF',fontSize:14,fontWeight:'bold',marginBottom:2},ru:{color:'#94a3b8',fontSize:11},qb:{backgroundColor:'#D4AF37'+'20',paddingHorizontal:10,paddingVertical:6,borderRadius:8},q:{color:'#D4AF37',fontSize:14,fontWeight:'bold'},
  rp:{flexDirection:'row',justifyContent:'space-around',borderTopWidth:1,borderTopColor:'#2a3550',paddingTop:10},rpv:{fontSize:12,fontWeight:'bold',color:'#EF4444'},
  mo:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},mc:{backgroundColor:'#16213E',borderTopLeftRadius:20,borderTopRightRadius:20,maxHeight:'90%'},mh:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#2a3550'},mt:{color:'#D4AF37',fontSize:18,fontWeight:'bold'},mx:{color:'#EF4444',fontSize:22,fontWeight:'bold'},mb:{padding:16},
  fl:{color:'#94a3b8',fontSize:13,marginBottom:6,marginTop:12},fi:{backgroundColor:'#0A1128',borderRadius:10,padding:12,color:'#FFF',borderWidth:1,borderColor:'#2a3550',fontSize:14},
  pk:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#0A1128',borderRadius:10,padding:14,borderWidth:1,borderColor:'#2a3550'},pkt:{color:'#FFF',fontSize:14,flex:1},pka:{color:'#D4AF37',fontSize:12,marginLeft:8},
  rw:{flexDirection:'row',gap:8},hf:{flex:1},
  ma:{flexDirection:'row',gap:10,marginTop:24,marginBottom:16},sb:{flex:1,backgroundColor:'#D4AF37',borderRadius:12,padding:14,alignItems:'center'},sbt:{color:'#0A1128',fontSize:16,fontWeight:'bold'},clb:{flex:1,backgroundColor:'#2a3550',borderRadius:12,padding:14,alignItems:'center'},clt:{color:'#FFF',fontSize:16},
});
