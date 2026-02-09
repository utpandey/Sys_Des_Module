/**
 * Network Optimization - React.js & Next.js Examples
 * 
 * This file contains examples for:
 * 1. Critical Rendering Path
 * 2. Minimize HTTP Requests
 * 3. Avoid Redirection
 * 4. Resource Hinting
 * 5. Fetch Priority
 * 6. Early Hints
 * 7. HTTP upgrade methods
 * 8. Compression
 * 9. HTTP Caching
 * 10. Service Worker Caching
 */

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  lazy, 
  Suspense,
  useRef,
  memo
} from 'react';

// Next.js specific imports (use conditionally)
// import Head from 'next/head';
// import Script from 'next/script';
// import Image from 'next/image';
// import dynamic from 'next/dynamic';
// import { useRouter } from 'next/router';

/* ============================================
   1. CRITICAL RENDERING PATH
   ============================================ */

/**
 * Critical CSS Component
 * Inlines critical styles for above-the-fold content
 */
export function CriticalCSS() {
  // In Next.js, use _document.js or next/head
  // In React, inject during SSR or use styled-components critical extraction
  
  const criticalStyles = `
    /* Critical CSS for initial viewport */
    :root {
      --primary: #2563eb;
      --bg: #0f172a;
      --text: #e2e8f0;
    }
    
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;
  
  return (
    <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
  );
}

/**
 * Non-Critical CSS Loader
 * Loads CSS asynchronously to avoid render blocking
 */
export function AsyncStylesheet({ href }) {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print'; // Low priority
    link.onload = () => { link.media = 'all'; };
    document.head.appendChild(link);
    
    return () => document.head.removeChild(link);
  }, [href]);
  
  return null;
}

// Next.js Critical CSS Pattern (_document.js)
/*
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Critical CSS inline *}
          <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
          
          {/* Non-critical CSS async *}
          <link
            rel="preload"
            href="/styles/non-critical.css"
            as="style"
            onLoad="this.onload=null;this.rel='stylesheet'"
          />
          <noscript>
            <link rel="stylesheet" href="/styles/non-critical.css" />
          </noscript>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
*/

/* ============================================
   2. MINIMIZE HTTP REQUESTS
   ============================================ */

/**
 * Request Batching Hook
 * Combines multiple API calls into a single request
 */
export function useRequestBatcher(batchInterval = 50) {
  const queueRef = useRef([]);
  const timerRef = useRef(null);
  
  const flush = useCallback(async () => {
    const batch = queueRef.current.splice(0);
    timerRef.current = null;
    
    if (batch.length === 0) return;
    
    try {
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: batch.map(({ url, options }) => ({ url, ...options }))
        })
      });
      
      const results = await response.json();
      batch.forEach((item, i) => item.resolve(results[i]));
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }, []);
  
  const addRequest = useCallback((url, options = {}) => {
    return new Promise((resolve, reject) => {
      queueRef.current.push({ url, options, resolve, reject });
      
      if (!timerRef.current) {
        timerRef.current = setTimeout(flush, batchInterval);
      }
    });
  }, [batchInterval, flush]);
  
  return { addRequest };
}

/**
 * Inline SVG Icon Component
 * Avoids HTTP requests for small icons
 */
export function InlineIcon({ name, size = 24, color = 'currentColor' }) {
  const icons = {
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    close: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    // Add more icons as needed
  };
  
  return icons[name] || null;
}

/**
 * Code Splitting with React.lazy
 * Reduces initial bundle size
 */
const HeavyComponent = lazy(() => import('./HeavyComponent'));
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

export function LazyLoadedApp() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* Components loaded on demand */}
    </Suspense>
  );
}

// Next.js Dynamic Import
/*
import dynamic from 'next/dynamic';

const DynamicChart = dynamic(() => import('./Chart'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Disable SSR for client-only components
});

const DynamicEditor = dynamic(() => import('./Editor'), {
  loading: () => <EditorSkeleton />,
  ssr: false
});
*/

/* ============================================
   3. AVOID REDIRECTIONS
   ============================================ */

/**
 * Smart Link Component
 * Uses final URLs to avoid redirects
 */
export function SmartLink({ href, children, ...props }) {
  // Map of known redirects to final destinations
  const urlMap = {
    '/old-page': '/new-page',
    '/blog': '/articles',
    // Add more mappings
  };
  
  const finalHref = urlMap[href] || href;
  
  return (
    <a href={finalHref} {...props}>
      {children}
    </a>
  );
}

// Next.js - Use middleware for server-side redirects
/*
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Permanent redirects (cached by browser)
  const permanentRedirects = {
    '/old-page': '/new-page',
    '/blog': '/articles',
  };
  
  if (permanentRedirects[pathname]) {
    return NextResponse.redirect(
      new URL(permanentRedirects[pathname], request.url),
      { status: 308 } // Permanent redirect
    );
  }
  
  return NextResponse.next();
}

// next.config.js - Static redirects (most efficient)
module.exports = {
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true, // 308 status
      },
    ];
  },
};
*/

/* ============================================
   4. RESOURCE HINTING
   ============================================ */

/**
 * Resource Hints Component
 * Adds preconnect, prefetch, preload hints
 */
export function ResourceHints({ hints }) {
  return (
    <>
      {hints.map((hint, i) => (
        <link
          key={i}
          rel={hint.rel}
          href={hint.href}
          as={hint.as}
          type={hint.type}
          crossOrigin={hint.crossOrigin ? 'anonymous' : undefined}
          fetchpriority={hint.priority}
        />
      ))}
    </>
  );
}

// Usage
const resourceHints = [
  // Preconnect to critical third-party origins
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: true },
  { rel: 'preconnect', href: 'https://api.example.com', crossOrigin: true },
  
  // DNS prefetch for less critical origins
  { rel: 'dns-prefetch', href: '//analytics.example.com' },
  { rel: 'dns-prefetch', href: '//cdn.example.com' },
  
  // Preload critical resources
  { rel: 'preload', href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossOrigin: true },
  { rel: 'preload', href: '/images/hero.webp', as: 'image', priority: 'high' },
  
  // Prefetch likely next pages
  { rel: 'prefetch', href: '/about' },
];

/**
 * Smart Prefetch Hook
 * Prefetches links on hover/focus
 */
export function useSmartPrefetch() {
  const prefetched = useRef(new Set());
  
  const prefetch = useCallback((href) => {
    if (prefetched.current.has(href)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
    
    prefetched.current.add(href);
  }, []);
  
  const onHover = useCallback((href) => {
    // Small delay to confirm intent
    const timer = setTimeout(() => prefetch(href), 100);
    return () => clearTimeout(timer);
  }, [prefetch]);
  
  return { prefetch, onHover };
}

/**
 * Prefetch Link Component
 * Automatically prefetches on hover
 */
export function PrefetchLink({ href, children, ...props }) {
  const { onHover } = useSmartPrefetch();
  
  return (
    <a
      href={href}
      onMouseEnter={() => onHover(href)}
      onFocus={() => onHover(href)}
      {...props}
    >
      {children}
    </a>
  );
}

// Next.js Prefetch Pattern
/*
import Link from 'next/link';

// Next.js automatically prefetches links in viewport
// Use prefetch={false} to disable

<Link href="/about" prefetch={true}>About</Link>

// Manual prefetch with router
import { useRouter } from 'next/router';

function NavLink({ href, children }) {
  const router = useRouter();
  
  const handleMouseEnter = () => {
    router.prefetch(href);
  };
  
  return (
    <Link href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
*/

/* ============================================
   5. FETCH PRIORITY
   ============================================ */

/**
 * Prioritized Image Component
 * Sets fetchpriority for LCP optimization
 */
export function PrioritizedImage({ 
  src, 
  alt, 
  priority = 'auto',
  isLCP = false,
  ...props 
}) {
  return (
    <img
      src={src}
      alt={alt}
      fetchpriority={isLCP ? 'high' : priority}
      loading={isLCP ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
}

// Next.js Image with Priority
/*
import Image from 'next/image';

// LCP Image - high priority, no lazy loading
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Adds fetchpriority="high" and preloads
/>

// Below-fold image - lazy loaded
<Image
  src="/secondary.jpg"
  alt="Secondary"
  width={400}
  height={300}
  loading="lazy" // Default behavior
/>
*/

/**
 * Fetch with Priority Hook
 */
export function useFetchWithPriority() {
  const fetchWithPriority = useCallback(async (url, priority = 'auto', options = {}) => {
    return fetch(url, {
      ...options,
      priority, // 'high', 'low', or 'auto'
    });
  }, []);
  
  return { fetchWithPriority };
}

/**
 * Priority Script Loader
 */
export function PriorityScript({ src, priority = 'auto', strategy = 'afterInteractive' }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = src;
    script.fetchPriority = priority;
    
    if (strategy === 'lazyOnload') {
      script.defer = true;
    }
    
    document.body.appendChild(script);
    
    return () => document.body.removeChild(script);
  }, [src, priority, strategy]);
  
  return null;
}

// Next.js Script Component
/*
import Script from 'next/script';

// Critical script - high priority
<Script
  src="/scripts/critical.js"
  strategy="beforeInteractive"
/>

// Analytics - low priority, after page load
<Script
  src="https://analytics.example.com/script.js"
  strategy="lazyOnload"
/>

// Third-party - after hydration
<Script
  src="https://third-party.example.com/widget.js"
  strategy="afterInteractive"
/>
*/

/* ============================================
   6. EARLY HINTS (Server-side setup)
   ============================================ */

// Early Hints require server configuration
// See server-examples.js for implementation

// Next.js middleware for Early Hints
/*
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  
  // Add Link headers for resources (CDN will convert to 103 Early Hints)
  response.headers.set('Link', [
    '</fonts/inter.woff2>; rel=preload; as=font; type="font/woff2"; crossorigin',
    '</styles/critical.css>; rel=preload; as=style',
    '</scripts/app.js>; rel=preload; as=script',
  ].join(', '));
  
  return response;
}
*/

/* ============================================
   7. HTTP PROTOCOL DETECTION
   ============================================ */

/**
 * HTTP Protocol Detection Hook
 */
export function useHTTPProtocol() {
  const [protocol, setProtocol] = useState(null);
  
  useEffect(() => {
    const entries = performance.getEntriesByType('navigation');
    if (entries.length > 0) {
      setProtocol(entries[0].nextHopProtocol);
    }
  }, []);
  
  return protocol; // 'h2', 'h3', 'http/1.1'
}

/**
 * Protocol Warning Component
 */
export function ProtocolWarning() {
  const protocol = useHTTPProtocol();
  
  if (!protocol || ['h2', 'h3'].includes(protocol)) {
    return null;
  }
  
  return (
    <div style={{ 
      background: '#fef3c7', 
      padding: '1rem', 
      borderRadius: '0.5rem',
      margin: '1rem 0'
    }}>
      ⚠️ Your server is using HTTP/1.1. Consider upgrading to HTTP/2 or HTTP/3 for better performance.
    </div>
  );
}

/* ============================================
   8. COMPRESSION ANALYSIS
   ============================================ */

/**
 * Compression Analysis Hook
 */
export function useCompressionAnalysis() {
  const [analysis, setAnalysis] = useState([]);
  
  useEffect(() => {
    const resources = performance.getEntriesByType('resource');
    
    const data = resources.map(resource => ({
      name: resource.name.split('/').pop(),
      type: resource.initiatorType,
      transferSize: resource.transferSize,
      decodedSize: resource.decodedBodySize,
      compressionRatio: resource.decodedBodySize 
        ? ((1 - resource.encodedBodySize / resource.decodedBodySize) * 100).toFixed(1) + '%'
        : 'N/A',
      protocol: resource.nextHopProtocol
    }));
    
    setAnalysis(data);
  }, []);
  
  return analysis;
}

/**
 * Compression Report Component
 */
export function CompressionReport() {
  const analysis = useCompressionAnalysis();
  
  const uncompressed = analysis.filter(r => 
    r.decodedSize > 1000 && r.compressionRatio === '0.0%'
  );
  
  if (uncompressed.length === 0) return null;
  
  return (
    <div>
      <h3>⚠️ Uncompressed Resources</h3>
      <ul>
        {uncompressed.map((r, i) => (
          <li key={i}>{r.name} ({r.decodedSize} bytes)</li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================
   9. HTTP CACHING
   ============================================ */

/**
 * SWR-like Stale-While-Revalidate Hook
 * Implements client-side cache strategy
 */
export function useSWR(url, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const cacheRef = useRef(new Map());
  
  const {
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    dedupingInterval = 2000,
    cacheTime = 5 * 60 * 1000, // 5 minutes
  } = options;
  
  const fetchData = useCallback(async (skipCache = false) => {
    const cached = cacheRef.current.get(url);
    
    // Return cached data immediately (stale)
    if (cached && !skipCache) {
      setData(cached.data);
      setIsLoading(false);
      
      // Check if cache is still fresh
      if (Date.now() - cached.timestamp < dedupingInterval) {
        return;
      }
    }
    
    // Revalidate in background
    try {
      const response = await fetch(url);
      const newData = await response.json();
      
      cacheRef.current.set(url, {
        data: newData,
        timestamp: Date.now()
      });
      
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [url, dedupingInterval]);
  
  useEffect(() => {
    fetchData();
    
    // Revalidate on focus
    const handleFocus = () => {
      if (revalidateOnFocus) fetchData();
    };
    
    // Revalidate on reconnect
    const handleOnline = () => {
      if (revalidateOnReconnect) fetchData();
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchData, revalidateOnFocus, revalidateOnReconnect]);
  
  const mutate = useCallback(() => fetchData(true), [fetchData]);
  
  return { data, error, isLoading, mutate };
}

/**
 * Cache Headers Display Component
 */
export function CacheHeadersDisplay({ url }) {
  const [headers, setHeaders] = useState(null);
  
  useEffect(() => {
    fetch(url, { method: 'HEAD' })
      .then(response => {
        setHeaders({
          cacheControl: response.headers.get('Cache-Control'),
          etag: response.headers.get('ETag'),
          lastModified: response.headers.get('Last-Modified'),
          expires: response.headers.get('Expires')
        });
      });
  }, [url]);
  
  if (!headers) return null;
  
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
      <p>Cache-Control: {headers.cacheControl || 'none'}</p>
      <p>ETag: {headers.etag || 'none'}</p>
      <p>Last-Modified: {headers.lastModified || 'none'}</p>
      <p>Expires: {headers.expires || 'none'}</p>
    </div>
  );
}

// Next.js Caching Patterns
/*
// app/page.js (App Router)
export const revalidate = 60; // ISR: revalidate every 60 seconds

// Or fetch-level caching
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { 
      revalidate: 60,  // Cache for 60 seconds
      tags: ['data']   // Tag for on-demand revalidation
    }
  });
  return res.json();
}

// On-demand revalidation
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST() {
  revalidateTag('data');
  // or
  revalidatePath('/data');
  return Response.json({ revalidated: true });
}
*/

/* ============================================
   10. SERVICE WORKER CACHING
   ============================================ */

/**
 * Service Worker Registration Hook
 */
export function useServiceWorker(swPath = '/sw.js') {
  const [registration, setRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    
    navigator.serviceWorker.register(swPath)
      .then(reg => {
        setRegistration(reg);
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(console.error);
  }, [swPath]);
  
  const update = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);
  
  return { registration, updateAvailable, update };
}

/**
 * Update Prompt Component
 */
export function UpdatePrompt() {
  const { updateAvailable, update } = useServiceWorker();
  
  if (!updateAvailable) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      background: '#2563eb',
      color: 'white',
      padding: '1rem',
      borderRadius: '0.5rem',
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    }}>
      <span>New version available!</span>
      <button onClick={update} style={{
        background: 'white',
        color: '#2563eb',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '0.25rem',
        cursor: 'pointer'
      }}>
        Update
      </button>
    </div>
  );
}

/**
 * Offline Indicator Component
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#fef3c7',
      color: '#92400e',
      padding: '0.5rem',
      textAlign: 'center',
      zIndex: 9999
    }}>
      📴 You're offline. Some features may be unavailable.
    </div>
  );
}

/* ============================================
   UTILITY COMPONENTS
   ============================================ */

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e2e8f0',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ============================================
   EXAMPLE APP USING ALL OPTIMIZATIONS
   ============================================ */

export default function NetworkOptimizedApp() {
  return (
    <>
      {/* Critical CSS */}
      <CriticalCSS />
      
      {/* Resource Hints in document head */}
      <ResourceHints hints={resourceHints} />
      
      {/* Async load non-critical CSS */}
      <AsyncStylesheet href="/styles/non-critical.css" />
      
      {/* Protocol check */}
      <ProtocolWarning />
      
      {/* Offline indicator */}
      <OfflineIndicator />
      
      {/* Update prompt for SW */}
      <UpdatePrompt />
      
      {/* Main content with lazy loading */}
      <main className="hero">
        <h1>Network Optimized App</h1>
        
        {/* LCP Image with high priority */}
        <PrioritizedImage
          src="/images/hero.webp"
          alt="Hero"
          isLCP={true}
          width={800}
          height={600}
        />
        
        {/* Prefetch links */}
        <nav>
          <PrefetchLink href="/about">About</PrefetchLink>
          <PrefetchLink href="/contact">Contact</PrefetchLink>
        </nav>
        
        {/* Lazy loaded content */}
        <Suspense fallback={<LoadingSpinner />}>
          <HeavyComponent />
        </Suspense>
      </main>
    </>
  );
}

/* ============================================
   NEXT.JS APP ROUTER EXAMPLE (app/page.js)
   ============================================ */

/*
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Network Optimized App',
  // Next.js automatically adds preconnect for fonts
};

// ISR with 60 second revalidation
export const revalidate = 60;

async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }
  });
  return res.json();
}

export default async function Page() {
  const data = await getData();
  
  return (
    <main>
      {/* Priority LCP image *}
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={600}
        priority
        sizes="100vw"
      />
      
      {/* Auto-prefetching links *}
      <nav>
        <Link href="/about">About</Link>
        <Link href="/contact" prefetch={false}>Contact</Link>
      </nav>
      
      {/* Data from cached fetch *}
      <div>{JSON.stringify(data)}</div>
    </main>
  );
}
*/

/* ============================================
   NEXT.JS CONFIG (next.config.js)
   ============================================ */

/*
// next.config.js
const nextConfig = {
  // Enable compression (automatic with Vercel)
  compress: true,
  
  // HTTP headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true, // Experimental CSS optimization
  },
};

module.exports = nextConfig;
*/
