# IndexedDB

## Overview

IndexedDB is a **low-level async API** for storing large amounts of structured data (including Blobs/files). It's the only client-side storage that's truly async, works in Web Workers and Service Workers, and supports indexes and transactions.

---

## Why IndexedDB Matters for Senior Engineers

- **Only async client storage** — doesn't block the main thread
- **Large capacity** — 50MB+ (varies by browser, can request more)
- **Structured data** — objects, arrays, Blobs, Files, ArrayBuffers
- **Indexable** — create indexes for efficient queries
- **Transactional** — ACID-like transactions
- **Available in Service Workers** — offline-first apps

---

## IndexedDB vs Other Storage

| Feature | IndexedDB | localStorage | Cache API |
|---------|:---------:|:------------:|:---------:|
| Async | ✅ | ❌ | ✅ |
| Capacity | 50+ MB | 5-10 MB | Large |
| Structured data | ✅ | Strings | Request/Response |
| Indexes | ✅ | ❌ | ❌ |
| Workers | ✅ | ❌ | ✅ |
| Queries | ✅ | ❌ | URL match only |

---

## ✅ DO's

1. **Use for offline-first apps** (store data for offline access)
2. **Use for large datasets** (search results, product catalogs)
3. **Use for file/blob storage** (images, documents)
4. **Use wrapper libraries** (idb, Dexie.js) — raw API is painful
5. **Handle version upgrades** carefully
6. **Use transactions** for data integrity

## ❌ DON'Ts

1. **Don't use for simple key-value** (overkill, use localStorage)
2. **Don't ignore versioning** (upgrade logic is critical)
3. **Don't store sensitive unencrypted data**
4. **Don't forget error handling** (storage can be cleared by browser)
5. **Don't use in private browsing without handling failures**

---

## Common Interview Questions

**Q: When would you pick IndexedDB over localStorage?**
A: When I need async operations (won't block UI), large storage (50MB+), structured data with indexes, or access from Service Workers for offline-first. For simple key-value under 5MB, localStorage is fine.

**Q: How does IndexedDB handle concurrent access across tabs?**
A: IndexedDB uses a versioning system. If one tab upgrades the database, other tabs receive a `versionchange` event and should close their connection. Transactions within a single tab are serialized.

**Q: What's the upgrade pattern?**
A: You increment the version number. The `onupgradeneeded` callback fires where you create/modify object stores. This is the ONLY place you can change the schema.
