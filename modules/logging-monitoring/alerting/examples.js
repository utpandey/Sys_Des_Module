/**
 * Alerting - Frontend Alert System Examples
 * Vanilla JS & React patterns
 */

/* ============================================
   1. CLIENT-SIDE ALERT MANAGER
   ============================================ */

/**
 * Alert Manager
 * Monitors metrics and triggers alerts when thresholds are breached
 */
class AlertManager {
  constructor(options = {}) {
    this.rules = [];
    this.cooldowns = new Map(); // Prevent duplicate alerts
    this.channels = {
      console: (alert) => console.warn(`🚨 [${alert.severity}] ${alert.message}`),
      beacon: (alert) => this._sendBeacon(alert),
      webhook: (alert) => this._sendWebhook(alert),
    };
    this.webhookUrl = options.webhookUrl;
    this.beaconEndpoint = options.beaconEndpoint || '/api/alerts';
  }

  // Define alert rules
  addRule(rule) {
    this.rules.push({
      name: rule.name,
      condition: rule.condition,     // (value) => boolean
      severity: rule.severity || 'warning', // 'critical', 'warning', 'info'
      cooldownMs: rule.cooldownMs || 300_000, // 5 min default
      channels: rule.channels || ['console', 'beacon'],
      metadata: rule.metadata || {},
    });
  }

  // Check value against all rules
  evaluate(metricName, value) {
    this.rules
      .filter(rule => rule.name === metricName)
      .forEach(rule => {
        if (rule.condition(value) && !this._isInCooldown(rule.name)) {
          this._trigger(rule, value);
        }
      });
  }

  _trigger(rule, value) {
    const alert = {
      rule: rule.name,
      severity: rule.severity,
      value,
      message: `${rule.name}: ${value} breached threshold`,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...rule.metadata,
    };

    // Send to configured channels
    rule.channels.forEach(channel => {
      if (this.channels[channel]) {
        this.channels[channel](alert);
      }
    });

    // Set cooldown
    this.cooldowns.set(rule.name, Date.now() + rule.cooldownMs);
  }

  _isInCooldown(name) {
    const expiry = this.cooldowns.get(name);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.cooldowns.delete(name);
      return false;
    }
    return true;
  }

  _sendBeacon(alert) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.beaconEndpoint, JSON.stringify(alert));
    }
  }

  async _sendWebhook(alert) {
    if (!this.webhookUrl) return;
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *${alert.severity.toUpperCase()}*: ${alert.message}`,
          blocks: [
            { type: 'header', text: { type: 'plain_text', text: `Alert: ${alert.rule}` } },
            { type: 'section', text: { type: 'mrkdwn', text: `*Severity*: ${alert.severity}\n*Value*: ${alert.value}\n*URL*: ${alert.url}` } }
          ]
        }),
      });
    } catch (e) {
      console.error('Failed to send webhook alert:', e);
    }
  }
}

// Setup alert rules:
const alertManager = new AlertManager({
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  beaconEndpoint: '/api/alerts',
});

// Error rate alert
alertManager.addRule({
  name: 'error_rate',
  condition: (rate) => rate > 0.05, // > 5%
  severity: 'critical',
  cooldownMs: 600_000, // 10 min cooldown
  channels: ['console', 'beacon', 'webhook'],
});

// Performance alert (LCP)
alertManager.addRule({
  name: 'lcp',
  condition: (ms) => ms > 4000, // > 4s
  severity: 'warning',
  cooldownMs: 300_000,
  channels: ['console', 'beacon'],
});

// CLS alert
alertManager.addRule({
  name: 'cls',
  condition: (value) => value > 0.25,
  severity: 'warning',
  cooldownMs: 300_000,
});

// Bundle size alert (CI/CD)
alertManager.addRule({
  name: 'bundle_size_increase',
  condition: (percentIncrease) => percentIncrease > 10,
  severity: 'info',
  channels: ['console'],
});


/* ============================================
   2. ERROR RATE MONITOR
   ============================================ */

/**
 * Sliding Window Error Rate Calculator
 * Calculates error rate over a time window
 */
class ErrorRateMonitor {
  constructor(windowMs = 300_000, checkIntervalMs = 30_000) {
    this.windowMs = windowMs;
    this.events = []; // { timestamp, isError }
    this.alertManager = null;

    setInterval(() => this._check(), checkIntervalMs);
  }

  setAlertManager(manager) {
    this.alertManager = manager;
  }

  recordSuccess() {
    this.events.push({ timestamp: Date.now(), isError: false });
    this._prune();
  }

  recordError() {
    this.events.push({ timestamp: Date.now(), isError: true });
    this._prune();
    this._check(); // Check immediately on error
  }

  getErrorRate() {
    this._prune();
    if (this.events.length === 0) return 0;
    const errors = this.events.filter(e => e.isError).length;
    return errors / this.events.length;
  }

  _prune() {
    const cutoff = Date.now() - this.windowMs;
    this.events = this.events.filter(e => e.timestamp > cutoff);
  }

  _check() {
    const rate = this.getErrorRate();
    if (this.alertManager && this.events.length > 10) { // Need minimum sample
      this.alertManager.evaluate('error_rate', rate);
    }
  }
}


/* ============================================
   3. REACT ALERTING COMPONENTS
   ============================================ */

/**
 * useErrorRate Hook
 */
function useErrorRate(windowMs = 300_000) {
  const monitorRef = React.useRef(new ErrorRateMonitor(windowMs));
  const [errorRate, setErrorRate] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setErrorRate(monitorRef.current.getErrorRate());
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  return {
    errorRate,
    recordSuccess: () => monitorRef.current.recordSuccess(),
    recordError: () => monitorRef.current.recordError(),
  };
}


/**
 * Performance Alert Banner (React)
 * Shows warning when performance degrades
 */
function PerformanceAlertBanner() {
  const [alerts, setAlerts] = React.useState([]);

  React.useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Long task detection
        if (entry.entryType === 'longtask' && entry.duration > 200) {
          setAlerts(prev => [...prev, {
            id: Date.now(),
            type: 'warning',
            message: `Long task detected: ${Math.round(entry.duration)}ms`,
          }]);
        }
      }
    });

    observer.observe({ type: 'longtask', buffered: true });
    return () => observer.disconnect();
  }, []);

  if (alerts.length === 0) return null;

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fef3c7', padding: '0.5rem', fontSize: '0.8rem',
      maxHeight: '100px', overflow: 'auto',
    }}>
      {alerts.slice(-5).map(alert => (
        <div key={alert.id}>⚠️ {alert.message}</div>
      ))}
    </div>
  );
}


/* ============================================
   4. SERVER-SIDE ALERT ENDPOINT (Express)
   ============================================ */

/*
const express = require('express');
const app = express();

app.post('/api/alerts', express.json(), (req, res) => {
  const alert = req.body;
  
  // Log alert
  console.log('[ALERT]', JSON.stringify(alert));
  
  // Forward to monitoring service
  // sendToSlack(alert);
  // sendToPagerDuty(alert);
  // sendToDatadog(alert);
  
  // Store for dashboard
  // db.alerts.insert(alert);
  
  res.status(202).json({ received: true });
});
*/


console.log('See README.md for documentation');
