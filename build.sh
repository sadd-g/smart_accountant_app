#!/usr/bin/env bash

echo "🚀 بدء بناء تطبيق الأندرويد..."
echo "================================"

npx eas-cli build --platform android --profile preview --non-interactive

echo "✅ اكتمل البناء!"
