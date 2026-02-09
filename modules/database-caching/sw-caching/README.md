# Service Worker Caching

> **Detailed implementation with full Service Worker code is in the Performance module:**
> See [`../../performance/network-optimization/sw-example.js`](../../performance/network-optimization/sw-example.js)

## Quick Reference for Interview

### Caching Strategies

| Strategy | When to Use | Code Pattern |
|----------|------------|--------------|
| **Cache First** | Static assets, fonts, icons | `cache.match() \|\| fetch()` |
| **Network First** | HTML, fresh content | `fetch() catch → cache.match()` |
| **Stale While Revalidate** | Images, non-critical | Return cache immediately, update in bg |
| **Cache Only** | Offline-only resources | `cache.match()` |
| **Network Only** | Real-time data, POST | `fetch()` |

### Service Worker Lifecycle

```
Register → Install → Activate → Fetch (intercept)
                ↓
          (waiting if old SW active)
                ↓
          skipWaiting() → takes over
```

### Cache API vs Service Worker

- **Cache API** (`caches.open()`): Can be used without Service Worker
- **Service Worker**: Intercepts fetch requests, applies caching strategies
- In practice: Service Worker uses Cache API under the hood

### Common Mistakes

1. **Not versioning caches** → Stale resources served forever
2. **Caching POST requests** → Data corruption
3. **Not cleaning old caches on activate** → Storage bloat
4. **Caching cross-origin without CORS** → Opaque responses waste quota
5. **Not handling SW updates** → Users stuck on old version
