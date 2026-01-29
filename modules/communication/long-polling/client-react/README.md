# Long Polling - React Client

## Overview

This is a React implementation of a long polling client using custom hooks and React best practices.

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

- **Custom Hook**: `useLongPolling` hook encapsulates long polling logic
- **Sequential Polling**: Automatically makes new request after each response
- **Version Tracking**: Tracks data version to avoid unnecessary updates
- **Request Cancellation**: Properly cancels requests on unmount or stop
- **Error Recovery**: Automatic retry on errors

## Key Implementation Details

### Custom Hook: `useLongPolling`

```javascript
function useLongPolling(timeoutMs, enabled) {
  const [currentVersion, setCurrentVersion] = useState(-1);
  const abortControllerRef = useRef(null);

  const longPoll = useCallback(async (version) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const response = await fetch(`/api/data?version=${version}&timeout=${timeoutMs}`, {
      signal: controller.signal
    });
    
    const result = await response.json();
    setCurrentVersion(result.version);
    
    // Immediately make another request
    if (enabled) {
      longPoll(result.version);
    }
  }, [enabled, timeoutMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
}
```

### Best Practices Implemented

1. **AbortController**: Cancels requests when component unmounts or polling stops
2. **Mounted Check**: Prevents state updates after unmount
3. **Sequential Requests**: Makes new request immediately after receiving response
4. **Version Tracking**: Only updates when version changes
5. **Error Recovery**: Retries after delay on errors

## React-Specific Considerations

- **Memory Leaks**: Proper cleanup prevents memory leaks
- **Request Cancellation**: AbortController cancels pending requests
- **State Management**: Uses React hooks for all state
- **Re-renders**: Optimized to minimize unnecessary re-renders

## Learning Points

- How to implement sequential long polling in React
- Proper cleanup of async operations
- Request cancellation with AbortController
- Version tracking for efficient updates
