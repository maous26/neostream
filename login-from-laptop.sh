#!/bin/bash

# Script interactif pour se connecter à NeoStream depuis votre laptop
# Permet de taper sur votre clavier et d'envoyer vers Android TV

export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "🖥️  NeoStream - Connexion depuis votre Laptop"
echo "=============================================="
echo ""

# Vérifie la connexion ADB
if ! adb devices | grep -q "device$"; then
    echo "❌ Android TV non connecté"
    exit 1
fi

echo "✅ Android TV connecté"
echo ""

# Demande l'URL M3U
echo "🔗 Entrez votre URL M3U:"
read -r m3u_url

if [ -z "$m3u_url" ]; then
    echo "❌ URL M3U requise"
    exit 1
fi

# Demande le username (optionnel)
echo ""
echo "👤 Nom d'utilisateur (optionnel, appuyez sur Entrée pour ignorer):"
read -r username

# Demande le password (optionnel)
echo ""
echo "🔒 Mot de passe (optionnel, appuyez sur Entrée pour ignorer):"
read -rs password
echo ""

# Lance l'application
echo ""
echo "🚀 Lancement de l'application..."
adb shell am start -n com.neostream/.MainActivity
sleep 2

# Focus sur le premier champ (URL M3U)
echo "📝 Remplissage du champ URL M3U..."
adb shell input tap 540 400  # Tap sur le champ URL
sleep 1

# Envoie l'URL M3U
M3U_ESCAPED=$(echo "$m3u_url" | sed 's/ /%s/g' | sed 's/:/\\:/g' | sed 's/\//\\\//g')
adb shell input text "$M3U_ESCAPED"
sleep 1

# Passe au champ suivant si username fourni
if [ -n "$username" ]; then
    echo "👤 Remplissage du nom d'utilisateur..."
    adb shell input keyevent KEYCODE_TAB
    sleep 1
    USERNAME_ESCAPED=$(echo "$username" | sed 's/ /%s/g')
    adb shell input text "$USERNAME_ESCAPED"
    sleep 1
fi

# Passe au champ password si fourni
if [ -n "$password" ]; then
    echo "🔒 Remplissage du mot de passe..."
    adb shell input keyevent KEYCODE_TAB
    sleep 1
    PASSWORD_ESCAPED=$(echo "$password" | sed 's/ /%s/g')
    adb shell input text "$PASSWORD_ESCAPED"
    sleep 1
fi

# Navigation vers le bouton de connexion
echo "🎯 Navigation vers le bouton de connexion..."
adb shell input keyevent KEYCODE_TAB
sleep 1
adb shell input keyevent KEYCODE_TAB
sleep 1

echo ""
echo "✅ Formulaire rempli!"
echo ""
echo "📌 Prochaines étapes:"
echo "   1. Appuyez sur OK/Entrée sur votre télécommande pour vous connecter"
echo "   2. Ou tapez cette commande:"
echo "      adb shell input keyevent KEYCODE_ENTER"
echo ""
echo "💡 Pour vous connecter automatiquement, tapez:"
echo "   adb shell input keyevent KEYCODE_ENTER"
