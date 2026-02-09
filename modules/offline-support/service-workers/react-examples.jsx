/**
 * Service Workers — React & Next.js Integration
 * Registration, update prompts, offline hooks
 */

import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';

/* ============================================
   1. useServiceWorker HOOK
   ============================================ */

function useServiceWorker(swUrl = '/sw.js') {
  const [registration, setRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const waitingWorkerRef = useRef(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    navigator.serviceWorker.register(swUrl, { updateViaCache: 'none' })
      .then(reg => {
        setRegistration(reg);

        // Check if update is waiting
        if (reg.waiting) {
          waitingWorkerRef.current = reg.waiting;
          setUpdateAvailable(true);
          return;
        }

        // Listen for new SW
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              waitingWorkerRef.current = newWorker;
              setUpdateAvailable(true);
            }
          });
        });

        // Periodic update check
        const interval = setInterval(() => reg.update(), 60 * 60 * 1000);
        return () => clearInterval(interval);
      })
      .catch(err => console.error('SW registration failed:', err));

    // Reload on controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, [swUrl]);

  const applyUpdate = useCallback(() => {
    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return {
    registration,
    updateAvailable,
    applyUpdate,
    dismissUpdate,
  };
}


/* ============================================
   2. UPDATE PROMPT COMPONENT
   ============================================ */

function UpdatePrompt() {
  const { updateAvailable, applyUpdate, dismissUpdate } = useServiceWorker();

  if (!updateAvailable) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#1e293b', color: '#e2e8f0',
        padding: '1rem', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        zIndex: 10000, borderTop: '2px solid #3b82f6',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <span>🔄 A new version is available!</span>
      <div>
        <button
          onClick={dismissUpdate}
          style={{
            background: 'transparent', color: '#94a3b8',
            border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
          }}
        >
          Later
        </button>
        <button
          onClick={applyUpdate}
          style={{
            background: '#3b82f6', color: 'white', border: 'none',
            padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer',
          }}
        >
          Update Now
        </button>
      </div>
    </div>
  );
}


/* ============================================
   3. useOnlineStatus HOOK
   ============================================ */

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Usage:
// function App() {
//   const isOnline = useOnlineStatus();
//   return <div>{isOnline ? '🟢 Online' : '🔴 Offline'}</div>;
// }


/* ============================================
   4. OFFLINE INDICATOR COMPONENT
   ============================================ */

function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showOnline, setShowOnline] = useState(false);
  const prevOnline = useRef(isOnline);

  useEffect(() => {
    // Show "Back online" briefly when reconnecting
    if (isOnline && !prevOnline.current) {
      setShowOnline(true);
      const timer = setTimeout(() => setShowOnline(false), 3000);
      return () => clearTimeout(timer);
    }
    prevOnline.current = isOnline;
  }, [isOnline]);

  if (isOnline && !showOnline) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        padding: '0.5rem', textAlign: 'center',
        fontWeight: 500, zIndex: 10001,
        background: isOnline ? '#22c55e' : '#ef4444',
        color: 'white',
        transition: 'transform 0.3s',
        transform: (isOnline && !showOnline) ? 'translateY(-100%)' : 'translateY(0)',
      }}
    >
      {isOnline ? '✅ Back online' : '📡 You are offline — some features may be unavailable'}
    </div>
  );
}


/* ============================================
   5. useOfflineQueue HOOK
   ============================================ */

function useOfflineQueue() {
  const isOnline = useOnlineStatus();
  const [queueCount, setQueueCount] = useState(0);

  const queueRequest = useCallback(async (url, options = {}) => {
    if (isOnline) {
      try {
        return await fetch(url, options);
      } catch {
        // Network error despite being "online" (lie-fi)
      }
    }

    // Queue in IndexedDB
    const db = await openDB();
    const tx = db.transaction('outbox', 'readwrite');
    tx.objectStore('outbox').add({
      url,
      method: options.method || 'POST',
      headers: options.headers || {},
      body: options.body || null,
      timestamp: Date.now(),
    });

    setQueueCount(prev => prev + 1);

    // Register background sync if available
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.sync) {
      await reg.sync.register('sync-outbox');
    }

    return new Response(JSON.stringify({ queued: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }, [isOnline]);

  // Sync when back online
  useEffect(() => {
    if (isOnline && queueCount > 0) {
      syncQueue().then(() => setQueueCount(0));
    }
  }, [isOnline, queueCount]);

  return { queueRequest, queueCount, isOnline };
}

async function syncQueue() {
  const db = await openDB();
  const tx = db.transaction('outbox', 'readonly');
  const items = await new Promise((resolve, reject) => {
    const req = tx.objectStore('outbox').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  for (const item of items) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });

      const delTx = db.transaction('outbox', 'readwrite');
      delTx.objectStore('outbox').delete(item.id);
    } catch {
      break; // Will retry next time
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('offline-queue', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}


/* ============================================
   6. NEXT.JS SERVICE WORKER SETUP
   ============================================ */

/*
// next.config.js — Copy SW to public folder or use next-pwa

// Option 1: Manual (place sw.js in /public/)
// public/sw.js → served at /sw.js automatically

// Option 2: next-pwa (recommended)
// npm install next-pwa

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.example\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 300, // 5 min
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-cache',
      },
    },
  ],
});

module.exports = withPWA({
  // your Next.js config
});
*/


export {
  useServiceWorker,
  UpdatePrompt,
  useOnlineStatus,
  OfflineIndicator,
  useOfflineQueue,
};
