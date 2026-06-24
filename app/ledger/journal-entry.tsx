import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useDatabase } from '@/context/DatabaseContext';

export default function JournalEntryScreen() {
  const { addJournalEntry } = useDatabase();
  const [amount, setAmount] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>سند قيد محاسبي (يمني)</Text>
      <TextInput 
        placeholder="المبلغ" 
        keyboardType="numeric" 
        style={styles.input}
        onChangeText={setAmount}
      />
      <Button title="حفظ القيد" onPress={() => {/* هنا سيتم استدعاء addJournalEntry */}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 }
});
