/**
 * Progressive Web App — React & Next.js Patterns
 * Install prompt, display mode, notifications, offline UX
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ============================================
   1. usePWAInstall HOOK
   ============================================ */

function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPromptRef = useRef(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPromptRef.current = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPromptRef.current) return false;

    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;

    deferredPromptRef.current = null;
    setCanInstall(false);

    return outcome === 'accepted';
  }, []);

  return { canInstall, isInstalled, install };
}

// Usage:
// function InstallButton() {
//   const { canInstall, isInstalled, install } = usePWAInstall();
//   if (isInstalled) return <span>✅ Installed</span>;
//   if (!canInstall) return null;
//   return <button onClick={install}>📱 Install App</button>;
// }


/* ============================================
   2. PWA INSTALL BANNER COMPONENT
   ============================================ */

function PWAInstallBanner({ delay = 30000 }) {
  const { canInstall, install } = usePWAInstall();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!canInstall || dismissed) return;

    // Show banner after delay
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [canInstall, delay, dismissed]);

  if (!show) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem',
        maxWidth: '500px', margin: '0 auto',
        background: '#1e293b', border: '2px solid #3b82f6',
        borderRadius: '1rem', padding: '1.5rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem', color: '#38bdf8' }}>📱 Install This App</h3>
      <p style={{ color: '#94a3b8', margin: '0 0 1rem', fontSize: '0.9rem' }}>
        Quick access from your home screen. Works offline too!
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={async () => { await install(); setShow(false); }}
          style={{
            background: '#3b82f6', color: 'white', border: 'none',
            padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer',
          }}
        >
          Install
        </button>
        <button
          onClick={() => { setShow(false); setDismissed(true); }}
          style={{
            background: 'transparent', color: '#94a3b8',
            border: '1px solid #475569', padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem', cursor: 'pointer',
          }}
        >
          Not Now
        </button>
      </div>
    </div>
  );
}


/* ============================================
   3. useDisplayMode HOOK
   ============================================ */

function useDisplayMode() {
  const [displayMode, setDisplayMode] = useState('browser');

  useEffect(() => {
    // iOS standalone detection
    if (window.navigator.standalone === true) {
      setDisplayMode('standalone');
      return;
    }

    const modes = ['standalone', 'minimal-ui', 'fullscreen', 'browser'];
    for (const mode of modes) {
      const mq = window.matchMedia(`(display-mode: ${mode})`);
      if (mq.matches) {
        setDisplayMode(mode);
        break;
      }
    }

    // Listen for display mode changes
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = (e) => setDisplayMode(e.matches ? 'standalone' : 'browser');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return {
    displayMode,
    isStandalone: displayMode === 'standalone',
    isInBrowser: displayMode === 'browser',
  };
}

// Usage:
// function Header() {
//   const { isStandalone } = useDisplayMode();
//   // Show different header in installed PWA vs browser
//   return isStandalone ? <CompactHeader /> : <FullHeader />;
// }


/* ============================================
   4. usePushNotifications HOOK
   ============================================ */

function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [subscription, setSubscription] = useState(null);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported';

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const subscribe = useCallback(async (vapidPublicKey) => {
    const reg = await navigator.serviceWorker.ready;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    setSubscription(sub);

    // Send subscription to your server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    });

    return sub;
  }, []);

  const sendLocal = useCallback(async (title, options = {}) => {
    const reg = await navigator.serviceWorker.ready;
    return reg.showNotification(title, options);
  }, []);

  return {
    permission,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    subscription,
    requestPermission,
    subscribe,
    sendLocal,
  };
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}


/* ============================================
   5. OFFLINE-AWARE DATA COMPONENT
   ============================================ */

function OfflineAwareList({ fetchUrl, renderItem }) {
  const [items, setItems] = useState([]);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (data.error === 'offline') {
          // Response from SW's offline JSON fallback
          setIsStale(true);
          // Try to load from localStorage backup
          const cached = localStorage.getItem(`cache:${fetchUrl}`);
          if (cached) setItems(JSON.parse(cached));
        } else {
          setItems(data);
          setIsStale(false);
          // Backup to localStorage for extra resilience
          localStorage.setItem(`cache:${fetchUrl}`, JSON.stringify(data));
        }
      } catch (err) {
        setError(err);
        // Load localStorage backup
        const cached = localStorage.getItem(`cache:${fetchUrl}`);
        if (cached) {
          setItems(JSON.parse(cached));
          setIsStale(true);
        }
      }
    };

    fetchData();
  }, [fetchUrl, isOnline]);

  return (
    <div>
      {!isOnline && (
        <div role="status" style={{ background: '#451a1a', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
          📡 You're offline. Showing cached data.
        </div>
      )}
      {isStale && isOnline && (
        <div role="status" style={{ background: '#422006', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
          ⚠️ Showing cached data. Reconnecting...
        </div>
      )}
      {error && items.length === 0 && (
        <div role="alert" style={{ color: '#ef4444' }}>
          Failed to load data. {!isOnline ? 'Check your connection.' : 'Please try again.'}
        </div>
      )}
      {items.map(renderItem)}
    </div>
  );
}

// Usage:
// <OfflineAwareList
//   fetchUrl="/api/posts"
//   renderItem={(post) => <PostCard key={post.id} post={post} />}
// />


/* ============================================
   6. NEXT.JS PWA SETUP
   ============================================ */

/*
// ✅ OPTION 1: next-pwa (easiest)
// npm install next-pwa

// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});
module.exports = withPWA({ ... });

// ✅ OPTION 2: Manual (more control)
// 1. Place sw.js in public/
// 2. Place manifest.json in public/
// 3. Register SW in a client component

// app/layout.jsx
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyPWA',
  },
};

// app/components/PWAProvider.jsx
'use client';
export default function PWAProvider({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);
  return children;
}

// app/layout.jsx
import PWAProvider from './components/PWAProvider';
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PWAProvider>
          {children}
        </PWAProvider>
      </body>
    </html>
  );
}
*/


export {
  usePWAInstall,
  PWAInstallBanner,
  useDisplayMode,
  usePushNotifications,
  OfflineAwareList,
};
