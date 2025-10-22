# 🎬 Video Playback Error Fix

**Error:** `ExoPlaybackException: Source error - Input does not start with the #EXTM3U header`

**Date:** October 22, 2025  
**Status:** 🔧 **FIXING**

---

## 🐛 Problem Analysis

### The Error
```
androidx.media3.exoplayer.ExoPlaybackException: Source error
Caused by: androidx.media3.common.ParserException: 
Input does not start with the #EXTM3U header
```

### What This Means
The video player (ExoPlayer) is trying to play an M3U8 stream, but the URL is NOT returning a valid M3U8 playlist. Instead, it's likely returning:
- ❌ HTML error page
- ❌ Authentication error
- ❌ 404 Not Found
- ❌ Server error message

---

## 🔍 Root Cause

### Current URL Format
```
http://apsmarter.net:80/live/{username}/{password}/{stream_id}.m3u8
```

### Possible Issues

1. **Server Requires Different Format**
   - Some Xtream Codes servers use `/live/` while others use `/hls/`
   - Some require token-based auth instead of username/password in URL

2. **HTTP Redirects Not Followed**
   - Server might return 302 redirect with auth token
   - ExoPlayer doesn't follow redirects automatically

3. **Missing Headers**
   - Server might require specific User-Agent
   - Server might require Referer header

4. **Stream Not Available**
   - Stream ID might be offline/expired
   - Server might be blocking the request

---

## ✅ Fixes Applied

### 1. Added URL Testing
```typescript
const testStreamUrl = async () => {
  // Test URL before playing
  const response = await fetch(channel.url, {
    method: 'HEAD',
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  
  // Check for redirects
  if (response.status === 302 || response.status === 301) {
    const redirectUrl = response.headers.get('location');
    setStreamUrl(redirectUrl); // Use redirected URL
  }
};
```

### 2. Added User-Agent Header
```typescript
<Video
  source={{ 
    uri: streamUrl,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  }}
  ...
/>
```

### 3. Improved Error Messages
```typescript
const handleError = (e: any) => {
  let errorMsg = 'Impossible de lire cette chaîne';
  if (e?.error?.code === '23002') {
    errorMsg = 'Format de stream non supporté (M3U8 invalide)';
  }
  setError(errorMsg);
};
```

### 4. Added Detailed Error Display
- Shows the actual URL being used
- Explains what the error means
- Provides retry button

---

## 🧪 Testing

### Manual Test Script
```bash
./test-stream-url.sh
```

This will:
1. Get a real stream ID from the API
2. Build the stream URL  
3. Test what the server actually returns
4. Check if it's a valid M3U8

### Expected Output
✅ **If working:**
```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=...
http://...
```

❌ **If broken:**
```
<html>
<head><title>404 Not Found</title></head>
...
```

---

## 🔧 Alternative Solutions to Try

### Option 1: Use HLS Instead of Live
Some servers use different endpoints:
```typescript
// Instead of:
/live/{user}/{pass}/{id}.m3u8

// Try:
/hls/{user}/{pass}/{id}.m3u8
// or
/stream/{user}/{pass}/{id}.m3u8
```

### Option 2: Use M3U8 Proxy
Create a proxy that:
1. Fetches the stream with proper auth
2. Returns it with correct headers
3. Handles redirects

### Option 3: Use Different Video Player
Try `react-native-vlc-media-player` or `react-native-video-player` which might handle redirects better.

### Option 4: Token-Based Authentication
Some Xtream Codes servers require getting a play token first:
```typescript
// 1. Get play token
const token = await xtreamService.getPlayToken(streamId);

// 2. Use token in URL
const url = `${baseUrl}/live/token/${token}/${streamId}.m3u8`;
```

---

## 📝 Next Steps

### 1. Test Stream URL
```bash
./test-stream-url.sh
```

This will show us what the server actually returns.

### 2. Based on Results

**If returns HTML:**
- Server is rejecting the request
- Need to check authentication format
- Try different URL format (/hls/ vs /live/)

**If returns 302 redirect:**
- Current fix should work
- Reload app and test again

**If returns 404:**
- Stream ID might be wrong
- Check if channel is actually live
- Try different channel

**If returns valid M3U8:**
- Issue is in the player configuration
- Try adding more headers
- Try different video player library

---

## 🎯 Current Status

✅ **Applied fixes:**
- Added URL redirect handling
- Added User-Agent header
- Improved error messages
- Added URL testing before playback

⏳ **Waiting for:**
- App reload on emulator
- User to test channel selection
- Stream URL test results

---

## 📱 How to Test

1. **Reload the app** (press Menu → Reload)
2. **Select any channel**
3. **Check the logs** - will show:
   - 🧪 Test de l'URL du stream...
   - 📊 Status: 200/302/404
   - 🔀 Redirection details (if any)
4. **Check if video plays** or shows better error

---

## 🚨 If Still Not Working

We'll need to:
1. Check the test script output
2. Try alternative URL formats
3. Contact IPTV provider for correct format
4. Consider using VLC player library instead

---

*Fix in progress - awaiting test results* 🔧
