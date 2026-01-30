# WebSocket - Vanilla JavaScript Client

## Overview

This is a vanilla JavaScript implementation of a WebSocket client with reconnection logic and bidirectional communication.

## How to Run

1. Make sure the server is running (see `../server/README.md`)
2. Open `index.html` in a web browser
3. Click "Connect" to establish WebSocket connection
4. Send messages using the text area

## Features

- **Bidirectional Communication**: Send and receive messages in real-time
- **Automatic Reconnection**: Exponential backoff reconnection on disconnect
- **Message Types**: Handles different message types (connection, echo, broadcast, update)
- **Connection Status**: Visual indicators for connection state
- **Message History**: Displays last 50 messages

## Key Implementation Details

### WebSocket Connection

```javascript
this.ws = new WebSocket('ws://localhost:3003/ws');

this.ws.onopen = () => {
    // Connection established
};

this.ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Handle message
};

this.ws.onclose = () => {
    // Connection closed
};
```

### Reconnection Logic

Implements exponential backoff:

```javascript
scheduleReconnect() {
    const delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
        30000
    );
    setTimeout(() => this.connect(), delay);
}
```

### Sending Messages

```javascript
this.ws.send(JSON.stringify({
    type: 'chat',
    message: 'Hello!'
}));
```

## Message Format

All messages are JSON:

```json
{
  "type": "message-type",
  "message": "content",
  "timestamp": 1234567890
}
```

## Observations

When running this client, you'll notice:

- **Real-time**: Messages appear instantly
- **Bidirectional**: Can send and receive simultaneously
- **Persistent Connection**: Connection stays open until closed
- **Automatic Reconnection**: Reconnects on network issues

## Learning Points

- WebSocket provides true real-time bidirectional communication
- More efficient than polling (single persistent connection)
- Requires connection management and error handling
- Best for chat, gaming, live updates, collaborative editing
