/**
 * Network Optimization - Node.js/Express Server Examples
 * 
 * This file contains server-side implementations for:
 * 1. Critical Rendering Path (Server-side)
 * 2. Minimize HTTP Requests (Batch endpoints)
 * 3. Avoid Redirection (Proper redirects)
 * 4. Resource Hinting (Link headers)
 * 5. Fetch Priority (Preload headers)
 * 6. Early Hints (103 status)
 * 7. HTTP upgrade methods
 * 8. Compression (Brotli/Gzip)
 * 9. HTTP Caching (Cache-Control)
 * 10. Service Worker support
 */

const express = require('express');
const compression = require('compression');
const zlib = require('zlib');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

/* ============================================
   MIDDLEWARE SETUP
   ============================================ */

// Parse JSON bodies
app.use(express.json());

// Serve static files with caching
app.use(express.static('public', {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set immutable for hashed files
    if (filePath.includes('.') && /\.[a-f0-9]{8,}\./.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

/* ============================================
   8. COMPRESSION: BROTLI / GZIP
   ============================================ */

/**
 * Custom compression middleware with Brotli preference
 */
function advancedCompression(req, res, next) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // Skip compression for:
  // - Already compressed files (images, videos, etc.)
  // - Small responses (< 1KB)
  // - Non-text content types
  
  const originalSend = res.send;
  
  res.send = function(body) {
    // Don't compress if already compressed or small
    if (!body || body.length < 1024) {
      return originalSend.call(this, body);
    }
    
    const contentType = res.get('Content-Type') || '';
    const compressibleTypes = [
      'text/', 'application/json', 'application/javascript',
      'application/xml', 'image/svg+xml'
    ];
    
    const isCompressible = compressibleTypes.some(type => 
      contentType.includes(type)
    );
    
    if (!isCompressible) {
      return originalSend.call(this, body);
    }
    
    // Prefer Brotli, fallback to Gzip
    if (acceptEncoding.includes('br')) {
      res.setHeader('Content-Encoding', 'br');
      res.setHeader('Vary', 'Accept-Encoding');
      
      zlib.brotliCompress(Buffer.from(body), {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 4 // 0-11, 4 for dynamic
        }
      }, (err, compressed) => {
        if (err) {
          return originalSend.call(this, body);
        }
        originalSend.call(this, compressed);
      });
    } else if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      
      zlib.gzip(Buffer.from(body), { level: 6 }, (err, compressed) => {
        if (err) {
          return originalSend.call(this, body);
        }
        originalSend.call(this, compressed);
      });
    } else {
      return originalSend.call(this, body);
    }
  };
  
  next();
}

// Use built-in compression middleware (simpler approach)
app.use(compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter
    return compression.filter(req, res);
  }
}));

/**
 * Pre-compressed static files middleware
 * Serves .br or .gz versions if available
 */
function servePreCompressed(staticDir) {
  return (req, res, next) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const filePath = path.join(staticDir, req.path);
    
    // Try Brotli first
    if (acceptEncoding.includes('br')) {
      const brPath = filePath + '.br';
      if (fs.existsSync(brPath)) {
        res.setHeader('Content-Encoding', 'br');
        res.setHeader('Vary', 'Accept-Encoding');
        return res.sendFile(brPath);
      }
    }
    
    // Try Gzip
    if (acceptEncoding.includes('gzip')) {
      const gzPath = filePath + '.gz';
      if (fs.existsSync(gzPath)) {
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Vary', 'Accept-Encoding');
        return res.sendFile(gzPath);
      }
    }
    
    next();
  };
}

// app.use(servePreCompressed(path.join(__dirname, 'public')));

/* ============================================
   9. HTTP CACHING: CACHE-CONTROL
   ============================================ */

/**
 * Cache Control Middleware
 * Sets appropriate cache headers based on resource type
 */
function cacheControl(options = {}) {
  const {
    // Default cache times by resource type
    html: htmlMaxAge = 0,
    css: cssMaxAge = 31536000, // 1 year
    js: jsMaxAge = 31536000,
    images: imagesMaxAge = 86400, // 1 day
    api: apiMaxAge = 0,
    defaultMaxAge = 3600 // 1 hour
  } = options;
  
  return (req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    
    // Determine cache settings based on file type
    let cacheSettings;
    
    switch (ext) {
      case '.html':
        cacheSettings = `public, max-age=${htmlMaxAge}, must-revalidate`;
        break;
      case '.css':
        cacheSettings = `public, max-age=${cssMaxAge}, immutable`;
        break;
      case '.js':
      case '.mjs':
        cacheSettings = `public, max-age=${jsMaxAge}, immutable`;
        break;
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.webp':
      case '.avif':
      case '.svg':
        cacheSettings = `public, max-age=${imagesMaxAge}`;
        break;
      case '.woff':
      case '.woff2':
      case '.ttf':
      case '.eot':
        cacheSettings = `public, max-age=${cssMaxAge}, immutable`;
        break;
      default:
        // API endpoints
        if (req.path.startsWith('/api')) {
          cacheSettings = `private, max-age=${apiMaxAge}, must-revalidate`;
        } else {
          cacheSettings = `public, max-age=${defaultMaxAge}`;
        }
    }
    
    res.setHeader('Cache-Control', cacheSettings);
    next();
  };
}

app.use(cacheControl());

/**
 * ETag middleware for cache validation
 */
function etagMiddleware() {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      if (body && typeof body === 'string') {
        const hash = crypto
          .createHash('md5')
          .update(body)
          .digest('hex');
        
        const etag = `"${hash}"`;
        res.setHeader('ETag', etag);
        
        // Check If-None-Match header
        const clientEtag = req.headers['if-none-match'];
        if (clientEtag === etag) {
          res.status(304).end();
          return;
        }
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}

app.use(etagMiddleware());

/**
 * Stale-While-Revalidate headers
 */
app.get('/api/data', (req, res) => {
  res.setHeader('Cache-Control', 
    'public, max-age=60, stale-while-revalidate=3600, stale-if-error=86400'
  );
  
  res.json({
    data: 'Fresh data',
    timestamp: Date.now()
  });
});

/* ============================================
   4 & 5. RESOURCE HINTING & FETCH PRIORITY
   ============================================ */

/**
 * Link Header Middleware
 * Adds Link headers for resource hints
 */
function resourceHints(hints) {
  return (req, res, next) => {
    const linkHeaders = hints.map(hint => {
      let link = `<${hint.href}>; rel=${hint.rel}`;
      
      if (hint.as) link += `; as=${hint.as}`;
      if (hint.type) link += `; type="${hint.type}"`;
      if (hint.crossorigin) link += '; crossorigin';
      if (hint.fetchpriority) link += `; fetchpriority=${hint.fetchpriority}`;
      
      return link;
    });
    
    res.setHeader('Link', linkHeaders.join(', '));
    next();
  };
}

// Apply resource hints to HTML pages
app.use('*.html', resourceHints([
  { href: '/fonts/inter.woff2', rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: true },
  { href: '/css/critical.css', rel: 'preload', as: 'style' },
  { href: '/js/app.js', rel: 'preload', as: 'script' },
  { href: 'https://fonts.gstatic.com', rel: 'preconnect', crossorigin: true },
  { href: 'https://api.example.com', rel: 'preconnect', crossorigin: true },
]));

/* ============================================
   6. EARLY HINTS (103 Status Code)
   ============================================ */

/**
 * Early Hints middleware
 * Sends 103 Early Hints before full response
 * Note: Requires HTTP/2 or HTTP/3 and server support
 */
function earlyHints(hints) {
  return (req, res, next) => {
    // Check if server supports writeEarlyHints (Node 18.11+)
    if (typeof res.writeEarlyHints === 'function') {
      const linkHeaders = hints.map(hint => {
        let link = `<${hint.href}>; rel=${hint.rel}`;
        if (hint.as) link += `; as=${hint.as}`;
        if (hint.type) link += `; type="${hint.type}"`;
        if (hint.crossorigin) link += '; crossorigin';
        return link;
      });
      
      res.writeEarlyHints({
        link: linkHeaders
      });
    }
    
    next();
  };
}

// Apply early hints to main pages
app.use('/', earlyHints([
  { href: '/fonts/inter.woff2', rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: true },
  { href: '/css/critical.css', rel: 'preload', as: 'style' },
  { href: '/js/app.js', rel: 'preload', as: 'script' },
]));

/**
 * Simulated Early Hints for CDNs
 * Many CDNs (Cloudflare, Fastly) convert Link headers to 103 Early Hints
 */
app.get('/page-with-early-hints', (req, res) => {
  // CDN will convert these to 103 Early Hints
  res.setHeader('Link', [
    '</fonts/inter.woff2>; rel=preload; as=font; type="font/woff2"; crossorigin',
    '</css/critical.css>; rel=preload; as=style',
    '</images/hero.webp>; rel=preload; as=image; fetchpriority=high',
  ].join(', '));
  
  // Simulate server processing time
  setTimeout(() => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="/css/critical.css">
        </head>
        <body>
          <img src="/images/hero.webp" alt="Hero" fetchpriority="high">
          <script src="/js/app.js"></script>
        </body>
      </html>
    `);
  }, 200); // Browser starts fetching resources during this delay
});

/* ============================================
   3. AVOID REDIRECTIONS
   ============================================ */

/**
 * Proper redirect middleware
 * Uses permanent redirects with proper status codes
 */
const permanentRedirects = {
  '/old-page': '/new-page',
  '/blog': '/articles',
  '/api/v1': '/api/v2',
};

app.use((req, res, next) => {
  const redirect = permanentRedirects[req.path];
  
  if (redirect) {
    // 308 Permanent Redirect (preserves method)
    // or 301 Moved Permanently (may change method)
    return res.redirect(308, redirect);
  }
  
  next();
});

// Trailing slash normalization (avoid redirects)
app.use((req, res, next) => {
  // Remove trailing slash except for root
  if (req.path !== '/' && req.path.endsWith('/')) {
    const query = req.url.slice(req.path.length);
    const safePath = req.path.slice(0, -1).replace(/\/+/g, '/');
    return res.redirect(308, safePath + query);
  }
  next();
});

/* ============================================
   2. MINIMIZE HTTP REQUESTS - Batch Endpoint
   ============================================ */

/**
 * Batch API endpoint
 * Combines multiple API calls into single request
 */
app.post('/api/batch', async (req, res) => {
  const { requests } = req.body;
  
  if (!Array.isArray(requests)) {
    return res.status(400).json({ error: 'Invalid batch request' });
  }
  
  // Limit batch size
  if (requests.length > 20) {
    return res.status(400).json({ error: 'Batch size exceeded (max 20)' });
  }
  
  try {
    const results = await Promise.all(
      requests.map(async (request) => {
        try {
          // Handle internal routing
          const response = await handleInternalRequest(request);
          return { success: true, data: response };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })
    );
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Batch processing failed' });
  }
});

// Helper to handle internal requests
async function handleInternalRequest(request) {
  const { url, method = 'GET', body } = request;
  
  // Route to appropriate handler
  switch (url) {
    case '/api/user':
      return { id: 1, name: 'John' };
    case '/api/products':
      return [{ id: 1, name: 'Product 1' }];
    default:
      throw new Error(`Unknown endpoint: ${url}`);
  }
}

/* ============================================
   1. CRITICAL RENDERING PATH - Server-side
   ============================================ */

/**
 * Critical CSS injection middleware
 * Inlines critical CSS in HTML responses
 */
function injectCriticalCSS(criticalCSS) {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      if (typeof body === 'string' && body.includes('</head>')) {
        // Inject critical CSS before </head>
        body = body.replace(
          '</head>',
          `<style>${criticalCSS}</style></head>`
        );
      }
      return originalSend.call(this, body);
    };
    
    next();
  };
}

const criticalCSS = `
  :root { --primary: #2563eb; --bg: #0f172a; --text: #e2e8f0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); }
  .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
`;

// app.use('*.html', injectCriticalCSS(criticalCSS));

/**
 * Server-side rendering with inline critical resources
 */
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Network Optimized Page</title>
      
      <!-- Critical CSS (inline) -->
      <style>${criticalCSS}</style>
      
      <!-- Preload critical resources -->
      <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
      <link rel="preload" href="/images/hero.webp" as="image" fetchpriority="high">
      
      <!-- Preconnect to third-party origins -->
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      
      <!-- Non-critical CSS (async) -->
      <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
      <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
    </head>
    <body>
      <main class="hero">
        <h1>Network Optimized</h1>
        <img 
          src="/images/hero.webp" 
          alt="Hero" 
          width="800" 
          height="600"
          fetchpriority="high"
          decoding="async"
        >
      </main>
      
      <!-- Non-critical JS (defer) -->
      <script src="/js/app.js" defer></script>
    </body>
    </html>
  `);
});

/* ============================================
   10. SERVICE WORKER SUPPORT
   ============================================ */

// Serve service worker from root
app.get('/sw.js', (req, res) => {
  // Service worker must be served without cache
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/javascript');
  
  res.send(`
    const CACHE_NAME = 'v1';
    const STATIC_ASSETS = [
      '/',
      '/css/main.css',
      '/js/app.js',
      '/fonts/inter.woff2',
      '/offline.html'
    ];
    
    // Install - cache static assets
    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => cache.addAll(STATIC_ASSETS))
          .then(() => self.skipWaiting())
      );
    });
    
    // Activate - clean old caches
    self.addEventListener('activate', (event) => {
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames
              .filter(name => name !== CACHE_NAME)
              .map(name => caches.delete(name))
          );
        }).then(() => self.clients.claim())
      );
    });
    
    // Fetch - implement caching strategy
    self.addEventListener('fetch', (event) => {
      const { request } = event;
      const url = new URL(request.url);
      
      // Different strategies for different resource types
      if (request.destination === 'document') {
        // HTML: Network first, fallback to cache
        event.respondWith(
          fetch(request)
            .then(response => {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, clone);
              });
              return response;
            })
            .catch(() => caches.match(request) || caches.match('/offline.html'))
        );
      } else if (['style', 'script', 'font'].includes(request.destination)) {
        // Static assets: Cache first
        event.respondWith(
          caches.match(request).then(cached => {
            return cached || fetch(request).then(response => {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, clone);
              });
              return response;
            });
          })
        );
      } else if (request.destination === 'image') {
        // Images: Stale while revalidate
        event.respondWith(
          caches.open(CACHE_NAME).then(cache => {
            return cache.match(request).then(cached => {
              const fetchPromise = fetch(request).then(response => {
                cache.put(request, response.clone());
                return response;
              });
              return cached || fetchPromise;
            });
          })
        );
      } else if (url.pathname.startsWith('/api/')) {
        // API: Network only (or implement SWR)
        event.respondWith(fetch(request));
      }
    });
    
    // Handle skip waiting message
    self.addEventListener('message', (event) => {
      if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
      }
    });
  `);
});

/* ============================================
   7. HTTP/2 & HTTP/3 SETUP
   ============================================ */

// HTTP/2 Server Setup (requires SSL certificates)
/*
const http2 = require('http2');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem'),
  allowHTTP1: true // Fallback for clients that don't support HTTP/2
};

const server = http2.createSecureServer(options, app);

// HTTP/2 Server Push
app.get('/page-with-push', (req, res) => {
  // Push critical resources
  if (res.push) {
    res.push('/css/critical.css', {
      request: { accept: 'text/css' },
      response: { 'content-type': 'text/css' }
    }).end(fs.readFileSync('./public/css/critical.css'));
    
    res.push('/js/app.js', {
      request: { accept: 'application/javascript' },
      response: { 'content-type': 'application/javascript' }
    }).end(fs.readFileSync('./public/js/app.js'));
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="/css/critical.css">
      </head>
      <body>
        <h1>Page with HTTP/2 Server Push</h1>
        <script src="/js/app.js"></script>
      </body>
    </html>
  `);
});

server.listen(443, () => {
  console.log('HTTP/2 Server running on port 443');
});
*/

// HTTP/3 setup typically requires:
// - QUIC-enabled reverse proxy (e.g., Cloudflare, nginx with quic)
// - Alt-Svc header to advertise HTTP/3 support

app.use((req, res, next) => {
  // Advertise HTTP/3 support (for CDN/proxy)
  res.setHeader('Alt-Svc', 'h3=":443"; ma=86400');
  next();
});

/* ============================================
   DIAGNOSTIC ENDPOINTS
   ============================================ */

// Endpoint to check caching headers
app.get('/api/check-cache/:url', async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.url);
    const response = await fetch(url, { method: 'HEAD' });
    
    res.json({
      url,
      cacheControl: response.headers.get('cache-control'),
      etag: response.headers.get('etag'),
      lastModified: response.headers.get('last-modified'),
      expires: response.headers.get('expires'),
      contentEncoding: response.headers.get('content-encoding'),
      contentLength: response.headers.get('content-length')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compression test endpoint
app.get('/api/compression-test', (req, res) => {
  // Generate large JSON response
  const largeData = {
    message: 'This is a test for compression',
    data: Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: 'A longer description to make the response larger'
    }))
  };
  
  res.json(largeData);
});

/* ============================================
   START SERVER
   ============================================ */

app.listen(PORT, () => {
  console.log(`
    🚀 Network Optimization Server running on port ${PORT}
    
    Endpoints:
    - GET  /                    - Main page with optimizations
    - GET  /sw.js               - Service worker
    - POST /api/batch           - Batch API requests
    - GET  /api/data            - Cached API endpoint
    - GET  /api/compression-test - Test compression
    - GET  /page-with-early-hints - Early hints demo
    
    Features enabled:
    ✅ Compression (Brotli/Gzip)
    ✅ Cache-Control headers
    ✅ ETag validation
    ✅ Resource hints (Link headers)
    ✅ Service Worker support
    ✅ Redirect handling (308)
    ✅ Batch API endpoint
  `);
});

module.exports = app;
