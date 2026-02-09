# Cookie Storage

## Overview

Cookies are the **only client-side storage sent to the server** with every HTTP request. They're essential for authentication, session management, and tracking — but misusing them is a major security risk.

---

## Cookie Attributes (MUST KNOW)

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `HttpOnly` | Blocks JavaScript access (XSS protection) | `HttpOnly` |
| `Secure` | Only sent over HTTPS | `Secure` |
| `SameSite` | CSRF protection | `SameSite=Strict\|Lax\|None` |
| `Domain` | Which domains receive the cookie | `Domain=.example.com` |
| `Path` | Which paths receive the cookie | `Path=/api` |
| `Max-Age` | Seconds until expiry | `Max-Age=86400` |
| `Expires` | Absolute expiry date | `Expires=Thu, 01 Jan 2026...` |
| `Partitioned` | Third-party cookie isolation (CHIPS) | `Partitioned` |

---

## SameSite Deep Dive

| Value | Cross-site requests | Safe for | CSRF protection |
|-------|:------------------:|----------|:---------------:|
| `Strict` | Never sent | Auth tokens | ✅ Best |
| `Lax` (default) | Only on top-level navigation (GET) | Session cookies | ✅ Good |
| `None` | Always (requires `Secure`) | Third-party embeds, iframes | ❌ None |

### SameSite Decision Tree:
```
Is the cookie used cross-site? 
├── No → Use SameSite=Strict (maximum security)
└── Yes → Does it need to work in iframes?
    ├── No → Use SameSite=Lax (good default)
    └── Yes → Use SameSite=None; Secure (must have)
```

---

## ✅ DO's

1. **Always set `HttpOnly` for auth cookies** (prevents XSS token theft)
2. **Always set `Secure`** (prevents MITM interception)
3. **Set `SameSite=Strict` or `Lax`** (CSRF protection)
4. **Set explicit `Path` and `Domain`** (minimize cookie scope)
5. **Use short `Max-Age` for sensitive cookies**
6. **Prefix cookie names** (`__Host-` or `__Secure-`)

## ❌ DON'Ts

1. **Never store sensitive data in JS-accessible cookies**
2. **Never set cookies without `Secure` in production**
3. **Never use `SameSite=None` without understanding cross-site implications**
4. **Don't store large data in cookies** (4KB limit, sent with EVERY request)
5. **Don't use cookies for client-only storage** (use localStorage/sessionStorage)
6. **Don't forget cookies count towards HTTP header size**

---

## Cookie Prefixes (Senior Knowledge)

| Prefix | Requirements | Purpose |
|--------|-------------|---------|
| `__Host-` | Must be `Secure`, no `Domain`, `Path=/` | Strongest: locked to exact origin |
| `__Secure-` | Must be `Secure` | Medium: ensures HTTPS only |

```
Set-Cookie: __Host-token=abc123; Secure; Path=/; HttpOnly; SameSite=Strict
```

---

## Common Mistakes (Interview)

| Mistake | Impact | Fix |
|---------|--------|-----|
| JWT in regular cookie (no HttpOnly) | XSS steals token | `HttpOnly` flag |
| Missing `Secure` flag | MITM intercepts cookie | Add `Secure` |
| `SameSite=None` without `Secure` | Browser rejects cookie | Always pair them |
| Too many/large cookies | Slows every request | Minimize cookie data |
| Not setting `Path` | Cookie sent everywhere | Scope to specific paths |
| Cookie used for state management | Performance, 4KB limit | Use localStorage |
