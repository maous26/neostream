#!/bin/bash

echo "🚪 Déconnexion de NeoStream"
echo "============================"
echo ""

# Vérifier que l'émulateur est connecté
DEVICE=$(~/Library/Android/sdk/platform-tools/adb devices | grep "emulator" | awk '{print $1}')

if [ -z "$DEVICE" ]; then
    echo "❌ Aucun émulateur Android détecté"
    exit 1
fi

echo "📱 Device: $DEVICE"
echo ""

# Ouvrir l'app sur l'écran de connexion en utilisant Intent
echo "🔄 Retour à l'écran de connexion..."

# Méthode 1: Effacer les credentials AsyncStorage
~/Library/Android/sdk/platform-tools/adb shell run-as com.neostream rm -rf /data/data/com.neostream/files/RCTAsyncLocalStorage_V1 2>/dev/null

# Méthode 2: Forcer la fermeture et relancer l'app
~/Library/Android/sdk/platform-tools/adb shell am force-stop com.neostream
sleep 1
~/Library/Android/sdk/platform-tools/adb shell am start -n com.neostream/.MainActivity

echo ""
echo "✅ App relancée"
echo ""
echo "📝 Sur l'écran de connexion, vérifiez que le serveur est:"
echo "   apsmarter.net:80  (AVEC le port :80)"
echo ""
echo "   Si ce n'est pas le cas, ajoutez :80 à la fin"
echo ""
