# Offline Support

## Overview

Offline support is about making your web application **work without a network connection** — or at least degrade gracefully. At a senior level, this means understanding Service Workers, caching strategies, background sync, and building full Progressive Web Applications (PWAs).

> **"Offline-first isn't about offline users. It's about bad connections, slow networks, and lie-fi."**

---

## Why Offline Support Matters

| Reason | Detail |
|--------|--------|
| **Reliability** | Apps work on flaky connections (subway, flights, rural areas) |
| **Performance** | Cached resources load instantly — no network roundtrip |
| **Engagement** | PWAs can be installed, send push notifications, run in background |
| **Resilience** | Graceful degradation instead of blank screens |
| **Mobile-first** | Mobile networks are unreliable by nature |

---

## The Offline Stack

```
┌────────────────────────────────────┐
│         Progressive Web App        │  ← Install, push, background sync
├────────────────────────────────────┤
│       Service Worker (proxy)       │  ← Intercepts ALL network requests
├────────────────────────────────────┤
│         Cache API / IndexedDB      │  ← Storage for assets and data
├────────────────────────────────────┤
│      Web App Manifest              │  ← Metadata for installation
├────────────────────────────────────┤
│         HTTPS (required)           │  ← Service Workers require HTTPS
└────────────────────────────────────┘
```

---

## Module Topics

1. [Service Workers](./service-workers/) — Registration, lifecycle, caching strategies, background sync
2. [Progressive Web Applications](./pwa/) — Manifest, installability, push notifications, offline UX

---

## Offline Capability Levels

| Level | Description | Implementation |
|:-----:|-------------|---------------|
| **0** | No offline support | Blank page when offline |
| **1** | Custom offline page | SW serves a fallback page |
| **2** | Static shell cached | App shell works offline, data needs network |
| **3** | Read-only offline | Cached API data available offline |
| **4** | Full offline-first | Read & write offline, sync when online |

---

## ✅ DO's

1. **Always register Service Worker over HTTPS** (except localhost)
2. **Cache the app shell** (HTML, CSS, JS) on install
3. **Use appropriate caching strategies** per resource type
4. **Provide offline feedback** — tell users they're offline
5. **Queue offline writes** and sync when online (Background Sync API)
6. **Version your caches** — clean up old caches on activation
7. **Test offline mode** — Chrome DevTools → Application → Service Workers → Offline

## ❌ DON'Ts

1. **Don't cache everything** — be selective, storage has limits
2. **Don't forget cache invalidation** — stale data is worse than no data
3. **Don't block the install event** with huge precaches
4. **Don't ignore Service Worker updates** — users get stuck on old versions
5. **Don't assume online** — always handle network failures gracefully
6. **Don't cache POST requests** — they have side effects
7. **Don't skip the offline UX** — show meaningful feedback, not errors

---

## Production Checklist

- [ ] Service Worker registered and active
- [ ] App shell cached on install (HTML, CSS, core JS)
- [ ] Custom offline fallback page
- [ ] API responses cached with appropriate strategy
- [ ] Old caches cleaned up on SW activation
- [ ] Online/offline status indicator in UI
- [ ] Offline writes queued and synced
- [ ] Web App Manifest with icons, theme color, display mode
- [ ] Passes Lighthouse PWA audit
- [ ] HTTPS enforced
- [ ] SW update flow handles gracefully (skipWaiting + reload prompt)
