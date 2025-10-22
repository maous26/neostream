#!/bin/bash

# Script pour forcer une nouvelle connexion avec les bons paramètres

echo "🔧 NeoStream - Reset Credentials"
echo "=================================="
echo ""

DEVICE=$(~/Library/Android/sdk/platform-tools/adb devices | grep "emulator" | awk '{print $1}')

if [ -z "$DEVICE" ]; then
    echo "❌ Aucun émulateur Android détecté"
    exit 1
fi

echo "📱 Device: $DEVICE"
echo ""

# Clear AsyncStorage pour forcer une nouvelle connexion
echo "🗑️  Effacement des credentials..."
~/Library/Android/sdk/platform-tools/adb shell run-as com.neostream rm -rf /data/data/com.neostream/files/RCTAsyncLocalStorage_V1

echo "✅ Credentials effacés"
echo ""
echo "📝 Au prochain lancement, reconnectez-vous avec:"
echo "   Server: apsmarter.net:80"
echo "   Username: 703985977790132"
echo "   Password: 1593574628"
echo ""
echo "🔄 Relancement de l'app..."

# Relancer l'app
~/Library/Android/sdk/platform-tools/adb shell am force-stop com.neostream
sleep 1
~/Library/Android/sdk/platform-tools/adb shell am start -n com.neostream/.MainActivity

echo ""
echo "✨ App relancée! Reconnectez-vous avec le port :80"
