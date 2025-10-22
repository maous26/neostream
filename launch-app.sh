#!/bin/bash

# Script de lancement rapide pour NeoStream
echo "🚀 Lancement de NeoStream..."

# Configuration des chemins Android
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Vérifie si l'appareil est connecté
if ! adb devices | grep -q "device$"; then
    echo "❌ Aucun appareil Android connecté"
    echo "💡 Assurez-vous que votre Android TV est connecté"
    exit 1
fi

# Lance l'application
adb shell am start -n com.neostream/.MainActivity

echo "✅ Application lancée!"
echo ""
echo "💡 Astuces:"
echo "   - Utilisez les flèches de la télécommande pour naviguer"
echo "   - Le clavier Android devrait s'afficher automatiquement"
echo "   - Utilisez ./adb-input-text.sh pour envoyer du texte depuis votre ordinateur"
