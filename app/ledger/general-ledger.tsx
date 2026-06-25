import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import colors from '../../constants/colors';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
}

export default function GeneralLedgerScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('الكل');

  const accountTypes = ['الكل', 'أصل', 'خصم', 'ملكية', 'إيراد', 'مصروف'];

  const addAccount = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
      code: `${1000 + accounts.length + 1}`,
      name: 'حساب جديد ' + (accounts.length + 1),
      type: 'أصل',
      balance: 0,
    };
    setAccounts([...accounts, newAccount]);
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'أصل': return '#D4AF37';
      case 'خصم': return '#EF4444';
      case 'ملكية': return '#3B82F6';
      case 'إيراد': return '#10B981';
      case 'مصروف': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.includes(searchQuery) || acc.code.includes(searchQuery);
    const matchesType = selectedType === 'الكل' || acc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalDebit = filteredAccounts
    .filter(a => ['أصل', 'مصروف'].includes(a.type))
    .reduce((sum, a) => sum + a.balance, 0);

  const totalCredit = filteredAccounts
    .filter(a => ['خصم', 'ملكية', 'إيراد'].includes(a.type))
    .reduce((sum, a) => sum + a.balance, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backBtn, { color: theme.accent }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>دفتر الأستاذ العام</Text>
        <TouchableOpacity onPress={addAccount} style={[styles.addBtn, { backgroundColor: theme.accent + '20' }]}>
          <Text style={[styles.addBtnText, { color: theme.accent }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* البحث */}
      <TextInput
        style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder="🔍 بحث..."
        placeholderTextColor={theme.mutedForeground}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* الفلاتر */}
      <View style={styles.filterRow}>
        {accountTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterBtn,
              { backgroundColor: selectedType === type ? theme.accent + '30' : theme.card, borderColor: theme.border },
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[styles.filterText, { color: selectedType === type ? theme.accent : theme.mutedForeground }]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ملخص المدين والدائن */}
      <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>مدين</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>{totalDebit.toLocaleString()}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>دائن</Text>
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{totalCredit.toLocaleString()}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>الفرق</Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>{(totalDebit - totalCredit).toLocaleString()}</Text>
        </View>
      </View>

      {/* قائمة الحسابات */}
      {filteredAccounts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>لا توجد حسابات</Text>
          <Text style={[styles.emptySubtext, { color: theme.mutedForeground }]}>اضغط + لإضافة حساب</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAccounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.accountCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.accountCode, { color: theme.mutedForeground }]}>{item.code}</Text>
                  <Text style={[styles.accountName, { color: theme.text }]}>{item.name}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                  <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>{item.type}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={[styles.balanceLabel, { color: theme.mutedForeground }]}>الرصيد</Text>
                <Text style={[styles.balanceValue, { color: item.balance >= 0 ? '#10B981' : '#EF4444' }]}>
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  backBtn: { fontSize: 28, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold' },
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { fontSize: 24, fontWeight: 'bold' },
  searchInput: {
    marginHorizontal: 20, marginBottom: 12, padding: 14,
    borderRadius: 12, borderWidth: 1, textAlign: 'right', fontSize: 16,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, gap: 6 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  filterText: { fontSize: 12 },
  summary: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    borderRadius: 12, borderWidth: 1, padding: 16, justifyContent: 'space-around',
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },
  divider: { width: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubtext: { fontSize: 14 },
  accountCard: {
    marginHorizontal: 20, marginBottom: 10, padding: 16,
    borderRadius: 12, borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  accountCode: { fontSize: 12 },
  accountName: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeText: { fontSize: 10, fontWeight: 'bold' },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  balanceLabel: { fontSize: 12 },
  balanceValue: { fontSize: 18, fontWeight: 'bold' },
});
