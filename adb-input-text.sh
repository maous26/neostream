#!/bin/bash

# Script pour envoyer du texte vers Android TV via ADB
# Usage: ./adb-input-text.sh "votre texte ici"

# Configuration Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

if [ -z "$1" ]; then
    echo "❌ Usage: $0 \"texte à envoyer\""
    echo ""
    echo "📖 Exemples:"
    echo "   $0 \"http://exemple.com/playlist.m3u\""
    echo "   $0 \"username123\""
    echo "   $0 \"password456\""
    exit 1
fi

# Vérifie si ADB est disponible
if ! command -v adb &> /dev/null; then
    echo "❌ ADB n'est pas installé ou pas dans le PATH"
    echo "💡 Installez Android SDK Platform Tools"
    exit 1
fi

# Vérifie si un appareil est connecté
DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)
if [ "$DEVICES" -eq 0 ]; then
    echo "❌ Aucun appareil Android connecté"
    echo "💡 Lancez l'émulateur Android TV"
    exit 1
fi

echo "📱 Envoi du texte vers Android TV..."
echo "📝 Texte: $1"

# Remplace les espaces par %s et caractères spéciaux pour ADB
TEXT=$(echo "$1" | sed 's/ /%s/g' | sed 's/:/\\:/g')

# Envoie le texte
adb shell input text "$TEXT"

echo "✅ Texte envoyé avec succès!"
echo ""
echo "💡 Prochaines étapes:"
echo "   1. Utilisez les flèches ↓ pour passer au champ suivant"
echo "   2. Appuyez sur OK pour valider"
echo ""
echo "📌 Commandes utiles:"
echo "   - Passer au champ suivant: adb shell input keyevent KEYCODE_TAB"
echo "   - Valider/OK: adb shell input keyevent KEYCODE_ENTER"
echo "   - Retour: adb shell input keyevent KEYCODE_BACK"
