# WebSocket - React Client

## Overview

This is a React implementation of a WebSocket client using custom hooks and React best practices.

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

- **Custom Hook**: `useWebSocket` hook encapsulates WebSocket logic
- **Automatic Reconnection**: Exponential backoff reconnection
- **Connection Management**: Proper cleanup on unmount
- **Message Handling**: Handles different message types
- **State Management**: Uses React hooks for all state

## Key Implementation Details

### Custom Hook: `useWebSocket`

```javascript
function useWebSocket(url, enabled) {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
    
    ws.onopen = () => setConnectionState('connected');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [data, ...prev]);
    };
    // ... other handlers
  }, [url]);

  return { connectionState, messages, sendMessage, connect, disconnect };
}
```

### Best Practices Implemented

1. **Refs for WebSocket**: Store WebSocket instance in ref to avoid re-creation
2. **Cleanup on Unmount**: Properly closes connection and clears timeouts
3. **Mounted Check**: Prevents state updates after unmount
4. **Reconnection Logic**: Exponential backoff with max attempts
5. **Error Handling**: Catches and displays errors gracefully

## React-Specific Considerations

- **Memory Leaks**: Proper cleanup prevents memory leaks
- **Re-renders**: Optimized to minimize unnecessary re-renders
- **State Updates**: Uses functional updates for message list
- **Connection Lifecycle**: Manages connection state through React state

## Learning Points

- How to create reusable WebSocket hooks
- Proper cleanup of WebSocket connections
- Reconnection strategies
- Managing real-time state in React
