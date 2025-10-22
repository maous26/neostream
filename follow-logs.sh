#!/bin/bash

# Script pour suivre les logs de l'application en temps réel avec filtrage

echo "🔍 Suivi des logs NeoStream..."
echo "================================"
echo ""
echo "Logs des catégories et navigation :"
echo ""

# Suivre les logs avec filtrage pour les informations importantes
adb logcat | grep -E "(Categories|channels|category|Player|navigation|NeoStream|ReactNativeJS)" --color=always

