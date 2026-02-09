# HTTP Caching

> **Detailed implementation examples are in the Performance module:**
> See [`../../performance/network-optimization/`](../../performance/network-optimization/) for server and client implementations.

## Quick Reference for Interview

### Cache-Control Cheat Sheet

```
# Immutable assets (hashed filenames: app.abc123.js)
Cache-Control: public, max-age=31536000, immutable

# HTML pages (always revalidate)
Cache-Control: public, max-age=0, must-revalidate

# Private API responses
Cache-Control: private, max-age=300

# Best UX (serve stale, update in background)
Cache-Control: public, max-age=60, stale-while-revalidate=3600

# Never cache (sensitive data)
Cache-Control: no-store
```

### Decision Tree

```
Is the response sensitive/personal?
├── Yes → Cache-Control: no-store
│         (or private, short max-age)
└── No → Is it a versioned static asset?
    ├── Yes → public, max-age=31536000, immutable
    └── No → Does it change frequently?
        ├── Yes → public, max-age=0, must-revalidate
        │         (with ETag for conditional requests)
        └── No → public, max-age=3600, stale-while-revalidate=86400
```

### Validation Mechanisms

| Mechanism | Header | Purpose |
|-----------|--------|---------|
| **ETag** | `If-None-Match` | Content hash comparison |
| **Last-Modified** | `If-Modified-Since` | Timestamp comparison |

**304 Not Modified** = "Your cached copy is still good"

### Common Mistakes

1. **Long cache without versioning** → Users stuck on old code
2. **`no-cache` ≠ `no-store`** → `no-cache` still stores but revalidates
3. **Missing `Vary: Accept-Encoding`** → Compressed and uncompressed responses conflict
4. **Caching error responses** → 500s cached by CDN
5. **Not using `immutable`** → Browser still revalidates on refresh
