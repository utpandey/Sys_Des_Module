# Database & Caching - Senior Interview Guide

## Quick-Fire Questions & Answers

---

### Storage

**Q: Compare localStorage, sessionStorage, cookies, and IndexedDB.**
A:
- **localStorage**: 5-10MB, persists forever, sync, same-origin, strings only
- **sessionStorage**: 5-10MB, tab-scoped, sync, lost on close
- **Cookies**: 4KB, sent to server with every request, has expiry, HttpOnly option
- **IndexedDB**: 50MB+, async, structured data, indexes, works in Service Workers

**Q: Where should you store JWT tokens?**
A: In **HttpOnly, Secure, SameSite=Strict cookies**. Never in localStorage (XSS can steal them) or regular cookies (JS-accessible). HttpOnly means JavaScript cannot read the cookie, so even if XSS occurs, the token is safe.

**Q: What happens when localStorage is full?**
A: `QuotaExceededError` is thrown. You must: 1) Wrap in try/catch, 2) Implement cleanup of old/expired data, 3) Consider IndexedDB for larger data needs.

**Q: How do you sync state across browser tabs?**
A: Use the `storage` event on `window`. It fires in OTHER tabs when localStorage changes. For more complex sync, use BroadcastChannel API or SharedWorker.

**Q: Why is localStorage synchronous a problem?**
A: It blocks the main thread. For large data reads/writes, it can cause jank. Use IndexedDB (async) for anything non-trivial. localStorage is fine for small config/preferences.

---

### Caching

**Q: Explain stale-while-revalidate.**
A: Return cached data instantly (even if stale) → make network request in background → update cache when response arrives → notify subscribers. Best UX because users see instant data while getting fresh updates.

**Q: How does HTTP caching work? What's the difference between ETag and Last-Modified?**
A:
- **ETag**: Content hash. Browser sends `If-None-Match` header. Server compares hashes, returns 304 if match. More accurate.
- **Last-Modified**: Timestamp. Browser sends `If-Modified-Since`. Server checks date. Less precise but lower overhead.
Both result in 304 Not Modified (no body transferred) if resource hasn't changed.

**Q: What's the difference between `no-cache` and `no-store`?**
A:
- `no-cache`: Store in cache but ALWAYS revalidate with server before using (sends conditional request)
- `no-store`: NEVER store anywhere. Every request is fresh. Use for sensitive data.

**Q: How would you cache API responses in a React app?**
A: Use React Query or SWR. They handle: deduplication (5 components requesting same URL → 1 network call), caching with stale time, background revalidation, retry on error, garbage collection. Don't reinvent this.

**Q: How does cache invalidation work after mutations?**
A: Three strategies:
1. **Refetch**: Invalidate query keys, library refetches (simplest, safest)
2. **Optimistic update**: Update cache immediately, rollback on error (best UX)
3. **Manual update**: Use mutation response to update cache (most efficient)

**Q: Service Worker vs HTTP Cache — when to use which?**
A:
- **HTTP Cache**: Automatic, browser-managed, based on headers. Good for standard caching.
- **Service Worker**: Programmable, you control the strategy per request. Essential for offline-first, custom caching logic, and when you need more control than HTTP headers provide.

---

### Normalization

**Q: Why normalize frontend state?**
A: To avoid data duplication. If User "John" appears in posts, comments, and reactions, normalize so John is stored once in `users.byId[1]`, and everything else references the ID. Update in one place → consistent everywhere.

**Q: What does normalized state look like?**
A:
```javascript
{
  users: { byId: { 1: { id: 1, name: 'John' } }, allIds: [1] },
  posts: { byId: { 1: { id: 1, authorId: 1 } }, allIds: [1] }
}
```
Flat structure. Entities stored by ID. Relations use IDs, not nested objects.

---

### State Management

**Q: When would you use Redux vs Context vs Zustand?**
A:
- **Context**: Theme, auth, small infrequent state. Free. But re-renders all consumers on any change.
- **Zustand**: Most apps. ~1KB. Selector-based (no re-render issues). No Provider needed. Simple.
- **Redux Toolkit**: Large apps with complex logic, need middleware, DevTools time-travel, or team already uses it.

**Q: What's the Context performance problem?**
A: When context value changes, ALL consumers re-render — even if they only use one property. Fix: 1) Split into multiple contexts, 2) Use `useMemo` for the value object, 3) Or use Zustand/Jotai which have built-in selectors.

**Q: Where should API/server data live?**
A: In a server-state library (React Query, SWR, RTK Query) — NOT in Redux/Context. These libraries handle caching, loading/error states, deduplication, and revalidation automatically. Mixing server data into client state creates complexity.

**Q: What state belongs in the URL?**
A: Anything that should be shareable or bookmarkable: pagination, search queries, filters, sort order, active tab. Use URL search params, not React state.

---

## Scenario-Based Questions

**Q: Design the caching strategy for an e-commerce product listing page.**
A:
1. **Product list**: SWR with 30s stale time. Prefetch next page on hover.
2. **Product detail**: Cache individually by ID. Prefetch on product hover.
3. **Cart**: localStorage for persistence + React state for reactivity.
4. **User session**: HttpOnly cookie.
5. **Search**: Debounce 300ms + cache results by query string.
6. **Images**: CDN with `Cache-Control: public, max-age=86400`.
7. **Offline**: Service Worker caches product shell and recently viewed.

**Q: You notice API requests are slow. How do you optimize?**
A:
1. **Deduplicate**: Ensure same request isn't fired multiple times
2. **Cache**: Implement SWR for repeated data
3. **Prefetch**: Load data before user needs it (hover, scroll near)
4. **Batch**: Combine multiple API calls into one
5. **Paginate**: Don't load all data at once
6. **Compress**: Ensure Brotli/Gzip is enabled
7. **CDN**: Cache API responses at the edge for public data

**Q: How would you handle offline support for a note-taking app?**
A:
1. **IndexedDB**: Store all notes locally
2. **Service Worker**: Cache app shell for offline access
3. **Sync Queue**: Queue changes when offline, sync when online
4. **Conflict Resolution**: Use last-write-wins or operational transform
5. **Optimistic UI**: Show changes immediately, sync in background
6. **Status Indicator**: Show online/offline status to user
