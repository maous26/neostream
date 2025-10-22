#!/bin/bash

echo "🧪 Testing Channel Display with Pagination & Search"
echo "=================================================="
echo ""

# Check if app is running
if ~/Library/Android/sdk/platform-tools/adb devices | grep -q "device$"; then
    echo "✅ Android device connected"
else
    echo "❌ No Android device connected"
    exit 1
fi

echo ""
echo "📱 Reloading app..."
~/Library/Android/sdk/platform-tools/adb shell input keyevent 82
sleep 1
~/Library/Android/sdk/platform-tools/adb shell input tap 540 960

echo ""
echo "⏳ Waiting for app to reload (10 seconds)..."
sleep 10

echo ""
echo "📊 Checking logs for channel loading..."
echo ""

# Check recent logs for channel info
~/Library/Android/sdk/platform-tools/adb logcat -d | grep -E "(channels|Loaded|📺|✅)" | tail -20

echo ""
echo "=================================================="
echo "🎯 What to look for:"
echo "   1. '✅ Loaded XXXX channels' message"
echo "   2. App should show first 100 channels"
echo "   3. Search bar at top with 🔍 icon"
echo "   4. 'Load More' button at bottom if >100 channels"
echo "   5. Info shows: 'Affichage de 100 / XXXX chaînes'"
echo ""
echo "🧪 Manual Tests:"
echo "   1. Scroll through channel list"
echo "   2. Click 'Load More' button"
echo "   3. Type in search bar to filter"
echo "   4. Select a channel to test playback"
echo "=================================================="
