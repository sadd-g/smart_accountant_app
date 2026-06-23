import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "../context/AppContext";
import { DatabaseProvider } from "../context/DatabaseContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Notifications */}
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      {/* Ledger */}
      <Stack.Screen name="ledger/index" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/accounts" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/account-groups" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/currencies" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/cash-boxes" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/banks" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/ewallets" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/journal-entry" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/recurring-journal" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/cash-receipt" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/cash-payment" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/bank-receipt" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/bank-payment" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/account-statement" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/trial-balance" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/general-ledger" options={{ headerShown: false }} />
      <Stack.Screen name="ledger/currency-reports" options={{ headerShown: false }} />
      {/* Inventory */}
      <Stack.Screen name="inventory/index" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/items" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/suppliers" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/purchase-invoice" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/warehouses" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/units" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/categories" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/brands" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/purchase-return" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/inventory-issue" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/inventory-receipt" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/warehouse-transfer" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/stock-count" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/stock-adjustment" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/qty-report" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/cost-report" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/item-movement" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/supplier-movement" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/slow-moving" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/expired" options={{ headerShown: false }} />
      {/* Sales */}
      <Stack.Screen name="sales/index" options={{ headerShown: false }} />
      <Stack.Screen name="sales/customers" options={{ headerShown: false }} />
      <Stack.Screen name="sales/reps" options={{ headerShown: false }} />
      <Stack.Screen name="sales/sales-invoice" options={{ headerShown: false }} />
      <Stack.Screen name="sales/sales-return" options={{ headerShown: false }} />
      <Stack.Screen name="sales/quotation" options={{ headerShown: false }} />
      <Stack.Screen name="sales/customer-groups" options={{ headerShown: false }} />
      <Stack.Screen name="sales/customer-sales" options={{ headerShown: false }} />
      <Stack.Screen name="sales/item-sales" options={{ headerShown: false }} />
      <Stack.Screen name="sales/summary" options={{ headerShown: false }} />
      <Stack.Screen name="sales/rep-performance" options={{ headerShown: false }} />
      {/* Reports */}
      <Stack.Screen name="reports/index" options={{ headerShown: false }} />
      <Stack.Screen name="reports/sales-target" options={{ headerShown: false }} />
      {/* Other */}
      <Stack.Screen name="voice" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="owner" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
      <Stack.Screen name="backup" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <DatabaseProvider>
          <RootLayoutNav />
        </DatabaseProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
