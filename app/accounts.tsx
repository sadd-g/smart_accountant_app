import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadows } from '../src/theme/colors';

// هيكل الحساب
interface Account {
  id: string;
  code: string;
  name: string;
  type: 'أصل' | 'خصم' | 'ملكية' | 'إيراد' | 'مصروف';
  balance: number;
}

export default function GeneralLedgerScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('الكل');

  const accountTypes = ['الكل', 'أصل', 'خصم', 'ملكية', 'إيراد', 'مصروف'];

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

  const addAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'إضافة حساب جديد',
      'سيتم إضافة حساب جديد فارغ',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'إضافة', 
          onPress: () => {
            const newAccount: Account = {
              id: Date.now().toString(),
              code: `${1000 + accounts.length + 1}`,
              name: 'حساب جديد',
              type: 'أصل',
              balance: 0,
            };
            setAccounts([...accounts, newAccount]);
          }
        },
      ]
    );
  };

  const renderAccount = ({ item }: { item: Account }) => (
    <TouchableOpacity 
      style={styles.accountCard}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={styles.accountGradient}
      >
        <View style={styles.accountHeader}>
          <View>
            <Text style={styles.accountCode}>{item.code}</Text>
            <Text style={styles.accountName}>{item.name}</Text>
          </View>
          <View style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(item.type) + '30' }
          ]}>
            <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
              {item.type}
            </Text>
          </View>
        </View>
        <View style={styles.accountFooter}>
          <Text style={styles.balanceLabel}>الرصيد</Text>
          <Text style={[
            styles.balanceValue,
            { color: item.balance >= 0 ? Colors.status.success : Colors.status.error }
          ]}>
            {item.balance.toLocaleString()} ﷼
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'أصل': return Colors.primary.gold;
      case 'خصم': return Colors.status.error;
      case 'ملكية': return Colors.status.info;
      case 'إيراد': return Colors.status.success;
      case 'مصروف': return Colors.status.warning;
      default: return Colors.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={Colors.gradients.dark}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>دفتر الأستاذ العام</Text>
        <TouchableOpacity onPress={addAccount}>
          <Text style={styles.addButton}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      {/* شريط البحث */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 بحث عن حساب..."
          placeholderTextColor={Colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* تصنيف الحسابات */}
      <View style={styles.filterContainer}>
        {accountTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              selectedType === type && styles.filterButtonActive,
            ]}
            onPress={() => {
              setSelectedType(type);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[
              styles.filterText,
              selectedType === type && styles.filterTextActive,
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* الملخص */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>مدين</Text>
          <Text style={[styles.summaryValue, { color: Colors.status.success }]}>
            {totalDebit.toLocaleString()} ﷼
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>دائن</Text>
          <Text style={[styles.summaryValue, { color: Colors.status.error }]}>
            {totalCredit.toLocaleString()} ﷼
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>الفرق</Text>
          <Text style={[styles.summaryValue, { color: Colors.primary.gold }]}>
            {(totalDebit - totalCredit).toLocaleString()} ﷼
          </Text>
        </View>
      </View>

      {/* قائمة الحسابات */}
      {filteredAccounts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>لا توجد حسابات</Text>
          <Text style={styles.emptySubtext}>اضغط على + لإضافة حساب جديد</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAccounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    color: Colors.primary.gold,
    fontSize: 16,
  },
  headerTitle: {
    color: Colors.text.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    color: Colors.status.success,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInput: {
    backgroundColor: Colors.ui.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text.white,
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.ui.glass,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary.gold + '30',
  },
  filterText: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  filterTextActive: {
    color: Colors.primary.gold,
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.ui.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.ui.border,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  accountCard: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.small,
  },
  accountGradient: {
    padding: Spacing.md,
    backgroundColor: Colors.ui.card,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  accountCode: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  accountName: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    color: Colors.text.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
});
