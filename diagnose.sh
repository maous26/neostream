#!/bin/bash

echo "🩺 NeoStream Video Playback Diagnostic"
echo "======================================"
echo ""

# Check app is running
APP_RUNNING=$(~/Library/Android/sdk/platform-tools/adb shell "dumpsys window | grep -i neostream" 2>/dev/null)
if [ -n "$APP_RUNNING" ]; then
    echo "✅ NeoStream app is running"
else
    echo "❌ NeoStream app is NOT running"
    echo "   Starting app..."
    ~/Library/Android/sdk/platform-tools/adb shell am start -n com.neostream/.MainActivity
fi

echo ""
echo "📊 Recent Logs (last 30 lines with relevant info):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
~/Library/Android/sdk/platform-tools/adb logcat -d -s ReactNativeJS:* | grep -E "(PlayerScreen|HomeScreen|channels|Loaded|URL|Error|❌|✅)" | tail -30

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎬 Status Check:"
echo ""

# Check if on HomeScreen
HOME_LOGS=$(~/Library/Android/sdk/platform-tools/adb logcat -d -s ReactNativeJS:* | grep "HomeScreen" | tail -5)
if [ -n "$HOME_LOGS" ]; then
    echo "📱 HomeScreen is visible"
    CHANNEL_COUNT=$(echo "$HOME_LOGS" | grep -o "Loaded [0-9]* channels" | tail -1)
    if [ -n "$CHANNEL_COUNT" ]; then
        echo "   $CHANNEL_COUNT"
    fi
fi

# Check if on PlayerScreen
PLAYER_LOGS=$(~/Library/Android/sdk/platform-tools/adb logcat -d -s ReactNativeJS:* | grep "PlayerScreen" | tail -5)
if [ -n "$PLAYER_LOGS" ]; then
    echo "🎬 PlayerScreen is active"
    echo "   Recent activity:"
    echo "$PLAYER_LOGS" | sed 's/^/   /'
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Next Steps:"
echo ""
if [ -n "$PLAYER_LOGS" ]; then
    echo "   ✓ PlayerScreen is active - check if video is playing"
    echo "   ✓ If not playing, check the error messages above"
    echo "   ✓ Run ./test-video-playback.sh for live monitoring"
else
    echo "   → Navigate to HomeScreen if not there"
    echo "   → Select a channel to test video playback"
    echo "   → Run ./test-video-playback.sh for live monitoring"
fi

echo ""
