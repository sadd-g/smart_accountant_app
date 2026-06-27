import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import SmartToolbar from './SmartToolbar';

export default function UniversalTemplate({ title, children }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>{title}</Text></View>
      <SmartToolbar onAction={(action) => alert('تم الضغط على: ' + action)} />
      <ScrollView style={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, backgroundColor: '#0A1128', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 10 }
});
