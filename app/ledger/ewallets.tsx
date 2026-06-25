import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EWallet {
  id: string;
  name: string;
  provider: string;
  phone: string;
  balance: number;
}

export default function EWalletsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [wallets, setWallets] = useState<EWallet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const providers = ['محفظة يمن موبايل', 'محفظة سبأفون', 'محفظة يمن فون', 'محفظة عدن نت'];

  const addWallet = () => {
    const newWallet: EWallet = {
      id: Date.now().toString(),
      name: 'محفظة جديدة ' + (wallets.length + 1),
      provider: providers[Math.floor(Math.random() * providers.length)],
      phone: '',
      balance: 0,
    };
    setWallets([...wallets, newWallet]);
  };

  const filteredWallets = wallets.filter(w => w.name.includes(searchQuery));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>المحافظ الإلكترونية</Text>
        <TouchableOpacity onPress={addWallet} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 بحث عن محفظة..."
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>إجمالي أرصدة المحافظ</Text>
        <Text style={styles.summaryValue}>
          {wallets.reduce((sum, w) => sum + w.balance, 0).toLocaleString()} ﷼
        </Text>
      </View>

      {filteredWallets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📱</Text>
          <Text style={styles.emptyTitle}>لا توجد محافظ</Text>
          <Text style={styles.emptyDesc}>اضغط + لإضافة محفظة جديدة</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWallets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <Text style={styles.walletIcon}>📱</Text>
                <View style={styles.walletInfo}>
                  <Text style={styles.walletName}>{item.name}</Text>
                  <Text style={styles.provider}>{item.provider}</Text>
                  <Text style={styles.phone}>{item.phone || 'لا يوجد رقم'}</Text>
                </View>
                <Text style={[styles.balance, { color: item.balance >= 0 ? '#10B981' : '#EF4444' }]}>
                  {item.balance.toLocaleString()} ﷼
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backBtn: { fontSize: 28, color: '#D4AF37', fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#D4AF37' + '20', justifyContent: 'center', alignItems: 'center',
  },
  addBtnText: { fontSize: 24, color: '#D4AF37', fontWeight: 'bold' },
  searchInput: {
    marginHorizontal: 20, marginBottom: 16, padding: 14,
    backgroundColor: '#16213E', borderRadius: 12, color: '#FFFFFF',
    borderWidth: 1, borderColor: '#2a3550', textAlign: 'right',
  },
  summaryCard: {
    marginHorizontal: 20, marginBottom: 16, padding: 20,
    backgroundColor: '#16213E', borderRadius: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#2a3550',
  },
  summaryLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  summaryValue: { color: '#D4AF37', fontSize: 28, fontWeight: 'bold' },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptyDesc: { color: '#94a3b8', fontSize: 14 },
  walletCard: {
    marginHorizontal: 20, marginBottom: 10, padding: 16,
    backgroundColor: '#16213E', borderRadius: 16,
    borderWidth: 1, borderColor: '#2a3550',
  },
  walletHeader: { flexDirection: 'row', alignItems: 'center' },
  walletIcon: { fontSize: 32, marginRight: 12 },
  walletInfo: { flex: 1 },
  walletName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  provider: { color: '#D4AF37', fontSize: 12, marginBottom: 2 },
  phone: { color: '#94a3b8', fontSize: 12 },
  balance: { fontSize: 18, fontWeight: 'bold' },
});
