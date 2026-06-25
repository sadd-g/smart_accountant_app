#!/usr/bin/env bash

echo "🚀 بدء عملية البناء..."
echo "================================"

# تثبيت pnpm عالمياً
echo "📦 تثبيت pnpm..."
npm install -g pnpm

# تثبيت تبعيات المشروع
echo "📦 تثبيت تبعيات المشروع..."
pnpm install --no-frozen-lockfile

# تنظيف الكاش
echo "🧹 تنظيف الكاش..."
rm -rf node_modules/.cache .expo

# بناء للأندرويد
echo "📱 بناء تطبيق الأندرويد..."
npx eas-cli build --platform android --profile preview --non-interactive

echo "✅ اكتمل البناء بنجاح!"
