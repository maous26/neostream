#!/bin/bash

# Script de relance rapide de NeoStream

echo "🚀 NeoStream - Relance Rapide"
echo "=============================="
echo ""

# Vérifier que l'émulateur est connecté
DEVICE=$(~/Library/Android/sdk/platform-tools/adb devices | grep "emulator" | awk '{print $1}')

if [ -z "$DEVICE" ]; then
    echo "❌ Aucun émulateur Android détecté"
    echo "   Lancez d'abord l'émulateur Android TV"
    exit 1
fi

echo "✅ Émulateur détecté: $DEVICE"
echo ""

# Nettoyer le cache Metro
echo "🧹 Nettoyage du cache..."
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null

# Tuer les processus Metro existants
echo "🔄 Arrêt des processus Metro..."
pkill -f "react-native" 2>/dev/null
pkill -f "metro" 2>/dev/null

sleep 2

# Reconstruire et installer l'APK
echo ""
echo "📦 Compilation de l'APK..."
cd "$(dirname "$0")"
npm run android

echo ""
echo "✨ Application lancée!"
echo ""
echo "💡 Commandes utiles:"
echo "   ./follow-logs.sh    - Suivre les logs en temps réel"
echo "   ./view-logs.sh      - Voir tous les logs"
echo ""
