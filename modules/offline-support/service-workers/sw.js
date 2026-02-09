/**
 * Service Worker — Complete Production-Ready Implementation
 * 
 * This file IS the Service Worker. It runs in a separate thread.
 * No DOM access. Communicates via postMessage.
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// App shell: critical resources to pre-cache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html',      // Fallback page for offline
  '/manifest.json',
];

// Max items in dynamic cache (LRU-like cleanup)
const DYNAMIC_CACHE_LIMIT = 50;
const IMAGE_CACHE_LIMIT = 100;


/* ============================================
   1. INSTALL EVENT — Pre-cache app shell
   ============================================ */

self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        // ⚠️ skipWaiting: Activate new SW immediately (don't wait for old tabs)
        // Use cautiously — mixing old HTML with new SW can cause issues
        // Better: Show "Update available" prompt and let user decide
        // return self.skipWaiting();
      })
  );
});


/* ============================================
   2. ACTIVATE EVENT — Clean up old caches
   ============================================ */

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          // Delete caches from old versions
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // Take control of all open pages immediately
      return self.clients.claim();
    })
  );
});


/* ============================================
   3. FETCH EVENT — Route requests to strategies
   ============================================ */

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE have side effects)
  if (request.method !== 'GET') return;

  // Skip chrome-extension, devtools, etc.
  if (!url.protocol.startsWith('http')) return;

  // Route to appropriate caching strategy
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, IMAGE_CACHE_LIMIT));
  }
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
  else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  }
  else if (request.destination === 'document') {
    event.respondWith(networkFirstWithFallback(request));
  }
  else {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT));
  }
});


/* ============================================
   4. CACHING STRATEGIES
   ============================================ */

/**
 * Cache First (Cache Falling Back to Network)
 * Best for: Static assets that don't change (CSS, JS, images, fonts)
 */
async function cacheFirst(request, cacheName, limit) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (limit) trimCache(cacheName, limit);
    }
    return response;
  } catch (error) {
    // If it's an image, return a placeholder
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#1e293b" width="200" height="200"/><text fill="#64748b" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="14">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}


/**
 * Network First (Network Falling Back to Cache)
 * Best for: API responses, HTML pages (always want fresh data)
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return offline JSON for API requests
    return new Response(
      JSON.stringify({ error: 'offline', message: 'You are currently offline' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}


/**
 * Network First with Offline HTML Fallback
 * Best for: HTML navigation requests
 */
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Serve offline fallback page
    return caches.match('/offline.html');
  }
}


/**
 * Stale While Revalidate
 * Best for: Frequently updated resources where speed > freshness
 * (fonts, non-critical API data, user avatars)
 */
async function staleWhileRevalidate(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Fetch in background regardless
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
        if (limit) trimCache(cacheName, limit);
      }
      return response;
    })
    .catch(() => cached); // Fall back to cache on error

  // Return cached immediately if available, otherwise wait for fetch
  return cached || fetchPromise;
}


/* ============================================
   5. HELPERS
   ============================================ */

function isStaticAsset(url) {
  return /\.(css|js|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/.test(url.pathname);
}

// Simple LRU-like cache trimming
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]); // Delete oldest
    trimCache(cacheName, maxItems); // Recurse
  }
}


/* ============================================
   6. BACKGROUND SYNC (Offline Writes)
   ============================================ */

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-outbox') {
    event.waitUntil(syncOutbox());
  }
});

async function syncOutbox() {
  // Read queued requests from IndexedDB
  const db = await openDB();
  const tx = db.transaction('outbox', 'readonly');
  const store = tx.objectStore('outbox');
  const requests = await getAllFromStore(store);

  for (const item of requests) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });

      // Remove from outbox on success
      const deleteTx = db.transaction('outbox', 'readwrite');
      deleteTx.objectStore('outbox').delete(item.id);
    } catch (error) {
      console.log('[SW] Sync failed for:', item.url, '— will retry');
      break; // Stop processing, will retry on next sync
    }
  }
}

// Simple IndexedDB helpers for background sync
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sw-db', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}


/* ============================================
   7. PUSH NOTIFICATIONS
   ============================================ */

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    tag: data.tag || 'default',        // Group notifications
    renotify: data.renotify || false,   // Vibrate even if same tag
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},              // Custom data for click handler
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // If a window with the URL is already open, focus it
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      return clients.openWindow(url);
    })
  );
});


/* ============================================
   8. MESSAGE HANDLING (Communication with page)
   ============================================ */

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(DYNAMIC_CACHE).then(cache => cache.addAll(payload.urls))
      );
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      );
      break;

    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.source.postMessage({ type: 'CACHE_SIZE', payload: size });
      });
      break;
  }
});

async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      usagePercent: ((estimate.usage / estimate.quota) * 100).toFixed(2),
    };
  }
  return null;
}
