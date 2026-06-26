#!/bin/bash
echo "🔍 ====== فحص شامل للتطبيق ======"
echo ""

ERRORS=0
WARNINGS=0

# 1. فحص الملفات الأساسية
echo "📁 1. فحص الملفات الأساسية..."
for f in app/index.tsx app/_layout.tsx "app/(tabs)/_layout.tsx" "app/(tabs)/index.tsx" app/login.tsx; do
  if [ -f "$f" ]; then echo "   ✅ $f"; else echo "   ❌ $f مفقود"; ERRORS=$((ERRORS+1)); fi
done

# 2. فحص مجلدات الأقسام
echo ""
echo "📁 2. فحص مجلدات الأقسام..."
for dir in ledger inventory sales reports; do
  if [ -d "app/$dir" ]; then
    count=$(ls app/$dir/*.tsx 2>/dev/null | wc -l)
    echo "   ✅ app/$dir/ ($count ملف)"
  else
    echo "   ❌ app/$dir/ مفقود"
    ERRORS=$((ERRORS+1))
  fi
done

# 3. فحص استدعاءات useLocalTable
echo ""
echo "📁 3. فحص استدعاءات useLocalTable..."
grep -rn "useLocalTable" app/ --include="*.tsx" | while read line; do
  table=$(echo "$line" | grep -oP "(?<=useLocalTable\(['\"])[^'\"]*")
  file=$(echo "$line" | cut -d: -f1)
  echo "   📄 $file → $table"
done

# 4. فحص الدوال غير المعرفة
echo ""
echo "📁 4. فحص الدوال المستخدمة..."
grep -rn "formatNumber\|fmtNum\|formatCurrency" app/ --include="*.tsx" && {
  echo "   ⚠️ دوال غير قياسية موجودة"
  WARNINGS=$((WARNINGS+1))
} || echo "   ✅ لا يوجد دوال غير معرفة"

# 5. فحص المسارات
echo ""
echo "📁 5. فحص تطابق المسارات..."
SCREENS=$(grep "name=" app/_layout.tsx | sed 's/.*name="//' | sed 's/".*//' | sort)
ROUTES=$(grep -rn "router.push\|router.replace" app/ --include="*.tsx" | grep -oP "(?<=push\(|replace\()['\"][^'\"]*" | tr -d "'\"" | sed 's|^/||' | sort -u)

echo "   المسارات في _layout.tsx: $(echo "$SCREENS" | wc -l)"
echo "   المسارات المستخدمة: $(echo "$ROUTES" | wc -l)"

# 6. فحص ملفات PickerModal
echo ""
echo "📁 6. فحص PickerModal..."
if [ -f "src/components/ui/PickerModal.tsx" ]; then
  echo "   ✅ PickerModal موجود"
  USES=$(grep -rn "PickerModal" app/ --include="*.tsx" | wc -l)
  echo "   📄 مستخدم في $USES ملف"
else
  echo "   ❌ PickerModal مفقود"
  ERRORS=$((ERRORS+1))
fi

# 7. فحص useLocalStore
echo ""
echo "📁 7. فحص useLocalStore..."
if [ -f "hooks/useLocalStore.ts" ]; then
  echo "   ✅ useLocalStore موجود"
else
  echo "   ❌ useLocalStore مفقود"
  ERRORS=$((ERRORS+1))
fi

echo ""
echo "===== النتيجة ====="
echo "❌ أخطاء: $ERRORS"
echo "⚠️ تحذيرات: $WARNINGS"
echo "✅ اكتمل الفحص"
