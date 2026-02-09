# Service Workers

## Overview

A Service Worker is a **JavaScript proxy** that sits between your web app and the network. It intercepts every network request and lets you decide: serve from cache, fetch from network, or both. It runs in a separate thread (no DOM access) and works even when the page is closed.

---

## Service Worker Lifecycle

```
                     ┌──────────┐
                     │ Register │ ← navigator.serviceWorker.register()
                     └────┬─────┘
                          ▼
                     ┌──────────┐
                     │ Install  │ ← Pre-cache critical assets
                     └────┬─────┘
                          ▼
                    ┌───────────┐
                    │ Waiting   │ ← New SW waits for old tabs to close
                    └────┬──────┘
                         ▼
                    ┌───────────┐
                    │ Activate  │ ← Clean up old caches
                    └────┬──────┘
                         ▼
                    ┌───────────┐
                    │ Idle      │ ← Listening for fetch events
                    └────┬──────┘
                         ▼
                    ┌───────────┐
                    │ Fetch     │ ← Intercept requests → choose strategy
                    └───────────┘
```

### Key Lifecycle Events:
- **install**: Fires once when a new SW is detected. Pre-cache assets here.
- **activate**: Fires when SW takes control. Clean up old caches here.
- **fetch**: Fires on every network request. Apply caching strategy here.

---

## Caching Strategies (MUST KNOW for Interviews)

| Strategy | How It Works | Use Case |
|----------|-------------|----------|
| **Cache First** | Check cache → if miss, fetch network | Static assets (CSS, JS, images) |
| **Network First** | Fetch network → if fail, use cache | API data, HTML pages |
| **Stale While Revalidate** | Return cache immediately → fetch network in background → update cache | Frequently updated resources |
| **Cache Only** | Only serve from cache | Offline-only resources |
| **Network Only** | Always fetch from network | Real-time data, analytics |

### Decision Tree:
```
Is the resource static (doesn't change)?
  YES → Cache First
  NO → Does user need latest data?
    YES → Network First (with cache fallback)
    NO → Stale While Revalidate
```

---

## ✅ DO's

1. **Pre-cache critical assets** in `install` event (app shell)
2. **Version your caches** (`cache-v1`, `cache-v2`) to enable clean updates
3. **Clean old caches** in `activate` event
4. **Use `skipWaiting()`** carefully — can break in-flight requests
5. **Handle SW updates** with a "New version available" prompt
6. **Use `clients.claim()`** in activate to control all pages immediately
7. **Scope your cache strategies** — different strategies for different resources

## ❌ DON'Ts

1. **Don't cache opaque responses** (cross-origin without CORS) without understanding the 7MB cost
2. **Don't cache POST/PUT/DELETE** requests — side effects!
3. **Don't use `skipWaiting()` + `clients.claim()`** without a reload — mixing old HTML with new assets
4. **Don't forget error handling** in fetch — network can fail mid-stream
5. **Don't precache too much** — slow install, wasted storage

---

## Common Interview Questions

**Q: Can a Service Worker access the DOM?**
A: No. SW runs in a separate thread. It communicates with pages via `postMessage()` and the Clients API.

**Q: What's the difference between `cache.add()` and `cache.put()`?**
A: `cache.add(url)` fetches and caches in one step. `cache.put(request, response)` lets you cache a custom response (e.g., modified response, or from a different source).

**Q: How does SW update work?**
A: Browser checks for byte differences in SW file. If changed → installs new SW → new SW enters "waiting" state → when all tabs with old SW close → new SW activates. You can skip the wait with `self.skipWaiting()`.

**Q: What happens on first visit?**
A: SW registers during first visit but doesn't control that page load. On second visit (or after `clients.claim()`), SW intercepts requests. This is why you still need HTTP caching for first load.
