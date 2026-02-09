# Telemetry

## Overview

Telemetry is the **automated collection and transmission** of data from your frontend to monitoring systems. It covers error tracking, performance metrics, custom events, and user behavior.

---

## Types of Telemetry Data

| Type | Examples | Priority |
|------|---------|:--------:|
| **Errors** | JS exceptions, API failures, CSP violations | 🔴 Critical |
| **Performance** | CWV, TTFB, resource timing, long tasks | 🟠 High |
| **Custom Events** | Button clicks, feature usage, conversions | 🟡 Medium |
| **Session Data** | Page views, navigation, user flow | 🟢 Standard |

---

## ✅ DO's

1. **Capture errors with full context** (stack trace, user, URL, browser)
2. **Use Performance Observer API** for Web Vitals
3. **Batch telemetry events** before sending (reduce network calls)
4. **Use `sendBeacon()`** for reliable delivery on page unload
5. **Sample high-frequency events** (e.g., 10% of scroll events)
6. **Add breadcrumbs** (trail of events before an error)
7. **Tag events with deployment version** for correlation

## ❌ DON'Ts

1. **Don't send telemetry synchronously** (blocks UI)
2. **Don't include PII** in telemetry data
3. **Don't send on every event** (batch them)
4. **Don't ignore CORS** for telemetry endpoints
5. **Don't forget consent** (GDPR compliance)
