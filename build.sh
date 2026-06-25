#!/bin/bash

echo "🏗️ بدء بناء تطبيق دفتر المحاسب الذكي..."
echo "========================================"

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# الدخول لمجلد التطبيق
cd artifacts/smart-accountant

echo -e "${YELLOW}1. تثبيت التبعيات...${NC}"
npm install --legacy-peer-deps

echo -e "${YELLOW}2. تنظيف المشروع...${NC}"
rm -rf node_modules/.cache .expo dist

echo -e "${YELLOW}3. بناء تطبيق الأندرويد...${NC}"
npx eas-cli build --platform android --profile production --non-interactive

echo -e "${YELLOW}4. بناء تطبيق iOS...${NC}"
npx eas-cli build --platform ios --profile production --non-interactive

echo -e "${YELLOW}5. تصدير نسخة الويب...${NC}"
npx expo export --platform web

echo -e "${GREEN}✅ تم الانتهاء من البناء!${NC}"
echo "========================================"
echo "📱 الملفات موجودة في مجلد dist"
