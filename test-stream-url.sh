#!/bin/bash

# Test Xtream Codes Stream URL

SERVER="http://apsmarter.net:80"
USERNAME="703985977790132"
PASSWORD="1593574628"

echo "🧪 Testing Xtream Codes Stream URL"
echo "=================================="
echo ""

# First, get the stream ID from the API
echo "📡 Fetching channel list..."
RESPONSE=$(curl -s "${SERVER}/player_api.php?username=${USERNAME}&password=${PASSWORD}&action=get_live_streams" | head -1000)

# Extract first stream ID
STREAM_ID=$(echo "$RESPONSE" | grep -o '"stream_id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$STREAM_ID" ]; then
    echo "❌ Could not find stream ID in API response"
    echo "Response preview:"
    echo "$RESPONSE" | head -20
    exit 1
fi

echo "✅ Found stream ID: $STREAM_ID"
echo ""

# Build stream URL
STREAM_URL="${SERVER}/live/${USERNAME}/${PASSWORD}/${STREAM_ID}.m3u8"
echo "🔗 Stream URL: $STREAM_URL"
echo ""

# Test the stream URL
echo "🧪 Testing stream URL..."
echo "========================"
echo ""

# Get response
RESPONSE=$(curl -v "$STREAM_URL" 2>&1 | head -100)

echo "$RESPONSE"
echo ""
echo "========================"
echo ""

# Check if it's a valid M3U8
if echo "$RESPONSE" | grep -q "#EXTM3U"; then
    echo "✅ Valid M3U8 stream!"
else
    echo "❌ NOT a valid M3U8 stream"
    echo ""
    echo "Possible issues:"
    echo "1. Server returning HTML error page"
    echo "2. Authentication failed"
    echo "3. Stream not available"
    echo "4. Wrong URL format"
fi

echo ""
echo "🔍 First 20 lines of response:"
echo "$RESPONSE" | head -20
