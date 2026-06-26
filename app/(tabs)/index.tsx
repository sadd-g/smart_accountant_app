import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mainCards = [
    { icon: '📚', label: 'دفتر الأستاذ العام', desc: 'الحسابات، القيود، السندات، البنوك', color: '#D4AF37', route: '/ledger/accounts' },
    { icon: '📦', label: 'المخزون والمشتريات', desc: 'الموردين، الأصناف، المستودعات، الفواتير', color: '#3B82F6', route: '/inventory/items' },
    { icon: '💰', label: 'المبيعات والعملاء', desc: 'الفواتير، العملاء، المندوبين، المرتجعات', color: '#10B981', route: '/sales/customers' },
    { icon: '📊', label: 'التقارير والتنبيهات', desc: 'جميع التقارير المالية والإحصائية', color: '#7C3AED', route: '/reports/index' },
  ];

  const quickActions = [
    { icon: '📄', label: 'فاتورة مبيعات', route: '/sales/sales-invoice', color: '#10B981' },
    { icon: '📋', label: 'فاتورة مشتريات', route: '/inventory/purchase-invoice', color: '#3B82F6' },
    { icon: '📝', label: 'قيد يومية', route: '/ledger/journal-entry', color: '#7C3AED' },
    { icon: '🧾', label: 'سند قبض/صرف', route: '/ledger/vouchers', color: '#D4AF37' },
  ];

  const allMenuItems = [
    { section: '📚 دفتر الأستاذ العام', items: [
      { label: 'دليل الحسابات', route: '/ledger/accounts' },
      { label: 'مجموعات الحسابات', route: '/ledger/account-groups' },
      { label: 'القيود اليومية', route: '/ledger/journal-entry' },
      { label: 'سندات القبض والصرف', route: '/ledger/vouchers' },
      { label: 'الصناديق', route: '/ledger/cash-boxes' },
      { label: 'البنوك والمحافظ', route: '/ledger/banks' },
      { label: 'العملات', route: '/ledger/currencies' },
      { label: 'ميزان المراجعة', route: '/ledger/trial-balance' },
      { label: 'كشف حساب', route: '/ledger/account-statement' },
    ]},
    { section: '📦 المخزون والمشتريات', items: [
      { label: 'الموردين', route: '/inventory/suppliers' },
      { label: 'المستودعات', route: '/inventory/warehouses' },
      { label: 'الأصناف', route: '/inventory/items' },
      { label: 'فاتورة مشتريات', route: '/inventory/purchase-invoice' },
      { label: 'مرتجع مشتريات', route: '/inventory/purchase-return' },
      { label: 'صرف مخزون', route: '/inventory/inventory-issue' },
      { label: 'توريد مخزون', route: '/inventory/inventory-receipt' },
      { label: 'تحويل مخزني', route: '/inventory/warehouse-transfer' },
      { label: 'جرد مخزون', route: '/inventory/stock-count' },
      { label: 'تسوية مخزون', route: '/inventory/stock-adjustment' },
      { label: 'وحدات القياس', route: '/inventory/units' },
      { label: 'الفئات', route: '/inventory/categories' },
      { label: 'الماركات', route: '/inventory/brands' },
      { label: 'تقرير الكميات', route: '/inventory/qty-report' },
      { label: 'تقرير التكاليف', route: '/inventory/cost-report' },
      { label: 'حركة الأصناف', route: '/inventory/item-movement' },
      { label: 'حركة الموردين', route: '/inventory/supplier-movement' },
      { label: 'أصناف بطيئة الحركة', route: '/inventory/slow-moving' },
      { label: 'أصناف منتهية الصلاحية', route: '/inventory/expired' },
    ]},
    { section: '💰 المبيعات والعملاء', items: [
      { label: 'العملاء', route: '/sales/customers' },
      { label: 'مجموعات العملاء', route: '/sales/customer-groups' },
      { label: 'فاتورة مبيعات', route: '/sales/sales-invoice' },
      { label: 'مرتجع مبيعات', route: '/sales/sales-return' },
      { label: 'عرض سعر', route: '/sales/quotation' },
      { label: 'مندوبي المبيعات', route: '/sales/reps' },
      { label: 'ملخص المبيعات', route: '/sales/summary' },
      { label: 'مبيعات العملاء', route: '/sales/customer-sales' },
      { label: 'مبيعات الأصناف', route: '/sales/item-sales' },
      { label: 'أداء المندوبين', route: '/sales/rep-performance' },
    ]},
    { section: '📊 التقارير والتنبيهات', items: [
      { label: 'جميع التقارير المالية', route: '/reports/index' },
      { label: 'ميزان المراجعة', route: '/ledger/trial-balance' },
      { label: 'الأستاذ العام', route: '/ledger/general-ledger' },
      { label: 'كشف حساب', route: '/ledger/account-statement' },
      { label: 'تقارير العملات', route: '/ledger/currency-reports' },
      { label: 'حركة الأصناف', route: '/inventory/item-movement' },
      { label: 'تقرير الجرد', route: '/inventory/stock-count' },
    ]},
    { section: '⚙️ النظام', items: [
      { label: 'الإعدادات', route: '/settings' },
      { label: 'لوحة تحكم المالك', route: '/owner' },
      { label: 'الأوامر الصوتية', route: '/voice' },
      { label: 'النسخ الاحتياطي', route: '/backup' },
      { label: 'حول التطبيق', route: '/about' },
      { label: 'تسجيل الخروج', route: '/login' },
    ]},
  ];

  const filteredMenu = allMenuItems.map(section => ({
    ...section,
    items: section.items.filter(item => item.label.includes(searchQuery))
  })).filter(section => section.items.length > 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View><Text style={styles.welcome}>💎 دفتر المحاسب الذكي</Text><Text style={styles.subtitle}>النظام المحاسبي المتكامل</Text></View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setShowMenu(true)}><Text style={styles.menuBtnText}>📋</Text></TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/settings')}><Text style={styles.menuBtnText}>⚙️</Text></TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsGrid}>
          {mainCards.map((card, i) => (
            <TouchableOpacity key={i} style={[styles.mainCard, { borderLeftColor: card.color }]} onPress={() => router.push(card.route as any)}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Text style={styles.cardDesc}>{card.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sectionTitle}>⚡ إجراءات سريعة</Text>
        <View style={styles.quickRow}>
          {quickActions.map((action, i) => (
            <TouchableOpacity key={i} style={styles.quickCard} onPress={() => router.push(action.route as any)}>
              <View style={[styles.quickIcon, { backgroundColor: action.color + '20' }]}><Text style={styles.quickEmoji}>{action.icon}</Text></View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showMenu} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>📋 القائمة الرئيسية</Text><TouchableOpacity onPress={()=>{setShowMenu(false);setSearchQuery('');}}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
          <View style={styles.modalBody}>
            <TextInput style={styles.menuSearch} value={searchQuery} onChangeText={setSearchQuery} placeholder="🔍 بحث في القائمة..." placeholderTextColor="#94a3b8" />
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredMenu.map((section, i) => (
                <View key={i} style={styles.menuSection}>
                  <Text style={styles.menuSectionTitle}>{section.section}</Text>
                  {section.items.map((item, j) => (
                    <TouchableOpacity key={j} style={styles.menuItem} onPress={()=>{setShowMenu(false);setSearchQuery('');router.push(item.route as any);}}>
                      <Text style={styles.menuItemText}>{item.label}</Text><Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A1128'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},welcome:{fontSize:22,fontWeight:'bold',color:'#FFFFFF'},subtitle:{fontSize:12,color:'#D4AF37',marginTop:2},headerButtons:{flexDirection:'row',gap:8},menuBtn:{width:40,height:40,borderRadius:20,backgroundColor:'#16213E',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#2a3550'},menuBtnText:{fontSize:20},content:{flex:1,paddingHorizontal:16},
  cardsGrid:{marginTop:12},mainCard:{backgroundColor:'#16213E',borderRadius:14,padding:16,marginBottom:10,borderLeftWidth:4,borderWidth:1,borderColor:'#2a3550'},cardIcon:{fontSize:28,marginBottom:8},cardLabel:{color:'#FFFFFF',fontSize:16,fontWeight:'bold',marginBottom:4},cardDesc:{color:'#94a3b8',fontSize:11},
  sectionTitle:{fontSize:16,fontWeight:'bold',color:'#D4AF37',marginBottom:10,marginTop:20},quickRow:{flexDirection:'row',gap:8},quickCard:{flex:1,backgroundColor:'#16213E',borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:'#2a3550'},quickIcon:{width:40,height:40,borderRadius:20,justifyContent:'center',alignItems:'center',marginBottom:6},quickEmoji:{fontSize:18},quickLabel:{color:'#FFFFFF',fontSize:10,textAlign:'center'},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},modalContent:{backgroundColor:'#16213E',borderTopLeftRadius:20,borderTopRightRadius:20,maxHeight:'90%'},modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#2a3550'},modalTitle:{color:'#D4AF37',fontSize:18,fontWeight:'bold'},modalClose:{color:'#EF4444',fontSize:22,fontWeight:'bold'},modalBody:{padding:16},
  menuSearch:{backgroundColor:'#0A1128',borderRadius:10,padding:12,color:'#FFFFFF',borderWidth:1,borderColor:'#2a3550',textAlign:'right',fontSize:14,marginBottom:12},menuSection:{marginBottom:16},menuSectionTitle:{color:'#D4AF37',fontSize:14,fontWeight:'bold',marginBottom:8},menuItem:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:12,backgroundColor:'#0A1128',borderRadius:10,marginBottom:4},menuItemText:{color:'#FFFFFF',fontSize:13},menuArrow:{color:'#D4AF37',fontSize:14},
});
