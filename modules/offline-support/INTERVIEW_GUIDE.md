# Offline Support — Senior Interview Guide

## Quick-Fire Questions & Answers

---

### Service Worker Fundamentals

**Q: What is a Service Worker and how does it work?**
A: A Service Worker is a JavaScript file that runs as a **network proxy** between your web app and the network. It runs in a separate thread (no DOM access), intercepts all network requests via the `fetch` event, and can serve responses from cache, network, or both. It enables offline support, push notifications, and background sync.

**Q: Explain the Service Worker lifecycle.**
A:
1. **Register**: `navigator.serviceWorker.register('/sw.js')` — browser downloads and parses
2. **Install**: Fires once for new SW. Pre-cache critical assets here with `event.waitUntil()`
3. **Waiting**: New SW waits until all tabs using old SW are closed
4. **Activate**: SW takes control. Clean up old caches here
5. **Idle → Fetch**: SW listens for `fetch` events and intercepts requests

Key point: SW doesn't control the page on first visit — only subsequent visits (unless you use `clients.claim()`).

**Q: What's the difference between `skipWaiting()` and `clients.claim()`?**
A:
- `self.skipWaiting()`: Tells a **waiting** SW to activate immediately instead of waiting for old tabs to close
- `self.clients.claim()`: Makes the newly activated SW take control of **all open pages** immediately
- ⚠️ Using both together is risky: old HTML + new SW = potential asset mismatches. Always pair with a page reload.

**Q: Can a Service Worker access the DOM?**
A: No. SW runs in a separate worker thread. It communicates with pages via `postMessage()`, the Clients API, and the Broadcast Channel API. It also has no access to `localStorage`, `sessionStorage`, `document`, or `window`.

---

### Caching Strategies

**Q: Explain the main caching strategies and when to use each.**
A:

| Strategy | Use Case | Example |
|----------|----------|---------|
| **Cache First** | Static assets that rarely change | CSS, JS bundles, fonts, images |
| **Network First** | Data that must be fresh | API responses, HTML pages |
| **Stale While Revalidate** | Speed matters, freshness acceptable | User avatars, non-critical API |
| **Cache Only** | Pre-cached offline resources | Offline fallback page |
| **Network Only** | Must not be cached | Analytics pings, payment APIs |

Decision: Static? → Cache First. Must be fresh? → Network First. Speed over freshness? → SWR.

**Q: How do you invalidate cached data?**
A:
1. **Cache versioning**: Name caches `static-v1`, `static-v2`. Delete old ones in `activate` event
2. **Cache headers**: Set appropriate `Cache-Control` (SW cache and HTTP cache work independently)
3. **Background revalidation**: SWR strategy updates cache after serving stale
4. **Manual purge**: `caches.delete('cache-name')` triggered by app logic or `postMessage`
5. **TTL in SW**: Check timestamp in cached response, refetch if expired

**Q: What happens when a user visits your site for the first time?**
A: The SW registers but does **not** control the page load. Assets are fetched from network normally. The `install` event fires, pre-caching the app shell. On the **second visit**, the SW intercepts requests and can serve from cache. First visit performance depends on regular HTTP caching + server optimization.

**Q: What's the difference between Cache API and HTTP cache?**
A:
- **HTTP Cache**: Browser's built-in, controlled by `Cache-Control` headers, automatic, respects directives
- **Cache API**: Programmatic, used in Service Workers, fully controllable, independent of HTTP headers
- They work in **layers**: SW fetch → Cache API → HTTP cache → Network
- You can have both: HTTP cache for first visit, Cache API for SW-controlled responses

---

### Background Sync & Push

**Q: How does Background Sync work?**
A:
1. User performs action while offline (e.g., sends message)
2. App stores the request in IndexedDB
3. App registers a sync event: `registration.sync.register('sync-outbox')`
4. When connection restores, browser fires the `sync` event in the SW
5. SW processes queued requests from IndexedDB
6. If sync fails, browser retries automatically

Fallback for browsers without Background Sync: listen for `online` event and flush queue manually.

**Q: How do push notifications work in a PWA?**
A:
1. App requests `Notification.requestPermission()`
2. If granted, subscribe via `pushManager.subscribe()` with VAPID key
3. Send subscription to your server
4. Server sends push via Web Push protocol to browser's push service
5. Browser wakes up SW (even if app is closed)
6. SW receives `push` event → shows notification
7. User clicks notification → `notificationclick` event fires → open/focus app

---

### PWA

**Q: What makes a web app a PWA?**
A: Three core requirements:
1. **HTTPS** (except localhost)
2. **Service Worker** with a `fetch` handler
3. **Web App Manifest** (`manifest.json`) with name, icons, start_url, display mode

Plus it should: work offline (at least show a fallback page), be responsive, and load fast.

**Q: What is the Web App Manifest?**
A: A JSON file (`manifest.json`) that tells the browser about your app:
- `name` / `short_name` — display name
- `start_url` — what opens when app launches
- `display` — standalone, fullscreen, minimal-ui, browser
- `icons` — different sizes for different devices
- `theme_color` — address bar/task switcher color
- `background_color` — splash screen background
- `screenshots` / `shortcuts` — richer install experience

**Q: PWA vs Native — what are the trade-offs?**
A:

| | PWA | Native |
|---|---|---|
| Distribution | URL, no app store | App Store / Play Store |
| Install | Optional, instant | Required, download size |
| Updates | Instant (SW update) | Store review + user update |
| Offline | Cache API + IndexedDB | Full device storage |
| Hardware access | Limited (improving) | Full (camera, BT, NFC) |
| Push notifications | Yes (limited on iOS) | Full |
| Cost | Single codebase | Per-platform |
| Discoverability | SEO, sharable URL | App Store ranking |

Choose PWA for content-heavy apps, broad reach, quick iteration. Choose native for hardware-intensive features, gaming, or when App Store presence is critical.

---

### Scenario Questions

**Q: Design an offline-first note-taking app. What's your architecture?**
A:
1. **App Shell**: Pre-cache HTML/CSS/JS on SW install → instant load
2. **Data storage**: IndexedDB for notes (structured, large data, async)
3. **Sync strategy**: 
   - Read: Cache First from IndexedDB, background sync with server
   - Write: Write to IndexedDB immediately → queue server sync
   - Conflict resolution: Last-write-wins with timestamps (or CRDTs for collaborative)
4. **Background Sync**: Queue POST/PUT requests → SW syncs when online
5. **UI**: Show "saved locally" vs "synced" status per note
6. **Manifest**: standalone mode, proper icons, start_url
7. **Updates**: SWR for SW updates with user-facing prompt

**Q: How would you handle SW updates in production?**
A:
1. Set `updateViaCache: 'none'` in registration (bypass HTTP cache for SW file)
2. Browser automatically checks for byte changes in SW on navigation (+ periodic check)
3. New SW installs in background → enters "waiting" state
4. Show "Update available" banner to user (NOT auto-skip-waiting!)
5. User clicks "Update" → `postMessage({ type: 'SKIP_WAITING' })` to waiting SW
6. New SW activates → `controllerchange` fires → page reloads
7. Reason: Auto-skip can break pages mid-session (old HTML + new assets)

**Q: A user reports that your PWA shows stale data. How do you debug?**
A:
1. **Check SW status**: DevTools → Application → Service Workers
2. **Check cache contents**: Application → Cache Storage
3. **Verify caching strategy**: Is the API using Network First or Cache First?
4. **Check SW version**: Is user stuck on old SW? (waiting state?)
5. **Check Cache-Control headers**: Are API responses being cached by HTTP cache too?
6. **Check update mechanism**: Is the SW update prompt working?
7. **Fix**: Switch API strategy to Network First or SWR, add cache versioning, ensure SW update flow works

**Q: How do you handle the transition from online to offline in UX?**
A:
1. **Detect**: Listen for `online`/`offline` events + `navigator.onLine`
2. **Inform**: Show non-intrusive banner "You're offline" (aria-live for screen readers)
3. **Degrade gracefully**: Disable features that require network (submit, search)
4. **Queue writes**: Store pending actions, show "will sync when online"
5. **Resume**: Auto-retry queued actions when back online
6. **Feedback**: Show "Back online" briefly, sync progress indicator
7. **Never**: Show blank screens, error pages, or unhandled fetch failures
