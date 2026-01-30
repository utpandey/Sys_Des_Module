# Server-Sent Events (SSE) Server

## Overview

Server-Sent Events (SSE) is a technology that allows a server to push data to a client over HTTP. Unlike WebSockets, SSE is one-way (server to client only).

## How It Works

1. Client makes HTTP GET request to `/events` endpoint
2. Server sets special headers (`Content-Type: text/event-stream`)
3. Server keeps connection open and sends events
4. Events are sent in a specific format (SSE format)
5. Client receives events using EventSource API
6. Connection automatically reconnects on disconnect

## Implementation Details

- **SSE Endpoint**: `GET /events`
- **Trigger Endpoint**: `POST /trigger` - Manually trigger events
- **Health Check**: `GET /health` - Server status
- **Event Format**: SSE format with `id`, `event`, and `data` fields
- **Heartbeat**: Sends heartbeat every 30 seconds to keep connection alive

## Running the Server

```bash
cd modules/communication/server-sent-events/server
npm install
npm start
```

Server runs on `http://localhost:3004`

## SSE Event Format

```
id: 123
event: update
data: {"message": "Hello", "timestamp": 1234567890}

```

Each event consists of:
- `id`: Unique event identifier
- `event`: Event type (optional, defaults to "message")
- `data`: Event data (JSON string)

## Characteristics

### Pros
- **Simple**: Easy to implement, works over HTTP
- **Automatic Reconnection**: Browser automatically reconnects
- **One-Way Push**: Perfect for server-to-client notifications
- **HTTP Compatible**: Works through most proxies and firewalls
- **Text-Based**: Easy to debug

### Cons
- **One-Way Only**: Server to client only, no client-to-server
- **Text Only**: Can't send binary data
- **Connection Limits**: Browsers limit concurrent connections per domain
- **No Built-in Authentication**: Need to handle separately

## When to Use

- Live notifications
- Real-time feeds (news, social media)
- Progress updates
- Live dashboards
- Any server-to-client push scenario

## Best Practices

1. **Heartbeat**: Send periodic heartbeat to keep connection alive
2. **Event IDs**: Use incremental IDs for reconnection handling
3. **Error Handling**: Handle client disconnections gracefully
4. **Connection Limits**: Monitor and manage concurrent connections
5. **Event Types**: Use different event types for different data

## Comparison with Other Methods

| Aspect | Short Polling | Long Polling | WebSocket | SSE |
|--------|--------------|--------------|-----------|-----|
| Direction | Bidirectional | Bidirectional | Bidirectional | Server→Client |
| Complexity | Low | Medium | High | Low |
| Efficiency | Low | Medium | High | High |
| Reconnection | Manual | Manual | Manual | Automatic |
| Use Case | Simple | Near real-time | Real-time chat | Notifications |
