#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║         📊 NEOSTREAM LIVE LOGS WITH LOGO INTEGRATION 🎨        ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Monitoring logs for:"
echo "  • Channel loading"
echo "  • Logo enrichment"
echo "  • Xtream Codes API calls"
echo "  • Errors and warnings"
echo ""
echo "Press Ctrl+C to stop"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx react-native log-android 2>&1 | grep -E "(Loading|channels|logo|Logo|Enriching|Found|Auth|Error|HomeScreen|XtreamCodes)" --color=auto
