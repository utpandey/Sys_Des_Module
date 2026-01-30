# Server-Sent Events - Vanilla JavaScript Client

## Overview

This is a vanilla JavaScript implementation of an SSE client using the EventSource API.

## How to Run

1. Make sure the server is running (see `../server/README.md`)
2. Open `index.html` in a web browser
3. Click "Connect to SSE Stream" to start receiving events

## Features

- **EventSource API**: Uses native browser EventSource API
- **Automatic Reconnection**: Browser automatically reconnects on disconnect
- **Event Type Handling**: Handles different event types (connection, update, heartbeat)
- **Event History**: Displays last 50 events
- **Connection Status**: Visual indicators for connection state

## Key Implementation Details

### EventSource Connection

```javascript
this.eventSource = new EventSource('http://localhost:3004/events');

// Handle generic messages
this.eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Handle message
};

// Handle specific event types
this.eventSource.addEventListener('update', (event) => {
    const data = JSON.parse(event.data);
    // Handle update
});
```

### Automatic Reconnection

EventSource automatically reconnects on disconnect. You can check the readyState:

```javascript
this.eventSource.onerror = (error) => {
    if (this.eventSource.readyState === EventSource.CONNECTING) {
        // Reconnecting...
    } else if (this.eventSource.readyState === EventSource.CLOSED) {
        // Connection closed
    }
};
```

## EventSource API

- **onopen**: Fired when connection opens
- **onmessage**: Fired for messages without event type
- **onerror**: Fired on errors
- **addEventListener**: Listen for specific event types
- **close()**: Close the connection
- **readyState**: Connection state (CONNECTING, OPEN, CLOSED)

## Observations

When running this client, you'll notice:

- **One-Way**: Can only receive events, cannot send to server
- **Automatic Reconnection**: Reconnects automatically on disconnect
- **Event Types**: Can handle different event types
- **Simple API**: Very simple to use compared to WebSockets

## Learning Points

- SSE is perfect for server-to-client push scenarios
- Simpler than WebSockets for one-way communication
- Automatic reconnection built into browser
- Works over HTTP, no special protocol needed
