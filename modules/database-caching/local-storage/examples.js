/**
 * Local Storage - Vanilla JS & React Examples
 * Senior-level patterns with production considerations
 */

/* ============================================
   VANILLA JS EXAMPLES
   ============================================ */

/**
 * 1. Safe localStorage wrapper with error handling
 * 
 * ✅ Production-ready: handles quota, serialization, SSR
 */
const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.error('localStorage quota exceeded. Cleaning up...');
        this.cleanup();
        // Retry once after cleanup
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      }
      console.error(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  // Remove expired items
  cleanup() {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item && item.__expiry && item.__expiry < now) {
          localStorage.removeItem(key);
        }
      } catch {
        // Skip non-JSON items
      }
    }
  }
};


/**
 * 2. localStorage with TTL (Time-To-Live)
 * 
 * ✅ Senior pattern: localStorage has no built-in expiry
 */
const cachingStorage = {
  set(key, value, ttlMs) {
    const item = {
      value,
      __expiry: ttlMs ? Date.now() + ttlMs : null,
      __created: Date.now()
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to cache:', error);
    }
  },

  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const item = JSON.parse(raw);

      // Check expiry
      if (item.__expiry && Date.now() > item.__expiry) {
        localStorage.removeItem(key);
        return null; // Expired
      }

      return item.value;
    } catch {
      return null;
    }
  },

  // Check if data is stale but still usable (stale-while-revalidate)
  getWithMeta(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { value: null, isStale: true, exists: false };

      const item = JSON.parse(raw);
      const isExpired = item.__expiry && Date.now() > item.__expiry;

      return {
        value: item.value,
        isStale: isExpired,
        exists: true,
        age: Date.now() - item.__created
      };
    } catch {
      return { value: null, isStale: true, exists: false };
    }
  }
};

// Usage:
// cachingStorage.set('user-prefs', { theme: 'dark' }, 24 * 60 * 60 * 1000); // 24h TTL
// cachingStorage.get('user-prefs'); // Returns null if expired


/**
 * 3. Cross-tab synchronization via storage event
 * 
 * ✅ Senior pattern: Real-time sync between browser tabs
 */
function setupCrossTabSync(key, callback) {
  const handler = (event) => {
    if (event.key === key && event.storageArea === localStorage) {
      const newValue = event.newValue ? JSON.parse(event.newValue) : null;
      const oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
      callback({ newValue, oldValue, key });
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

// Usage:
// const unsub = setupCrossTabSync('cart', ({ newValue }) => {
//   console.log('Cart updated in another tab:', newValue);
//   renderCart(newValue);
// });


/**
 * 4. Storage quota monitoring
 */
async function checkStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    return {
      usedMB: (usage / 1024 / 1024).toFixed(2),
      totalMB: (quota / 1024 / 1024).toFixed(2),
      percentUsed: ((usage / quota) * 100).toFixed(1)
    };
  }
  return null;
}


/* ============================================
   REACT / NEXT.JS EXAMPLES
   ============================================ */

/**
 * 5. useLocalStorage Hook (Production-ready)
 * 
 * ✅ Handles: SSR, serialization, cross-tab sync, errors
 */
function useLocalStorage(key, initialValue) {
  // State to store value
  const [storedValue, setStoredValue] = React.useState(() => {
    if (typeof window === 'undefined') return initialValue; // SSR guard
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Wrapped setter that also persists to localStorage
  const setValue = React.useCallback((value) => {
    try {
      // Allow functional updates
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Cross-tab synchronization
  React.useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.storageArea === localStorage) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch {
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  const remove = React.useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, remove];
}

// Usage in React component:
// function ThemeToggle() {
//   const [theme, setTheme] = useLocalStorage('theme', 'light');
//   return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme}</button>;
// }


/**
 * 6. useLocalStorage with TTL (React)
 */
function useLocalStorageWithTTL(key, initialValue, ttlMs = 24 * 60 * 60 * 1000) {
  const [value, setValue] = React.useState(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return initialValue;
      
      const item = JSON.parse(raw);
      if (item.__expiry && Date.now() > item.__expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }
      return item.value;
    } catch {
      return initialValue;
    }
  });

  const set = React.useCallback((newValue) => {
    const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
    setValue(valueToStore);
    
    try {
      window.localStorage.setItem(key, JSON.stringify({
        value: valueToStore,
        __expiry: Date.now() + ttlMs,
        __created: Date.now()
      }));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }, [key, ttlMs, value]);

  return [value, set];
}


/**
 * 7. Next.js SSR-safe localStorage
 * 
 * ✅ Critical for Next.js: localStorage doesn't exist on server
 */
// Approach 1: Dynamic import with no SSR
// const StorageComponent = dynamic(() => import('./StorageComponent'), { ssr: false });

// Approach 2: useEffect guard
function useIsClient() {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);
  return isClient;
}

// function MyComponent() {
//   const isClient = useIsClient();
//   if (!isClient) return <Skeleton />;
//   // Now safe to use localStorage
// }


console.log('See README.md for documentation');
