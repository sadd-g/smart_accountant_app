#!/bin/bash

echo "🔍 فحص شامل لمشروع Expo Router..."
echo ""

# 1. التأكد من وجود الملفات الأساسية
FILES=(
  "app/index.tsx"
  "app/_layout.tsx"
  "app/login.tsx"
  "app/(tabs)/_layout.tsx"
  "app/(tabs)/index.tsx"
  "app/not-found.tsx"
  "app/ledger/index.tsx"
  "app/ledger/accounts.tsx"
  "app/ledger/account-groups.tsx"
  "app/ledger/journal-entry.tsx"
  "app/ledger/vouchers.tsx"
  "app/ledger/cash-boxes.tsx"
  "app/ledger/banks.tsx"
  "app/ledger/currencies.tsx"
  "app/ledger/trial-balance.tsx"
  "app/ledger/account-statement.tsx"
  "app/ledger/currency-reports.tsx"
  "app/inventory/index.tsx"
  "app/inventory/suppliers.tsx"
  "app/inventory/warehouses.tsx"
  "app/inventory/items.tsx"
  "app/inventory/purchase-invoice.tsx"
  "app/inventory/inventory-issue.tsx"
  "app/inventory/inventory-receipt.tsx"
  "app/inventory/warehouse-transfer.tsx"
  "app/inventory/units.tsx"
  "app/inventory/categories.tsx"
  "app/inventory/brands.tsx"
  "app/inventory/item-movement.tsx"
  "app/sales/index.tsx"
  "app/sales/customers.tsx"
  "app/sales/sales-invoice.tsx"
  "app/sales/sales-return.tsx"
  "app/sales/reps.tsx"
  "app/sales/summary.tsx"
  "app/sales/quotation.tsx"
  "app/reports/index.tsx"
  "app/settings.tsx"
  "app/owner.tsx"
  "app/voice.tsx"
  "app/about.tsx"
  "app/backup.tsx"
)

MISSING=0
for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "❌ مفقود: $f"
    MISSING=$((MISSING+1))
  fi
done

if [ $MISSING -eq 0 ]; then
  echo "✅ جميع الملفات الأساسية موجودة ($(( ${#FILES[@]} )) ملف)"
else
  echo "❌ عدد الملفات المفقودة: $MISSING"
fi

echo ""

# 2. فحص _layout.tsx
echo "📋 فحص _layout.tsx..."
SCREENS=$(grep -c "Stack.Screen" app/_layout.tsx 2>/dev/null || echo 0)
echo "عدد الشاشات المسجلة: $SCREENS"

# 3. التأكد من عدم وجود +not-found.tsx
if [ -f "app/+not-found.tsx" ]; then
  echo "❌ حذف app/+not-found.tsx (ملف غير صحيح)"
  rm -f app/+not-found.tsx
  echo "✅ تم الحذف"
fi

# 4. التأكد من not-found.tsx
if [ ! -f "app/not-found.tsx" ]; then
  echo "❌ إنشاء app/not-found.tsx"
  cat > app/not-found.tsx << 'EOF'
import { Redirect } from 'expo-router';
export default function NotFound() { return <Redirect href="/(tabs)" />; }
EOF
  echo "✅ تم الإنشاء"
fi

echo ""
echo "✅ اكتمل الفحص"
