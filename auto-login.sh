#!/bin/bash

echo "🤖 Auto-Connexion avec le Port Correct"
echo "======================================="
echo ""

DEVICE=$(~/Library/Android/sdk/platform-tools/adb devices | grep "emulator" | awk '{print $1}')

if [ -z "$DEVICE" ]; then
    echo "❌ Aucun émulateur Android détecté"
    exit 1
fi

echo "📱 Device: $DEVICE"
echo ""

# S'assurer que l'app est sur l'écran de connexion
echo "🔄 Navigation vers l'écran de connexion..."
~/Library/Android/sdk/platform-tools/adb shell am force-stop com.neostream
sleep 1
~/Library/Android/sdk/platform-tools/adb shell am start -n com.neostream/.MainActivity
sleep 3

echo "⌨️  Remplissage automatique des champs..."

# Cliquer sur le premier champ (Server)
~/Library/Android/sdk/platform-tools/adb shell input tap 700 400
sleep 1

# Effacer le contenu
for i in {1..30}; do
    ~/Library/Android/sdk/platform-tools/adb shell input keyevent 67  # DEL
done
sleep 1

# Entrer le serveur AVEC le port
echo "   📝 Serveur: apsmarter.net:80"
~/Library/Android/sdk/platform-tools/adb shell input text "apsmarter.net:80"
sleep 1

# Passer au champ suivant (Username)
~/Library/Android/sdk/platform-tools/adb shell input keyevent 61  # TAB
sleep 1

# Effacer
for i in {1..30}; do
    ~/Library/Android/sdk/platform-tools/adb shell input keyevent 67
done
sleep 1

# Entrer username
echo "   📝 Username: 703985977790132"
~/Library/Android/sdk/platform-tools/adb shell input text "703985977790132"
sleep 1

# Passer au champ password
~/Library/Android/sdk/platform-tools/adb shell input keyevent 61  # TAB
sleep 1

# Effacer
for i in {1..30}; do
    ~/Library/Android/sdk/platform-tools/adb shell input keyevent 67
done
sleep 1

# Entrer password
echo "   📝 Password: 1593574628"
~/Library/Android/sdk/platform-tools/adb shell input text "1593574628"
sleep 1

echo ""
echo "✅ Champs remplis !"
echo ""
echo "🎯 Maintenant, sur la TV, appuyez sur:"
echo "   1. Flèche BAS pour aller au bouton 'Se connecter'"
echo "   2. OK/ENTER pour se connecter"
echo ""
echo "Ou lancez:"
echo "   ~/Library/Android/sdk/platform-tools/adb shell input keyevent 20  # Flèche bas"
echo "   ~/Library/Android/sdk/platform-tools/adb shell input keyevent 66  # Enter"
echo ""
