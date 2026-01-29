# Short Polling - React Client

## Overview

This is a React implementation of a short polling client using custom hooks and React best practices.

## How to Run

1. Make sure the server is running (see `../server/README.md`)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- **Custom Hook**: `useShortPolling` hook encapsulates polling logic
- **React Best Practices**: Proper cleanup, useEffect dependencies, refs for mounted state
- **State Management**: Uses React hooks for all state
- **Error Handling**: Displays errors without breaking the UI
- **Data History**: Tracks and displays last 10 data updates

## Key Implementation Details

### Custom Hook: `useShortPolling`

```javascript
function useShortPolling(intervalMs, enabled) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Fetch logic with cleanup
  useEffect(() => {
    if (enabled) {
      fetchData();
      intervalRef.current = setInterval(fetchData, intervalMs);
    }
    
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [enabled, intervalMs]);
  
  return { data, error };
}
```

### Best Practices Implemented

1. **Cleanup on Unmount**: Clears interval when component unmounts
2. **Mounted Check**: Uses ref to prevent state updates after unmount
3. **useCallback**: Memoizes fetch function to prevent unnecessary re-renders
4. **Dependency Array**: Proper useEffect dependencies
5. **Immediate Fetch**: Fetches data immediately when enabled, not after first interval

## React-Specific Considerations

- **Memory Leaks**: Proper cleanup prevents memory leaks
- **Re-renders**: Optimized to minimize unnecessary re-renders
- **Error Boundaries**: Could be wrapped in ErrorBoundary for production
- **TypeScript**: Could be converted to TypeScript for type safety

## Learning Points

- How to create reusable custom hooks
- Proper cleanup in React effects
- Managing intervals in React components
- Handling async operations in hooks
