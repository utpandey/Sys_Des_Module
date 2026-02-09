/**
 * State Management - React Patterns
 * Context, Zustand, Redux Toolkit examples
 */

/* ============================================
   1. useState + useReducer (Local State)
   ============================================ */

/**
 * useReducer for complex local state
 * ✅ Better than useState when state logic is complex
 */
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text: action.text, done: false }],
      };
    case 'TOGGLE':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.id ? { ...t, done: !t.done } : t
        ),
      };
    case 'DELETE':
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.id),
      };
    case 'SET_FILTER':
      return { ...state, filter: action.filter };
    default:
      return state;
  }
}

// Usage:
// const [state, dispatch] = useReducer(todoReducer, { todos: [], filter: 'all' });
// dispatch({ type: 'ADD', text: 'Learn state management' });


/* ============================================
   2. React Context (Shared State)
   ============================================ */

/**
 * ✅ GOOD Pattern: Split contexts by concern
 */

// --- Auth Context ---
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check auth status on mount
    checkAuth().then(setUser).finally(() => setLoading(false));
  }, []);

  const login = React.useCallback(async (credentials) => {
    const user = await loginAPI(credentials);
    setUser(user);
  }, []);

  const logout = React.useCallback(async () => {
    await logoutAPI();
    setUser(null);
  }, []);

  // Memoize value to prevent unnecessary re-renders
  const value = React.useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}


// --- Theme Context ---
const ThemeContext = React.createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}


/**
 * ❌ BAD Pattern: God context with everything
 */
// const GodContext = React.createContext();
// function GodProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [theme, setTheme] = useState('light');
//   const [cart, setCart] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   // Every consumer re-renders when ANY value changes!
//   return <GodContext.Provider value={{ user, theme, cart, notifications, ... }}>{children}</GodContext.Provider>
// }


/* ============================================
   3. Zustand (Lightweight Store)
   ============================================ */

/**
 * Zustand pattern - ~1KB, no Provider needed, selector-based
 */
/*
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Basic store
const useStore = create((set, get) => ({
  // State
  count: 0,
  users: [],
  
  // Actions
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  
  // Async action
  fetchUsers: async () => {
    const response = await fetch('/api/users');
    const users = await response.json();
    set({ users });
  },
  
  // Access current state in action
  doubleCount: () => {
    const current = get().count;
    set({ count: current * 2 });
  }
}));

// ✅ Selector: component only re-renders when `count` changes
function Counter() {
  const count = useStore(state => state.count);
  const increment = useStore(state => state.increment);
  return <button onClick={increment}>{count}</button>;
}

// ✅ Zustand with persistence (localStorage)
const usePersistStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-storage', // localStorage key
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
);

// ✅ Zustand with devtools
const useDevStore = create(
  devtools(
    (set) => ({
      bears: 0,
      addBear: () => set(state => ({ bears: state.bears + 1 }), false, 'addBear'),
    }),
    { name: 'BearStore' }
  )
);

// ✅ Zustand with slices pattern (for larger apps)
const createUserSlice = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
});

const createCartSlice = (set) => ({
  items: [],
  addItem: (item) => set(state => ({ items: [...state.items, item] })),
});

const useBoundStore = create((...a) => ({
  ...createUserSlice(...a),
  ...createCartSlice(...a),
}));
*/


/* ============================================
   4. Redux Toolkit (Large Apps)
   ============================================ */

/**
 * Redux Toolkit pattern - for complex, large-scale apps
 */
/*
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk
const fetchUsers = createAsyncThunk('users/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    addUser: (state, action) => {
      state.items.push(action.payload); // Immer allows "mutations"
    },
    removeUser: (state, action) => {
      state.items = state.items.filter(u => u.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Store
const store = configureStore({
  reducer: {
    users: usersSlice.reducer,
  },
});

// Selectors
const selectAllUsers = (state) => state.users.items;
const selectUserById = (id) => (state) => state.users.items.find(u => u.id === id);
const selectLoading = (state) => state.users.loading;
*/


/* ============================================
   5. URL State (Often Overlooked)
   ============================================ */

/**
 * useSearchParams for URL-based state
 * ✅ Shareable, bookmarkable, survives refresh
 */
function useURLState(key, defaultValue) {
  const getParam = () => {
    if (typeof window === 'undefined') return defaultValue;
    const params = new URLSearchParams(window.location.search);
    const value = params.get(key);
    if (value === null) return defaultValue;
    try { return JSON.parse(value); } catch { return value; }
  };

  const [state, setState] = React.useState(getParam);

  const setURLState = React.useCallback((value) => {
    const newValue = value instanceof Function ? value(state) : value;
    setState(newValue);

    const params = new URLSearchParams(window.location.search);
    if (newValue === defaultValue || newValue === null) {
      params.delete(key);
    } else {
      params.set(key, typeof newValue === 'object' ? JSON.stringify(newValue) : newValue);
    }

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
  }, [key, defaultValue, state]);

  return [state, setURLState];
}

// Usage:
// function ProductList() {
//   const [page, setPage] = useURLState('page', 1);
//   const [sort, setSort] = useURLState('sort', 'newest');
//   // URL: /products?page=2&sort=price
//   // Shareable, bookmarkable, survives refresh!
// }

// Next.js App Router version:
// import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// function useNextURLState(key, defaultValue) {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const pathname = usePathname();
//   const value = searchParams.get(key) || defaultValue;
//   const setValue = (newValue) => {
//     const params = new URLSearchParams(searchParams);
//     params.set(key, newValue);
//     router.replace(`${pathname}?${params.toString()}`);
//   };
//   return [value, setValue];
// }


console.log('See README.md for documentation');

// Helpers used in examples above (stubs)
async function checkAuth() { return null; }
async function loginAPI() { return null; }
async function logoutAPI() { return null; }
