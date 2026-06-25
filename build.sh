#!/usr/bin/env bash

echo "🚀 بدء بناء التطبيق..."
echo "================================"

# تنظيف
rm -rf node_modules .expo android

# تثبيت
npm install --legacy-peer-deps

# بناء الأندرويد
npx expo prebuild --platform android

# بناء APK
cd android
echo "sdk.dir=$ANDROID_HOME" > local.properties
./gradlew assembleRelease
cd ..

echo "✅ تم البناء!"
echo "📱 الملف: android/app/build/outputs/apk/release/app-release.apk"
