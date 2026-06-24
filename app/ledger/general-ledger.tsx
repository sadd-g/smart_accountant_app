import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function GeneralLedger() {
  const transactions = [{ id: '1', desc: 'مبيعات نقدية', amount: 50000 }];
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>دفتر الأستاذ العام</Text>
      <FlatList 
        data={transactions}
        renderItem={({item}) => (
          <View style={styles.item}><Text>{item.desc}</Text><Text>{item.amount} ر.ي</Text></View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }
});
