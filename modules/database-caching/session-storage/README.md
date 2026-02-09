# Session Storage

## Overview

`sessionStorage` is identical to `localStorage` in API, but data is **scoped to the browser tab** and cleared when the tab closes. Each tab gets its own isolated storage.

---

## Key Difference from Local Storage

| Behavior | Local Storage | Session Storage |
|----------|:------------:|:--------------:|
| Persists after tab close | ✅ | ❌ |
| Shared across tabs | ✅ | ❌ (each tab isolated) |
| Survives page refresh | ✅ | ✅ |
| Survives browser restart | ✅ | ❌ |
| `storage` event cross-tab | ✅ | ❌ |
| Duplicated on "Duplicate tab" | N/A | ✅ (copied, then independent) |

---

## ✅ Best Use Cases

1. **Multi-step forms / wizards** - State preserved on refresh, cleared on close
2. **One-time modals / banners** - "Don't show again" per session
3. **Tab-specific state** - Different views in different tabs
4. **Temporary auth state** - PKCE code verifier for OAuth
5. **Scroll position** - Restore on back navigation
6. **Search filters** - Per-tab filter state

## ❌ DON'Ts

1. **Never store auth tokens** (same XSS risk as localStorage)
2. **Don't use for data that needs cross-tab sync** (use localStorage)
3. **Don't rely on it for persistence** (gone when tab closes)
4. **Don't store large data** (synchronous, blocks main thread)

---

## Common Interview Questions

**Q: When would you choose sessionStorage over localStorage?**
A: When data should be tab-specific and not persist beyond the session. Example: multi-step form progress, per-tab filters, or temporary OAuth state (PKCE verifier).

**Q: What happens when user duplicates a tab?**
A: The new tab gets a COPY of sessionStorage, but they become independent. Changes in one tab don't affect the other.

**Q: Does sessionStorage survive a page refresh?**
A: Yes! It persists across page refreshes and navigations within the same tab. It only clears when the tab/window is closed.
