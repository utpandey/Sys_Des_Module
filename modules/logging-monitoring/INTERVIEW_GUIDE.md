# Logging & Monitoring - Senior Interview Guide

## Quick-Fire Questions & Answers

---

### Fundamentals

**Q: What are the three pillars of observability?**
A:
1. **Logs**: Discrete events (error occurred, user action, API call)
2. **Metrics**: Numerical measurements over time (error rate, LCP, response time)
3. **Traces**: Request flow across services (user click → API → render)

**Q: What should you monitor in a production frontend?**
A: Four categories:
- **Errors**: Unhandled exceptions, promise rejections, API errors, CSP violations
- **Performance**: Core Web Vitals (LCP, INP, CLS), TTFB, long tasks, memory
- **User behavior**: Page views, feature usage, rage clicks, conversion funnels
- **Infrastructure**: Bundle size, CDN hit rates, Service Worker status

---

### Telemetry

**Q: How do you capture frontend errors in production?**
A: Three layers:
1. `window.onerror` — catches all unhandled JS errors
2. `window.addEventListener('unhandledrejection')` — catches unhandled promise rejections
3. React Error Boundaries — catches React component errors
Plus: instrument `fetch` to catch API errors, and listen for `securitypolicyviolation` for CSP violations.

**Q: What are breadcrumbs in error tracking?**
A: A trail of events (clicks, navigation, API calls, console logs) captured before an error occurs. When an error is reported, the breadcrumbs show what the user did leading up to it. Sentry captures ~20-30 most recent breadcrumbs.

**Q: How do you send telemetry reliably on page unload?**
A: Use `navigator.sendBeacon()`. It's designed for this — it queues the request and delivers it even if the page closes. The `fetch` API with `keepalive: true` also works. The `visibilitychange` event (not `unload`) is the right trigger.

**Q: How do you handle high-volume telemetry without killing performance?**
A:
1. **Batch events** (send every 5-10s instead of per-event)
2. **Sample high-frequency events** (e.g., only 10% of scroll events)
3. **Use `sendBeacon`** (non-blocking)
4. **Use `requestIdleCallback`** for non-critical telemetry
5. **Set max queue size** to prevent memory issues

**Q: Explain Core Web Vitals. How do you monitor them?**
A:
- **LCP** (Largest Contentful Paint): Loading speed. Good: < 2.5s
- **INP** (Interaction to Next Paint): Responsiveness. Good: < 200ms (replaced FID)
- **CLS** (Cumulative Layout Shift): Visual stability. Good: < 0.1
Monitor with PerformanceObserver API, or use `web-vitals` library. Report to analytics endpoint. Use p75 (75th percentile) as the benchmark, not average.

---

### Alerting

**Q: How do you design an alerting strategy for a frontend?**
A:
- **Critical** (page someone): Error rate > 5%, app down
- **Warning** (Slack): Error rate > 1%, LCP > 4s for sustained period
- **Info** (dashboard): Deploy completed, bundle size change
- Key principles: Alert on symptoms not causes, use percentiles not averages, include runbook links, set cooldowns to prevent spam.

**Q: What is alert fatigue and how do you prevent it?**
A: Alert fatigue is when the team receives so many alerts they start ignoring them — even critical ones. Prevention:
1. Only alert on actionable issues
2. Set proper thresholds (baselines, not guesses)
3. Deduplicate similar alerts (group by error fingerprint)
4. Use cooldown periods (don't re-alert for same issue in 10 min)
5. Review alerts quarterly and remove noisy ones

**Q: Why should you use percentiles (p75, p95) instead of averages?**
A: Averages hide outliers. If 90% of users have 500ms LCP and 10% have 10s LCP, the average is 1.45s (looks fine!). P75 = 500ms but P95 = 10s — which reveals the real problem for a significant portion of users. Google uses p75 for CWV thresholds.

---

### Fixing / Debugging

**Q: How do you debug an error that only happens in production?**
A: Systematic approach:
1. **Error tracking** (Sentry): Get stack trace with source maps
2. **Breadcrumbs**: What did the user do before the error?
3. **Context**: Browser, OS, device, connection type
4. **Network**: Was an API call failing?
5. **Deployment**: Did this start after a deploy? (correlate timestamps)
6. **Session replay**: Watch what the user experienced
7. **Reproduce**: Try to recreate with same browser/device/data

**Q: How do you handle source maps in production?**
A:
1. Generate with `hidden-source-map` (doesn't add URL reference in bundle)
2. Upload to Sentry/Bugsnag in CI/CD pipeline
3. Delete from deployment artifacts (never serve publicly)
4. Tag with release version for proper mapping
5. Keep for retention period (match your error retention)

**Q: What's your approach to structured logging?**
A: Use JSON structured logs instead of strings:
```javascript
// ❌ Bad
console.log('User login failed for user 123');

// ✅ Good
logger.error('Login failed', { userId: 123, reason: 'invalid_password', attempt: 3 });
```
Benefits: Searchable, filterable, aggregatable, parseable by log systems.

---

### Scenario Questions

**Q: You see a spike in errors after a deployment. Walk me through your response.**
A:
1. **Assess severity**: Error rate? User impact? (dashboard/Sentry)
2. **Quick mitigation**: If > 5% error rate, consider rolling back immediately
3. **Identify the error**: Stack trace, affected pages, error message
4. **Check diff**: What changed in this deploy?
5. **Reproduce**: Can we hit the error in staging?
6. **Fix or rollback**: Fix if quick, rollback if not
7. **Post-mortem**: Why wasn't this caught in testing/staging?

**Q: How would you set up frontend monitoring from scratch?**
A:
1. **Error tracking**: Sentry (captures errors, stack traces, breadcrumbs)
2. **Performance**: Web Vitals reporting → custom endpoint or Datadog RUM
3. **Analytics**: PostHog or Mixpanel for user behavior
4. **Alerting**: Sentry alerts → Slack, PagerDuty for critical
5. **Source maps**: Upload in CI/CD, delete from build
6. **Dashboard**: Error rates, CWV, deployment markers

**Q: A user reports "the page is slow." How do you investigate?**
A:
1. **Check CWV dashboard**: Is LCP/INP degraded globally or per-page?
2. **Check recent deploys**: Performance regression?
3. **Check specific user context**: Device? Connection? Location?
4. **Resource timing**: Any slow-loading resources? (blocked CDN, large bundle)
5. **Long tasks**: Main thread blocking? (check with PerformanceObserver)
6. **Network waterfall**: DNS? TLS? Server response time?
7. **Third-party scripts**: Any slow external scripts?

**Q: How do you ensure monitoring itself doesn't hurt performance?**
A:
1. **Batch events** (don't send per-event)
2. **Use `sendBeacon`** (non-blocking, no response needed)
3. **Sample high-volume events** (e.g., 10% of scrolls)
4. **Defer non-critical tracking** (requestIdleCallback)
5. **Keep SDK bundle small** (Sentry lazy-loads heavy modules)
6. **Set limits** (max breadcrumbs, max queue size)
