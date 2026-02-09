/**
 * API Caching - Vanilla JS, React (SWR/React Query patterns)
 * Senior-level patterns for interview prep
 */

/* ============================================
   VANILLA JS - Custom API Cache
   ============================================ */

/**
 * 1. SWR (Stale-While-Revalidate) from scratch
 * 
 * This is how libraries like SWR and React Query work under the hood.
 */
class APICache {
  constructor() {
    this.cache = new Map();       // { url → { data, timestamp, error } }
    this.inflight = new Map();    // Deduplication: { url → Promise }
    this.subscribers = new Map(); // { url → Set<callback> }
  }

  async fetch(url, options = {}) {
    const {
      ttl = 60_000,          // Cache TTL in ms (1 minute)
      staleTime = 5_000,     // Time before data is considered stale
      dedupe = true,         // Deduplicate concurrent requests
      revalidateOnFocus = true,
    } = options;

    const cached = this.cache.get(url);
    const now = Date.now();

    // Return fresh cache immediately
    if (cached && (now - cached.timestamp) < staleTime) {
      return cached.data;
    }

    // Return stale cache + revalidate in background
    if (cached && (now - cached.timestamp) < ttl) {
      this._revalidate(url, options); // Fire and forget
      return cached.data;
    }

    // No usable cache, must fetch
    return this._fetchAndCache(url, options);
  }

  async _fetchAndCache(url, options) {
    // Deduplication: if same request is in-flight, reuse it
    if (this.inflight.has(url)) {
      return this.inflight.get(url);
    }

    const promise = window.fetch(url, options.fetchOptions)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        this.cache.set(url, { data, timestamp: Date.now(), error: null });
        this._notify(url, data);
        return data;
      })
      .catch((error) => {
        // On error, return stale cache if available
        const stale = this.cache.get(url);
        if (stale) return stale.data;
        throw error;
      })
      .finally(() => {
        this.inflight.delete(url);
      });

    this.inflight.set(url, promise);
    return promise;
  }

  async _revalidate(url, options) {
    try {
      await this._fetchAndCache(url, options);
    } catch (e) {
      // Silent failure for background revalidation
    }
  }

  // Invalidate cache (after mutations)
  invalidate(url) {
    this.cache.delete(url);
  }

  // Invalidate by pattern
  invalidateMatching(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Subscribe to cache updates (for reactive UI)
  subscribe(url, callback) {
    if (!this.subscribers.has(url)) {
      this.subscribers.set(url, new Set());
    }
    this.subscribers.get(url).add(callback);
    return () => this.subscribers.get(url)?.delete(callback);
  }

  _notify(url, data) {
    this.subscribers.get(url)?.forEach(cb => cb(data));
  }

  // Optimistic update: update cache immediately, rollback on error
  async optimisticUpdate(url, newData, mutationFn) {
    const previous = this.cache.get(url);

    // Optimistic: update cache immediately
    this.cache.set(url, { data: newData, timestamp: Date.now(), error: null });
    this._notify(url, newData);

    try {
      await mutationFn();
      // Revalidate to get server truth
      await this._revalidate(url, {});
    } catch (error) {
      // Rollback on error
      if (previous) {
        this.cache.set(url, previous);
        this._notify(url, previous.data);
      } else {
        this.cache.delete(url);
      }
      throw error;
    }
  }
}

// Usage:
// const apiCache = new APICache();
// const data = await apiCache.fetch('/api/users', { ttl: 300_000 });
// After mutation:
// apiCache.invalidate('/api/users');


/**
 * 2. Request Deduplication
 * 
 * ✅ Critical: prevents 5 components from firing 5 identical requests
 */
class RequestDeduplicator {
  constructor() {
    this.pending = new Map();
  }

  async fetch(url, options = {}) {
    const key = `${url}:${JSON.stringify(options)}`;

    if (this.pending.has(key)) {
      return this.pending.get(key); // Return existing promise
    }

    const promise = window.fetch(url, options)
      .then(res => res.json())
      .finally(() => this.pending.delete(key));

    this.pending.set(key, promise);
    return promise;
  }
}


/* ============================================
   REACT EXAMPLES
   ============================================ */

/**
 * 3. useFetch Hook with SWR behavior (from scratch)
 */
const globalCache = new APICache();

function useFetch(url, options = {}) {
  const [state, setState] = React.useState({
    data: globalCache.cache.get(url)?.data || null,
    error: null,
    isLoading: !globalCache.cache.has(url),
    isValidating: false,
  });

  const fetchData = React.useCallback(async () => {
    setState(prev => ({ ...prev, isValidating: true }));
    try {
      const data = await globalCache.fetch(url, options);
      setState({ data, error: null, isLoading: false, isValidating: false });
    } catch (error) {
      setState(prev => ({ ...prev, error, isLoading: false, isValidating: false }));
    }
  }, [url]);

  React.useEffect(() => {
    fetchData();

    // Subscribe to cache updates (from other components)
    const unsub = globalCache.subscribe(url, (data) => {
      setState(prev => ({ ...prev, data }));
    });

    // Revalidate on window focus
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);

    return () => {
      unsub();
      window.removeEventListener('focus', handleFocus);
    };
  }, [url, fetchData]);

  const mutate = React.useCallback((newData) => {
    if (newData !== undefined) {
      globalCache.cache.set(url, { data: newData, timestamp: Date.now() });
      setState(prev => ({ ...prev, data: newData }));
    }
    return fetchData();
  }, [url, fetchData]);

  return { ...state, mutate };
}

// Usage:
// function UserList() {
//   const { data, error, isLoading, mutate } = useFetch('/api/users');
//   if (isLoading) return <Spinner />;
//   if (error) return <Error error={error} />;
//   return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
// }


/**
 * 4. SWR Library Pattern (reference)
 */
/*
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => res.json());

function UserProfile({ id }) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/users/${id}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      refreshInterval: 0,         // 0 = no polling
      errorRetryCount: 3,
      fallbackData: cachedUser,   // Initial data from SSR/cache
    }
  );

  // Optimistic update
  const updateName = async (newName) => {
    mutate(
      { ...data, name: newName },   // Optimistic data
      { revalidate: false }         // Don't revalidate yet
    );
    
    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName })
    });
    
    mutate(); // Revalidate after mutation
  };
}

// Conditional fetching
function ConditionalFetch({ userId }) {
  // Pass null key to skip fetching
  const { data } = useSWR(
    userId ? `/api/users/${userId}` : null,
    fetcher
  );
}
*/


/**
 * 5. React Query / TanStack Query Pattern (reference)
 */
/*
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function UserProfile({ id }) {
  const queryClient = useQueryClient();

  // Query with caching
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetch(`/api/users/${id}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000,  // 5 min before considered stale
    cacheTime: 30 * 60 * 1000, // 30 min in cache after unmount
    retry: 3,
    refetchOnWindowFocus: true,
  });

  // Mutation with cache invalidation
  const mutation = useMutation({
    mutationFn: (newData) => fetch(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(newData)
    }),
    // Optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries(['user', id]);
      const previous = queryClient.getQueryData(['user', id]);
      queryClient.setQueryData(['user', id], { ...previous, ...newData });
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback
      queryClient.setQueryData(['user', id], context.previous);
    },
    onSettled: () => {
      // Always refetch to get server truth
      queryClient.invalidateQueries(['user', id]);
    }
  });
}

// Prefetching
function ProductList() {
  const queryClient = useQueryClient();

  const prefetchProduct = (id) => {
    queryClient.prefetchQuery({
      queryKey: ['product', id],
      queryFn: () => fetch(`/api/products/${id}`).then(r => r.json()),
      staleTime: 60_000
    });
  };

  return products.map(p => (
    <div key={p.id} onMouseEnter={() => prefetchProduct(p.id)}>
      {p.name}
    </div>
  ));
}
*/


/**
 * 6. Next.js API Caching Patterns (reference)
 */
/*
// App Router - fetch with caching
async function getUser(id) {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    next: {
      revalidate: 60,       // ISR: revalidate every 60s
      tags: ['user', `user-${id}`]  // For on-demand revalidation
    }
  });
  return res.json();
}

// On-demand revalidation (API route)
import { revalidateTag } from 'next/cache';

export async function POST(request) {
  revalidateTag('user');  // Invalidate all user caches
  return Response.json({ revalidated: true });
}

// unstable_cache for non-fetch data
import { unstable_cache } from 'next/cache';

const getCachedUser = unstable_cache(
  async (id) => db.users.findById(id),
  ['user'],
  { revalidate: 60, tags: ['user'] }
);
*/


console.log('See README.md for documentation');
