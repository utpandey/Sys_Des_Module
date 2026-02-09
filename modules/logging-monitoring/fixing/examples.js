/**
 * Fixing / Debugging Production Issues
 * Source maps, structured logging, debug helpers
 */

/* ============================================
   1. STRUCTURED LOGGER
   ============================================ */

/**
 * Production Logger
 * Structured logging with levels, context, and transport
 */
class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.context = options.context || {};
    this.transport = options.transport || this._defaultTransport;
    this.levels = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };
  }

  debug(message, data = {}) { this._log('debug', message, data); }
  info(message, data = {}) { this._log('info', message, data); }
  warn(message, data = {}) { this._log('warn', message, data); }
  error(message, data = {}) { this._log('error', message, data); }
  fatal(message, data = {}) { this._log('fatal', message, data); }

  // Create child logger with additional context
  child(context) {
    return new Logger({
      level: this.level,
      context: { ...this.context, ...context },
      transport: this.transport,
    });
  }

  _log(level, message, data) {
    if (this.levels[level] < this.levels[this.level]) return;

    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...data,
      // Add useful context automatically
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.transport(entry);
  }

  _defaultTransport(entry) {
    const method = entry.level === 'error' || entry.level === 'fatal' 
      ? 'error' 
      : entry.level === 'warn' ? 'warn' : 'log';
    
    console[method](`[${entry.level.toUpperCase()}]`, entry.message, entry);
  }
}

// Usage:
// const logger = new Logger({ level: 'info', context: { service: 'frontend', version: '2.1.0' } });
// const pageLogger = logger.child({ page: 'checkout' });
// pageLogger.info('Checkout started', { cartItems: 3 });
// pageLogger.error('Payment failed', { error: 'card_declined', amount: 99.99 });


/* ============================================
   2. BREADCRUMB SYSTEM
   ============================================ */

/**
 * Breadcrumbs capture a trail of events leading to an error
 * This is what Sentry does under the hood
 */
class BreadcrumbTrail {
  constructor(maxBreadcrumbs = 30) {
    this.breadcrumbs = [];
    this.max = maxBreadcrumbs;
    this._instrumentDOM();
    this._instrumentXHR();
    this._instrumentNavigation();
    this._instrumentConsole();
  }

  add(category, message, data = {}, level = 'info') {
    this.breadcrumbs.push({
      category,
      message,
      data,
      level,
      timestamp: Date.now(),
    });

    if (this.breadcrumbs.length > this.max) {
      this.breadcrumbs.shift();
    }
  }

  getAll() {
    return [...this.breadcrumbs];
  }

  clear() {
    this.breadcrumbs = [];
  }

  // Auto-capture DOM interactions
  _instrumentDOM() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      const selector = this._getSelector(target);
      const text = target.textContent?.slice(0, 50) || '';
      this.add('ui.click', `Click on ${selector}`, { text, selector });
    }, true);

    document.addEventListener('input', (e) => {
      const target = e.target;
      const selector = this._getSelector(target);
      // Don't log actual values (PII!)
      this.add('ui.input', `Input on ${selector}`, { type: target.type });
    }, true);
  }

  // Auto-capture network requests
  _instrumentXHR() {
    const originalFetch = window.fetch;
    const trail = this;

    window.fetch = function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      const method = args[1]?.method || 'GET';
      const startTime = Date.now();

      trail.add('http', `${method} ${url}`, { method, url }, 'info');

      return originalFetch.apply(this, args)
        .then(response => {
          const duration = Date.now() - startTime;
          trail.add('http', `${method} ${url} → ${response.status}`, {
            method, url, status: response.status, duration
          }, response.ok ? 'info' : 'error');
          return response;
        })
        .catch(error => {
          trail.add('http', `${method} ${url} → FAILED`, {
            method, url, error: error.message
          }, 'error');
          throw error;
        });
    };
  }

  // Auto-capture navigation
  _instrumentNavigation() {
    window.addEventListener('popstate', () => {
      this.add('navigation', `Navigate to ${window.location.pathname}`);
    });

    // SPA navigation (history.pushState)
    const originalPushState = history.pushState;
    const trail = this;
    history.pushState = function(...args) {
      trail.add('navigation', `Navigate to ${args[2] || 'unknown'}`);
      return originalPushState.apply(this, args);
    };
  }

  // Auto-capture console warnings/errors
  _instrumentConsole() {
    const trail = this;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = function(...args) {
      trail.add('console', args.map(String).join(' '), {}, 'warning');
      originalWarn.apply(console, args);
    };

    console.error = function(...args) {
      trail.add('console', args.map(String).join(' '), {}, 'error');
      originalError.apply(console, args);
    };
  }

  _getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.dataset?.testid) return `[data-testid="${el.dataset.testid}"]`;
    let selector = el.tagName.toLowerCase();
    if (el.className) selector += `.${el.className.split(' ')[0]}`;
    return selector;
  }
}


/* ============================================
   3. SOURCE MAP CONFIGURATION
   ============================================ */

/**
 * Webpack source map configs
 */
const webpackSourceMapConfigs = {
  // Development: fast, full source maps
  development: {
    devtool: 'eval-source-map',
    // Fast rebuild, original source visible in DevTools
  },

  // Production: hidden source maps (upload to Sentry, don't serve)
  production: {
    devtool: 'hidden-source-map',
    // Generates .map files but doesn't add sourceMappingURL comment
    // Upload to Sentry/Bugsnag in CI/CD
  },

  // ❌ NEVER in production:
  bad: {
    devtool: 'source-map',
    // Adds sourceMappingURL → anyone can see your source code!
  },
};

/**
 * Upload source maps to Sentry (CI/CD script)
 */
/*
// sentry-upload.sh
#!/bin/bash
npx @sentry/cli sourcemaps upload \
  --org your-org \
  --project your-project \
  --release "$GIT_SHA" \
  ./dist

# Delete source maps after upload
find ./dist -name "*.map" -delete
*/

/**
 * Next.js source map config
 */
/*
// next.config.js
module.exports = {
  productionBrowserSourceMaps: false, // Don't serve to browser
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devtool = 'hidden-source-map';
    }
    return config;
  },
  
  // Sentry integration
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },
};
*/


/* ============================================
   4. ERROR CONTEXT COLLECTOR
   ============================================ */

/**
 * Collects rich context when an error occurs
 */
function collectErrorContext(error) {
  return {
    // Error details
    message: error.message,
    stack: error.stack,
    name: error.name,

    // Page context
    url: window.location.href,
    referrer: document.referrer,
    title: document.title,

    // Browser context
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,

    // Screen/viewport
    screen: {
      width: screen.width,
      height: screen.height,
      devicePixelRatio: window.devicePixelRatio,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },

    // Performance
    memory: performance.memory ? {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    } : null,

    // Connection
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
    } : null,

    // Timestamp
    timestamp: new Date().toISOString(),
    unixTimestamp: Date.now(),
  };
}


/* ============================================
   REACT EXAMPLES
   ============================================ */

/**
 * 5. Debug Panel (Development Only)
 */
function DebugPanel() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [metrics, setMetrics] = React.useState({});

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const interval = setInterval(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      setMetrics({
        domReady: nav ? Math.round(nav.domContentLoadedEventEnd) + 'ms' : '-',
        load: nav ? Math.round(nav.loadEventEnd) + 'ms' : '-',
        resources: performance.getEntriesByType('resource').length,
        memory: performance.memory
          ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB'
          : 'N/A',
        protocol: nav?.nextHopProtocol || 'unknown',
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      zIndex: 99999,
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.75rem',
        }}
      >
        🔧 Debug
      </button>
      {isOpen && (
        <div style={{
          background: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          minWidth: '200px',
        }}>
          {Object.entries(metrics).map(([key, val]) => (
            <div key={key} style={{ marginBottom: '0.25rem' }}>
              <span style={{ color: '#94a3b8' }}>{key}:</span> {val}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/**
 * 6. useDebugValue for custom hooks (React DevTools)
 */
function useDebuggedFetch(url) {
  const [state, setState] = React.useState({ data: null, loading: true, error: null });

  // Show in React DevTools
  React.useDebugValue(state.loading ? 'Loading...' : state.error ? 'Error' : 'Ready');

  React.useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error }));
  }, [url]);

  return state;
}


console.log('See README.md for documentation');
