/**
 * Telemetry - Vanilla JS & React Examples
 * Error tracking, performance metrics, custom events
 */

/* ============================================
   1. ERROR TRACKING
   ============================================ */

/**
 * Global Error Handler
 * Catches all unhandled errors and promise rejections
 */
class ErrorTracker {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/api/telemetry/errors';
    this.appVersion = options.appVersion || '1.0.0';
    this.environment = options.environment || 'production';
    this.breadcrumbs = [];
    this.maxBreadcrumbs = 20;
    this.queue = [];
    this.flushInterval = 5000;

    this._setupGlobalHandlers();
    this._startFlushing();
  }

  _setupGlobalHandlers() {
    // Catch unhandled JS errors
    window.onerror = (message, source, line, col, error) => {
      this.captureError({
        type: 'unhandled_error',
        message,
        source,
        line,
        col,
        stack: error?.stack,
      });
      return false; // Don't suppress default browser behavior
    };

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      });
    });

    // Catch CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      this.captureError({
        type: 'csp_violation',
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
      });
    });

    // Track console errors
    const originalError = console.error;
    console.error = (...args) => {
      this.addBreadcrumb('console.error', args.map(String).join(' '));
      originalError.apply(console, args);
    };
  }

  captureError(errorData) {
    const event = {
      ...errorData,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      appVersion: this.appVersion,
      environment: this.environment,
      breadcrumbs: [...this.breadcrumbs],
      // Extra context
      viewport: { w: window.innerWidth, h: window.innerHeight },
      connection: navigator.connection ? {
        type: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
      } : null,
    };

    this.queue.push(event);
    
    // Flush immediately for critical errors
    if (errorData.type === 'unhandled_error') {
      this._flush();
    }
  }

  // Breadcrumbs: trail of events before an error
  addBreadcrumb(category, message, data = {}) {
    this.breadcrumbs.push({
      category,
      message,
      data,
      timestamp: Date.now(),
    });

    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  // Manual error capture (try/catch)
  captureException(error, context = {}) {
    this.captureError({
      type: 'caught_exception',
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  _startFlushing() {
    setInterval(() => this._flush(), this.flushInterval);
    
    // Flush on page unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this._flush(true);
      }
    });
  }

  _flush(useBeacon = false) {
    if (this.queue.length === 0) return;

    const events = this.queue.splice(0);
    const payload = JSON.stringify(events);

    if (useBeacon && navigator.sendBeacon) {
      // sendBeacon is reliable even during page unload
      navigator.sendBeacon(this.endpoint, payload);
    } else {
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true, // Survives page navigation
      }).catch(() => {
        // Re-queue on failure
        this.queue.unshift(...events);
      });
    }
  }
}

// Usage:
// const tracker = new ErrorTracker({
//   endpoint: 'https://telemetry.example.com/errors',
//   appVersion: '2.1.0',
//   environment: process.env.NODE_ENV,
// });
//
// Manual capture:
// try { riskyOperation(); } catch (e) { tracker.captureException(e, { userId: 123 }); }


/* ============================================
   2. PERFORMANCE MONITORING
   ============================================ */

/**
 * Core Web Vitals Tracker
 * LCP, FID/INP, CLS — Google's ranking signals
 */
class PerformanceTracker {
  constructor(reportCallback) {
    this.report = reportCallback || console.log;
    this.metrics = {};
    
    this._trackLCP();
    this._trackFID();
    this._trackCLS();
    this._trackINP();
    this._trackTTFB();
    this._trackFCP();
    this._trackLongTasks();
    this._trackResourceTiming();
  }

  // Largest Contentful Paint (loading speed)
  _trackLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      this.report({ name: 'LCP', value: lastEntry.startTime, rating: this._rateLCP(lastEntry.startTime) });
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  // First Input Delay (interactivity)
  _trackFID() {
    const observer = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0];
      this.metrics.fid = entry.processingStart - entry.startTime;
      this.report({ name: 'FID', value: this.metrics.fid, rating: this._rateFID(this.metrics.fid) });
    });
    observer.observe({ type: 'first-input', buffered: true });
  }

  // Cumulative Layout Shift (visual stability)
  _trackCLS() {
    let clsValue = 0;
    let sessionEntries = [];
    let sessionValue = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          sessionEntries.push(entry);
          sessionValue += entry.value;

          // If gap > 1s or total > 5s, start new session
          if (sessionEntries.length > 1) {
            const last = sessionEntries[sessionEntries.length - 2];
            if (entry.startTime - last.startTime > 1000 || 
                entry.startTime - sessionEntries[0].startTime > 5000) {
              clsValue = Math.max(clsValue, sessionValue);
              sessionEntries = [entry];
              sessionValue = entry.value;
            }
          }
        }
      }
      clsValue = Math.max(clsValue, sessionValue);
      this.metrics.cls = clsValue;
      this.report({ name: 'CLS', value: clsValue, rating: this._rateCLS(clsValue) });
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  }

  // Interaction to Next Paint (replacing FID)
  _trackINP() {
    let worstINP = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.interactionId) {
          const duration = entry.duration;
          if (duration > worstINP) {
            worstINP = duration;
            this.metrics.inp = duration;
            this.report({ name: 'INP', value: duration, rating: this._rateINP(duration) });
          }
        }
      }
    });
    observer.observe({ type: 'event', buffered: true, durationThreshold: 40 });
  }

  // Time to First Byte
  _trackTTFB() {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      this.metrics.ttfb = nav.responseStart - nav.requestStart;
      this.report({ name: 'TTFB', value: this.metrics.ttfb });
    }
  }

  // First Contentful Paint
  _trackFCP() {
    const observer = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0];
      this.metrics.fcp = entry.startTime;
      this.report({ name: 'FCP', value: entry.startTime });
    });
    observer.observe({ type: 'paint', buffered: true });
  }

  // Long Tasks (> 50ms, cause jank)
  _trackLongTasks() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.report({
          name: 'LongTask',
          value: entry.duration,
          attribution: entry.attribution?.[0]?.containerName || 'unknown',
        });
      }
    });
    observer.observe({ type: 'longtask', buffered: true });
  }

  // Resource Timing (slow resources)
  _trackResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 3000) { // Log resources slower than 3s
          this.report({
            name: 'SlowResource',
            url: entry.name,
            duration: entry.duration,
            type: entry.initiatorType,
          });
        }
      }
    });
    observer.observe({ type: 'resource', buffered: true });
  }

  // Rating helpers (Google thresholds)
  _rateLCP(ms) { return ms <= 2500 ? 'good' : ms <= 4000 ? 'needs-improvement' : 'poor'; }
  _rateFID(ms) { return ms <= 100 ? 'good' : ms <= 300 ? 'needs-improvement' : 'poor'; }
  _rateCLS(val) { return val <= 0.1 ? 'good' : val <= 0.25 ? 'needs-improvement' : 'poor'; }
  _rateINP(ms) { return ms <= 200 ? 'good' : ms <= 500 ? 'needs-improvement' : 'poor'; }

  getAll() {
    return { ...this.metrics };
  }
}


/* ============================================
   3. CUSTOM EVENT TRACKING
   ============================================ */

/**
 * Event Tracker with batching and sampling
 */
class EventTracker {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/api/telemetry/events';
    this.batchSize = options.batchSize || 10;
    this.flushInterval = options.flushInterval || 10000;
    this.sampleRates = options.sampleRates || {}; // { 'scroll': 0.1 }
    this.queue = [];

    this._startFlushing();
  }

  track(eventName, properties = {}) {
    // Sampling: only send X% of certain events
    const sampleRate = this.sampleRates[eventName] ?? 1;
    if (Math.random() > sampleRate) return;

    this.queue.push({
      event: eventName,
      properties,
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this._getSessionId(),
    });

    if (this.queue.length >= this.batchSize) {
      this._flush();
    }
  }

  // Common tracking helpers
  trackPageView(page) {
    this.track('page_view', { page, referrer: document.referrer });
  }

  trackClick(element, label) {
    this.track('click', { element, label });
  }

  trackFeatureUsage(feature) {
    this.track('feature_used', { feature });
  }

  trackConversion(type, value) {
    this.track('conversion', { type, value });
  }

  // Detect rage clicks (frustration signal)
  setupRageClickDetection(threshold = 3, timeWindow = 1000) {
    let clicks = [];

    document.addEventListener('click', (e) => {
      const now = Date.now();
      clicks.push({ time: now, x: e.clientX, y: e.clientY });
      clicks = clicks.filter(c => now - c.time < timeWindow);

      if (clicks.length >= threshold) {
        this.track('rage_click', {
          count: clicks.length,
          element: e.target.tagName,
          selector: this._getSelector(e.target),
        });
        clicks = [];
      }
    });
  }

  _getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className) return `.${el.className.split(' ')[0]}`;
    return el.tagName.toLowerCase();
  }

  _getSessionId() {
    let id = sessionStorage.getItem('_sid');
    if (!id) {
      id = Math.random().toString(36).slice(2);
      sessionStorage.setItem('_sid', id);
    }
    return id;
  }

  _startFlushing() {
    setInterval(() => this._flush(), this.flushInterval);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this._flush(true);
    });
  }

  _flush(useBeacon = false) {
    if (this.queue.length === 0) return;
    const events = this.queue.splice(0);
    const payload = JSON.stringify(events);

    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoint, payload);
    } else {
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => this.queue.unshift(...events));
    }
  }
}


/* ============================================
   REACT EXAMPLES
   ============================================ */

/**
 * 4. React Error Boundary (class component — required for catch)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Send to error tracking
    // tracker.captureException(error, { componentStack: errorInfo.componentStack });
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage:
// <ErrorBoundary fallback={<ErrorPage />}>
//   <App />
// </ErrorBoundary>


/**
 * 5. usePerformanceMonitor Hook
 */
function usePerformanceMonitor(componentName) {
  const renderCount = React.useRef(0);
  const mountTime = React.useRef(Date.now());

  React.useEffect(() => {
    renderCount.current += 1;

    // Track excessive re-renders
    if (renderCount.current > 50) {
      console.warn(`[Perf] ${componentName} rendered ${renderCount.current} times`);
    }

    return () => {
      // Track component lifetime
      const lifetime = Date.now() - mountTime.current;
      if (lifetime < 100) {
        console.warn(`[Perf] ${componentName} unmounted after only ${lifetime}ms`);
      }
    };
  });
}


/**
 * 6. useTrackEvent Hook
 */
function useTrackEvent(tracker) {
  return React.useCallback((eventName, properties = {}) => {
    tracker.track(eventName, properties);
  }, [tracker]);
}

// Usage:
// function CheckoutButton() {
//   const track = useTrackEvent(eventTracker);
//   return <button onClick={() => { track('checkout_started'); startCheckout(); }}>Checkout</button>;
// }


/**
 * 7. Web Vitals reporting for Next.js
 */
/*
// app/layout.js or pages/_app.js
export function reportWebVitals(metric) {
  // Send to analytics
  const body = JSON.stringify({
    name: metric.name,    // CLS, FID, FCP, LCP, TTFB, INP
    value: metric.value,
    rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    id: metric.id,
    page: window.location.pathname,
  });
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body);
  } else {
    fetch('/api/vitals', { method: 'POST', body, keepalive: true });
  }
}
*/


console.log('See README.md for documentation');
