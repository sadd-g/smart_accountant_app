import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalTable } from '../../hooks/useLocalStore';

export default function CustomerGroupsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data: groups, add, remove } = useLocalTable('customerGroups');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const filtered = (groups||[]).filter((g:any) => g.name?.includes(searchQuery));

  const handleAdd = async () => {
    if (!newName) { Alert.alert('خطأ', 'أدخل اسم المجموعة'); return; }
    await add({ name: newName }); setNewName(''); setShowAdd(false);
  };

  return (
    <View style={[styles.c,{paddingTop:insets.top}]}><StatusBar barStyle="light-content"/>
      <View style={styles.h}><TouchableOpacity onPress={()=>router.back()} style={styles.b}><Text style={styles.bt}>←</Text></TouchableOpacity><Text style={styles.t}>👥 مجموعات العملاء</Text><TouchableOpacity style={styles.ab} onPress={()=>setShowAdd(true)}><Text style={styles.at}>+</Text></TouchableOpacity></View>
      {showAdd && <View style={styles.ac}><TextInput style={styles.si} value={newName} onChangeText={setNewName} placeholder="اسم المجموعة" placeholderTextColor="#666"/><TouchableOpacity style={styles.sb} onPress={handleAdd}><Text style={styles.stx}>💾 حفظ</Text></TouchableOpacity></View>}
      <TextInput style={styles.si} value={searchQuery} onChangeText={setSearchQuery} placeholder="🔍 بحث..." placeholderTextColor="#666"/>
      {filtered.length===0?<View style={styles.e}><Text style={styles.ei}>👥</Text><Text style={styles.et}>لا توجد مجموعات</Text></View>:
        <FlatList data={filtered} keyExtractor={(i:any)=>i.id} renderItem={({item}:any)=>(
          <TouchableOpacity style={styles.rc} onLongPress={()=>Alert.alert('حذف','حذف؟',[{text:'حذف',style:'destructive',onPress:()=>remove(item.id)},{text:'إلغاء'}])}><Text style={styles.rn}>{item.name}</Text></TouchableOpacity>
        )} contentContainerStyle={{padding:16}}/>
      }
    </View>
  );
}
const styles=StyleSheet.create({c:{flex:1,backgroundColor:'#0A1128'},h:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:14},b:{width:40,height:40,borderRadius:20,backgroundColor:'#16213E',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#2a3550'},bt:{fontSize:20,color:'#D4AF37'},t:{flex:1,fontSize:18,fontWeight:'bold',color:'#FFF',textAlign:'center'},ab:{width:36,height:36,borderRadius:18,backgroundColor:'#D4AF37'+'20',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#D4AF37'},at:{fontSize:20,color:'#D4AF37',fontWeight:'bold'},
  ac:{flexDirection:'row',paddingHorizontal:16,marginBottom:8,gap:8},si:{flex:1,backgroundColor:'#16213E',borderRadius:10,padding:12,color:'#FFF',borderWidth:1,borderColor:'#2a3550',textAlign:'right',fontSize:14,marginHorizontal:16,marginBottom:8},sb:{backgroundColor:'#D4AF37',borderRadius:10,padding:12,justifyContent:'center'},stx:{color:'#0A1128',fontSize:14,fontWeight:'bold'},
  e:{flex:1,justifyContent:'center',alignItems:'center'},ei:{fontSize:48,marginBottom:12},et:{color:'#94a3b8',fontSize:16},rc:{backgroundColor:'#16213E',borderRadius:12,padding:14,marginBottom:8,borderWidth:1,borderColor:'#2a3550'},rn:{color:'#FFF',fontSize:14,fontWeight:'bold'},
});
