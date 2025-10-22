// URL Resolver Proxy Server for IPTV redirects
const http = require('http');
const url = require('url');

const PORT = 8888;

// Cache for resolved URLs (5 minute TTL)
const urlCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function resolveRedirect(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(targetUrl);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.path,
      method: 'GET',
      headers: {
        'User-Agent': 'IPTVSmarters/1.1.1 (Linux; Android 11) ExoPlayerLib/2.13.2',
        'Accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, */*',
        'Connection': 'keep-alive'
      }
    };

    const req = http.request(options, (res) => {
      // Check for redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : url.resolve(targetUrl, res.headers.location);
        
        console.log(`✅ Redirect: ${targetUrl} -> ${redirectUrl}`);
        resolve(redirectUrl);
      } else if (res.statusCode === 200) {
        console.log(`✅ Direct URL (no redirect): ${targetUrl}`);
        resolve(targetUrl);
      } else {
        console.log(`⚠️  Unexpected status ${res.statusCode} for ${targetUrl}`);
        resolve(targetUrl);
      }
      res.resume(); // Consume response data to free up memory
    });

    req.on('error', (err) => {
      console.error(`❌ Error resolving ${targetUrl}:`, err.message);
      resolve(targetUrl); // Fallback to original URL
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.error(`⏱️  Timeout resolving ${targetUrl}`);
      resolve(targetUrl); // Fallback to original URL
    });

    req.end();
  });
}

// Create proxy server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const targetUrl = parsedUrl.query.url;

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing url parameter');
    return;
  }

  console.log(`\n🔍 Resolving: ${targetUrl}`);

  // Check cache first
  const cached = urlCache.get(targetUrl);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log(`📦 Cache hit: ${cached.url}`);
    res.writeHead(302, { 'Location': cached.url });
    res.end();
    return;
  }

  // Resolve the URL
  try {
    const resolvedUrl = await resolveRedirect(targetUrl);
    
    // Cache the result
    urlCache.set(targetUrl, {
      url: resolvedUrl,
      timestamp: Date.now()
    });

    // Redirect to the resolved URL
    res.writeHead(302, { 'Location': resolvedUrl });
    res.end();
  } catch (err) {
    console.error('❌ Resolution failed:', err);
    res.writeHead(302, { 'Location': targetUrl });
    res.end();
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 IPTV URL Resolver Proxy running on http://127.0.0.1:${PORT}`);
  console.log(`📺 Usage: http://127.0.0.1:${PORT}/?url=YOUR_STREAM_URL`);
  console.log(`\nReady to resolve IPTV redirects! 🎬\n`);
});

// Clean cache every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of urlCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      urlCache.delete(key);
    }
  }
}, 60000);
