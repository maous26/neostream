#!/bin/bash

# Test Xtream Codes API
SERVER="apsmarter.net"
USERNAME="703985977790132"
PASSWORD="1593574628"

echo "🔐 Testing Xtream Codes Authentication..."
echo "📡 Server: $SERVER"
echo ""

# Test authentication
echo "1️⃣ Testing authentication..."
curl -s "http://$SERVER/player_api.php?username=$USERNAME&password=$PASSWORD" | python3 -m json.tool
echo ""

# Get live categories
echo "2️⃣ Getting live categories..."
curl -s "http://$SERVER/player_api.php?username=$USERNAME&password=$PASSWORD&action=get_live_categories" | python3 -m json.tool | head -30
echo ""

# Get live streams (first 5)
echo "3️⃣ Getting live channels (sample)..."
curl -s "http://$SERVER/player_api.php?username=$USERNAME&password=$PASSWORD&action=get_live_streams" | python3 -m json.tool | head -50
