import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.container}>
    <BlurView intensity={80} style={styles.glassHeader}>
      <Text style={styles.headerText}>النظام المحاسبي الذكي</Text>
    </BlurView>
    <View style={styles.content}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  glassHeader: { height: 110, paddingTop: 40, alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#1A2A6C' },
  content: { flex: 1, padding: 20 }
});
