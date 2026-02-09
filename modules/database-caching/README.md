# Database & Caching (Frontend)

## Overview

Frontend storage and caching is about **choosing the right storage mechanism** for the right data, balancing performance, persistence, security, and capacity. As a senior engineer, you need to understand trade-offs, not just APIs.

---

## Storage Comparison Matrix

| Feature | Local Storage | Session Storage | Cookies | IndexedDB |
|---------|:------------:|:--------------:|:-------:|:---------:|
| **Capacity** | ~5-10 MB | ~5-10 MB | ~4 KB | 50+ MB |
| **Persistence** | Until cleared | Tab lifetime | Expiry-based | Until cleared |
| **Accessible from** | Same origin | Same origin + tab | Same origin (+ server) | Same origin |
| **Sync/Async** | Synchronous ⚠️ | Synchronous ⚠️ | Synchronous ⚠️ | Asynchronous ✅ |
| **Structured data** | Strings only | Strings only | Strings only | Any (incl. Blobs, Files) |
| **Web Workers** | ❌ | ❌ | ❌ | ✅ |
| **Service Workers** | ❌ | ❌ | ❌ | ✅ |
| **Sent to server** | ❌ | ❌ | ✅ (every request) | ❌ |
| **Indexable/Queryable** | ❌ | ❌ | ❌ | ✅ |

---

## When to Use What

| Data Type | Recommended Storage | Why |
|-----------|-------------------|-----|
| Auth tokens (JWT) | HttpOnly Cookie | Can't be accessed via JS (XSS safe) |
| User preferences (theme, lang) | Local Storage | Persists across sessions, small data |
| Form draft / wizard state | Session Storage | Lost when tab closes (intended) |
| CSRF tokens | Cookie (SameSite) | Auto-sent with requests |
| Large datasets / offline data | IndexedDB | Async, large capacity, queryable |
| API response cache | Cache API / IndexedDB | Structured, large, async |
| App state | Memory (Redux/Zustand/Context) | Fastest, no serialization |

---

## Module Topics

1. [Local Storage](./local-storage/) - Persistent key-value storage
2. [Session Storage](./session-storage/) - Tab-scoped storage
3. [Cookie Storage](./cookie-storage/) - Server-accessible storage with security
4. [IndexedDB](./indexeddb/) - Async structured database
5. [Normalization](./normalization/) - State normalization patterns
6. [HTTP Caching](./http-caching/) - Browser & CDN caching
7. [Service Worker Caching](./sw-caching/) - Offline-first caching
8. [API Caching](./api-caching/) - SWR, React Query, deduplication
9. [State Management](./state-management/) - Context, Redux, Zustand patterns

---

## Senior-Level Mental Model

```
┌─────────────────────────────────────────────────────┐
│                    Client                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Memory   │  │ Storage  │  │   IndexedDB      │  │
│  │ (State)   │  │ (LS/SS)  │  │   (Structured)   │  │
│  │ fastest   │  │ sync ⚠️   │  │   async ✅        │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────────────┘  │
│       │              │              │                 │
│  ┌────┴──────────────┴──────────────┴──────────┐    │
│  │         Service Worker / Cache API           │    │
│  └────┬─────────────────────────────────────────┘    │
│       │                                              │
│  ┌────┴─────────────────────────────────────────┐    │
│  │            Cookies (sent to server)           │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (Cache-Control, ETag)
┌──────────────────────┴──────────────────────────────┐
│                    CDN / Edge                         │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────┐
│                    Origin Server                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Redis    │  │ Memcached│  │   Database        │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Production Checklist

- [ ] Never store sensitive data in Local/Session Storage
- [ ] Use HttpOnly + Secure + SameSite cookies for auth
- [ ] Implement cache invalidation strategy
- [ ] Handle storage quota exceeded errors
- [ ] Encrypt sensitive data if stored client-side
- [ ] Use IndexedDB for large/structured data
- [ ] Normalize nested API responses
- [ ] Implement stale-while-revalidate for API caching
- [ ] Handle storage events for cross-tab sync
- [ ] Clean up expired/stale data periodically
