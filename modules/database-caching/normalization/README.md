# Normalization (Frontend State)

## Overview

Normalization is about **structuring your frontend state like a database** — flat, with entities referenced by IDs. It eliminates data duplication and makes updates O(1) instead of O(n).

---

## Why Normalize? (Senior Interview Answer)

**Denormalized (Nested):**
```javascript
// ❌ Updating user "John" requires finding and updating 
// every comment, post, and reaction that references John
const state = {
  posts: [
    {
      id: 1,
      author: { id: 1, name: 'John' },
      comments: [
        { id: 1, author: { id: 1, name: 'John' }, text: 'Hi' },
        { id: 2, author: { id: 2, name: 'Jane' }, text: 'Hello' }
      ]
    }
  ]
};
// If John changes name → update in 2+ places (inconsistency risk!)
```

**Normalized (Flat):**
```javascript
// ✅ Update user in ONE place → all references auto-resolve
const state = {
  users: {
    byId: { 1: { id: 1, name: 'John' }, 2: { id: 2, name: 'Jane' } },
    allIds: [1, 2]
  },
  posts: {
    byId: { 1: { id: 1, authorId: 1, commentIds: [1, 2] } },
    allIds: [1]
  },
  comments: {
    byId: { 1: { id: 1, authorId: 1, text: 'Hi' }, 2: { id: 2, authorId: 2, text: 'Hello' } },
    allIds: [1, 2]
  }
};
// John changes name → update users.byId[1] only!
```

---

## Normalization Rules

1. **Each entity type gets its own "table"** (`users`, `posts`, `comments`)
2. **Each entity is stored once**, by ID (`byId: { [id]: entity }`)
3. **References use IDs**, not nested objects (`authorId: 1`, not `author: { ... }`)
4. **Maintain an array of all IDs** for ordering (`allIds: [1, 2, 3]`)

---

## ✅ DO's

1. **Normalize API responses** before storing in state
2. **Use `byId` + `allIds` pattern** for predictable access
3. **Use selector functions** to denormalize for components
4. **Use normalizr or custom normalizers** for complex APIs
5. **Keep UI state separate** from entity state

## ❌ DON'Ts

1. **Don't deeply nest relational data** in state
2. **Don't duplicate entities** across multiple state slices
3. **Don't normalize simple, flat data** (overkill for small datasets)
4. **Don't update nested state directly** (mutation bugs)

---

## When to Normalize

| Scenario | Normalize? |
|----------|:----------:|
| Multiple entities reference the same data | ✅ Yes |
| Need to update an entity used in many places | ✅ Yes |
| Simple list with no relationships | ❌ No |
| Small dataset (< 100 items, no relations) | ❌ No |
| Offline-first app with complex data | ✅ Yes |
