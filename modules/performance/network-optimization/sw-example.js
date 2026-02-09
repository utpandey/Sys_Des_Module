/**
 * Service Worker - Complete Example
 * 
 * Implements multiple caching strategies:
 * - Cache First: Static assets (CSS, JS, fonts)
 * - Network First: HTML documents
 * - Stale While Revalidate: Images
 * - Network Only: API calls (with optional SWR)
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Resources to pre-cache during install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/critical.css',
  '/css/main.css',
  '/js/app.js',
  '/fonts/inter.woff2',
  '/images/logo.svg'
];

// Cache limits
const MAX_DYNAMIC_CACHE = 50;
const MAX_IMAGE_CACHE = 100;
const IMAGE_CACHE_DAYS = 30;

/* ============================================
   INSTALL EVENT
   Pre-cache static assets
   ============================================ */

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Pre-caching complete');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Pre-caching failed:', error);
      })
  );
});

/* ============================================
   ACTIVATE EVENT
   Clean up old caches
   ============================================ */

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => {
              // Delete caches that don't match current version
              return !name.includes(CACHE_VERSION);
            })
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Taking control of clients');
        return self.clients.claim();
      })
  );
});

/* ============================================
   FETCH EVENT
   Route requests to appropriate strategy
   ============================================ */

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (unless you want to cache them)
  if (url.origin !== location.origin) {
    // Optionally cache cross-origin images
    if (request.destination === 'image') {
      event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    }
    return;
  }
  
  // Route based on request type
  if (request.destination === 'document') {
    // HTML: Network First
    event.respondWith(networkFirst(request));
  } else if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    // Static assets: Cache First
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (request.destination === 'image') {
    // Images: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
  } else if (url.pathname.startsWith('/api/')) {
    // API: Network with SWR fallback
    event.respondWith(networkWithSWRFallback(request));
  } else {
    // Default: Cache First
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  }
});

/* ============================================
   CACHING STRATEGIES
   ============================================ */

/**
 * Cache First Strategy
 * Best for: Static assets that rarely change
 * 
 * 1. Check cache first
 * 2. Return cached response if found
 * 3. If not in cache, fetch from network
 * 4. Cache the network response
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }
  
  console.log('[SW] Cache miss, fetching:', request.url);
  
  try {
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

/**
 * Network First Strategy
 * Best for: HTML pages, frequently updated content
 * 
 * 1. Try network first
 * 2. Cache successful response
 * 3. Fall back to cache if network fails
 * 4. Fall back to offline page if nothing cached
 */
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, checking cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for documents
    console.log('[SW] No cache, returning offline page');
    return caches.match('/offline.html');
  }
}

/**
 * Stale While Revalidate Strategy
 * Best for: Images, non-critical resources
 * 
 * 1. Return cached response immediately (if available)
 * 2. Fetch from network in background
 * 3. Update cache with fresh response
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch in background (don't await)
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        // Update cache with fresh response
        cache.put(request, response.clone());
        // Clean old entries
        limitCache(cacheName, MAX_IMAGE_CACHE);
      }
      return response;
    })
    .catch(error => {
      console.error('[SW] Background fetch failed:', error);
    });
  
  // Return cached immediately, or wait for fetch
  if (cached) {
    console.log('[SW] Returning stale, revalidating:', request.url);
    return cached;
  }
  
  console.log('[SW] No cache, waiting for network:', request.url);
  return fetchPromise;
}

/**
 * Network with SWR Fallback
 * Best for: API calls where freshness matters but offline support is needed
 * 
 * 1. Try network first
 * 2. If successful, cache and return
 * 3. If network fails, return cached (with stale indicator)
 */
async function networkWithSWRFallback(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Store with timestamp for staleness check
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed for API, checking cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      // Clone and add header to indicate stale data
      const headers = new Headers(cached.headers);
      headers.set('X-SW-Cache', 'stale');
      
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers
      });
    }
    
    // Return error response
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Limit cache size by removing oldest entries
 */
async function limitCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Delete oldest entries (first in cache)
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map(key => cache.delete(key)));
    console.log(`[SW] Trimmed cache ${cacheName}, removed ${toDelete.length} entries`);
  }
}

/**
 * Delete expired cache entries
 */
async function cleanExpiredCache(cacheName, maxAgeDays) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  
  for (const key of keys) {
    const response = await cache.match(key);
    const dateHeader = response.headers.get('date');
    
    if (dateHeader) {
      const cachedDate = new Date(dateHeader).getTime();
      if (Date.now() - cachedDate > maxAgeMs) {
        await cache.delete(key);
        console.log('[SW] Deleted expired entry:', key.url);
      }
    }
  }
}

/* ============================================
   MESSAGE HANDLING
   ============================================ */

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('[SW] Skip waiting requested');
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      // Pre-cache specific URLs
      event.waitUntil(
        caches.open(STATIC_CACHE)
          .then(cache => cache.addAll(payload.urls))
      );
      break;
      
    case 'CLEAR_CACHE':
      // Clear specific cache
      event.waitUntil(
        caches.delete(payload.cacheName || DYNAMIC_CACHE)
      );
      break;
      
    case 'GET_CACHE_SIZE':
      // Report cache sizes
      getCacheSize().then(sizes => {
        event.source.postMessage({
          type: 'CACHE_SIZE',
          payload: sizes
        });
      });
      break;
  }
});

/**
 * Get size of all caches
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  const sizes = {};
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    sizes[name] = {
      count: keys.length,
      // Note: Can't get actual byte size without reading all responses
    };
  }
  
  return sizes;
}

/* ============================================
   BACKGROUND SYNC (Optional)
   ============================================ */

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPendingPosts());
  }
});

async function syncPendingPosts() {
  // Get pending posts from IndexedDB or similar
  // Send them to server
  console.log('[SW] Syncing pending posts...');
}

/* ============================================
   PUSH NOTIFICATIONS (Optional)
   ============================================ */

self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Notification', body: 'New update available' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/images/icon-192.png',
      badge: '/images/badge.png',
      data: data.url
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

console.log('[SW] Service worker loaded');
