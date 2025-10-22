#!/bin/bash

echo "🎬 Video Playback Test - Monitoring URL Resolution"
echo "=================================================="
echo ""
echo "📺 Please select a channel on your emulator NOW"
echo ""
echo "Monitoring logs for:"
echo "  • 🔎 URL resolution (HEAD/GET requests)"
echo "  • 🍪 Cookie capture"
echo "  • 🌐 Final resolved URL"
echo "  • ▶️ Video playback start"
echo "  • ❌ Any errors"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Monitor logs in real-time
~/Library/Android/sdk/platform-tools/adb logcat -c
~/Library/Android/sdk/platform-tools/adb logcat | grep -E "(🔎|🍪|🌐|▶️|❌|PlayerScreen|Résolution|URL|Cookie|Hop|Follow|status|redirect|Error)" --color=auto
