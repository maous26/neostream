#!/bin/bash

# Script de test pour vérifier l'URL M3U

export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "🧪 Test de connexion M3U"
echo "========================"
echo ""

# Test 1: Vérifier la connectivité réseau
echo "1️⃣ Test de connectivité réseau..."
if curl -s --connect-timeout 5 http://google.com > /dev/null; then
    echo "✅ Internet fonctionne"
else
    echo "❌ Pas d'accès Internet"
    exit 1
fi

# Test 2: Tester l'URL M3U
echo ""
echo "2️⃣ Test de l'URL M3U..."
read -p "Entrez votre URL M3U complète: " m3u_url

if [ -z "$m3u_url" ]; then
    echo "❌ URL vide"
    exit 1
fi

echo "📡 Test de connexion à: $m3u_url"
echo ""

# Test avec curl
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$m3u_url")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ URL accessible (HTTP $HTTP_STATUS)"
    
    # Télécharge un échantillon
    echo ""
    echo "📄 Aperçu du contenu:"
    curl -s "$m3u_url" | head -20
    
elif [ "$HTTP_STATUS" = "000" ]; then
    echo "❌ Connexion impossible"
    echo "💡 L'URL n'est pas accessible. Vérifiez:"
    echo "   - L'URL est correcte et complète"
    echo "   - Vous avez accès au serveur IPTV"
    echo "   - Le serveur IPTV est en ligne"
else
    echo "⚠️  HTTP $HTTP_STATUS"
    echo "💡 Le serveur répond mais avec un code d'erreur"
fi

echo ""
echo "💡 Format d'URL attendu:"
echo "   ✅ http://exemple.com/get.php?username=XX&password=XX&type=m3u"
echo "   ✅ http://exemple.com/playlist.m3u"
echo "   ❌ http://exemple.com (incomplet)"
echo ""
echo "📖 Si votre URL fonctionne, vous pouvez l'utiliser dans l'app!"
