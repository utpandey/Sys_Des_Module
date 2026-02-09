# Network Optimization

## Overview

Network optimization reduces data transfer, minimizes latency, and improves load times for better user experience and Core Web Vitals scores.

---

## 1. Critical Rendering Path (CRP)

The Critical Rendering Path is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels on screen.

### The CRP Steps:
1. **DOM Construction** - Parse HTML → DOM Tree
2. **CSSOM Construction** - Parse CSS → CSSOM Tree
3. **Render Tree** - Combine DOM + CSSOM
4. **Layout** - Calculate positions and sizes
5. **Paint** - Draw pixels to screen

### Optimization Strategies:

| Strategy | Impact | Implementation |
|----------|--------|----------------|
| Minimize critical resources | High | Inline critical CSS, defer non-critical |
| Minimize critical bytes | High | Minify, compress, remove unused code |
| Minimize critical path length | High | Reduce round trips, async/defer scripts |

### ✅ DO's
- Inline critical CSS (above-the-fold styles)
- Use `async` or `defer` for non-critical scripts
- Preload critical resources
- Minimize render-blocking resources

### ❌ DON'Ts
- Don't put large CSS files in `<head>` without splitting
- Don't use synchronous scripts in `<head>`
- Don't load unused CSS/JS on initial render
- Don't block rendering with third-party scripts

---

## 2. Minimize HTTP Requests

Each HTTP request adds latency. Reducing requests improves performance significantly.

### Strategies:

| Technique | Description |
|-----------|-------------|
| **Bundling** | Combine multiple JS/CSS files into one |
| **Sprites** | Combine multiple images into one |
| **Inlining** | Embed small resources directly in HTML |
| **Data URIs** | Embed small images as base64 |
| **Icon Fonts/SVG** | Use icon fonts or inline SVGs |

### ✅ DO's
- Bundle JavaScript and CSS files
- Use CSS sprites for small icons
- Inline critical CSS (<14KB)
- Use SVG icons instead of image sprites
- Lazy load non-critical resources

### ❌ DON'Ts
- Don't make separate requests for tiny files
- Don't load resources you don't need
- Don't use too many third-party scripts
- Don't forget to combine API calls when possible

---

## 3. Avoid Redirection

Redirects add extra round trips, increasing latency.

### Types of Redirects:
- **301** - Permanent redirect (cached)
- **302** - Temporary redirect (not cached)
- **307** - Temporary redirect (preserves method)
- **308** - Permanent redirect (preserves method)

### Performance Impact:
```
Without redirect: DNS → TCP → TLS → Request → Response
With redirect:    DNS → TCP → TLS → Request → 301 → DNS → TCP → TLS → Request → Response
                                              ↑ Extra round trip!
```

### ✅ DO's
- Use direct URLs whenever possible
- Update internal links to final URLs
- Use 301 for permanent redirects (browser caches)
- Implement redirects at CDN/edge level

### ❌ DON'Ts
- Don't chain multiple redirects
- Don't use redirects for URL normalization on every request
- Don't redirect to different origins unnecessarily
- Don't use JavaScript redirects for navigation

---

## 4. Resource Hinting

Resource hints tell the browser about resources it will need, allowing early fetching.

### Types of Resource Hints:

| Hint | Purpose | Use Case |
|------|---------|----------|
| `dns-prefetch` | Resolve DNS early | Third-party domains |
| `preconnect` | DNS + TCP + TLS early | Critical third-party |
| `prefetch` | Low-priority future resource | Next page resources |
| `preload` | High-priority current page | Critical resources |
| `prerender` | Render entire page in background | Likely next page |
| `modulepreload` | Preload ES modules | JavaScript modules |

### Priority Levels:
```
preload > prefetch > dns-prefetch
(current page, high priority) → (future page, low priority)
```

### ✅ DO's
- Preconnect to critical third-party origins
- Preload fonts, critical CSS, hero images
- Prefetch resources for likely next navigation
- DNS-prefetch for all third-party domains

### ❌ DON'Ts
- Don't preload too many resources (wastes bandwidth)
- Don't prefetch resources user won't need
- Don't preconnect to too many origins (6 max recommended)
- Don't forget `crossorigin` for fonts

---

## 5. Fetch Priority

The Fetch Priority API (`fetchpriority` attribute) lets you hint the priority of resources.

### Priority Values:
- `high` - Higher priority than default
- `low` - Lower priority than default
- `auto` - Browser decides (default)

### Default Priorities by Resource:
| Resource Type | Default Priority |
|---------------|------------------|
| CSS in `<head>` | Highest |
| Scripts in `<head>` (blocking) | High |
| Fonts | High |
| Images in viewport | High |
| Images outside viewport | Low |
| Async/defer scripts | Low |

### ✅ DO's
- Use `fetchpriority="high"` for LCP images
- Use `fetchpriority="low"` for below-fold images
- Prioritize critical fonts
- Lower priority for analytics scripts

### ❌ DON'Ts
- Don't mark everything as high priority
- Don't forget LCP image priority
- Don't use high priority for non-critical resources

---

## 6. Early Hints (103 Status Code)

Early Hints allow servers to send preliminary response headers before the full response.

### How It Works:
```
1. Browser: GET /page
2. Server: 103 Early Hints (Link: </style.css>; rel=preload)
3. Browser: Starts fetching style.css
4. Server: 200 OK (full response)
5. Browser: Already has style.css loading!
```

### Benefits:
- Server can send hints while preparing response
- Browser starts fetching resources earlier
- Reduces perceived latency

### ✅ DO's
- Use for critical CSS, fonts, JavaScript
- Implement at CDN level for best results
- Combine with preload headers

### ❌ DON'Ts
- Don't send too many early hints
- Don't use for resources that might not be needed
- Don't rely solely on Early Hints (graceful degradation)

---

## 7. HTTP Upgrade Methods

### HTTP/1.1 vs HTTP/2 vs HTTP/3

| Feature | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---------|----------|--------|--------|
| **Protocol** | TCP | TCP | QUIC (UDP) |
| **Multiplexing** | No | Yes | Yes |
| **Head-of-line blocking** | Yes (connection) | Yes (TCP) | No |
| **Header compression** | No | HPACK | QPACK |
| **Server push** | No | Yes | Yes |
| **Connection setup** | TCP + TLS (2-3 RTT) | TCP + TLS (2-3 RTT) | 0-1 RTT |
| **Connection migration** | No | No | Yes |

### HTTP/2 Benefits:
- Single connection for multiple requests
- Binary protocol (more efficient)
- Header compression
- Stream prioritization

### HTTP/3 Benefits:
- No head-of-line blocking
- Faster connection establishment
- Better mobile performance
- Connection migration (WiFi → Cellular)

### ✅ DO's
- Enable HTTP/2 minimum on your server
- Enable HTTP/3 if supported
- Use HTTP/2 Server Push for critical resources
- Ensure TLS 1.3 for best HTTP/3 performance

### ❌ DON'Ts
- Don't stick with HTTP/1.1 for production
- Don't domain shard with HTTP/2 (hurts multiplexing)
- Don't concatenate files aggressively with HTTP/2

---

## 8. Compression: Brotli / Gzip

### Comparison:

| Feature | Gzip | Brotli |
|---------|------|--------|
| **Compression ratio** | Good (~70%) | Better (~80%) |
| **Speed** | Fast | Slower (but worth it) |
| **Browser support** | Universal | Modern browsers |
| **Best for** | Dynamic content | Static content |

### When to Use:
- **Gzip**: Dynamic content, real-time compression
- **Brotli**: Static assets (pre-compressed), better ratio

### Compression Levels:
```
Brotli: 0-11 (11 = best compression, slowest)
Gzip: 1-9 (9 = best compression, slowest)

Production recommendation:
- Brotli: 4-6 for dynamic, 11 for static (pre-compressed)
- Gzip: 6 for dynamic, 9 for static
```

### ✅ DO's
- Enable both Brotli and Gzip
- Pre-compress static assets with Brotli 11
- Compress text-based files (HTML, CSS, JS, JSON, SVG)
- Set proper Content-Encoding headers

### ❌ DON'Ts
- Don't compress already compressed files (images, videos)
- Don't use maximum compression for dynamic content
- Don't forget to set Vary: Accept-Encoding header
- Don't compress files under 150 bytes (overhead)

---

## 9. HTTP Caching: Cache-Control

### Cache-Control Directives:

| Directive | Purpose |
|-----------|---------|
| `public` | Any cache can store |
| `private` | Only browser can cache |
| `no-cache` | Must revalidate before using |
| `no-store` | Never cache |
| `max-age=N` | Cache for N seconds |
| `s-maxage=N` | CDN/proxy cache for N seconds |
| `immutable` | Never changes, no revalidation |
| `stale-while-revalidate=N` | Serve stale, revalidate in background |
| `stale-if-error=N` | Serve stale if origin errors |

### Caching Strategies:

| Resource Type | Strategy | Headers |
|---------------|----------|---------|
| Versioned assets (app.abc123.js) | Immutable | `Cache-Control: public, max-age=31536000, immutable` |
| HTML pages | Short cache + revalidate | `Cache-Control: public, max-age=0, must-revalidate` |
| API responses | Vary by user | `Cache-Control: private, max-age=300` |
| Static images | Long cache | `Cache-Control: public, max-age=86400` |

### ETag vs Last-Modified:
- **ETag**: Content hash, more accurate
- **Last-Modified**: Timestamp, less overhead

### ✅ DO's
- Use content hashing for versioned assets
- Set long max-age for immutable resources
- Use stale-while-revalidate for better UX
- Set proper Vary headers

### ❌ DON'Ts
- Don't cache sensitive data with `public`
- Don't set long cache without versioning
- Don't forget to cache static assets
- Don't cache error responses

---

## 10. Caching using Service Worker

### Caching Strategies:

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Cache First** | Cache → Network (fallback) | Static assets, offline-first |
| **Network First** | Network → Cache (fallback) | API calls, fresh content |
| **Stale While Revalidate** | Cache → Network (update cache) | Balance fresh + fast |
| **Cache Only** | Cache only | Offline-only resources |
| **Network Only** | Network only | Always-fresh data |

### Service Worker Lifecycle:
1. **Register** - Browser downloads SW
2. **Install** - Cache initial resources
3. **Activate** - Clean old caches
4. **Fetch** - Intercept requests

### ✅ DO's
- Cache shell/critical resources on install
- Use appropriate strategy per resource type
- Version your caches
- Clean up old caches on activate

### ❌ DON'Ts
- Don't cache sensitive/user data
- Don't cache POST requests
- Don't forget to handle SW updates
- Don't cache cross-origin without proper CORS

---

## Production Checklist

- [ ] Optimize Critical Rendering Path
- [ ] Minimize HTTP requests (bundle, sprite, inline)
- [ ] Eliminate unnecessary redirects
- [ ] Implement resource hints (preload, preconnect, prefetch)
- [ ] Set fetch priorities for critical resources
- [ ] Enable HTTP/2 or HTTP/3
- [ ] Enable Brotli + Gzip compression
- [ ] Configure Cache-Control headers properly
- [ ] Implement Service Worker caching
- [ ] Use Early Hints if supported

---

## Common Mistakes

1. **No resource hints** - Missing preconnect/preload for critical resources
2. **Wrong cache headers** - Not versioning assets, caching too short/long
3. **Missing compression** - Not enabling Brotli/Gzip
4. **Redirect chains** - Multiple redirects adding latency
5. **Blocking scripts** - Scripts in `<head>` without async/defer
6. **Wrong priorities** - LCP image not prioritized
7. **Over-caching** - Caching dynamic content too aggressively
8. **Under-caching** - Not caching static assets

---

## Implementation Examples

See the following files:
- `vanilla-examples.html` - Vanilla JavaScript implementations
- `react-nextjs-examples.jsx` - React/Next.js implementations  
- `server-examples.js` - Node.js/Express server implementations
