# Logging & Monitoring (Frontend)

## Overview

Frontend logging and monitoring is about **knowing what's happening in production** — capturing errors, tracking performance, understanding user behavior, and getting alerted when things go wrong. As a senior engineer, you own the observability of your frontend.

---

## The Three Pillars of Observability

| Pillar | What | Frontend Example |
|--------|------|-----------------|
| **Logs** | Discrete events | Error logs, console output, API failures |
| **Metrics** | Numerical measurements over time | CWV scores, error rates, load times |
| **Traces** | Request flow across services | User click → API call → render |

---

## Frontend Monitoring Lifecycle

```
1. INSTRUMENT → Add tracking code to your app
       ↓
2. COLLECT → Capture errors, metrics, events
       ↓
3. TRANSPORT → Send data to monitoring service
       ↓
4. ANALYZE → Dashboards, queries, aggregation
       ↓
5. ALERT → Notify team when thresholds breach
       ↓
6. FIX → Debug with source maps, session replay, traces
```

---

## What to Monitor (Production Checklist)

### Errors
- [ ] Unhandled exceptions (`window.onerror`)
- [ ] Unhandled promise rejections
- [ ] API errors (4xx, 5xx, timeouts)
- [ ] React Error Boundaries
- [ ] CSP violations

### Performance
- [ ] Core Web Vitals (LCP, FID/INP, CLS)
- [ ] Time to First Byte (TTFB)
- [ ] First Contentful Paint (FCP)
- [ ] Resource load times
- [ ] Long tasks (> 50ms)
- [ ] Memory usage

### User Behavior
- [ ] Page views / navigation
- [ ] Feature usage (clicks, interactions)
- [ ] Conversion funnels
- [ ] Rage clicks (frustrated users)
- [ ] Dead clicks (broken UI)

### Infrastructure
- [ ] Bundle size changes
- [ ] CDN hit rates
- [ ] Service Worker status
- [ ] Third-party script performance

---

## Module Topics

1. [Telemetry](./telemetry/) - Collecting data (errors, metrics, events)
2. [Alerting](./alerting/) - Notifications when things go wrong
3. [Fixing](./fixing/) - Debugging production issues

---

## Tools Landscape

| Category | Tools |
|----------|-------|
| **Error Tracking** | Sentry, Bugsnag, LogRocket, Datadog RUM |
| **Performance** | Lighthouse CI, SpeedCurve, Web Vitals, Datadog |
| **Analytics** | Google Analytics, Mixpanel, Amplitude, PostHog |
| **Session Replay** | LogRocket, FullStory, Hotjar |
| **Alerting** | PagerDuty, OpsGenie, Slack webhooks |
| **APM** | Datadog, New Relic, Dynatrace |

---

## ✅ DO's

1. **Capture all unhandled errors** in production
2. **Upload source maps** (but keep them private!)
3. **Monitor Core Web Vitals** (Google ranking factor)
4. **Set up alerts** for error rate spikes
5. **Use structured logging** (JSON, not strings)
6. **Sample high-volume events** to control costs
7. **Track deployments** to correlate with errors

## ❌ DON'Ts

1. **Don't log PII** (personal data) — compliance risk
2. **Don't expose source maps publicly** — security risk
3. **Don't log everything** — costs and noise
4. **Don't ignore monitoring in development** — test your monitoring
5. **Don't alert on every error** — alert fatigue
6. **Don't forget mobile/slow networks** — they fail differently
