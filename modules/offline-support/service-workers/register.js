/**
 * Service Worker Registration & Update Handling
 * Vanilla JS — use in your main app entry point
 */

/* ============================================
   1. BASIC REGISTRATION
   ============================================ */

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',            // Controls all pages from root
      updateViaCache: 'none' // Always check for SW updates (bypass HTTP cache)
    });

    console.log('[App] SW registered, scope:', registration.scope);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    // Handle updates
    handleSWUpdate(registration);

    return registration;
  } catch (error) {
    console.error('[App] SW registration failed:', error);
    return null;
  }
}


/* ============================================
   2. UPDATE HANDLING
   ============================================ */

function handleSWUpdate(registration) {
  // A new SW is available (installed but waiting)
  if (registration.waiting) {
    showUpdatePrompt(registration.waiting);
    return;
  }

  // Listen for new SW being installed
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New SW installed, but old one still controls page
        showUpdatePrompt(newWorker);
      }
    });
  });

  // When the new SW takes over, reload page
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}


/**
 * Show "New version available" prompt
 * ✅ Production pattern: let user decide when to update
 */
function showUpdatePrompt(waitingWorker) {
  // Create update banner
  const banner = document.createElement('div');
  banner.id = 'sw-update-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = `
    <div style="
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #1e293b; color: #e2e8f0;
      padding: 1rem; display: flex; align-items: center;
      justify-content: space-between; z-index: 10000;
      border-top: 2px solid #3b82f6;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
    ">
      <span>🔄 A new version is available!</span>
      <div>
        <button id="sw-update-dismiss" style="
          background: transparent; color: #94a3b8; border: none;
          padding: 0.5rem 1rem; cursor: pointer; margin-right: 0.5rem;
        ">Later</button>
        <button id="sw-update-reload" style="
          background: #3b82f6; color: white; border: none;
          padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer;
        ">Update Now</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('sw-update-reload').addEventListener('click', () => {
    // Tell waiting SW to skip waiting → triggers controllerchange → reload
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    banner.remove();
  });

  document.getElementById('sw-update-dismiss').addEventListener('click', () => {
    banner.remove();
  });
}


/* ============================================
   3. ONLINE/OFFLINE STATUS
   ============================================ */

class ConnectionStatus {
  constructor() {
    this.listeners = new Set();
    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => this._update(true));
    window.addEventListener('offline', () => this._update(false));
  }

  _update(status) {
    this.isOnline = status;
    this.listeners.forEach(cb => cb(status));

    // Show status indicator
    this._showIndicator(status);
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _showIndicator(isOnline) {
    let indicator = document.getElementById('connection-indicator');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'connection-indicator';
      indicator.setAttribute('role', 'status');
      indicator.setAttribute('aria-live', 'assertive');
      document.body.appendChild(indicator);
    }

    indicator.textContent = isOnline ? '✅ Back online' : '📡 You are offline';
    indicator.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0;
      padding: 0.5rem; text-align: center; font-weight: 500;
      z-index: 10001; transition: transform 0.3s, opacity 0.3s;
      background: ${isOnline ? '#22c55e' : '#ef4444'};
      color: white;
    `;

    // Auto-hide "Back online" after 3s
    if (isOnline) {
      setTimeout(() => {
        indicator.style.transform = 'translateY(-100%)';
        indicator.style.opacity = '0';
      }, 3000);
    }
  }
}


/* ============================================
   4. OFFLINE QUEUE (Background Sync)
   ============================================ */

/**
 * Queue requests when offline, sync when online
 * Uses IndexedDB + Background Sync API
 */
class OfflineQueue {
  constructor() {
    this.dbPromise = this._openDB();
  }

  async queueRequest(url, options = {}) {
    const db = await this.dbPromise;
    const tx = db.transaction('outbox', 'readwrite');
    tx.objectStore('outbox').add({
      url,
      method: options.method || 'POST',
      headers: options.headers || { 'Content-Type': 'application/json' },
      body: options.body || null,
      timestamp: Date.now(),
    });

    // Register for background sync
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await registration.sync.register('sync-outbox');
      console.log('[Queue] Request queued for background sync');
    } else {
      // Fallback: sync on online event
      console.log('[Queue] Background Sync not supported, will sync on online');
    }
  }

  // Wrapper: fetch with offline fallback
  async fetchWithQueue(url, options = {}) {
    if (navigator.onLine) {
      try {
        return await fetch(url, options);
      } catch (error) {
        // Network error even though "online" (lie-fi)
        await this.queueRequest(url, options);
        return new Response(JSON.stringify({ queued: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      await this.queueRequest(url, options);
      return new Response(JSON.stringify({ queued: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  _openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('offline-queue', 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}


// Initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}


// Export for module usage
if (typeof module !== 'undefined') {
  module.exports = { registerServiceWorker, ConnectionStatus, OfflineQueue };
}
