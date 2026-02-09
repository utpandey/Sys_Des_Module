# API Caching

## Overview

API caching on the frontend is about avoiding redundant network requests while keeping data fresh. This is one of the **most impactful** performance optimizations for data-heavy apps.

---

## Caching Strategies

### 1. Stale-While-Revalidate (SWR)
Return cached data instantly, fetch fresh data in background, update when ready.
```
User request → Return cache (instant) → Fetch network (background) → Update UI
```

### 2. Cache-First
Only fetch if not in cache.
```
User request → Check cache → Hit? Return. Miss? Fetch, cache, return.
```

### 3. Network-First
Always fetch, fallback to cache on failure.
```
User request → Fetch → Success? Return + cache. Fail? Return cached.
```

### 4. Time-Based
Cache for a fixed duration, re-fetch when expired.
```
User request → Cache age < TTL? Return cache. Expired? Re-fetch.
```

---

## ✅ DO's

1. **Deduplicate in-flight requests** (don't fire same request twice)
2. **Use SWR pattern** for best UX (instant response + fresh data)
3. **Invalidate cache on mutations** (POST/PUT/DELETE → refetch related queries)
4. **Set appropriate TTLs** per resource type
5. **Cache at the right layer** (memory > IndexedDB > HTTP cache)
6. **Handle stale data in UI** (loading states, optimistic updates)

## ❌ DON'Ts

1. **Don't cache user-specific data globally** (data leaks between users)
2. **Don't forget to invalidate** (stale data is worse than no cache)
3. **Don't cache error responses** (transient errors get stuck)
4. **Don't ignore race conditions** (older response arriving after newer one)
5. **Don't cache without size limits** (memory leaks)

---

## Library Comparison (Senior Knowledge)

| Feature | SWR (Vercel) | React Query (TanStack) | RTK Query |
|---------|:---:|:---:|:---:|
| Bundle size | ~4KB | ~13KB | Part of RTK |
| Stale-while-revalidate | ✅ | ✅ | ✅ |
| Deduplication | ✅ | ✅ | ✅ |
| Polling | ✅ | ✅ | ✅ |
| Infinite scroll | ✅ | ✅ | ❌ |
| Optimistic updates | ✅ | ✅ | ✅ |
| Offline support | Basic | ✅ | Basic |
| DevTools | ❌ | ✅ | Redux DevTools |
| Auto garbage collection | ✅ | ✅ | ✅ |
| Structural sharing | ✅ | ✅ | ❌ |

---

## Common Interview Questions

**Q: How would you handle caching for a list that also has detail views?**
A: Normalize the data. Cache the list response, and when viewing detail, check if the entity already exists in cache. Use cache as initial data and revalidate in background.

**Q: How do you handle cache invalidation after a mutation?**
A: Three approaches: 1) Refetch related queries (safest), 2) Optimistic update + rollback on error (best UX), 3) Manual cache update with response data (most efficient).

**Q: How do you prevent thundering herd when cache expires?**
A: Request deduplication ensures only one network request fires even if multiple components need the same data simultaneously.
