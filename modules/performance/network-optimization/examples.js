/**
 * Network Optimization - Quick Reference Examples
 * 
 * For detailed implementations, see:
 * - vanilla-examples.html (Vanilla JS)
 * - react-nextjs-examples.jsx (React/Next.js)
 * - server-examples.js (Node.js/Express)
 * - sw-example.js (Service Worker)
 * 
 * Topics covered:
 * 1. Critical Rendering Path
 * 2. Minimize HTTP Requests
 * 3. Avoid Redirection
 * 4. Resource Hinting
 * 5. Fetch Priority
 * 6. Early Hints
 * 7. HTTP upgrade methods (HTTP/1.1 vs HTTP/2 vs HTTP/3)
 * 8. Compression: Brotli / Gzip
 * 9. HTTP Caching: Cache Control
 * 10. Caching using Service Worker
 */

/* ============================================
   1. CRITICAL RENDERING PATH
   ============================================ */

// ❌ DON'T: Render-blocking CSS in <head>
`<link rel="stylesheet" href="large-stylesheet.css">`;

// ✅ DO: Inline critical CSS, async load non-critical
`<style>/* Critical CSS inline */</style>
<link rel="preload" href="non-critical.css" as="style" onload="this.rel='stylesheet'">`;

// ❌ DON'T: Blocking scripts in <head>
`<script src="app.js"></script>`;

// ✅ DO: Use defer/async for scripts
`<script src="app.js" defer></script>
<script src="analytics.js" async></script>`;

/* ============================================
   2. MINIMIZE HTTP REQUESTS
   ============================================ */

// ❌ DON'T: Multiple separate requests
async function badMultipleRequests() {
  const user = await fetch('/api/user');
  const posts = await fetch('/api/posts');
  const comments = await fetch('/api/comments');
  // 3 separate HTTP requests!
}

// ✅ DO: Batch requests
async function batchedRequests() {
  const response = await fetch('/api/batch', {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        { url: '/api/user' },
        { url: '/api/posts' },
        { url: '/api/comments' }
      ]
    })
  });
  // Single HTTP request!
}

// ✅ DO: Use inline SVGs instead of image requests
const InlineSVG = `
<svg width="24" height="24" viewBox="0 0 24 24">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
</svg>`;

/* ============================================
   3. AVOID REDIRECTION
   ============================================ */

// ❌ DON'T: Chain redirects
// /page → /page/ → /new-page → /new-page/ (4 requests!)

// ✅ DO: Direct links to final URLs
const directLinks = {
  '/old-page': '/new-page',  // Update all internal links
};

// Server-side: Use 308 for permanent redirects
// res.redirect(308, '/new-url');

/* ============================================
   4. RESOURCE HINTING
   ============================================ */

// DNS Prefetch - Resolve DNS early for third-party domains
`<link rel="dns-prefetch" href="//fonts.googleapis.com">`;

// Preconnect - Full connection (DNS + TCP + TLS)
`<link rel="preconnect" href="https://api.example.com" crossorigin>`;

// Preload - High priority current page resource
`<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>`;

// Prefetch - Low priority future navigation
`<link rel="prefetch" href="/about.html">`;

// Dynamic prefetch on hover
function prefetchOnHover(href) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/* ============================================
   5. FETCH PRIORITY
   ============================================ */

// ❌ DON'T: Let browser guess priorities
`<img src="hero.jpg">`;

// ✅ DO: Set explicit priorities
`<img src="hero.jpg" fetchpriority="high" loading="eager">  <!-- LCP image -->
<img src="below-fold.jpg" fetchpriority="low" loading="lazy">`;

// Script priorities
`<script src="critical.js" fetchpriority="high"></script>
<script src="analytics.js" fetchpriority="low" async></script>`;

// Fetch API priority
fetch('/api/critical', { priority: 'high' });
fetch('/api/analytics', { priority: 'low' });

/* ============================================
   6. EARLY HINTS (103 Status)
   ============================================ */

// Server sends 103 BEFORE the full response
// Client starts fetching resources while server prepares response

// Express with Node 18.11+
// res.writeEarlyHints({
//   link: ['</style.css>; rel=preload; as=style']
// });

// CDNs (Cloudflare, Fastly) convert Link headers to 103 Early Hints
// res.setHeader('Link', '</style.css>; rel=preload; as=style');

/* ============================================
   7. HTTP PROTOCOL COMPARISON
   ============================================ */

const protocolComparison = {
  'HTTP/1.1': {
    connections: 'Multiple (6 per domain)',
    multiplexing: false,
    headerCompression: false,
    latency: 'High (head-of-line blocking)'
  },
  'HTTP/2': {
    connections: 'Single multiplexed',
    multiplexing: true,
    headerCompression: 'HPACK',
    latency: 'Lower (but TCP HOL blocking)'
  },
  'HTTP/3': {
    connections: 'QUIC (UDP-based)',
    multiplexing: true,
    headerCompression: 'QPACK',
    latency: 'Lowest (no HOL blocking)',
    bonus: 'Connection migration'
  }
};

// Detect protocol
const protocol = performance.getEntriesByType('navigation')[0]?.nextHopProtocol;
// Returns: 'h2', 'h3', 'http/1.1'

/* ============================================
   8. COMPRESSION
   ============================================ */

// Brotli vs Gzip
const compressionComparison = {
  brotli: {
    ratio: '~80% reduction',
    speed: 'Slower compression',
    support: 'Modern browsers',
    bestFor: 'Static assets (pre-compressed)'
  },
  gzip: {
    ratio: '~70% reduction',
    speed: 'Faster compression',
    support: 'Universal',
    bestFor: 'Dynamic content'
  }
};

// Express compression middleware
// const compression = require('compression');
// app.use(compression());

// Check if response is compressed
function checkCompression() {
  const resources = performance.getEntriesByType('resource');
  resources.forEach(r => {
    const ratio = r.decodedBodySize 
      ? (1 - r.encodedBodySize / r.decodedBodySize) 
      : 0;
    console.log(`${r.name}: ${(ratio * 100).toFixed(1)}% compressed`);
  });
}

/* ============================================
   9. HTTP CACHING
   ============================================ */

// Cache-Control headers
const cacheStrategies = {
  // Versioned static assets (app.abc123.js)
  immutable: 'Cache-Control: public, max-age=31536000, immutable',
  
  // HTML pages
  revalidate: 'Cache-Control: public, max-age=0, must-revalidate',
  
  // API responses
  shortCache: 'Cache-Control: private, max-age=300',
  
  // Stale while revalidate (best UX)
  swr: 'Cache-Control: public, max-age=60, stale-while-revalidate=3600'
};

// ❌ DON'T: Cache without versioning
// app.js with max-age=1y → users stuck on old version

// ✅ DO: Use content hash
// app.abc123.js with max-age=1y, immutable

/* ============================================
   10. SERVICE WORKER CACHING
   ============================================ */

// Caching strategies
const swStrategies = {
  cacheFirst: 'Cache → Network (static assets)',
  networkFirst: 'Network → Cache (HTML, fresh content)',
  staleWhileRevalidate: 'Cache immediately, update in background',
  cacheOnly: 'Only serve from cache',
  networkOnly: 'Always fetch fresh'
};

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.error('SW failed', err));
}

// Update service worker
function updateServiceWorker(registration) {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

/* ============================================
   PERFORMANCE MONITORING
   ============================================ */

// Log all network metrics
function logNetworkMetrics() {
  const resources = performance.getEntriesByType('resource');
  
  console.table(resources.map(r => ({
    name: r.name.split('/').pop(),
    protocol: r.nextHopProtocol,
    duration: Math.round(r.duration) + 'ms',
    size: r.transferSize + ' bytes',
    cached: r.transferSize === 0 ? '✓' : ''
  })));
}

// Navigation timing
function getNavigationMetrics() {
  const nav = performance.getEntriesByType('navigation')[0];
  
  return {
    dns: nav.domainLookupEnd - nav.domainLookupStart,
    tcp: nav.connectEnd - nav.connectStart,
    ttfb: nav.responseStart - nav.requestStart,
    download: nav.responseEnd - nav.responseStart,
    domReady: nav.domContentLoadedEventEnd - nav.fetchStart,
    load: nav.loadEventEnd - nav.fetchStart
  };
}

console.log('See README.md for detailed documentation');
