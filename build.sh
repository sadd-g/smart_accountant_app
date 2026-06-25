#!/usr/bin/env bash

echo "🚀 بدء تثبيت التبعيات باستخدام yarn..."
yarn install --frozen-lockfile 2>/dev/null || yarn install

echo "✅ تم التثبيت بنجاح!"
