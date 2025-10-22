// Quick script to resolve redirected URLs
const http = require('http');
const https = require('https');

function resolveRedirectUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'IPTVSmarters/1.1.1 (Linux; Android 11) ExoPlayerLib/2.13.2',
        'Accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, */*',
        'Connection': 'keep-alive'
      }
    };
    
    const req = lib.request(url, options, (res) => {
      console.log('Status:', res.statusCode);
      console.log('Headers:', JSON.stringify(res.headers, null, 2));
      
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('✅ Redirected to:', res.headers.location);
        resolve(res.headers.location);
      } else if (res.statusCode === 200) {
        console.log('✅ Direct URL (no redirect)');
        resolve(url);
      } else {
        reject(new Error(`Unexpected status: ${res.statusCode}`));
      }
      
      // Don't read body, just close
      res.resume();
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

// Test with a channel URL
const testUrl = 'http://apsmarter.net:80/live/703985977790132/1593574628/7819.m3u8';

console.log('🔎 Resolving:', testUrl);
resolveRedirectUrl(testUrl)
  .then(finalUrl => {
    console.log('\n🌐 Final URL to use in app:');
    console.log(finalUrl);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });
