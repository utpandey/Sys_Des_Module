# State Management

## Overview

State management is about **where data lives, how it flows, and how it's updated** in your application. Choosing the right approach depends on scope, complexity, and performance needs.

---

## State Categories

| Category | Scope | Examples | Storage |
|----------|-------|---------|---------|
| **Local/UI State** | Single component | Form inputs, toggles, modals | `useState` |
| **Shared State** | Multiple components | Theme, user, sidebar open | Context / Store |
| **Server State** | Remote data | API responses, user profile | SWR / React Query |
| **URL State** | Navigation | Filters, page, search query | URL params |
| **Persistent State** | Across sessions | Preferences, drafts | localStorage / cookies |

### Senior Mental Model:
```
DON'T put everything in one global store!

Server state → React Query / SWR (handles caching, loading, errors)
UI state     → useState / useReducer (local, fast)
Shared state → Context / Zustand / Redux (only if truly shared)
URL state    → URL params (shareable, bookmarkable)
```

---

## Solution Comparison

| Solution | Bundle | Learning Curve | Best For |
|----------|:------:|:---------:|----------|
| `useState` + `useReducer` | 0 KB | Low | Local component state |
| React Context | 0 KB | Low | Theme, auth, small shared state |
| Zustand | ~1 KB | Low | Medium apps, simple global state |
| Jotai | ~3 KB | Low | Atomic state, derived state |
| Redux Toolkit | ~11 KB | Medium | Large apps, complex state logic |
| MobX | ~16 KB | Medium | OOP-style, auto-tracking |
| Recoil | ~25 KB | Medium | Meta/Facebook patterns |

---

## ✅ DO's

1. **Co-locate state** — Keep state as close to where it's used as possible
2. **Separate server state from UI state** — Use React Query/SWR for API data
3. **Use URL for shareable state** — Filters, pagination, search
4. **Lift state only when needed** — Don't prematurely globalize
5. **Use selectors** to prevent unnecessary re-renders
6. **Normalize complex state** (see [normalization](../normalization/))

## ❌ DON'Ts

1. **Don't put everything in global state** — Most state is local
2. **Don't use Redux for simple apps** — Overkill for most
3. **Don't use Context for frequently changing values** — Causes re-renders
4. **Don't store derived data** — Compute it from source (useMemo)
5. **Don't mutate state directly** — Always return new references
6. **Don't duplicate server data in client state** — Single source of truth

---

## Context Performance Problem (Interview Must-Know)

```jsx
// ❌ BAD: Every consumer re-renders when ANY value changes
const AppContext = React.createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [sidebar, setSidebar] = useState(false);
  
  return (
    <AppContext.Provider value={{ user, theme, sidebar, setUser, setTheme, setSidebar }}>
      {children}
    </AppContext.Provider>
  );
}
// Changing sidebar → re-renders components that only need theme!
```

```jsx
// ✅ GOOD: Split contexts by update frequency
const UserContext = React.createContext();
const ThemeContext = React.createContext();
const SidebarContext = React.createContext();
// Now each consumer only re-renders when its specific context changes
```

---

## Common Interview Questions

**Q: When would you choose Redux over Context?**
A: Redux when you need: middleware (logging, async), DevTools time-travel, large shared state with many updaters, or Redux Toolkit's normalized entity adapters. Context is fine for infrequently-changing state (theme, auth).

**Q: How do you prevent unnecessary re-renders with global state?**
A: 1) Split contexts, 2) Use selectors (Zustand/Redux), 3) useMemo for derived values, 4) React.memo for expensive components, 5) Use atomic state (Jotai) for granular subscriptions.

**Q: Where should API data live?**
A: In a server state library (React Query/SWR), not in Redux/Context. These libraries handle caching, loading states, error states, deduplication, and revalidation automatically.
