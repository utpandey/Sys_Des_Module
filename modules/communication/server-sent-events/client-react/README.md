# Server-Sent Events - React Client

## Overview

This is a React implementation of an SSE client using custom hooks and React best practices.

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

- **Custom Hook**: `useServerSentEvents` hook encapsulates SSE logic
- **Event Type Handling**: Handles different event types
- **Automatic Reconnection**: EventSource automatically reconnects
- **Connection Management**: Proper cleanup on unmount
- **State Management**: Uses React hooks for all state

## Key Implementation Details

### Custom Hook: `useServerSentEvents`

```javascript
function useServerSentEvents(url, enabled) {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [events, setEvents] = useState([]);
  const eventSourceRef = useRef(null);

  const connect = useCallback(() => {
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => setConnectionState('connected');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents(prev => [data, ...prev]);
    };
    
    // Handle specific event types
    eventSource.addEventListener('update', handleEvent);
  }, [url]);

  return { connectionState, events, connect, disconnect };
}
```

### Best Practices Implemented

1. **Refs for EventSource**: Store EventSource in ref to avoid re-creation
2. **Cleanup on Unmount**: Properly closes connection
3. **Mounted Check**: Prevents state updates after unmount
4. **Event Type Handling**: Handles different event types
5. **Event History**: Limits to last 50 events

## React-Specific Considerations

- **Memory Leaks**: Proper cleanup prevents memory leaks
- **State Updates**: Uses functional updates for event list
- **Re-renders**: Optimized to minimize unnecessary re-renders
- **Connection Lifecycle**: Manages connection state through React state

## Learning Points

- How to create reusable SSE hooks
- EventSource API in React
- Handling different event types
- Managing real-time event streams in React
