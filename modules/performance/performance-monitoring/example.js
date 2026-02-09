// Performance Monitoring Example
// This demonstrates how to track Core Web Vitals and other performance metrics

/**
 * Track Core Web Vitals using Performance Observer API
 */
function trackCoreWebVitals() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  // Track Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      // LCP should be < 2.5s for good performance
      const lcpValue = lastEntry.renderTime || lastEntry.loadTime;
      
      sendToAnalytics('lcp', {
        value: lcpValue,
        rating: lcpValue < 2500 ? 'good' : lcpValue < 4000 ? 'needs-improvement' : 'poor',
        element: lastEntry.element?.tagName || 'unknown'
      });
    });
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    console.warn('LCP tracking not supported', e);
  }

  // Track First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        // FID should be < 100ms for good performance
        const fidValue = entry.processingStart - entry.startTime;
        
        sendToAnalytics('fid', {
          value: fidValue,
          rating: fidValue < 100 ? 'good' : fidValue < 300 ? 'needs-improvement' : 'poor',
          eventType: entry.name,
          target: entry.target?.tagName || 'unknown'
        });
      });
    });
    
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    console.warn('FID tracking not supported', e);
  }

  // Track Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        // Only count if not caused by user interaction
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      // CLS should be < 0.1 for good performance
      sendToAnalytics('cls', {
        value: clsValue,
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
      });
    });
    
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    console.warn('CLS tracking not supported', e);
  }
}

/**
 * Track other performance metrics
 */
function trackPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  window.addEventListener('load', () => {
    // Wait for all metrics to be available
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      // Time to First Byte (TTFB)
      const ttfb = navigation.responseStart - navigation.requestStart;
      
      // First Contentful Paint (FCP)
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime;
      
      // Time to Interactive (TTI) - approximate
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
      
      sendToAnalytics('performance', {
        ttfb,
        fcp,
        domContentLoaded,
        loadComplete,
        pageLoad: navigation.loadEventEnd - navigation.fetchStart
      });
    }, 2000);
  });
}

/**
 * Track resource loading performance
 */
function trackResourcePerformance() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        // Track slow resources
        if (entry.duration > 1000) {
          sendToAnalytics('slow-resource', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            type: entry.initiatorType
          });
        }
      });
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
  } catch (e) {
    console.warn('Resource tracking not supported', e);
  }
}

/**
 * Track long tasks (blocking main thread)
 */
function trackLongTasks() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        // Tasks > 50ms block the main thread
        if (entry.duration > 50) {
          sendToAnalytics('long-task', {
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    console.warn('Long task tracking not supported', e);
  }
}

/**
 * Send metrics to analytics service
 * Replace with your actual analytics implementation
 */
function sendToAnalytics(metricName, data) {
  // Example: Send to Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', metricName, {
      value: data.value,
      metric_rating: data.rating,
      ...data
    });
  }
  
  // Example: Send to custom analytics
  if (typeof fetch !== 'undefined') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metricName,
        data: data,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }).catch(err => console.warn('Analytics error:', err));
  }
  
  // Log for debugging
  console.log(`[Performance] ${metricName}:`, data);
}

// Initialize performance tracking
if (typeof window !== 'undefined') {
  trackCoreWebVitals();
  trackPerformanceMetrics();
  trackResourcePerformance();
  trackLongTasks();
}

export {
  trackCoreWebVitals,
  trackPerformanceMetrics,
  trackResourcePerformance,
  trackLongTasks
};
