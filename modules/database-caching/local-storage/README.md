# Local Storage

## Overview

`localStorage` provides persistent key-value storage (~5-10MB) that survives browser restarts. Data is stored per-origin and is **synchronous** (blocks the main thread).

---

## API

```javascript
localStorage.setItem('key', 'value');     // Set
localStorage.getItem('key');               // Get → 'value'
localStorage.removeItem('key');            // Remove
localStorage.clear();                      // Clear all
localStorage.length;                       // Count
localStorage.key(0);                       // Key at index
```

---

## ✅ DO's

1. **Use for small, non-sensitive preferences** (theme, language, UI state)
2. **Always wrap in try/catch** (quota exceeded, private browsing)
3. **JSON serialize/deserialize** complex data
4. **Add expiry logic** manually (localStorage has no TTL)
5. **Listen to `storage` event** for cross-tab sync
6. **Use as a fallback**, not primary data store

## ❌ DON'Ts

1. **Never store auth tokens** (XSS can read them)
2. **Never store PII** (personal data, passwords, credit cards)
3. **Never store large data** (it's synchronous → blocks UI)
4. **Never trust localStorage data** (user can modify it via DevTools)
5. **Don't use as a database** (no indexing, no querying)
6. **Don't assume it's always available** (private browsing, full quota)

---

## Common Mistakes (Senior Interview)

| Mistake | Why It's Bad | Fix |
|---------|-------------|-----|
| Storing JWT in localStorage | XSS attack reads token | Use HttpOnly cookie |
| Not handling quota errors | App crashes when storage full | Try/catch + cleanup |
| Not serializing objects | Stores `[object Object]` | JSON.stringify/parse |
| Assuming always available | Fails in private browsing | Feature detection + fallback |
| Storing large datasets | Blocks main thread | Use IndexedDB instead |
| No expiry mechanism | Stale data forever | Manual TTL wrapper |

---

## Production Considerations

- **Storage Limit**: ~5-10MB per origin (varies by browser)
- **Performance**: Synchronous reads/writes block main thread
- **Security**: Any JS on your page can read localStorage (XSS risk)
- **Privacy**: Cleared by "Clear browsing data" in most browsers
- **Cross-tab**: `storage` event fires in OTHER tabs (not current)
- **SSR**: Not available on server (check `typeof window !== 'undefined'`)
