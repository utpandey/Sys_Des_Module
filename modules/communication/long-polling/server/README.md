# Long Polling Server

## Overview

Long polling is a technique where the client makes a request, and the server holds the connection open until data is available or a timeout occurs. This is more efficient than short polling because it reduces unnecessary requests.

## How It Works

1. Client makes HTTP GET request to `/api/data` with current version
2. Server checks if data has changed
3. If changed: Server responds immediately
4. If not changed: Server holds connection open
5. When data changes: Server responds to all pending requests
6. If timeout: Server responds with timeout indicator
7. Client immediately makes another request (sequential long polling)

## Implementation Details

- **Endpoint**: `GET /api/data?version=<clientVersion>&timeout=<ms>`
- **Query Parameters**:
  - `version`: Client's last known data version (optional, defaults to -1)
  - `timeout`: Maximum time to wait in milliseconds (optional, defaults to 30000)
- **Response**: JSON with data version, timestamp, and message
- **Data Updates**: Simulated every 3-8 seconds randomly

## Running the Server

```bash
cd modules/communication/long-polling/server
npm install
npm start
```

Server runs on `http://localhost:3002`

## Characteristics

### Pros
- **More efficient than short polling**: Fewer requests, only when data changes
- **Lower latency**: Updates detected immediately when they occur
- **Reduced server load**: Connections held open instead of constant requests
- **Works over HTTP**: No special protocols needed

### Cons
- **Connection overhead**: Each client holds a connection open
- **Timeout management**: Need to handle timeouts and reconnect
- **Sequential requests**: Client must make new request after each response
- **Server resources**: More concurrent connections than short polling

## When to Use

- Need near real-time updates
- WebSockets not available or overkill
- Want better efficiency than short polling
- HTTP-only environments

## Best Practices

1. **Version tracking**: Client sends last known version to avoid unnecessary updates
2. **Timeout handling**: Set reasonable timeouts (20-60 seconds)
3. **Immediate reconnection**: Client should immediately make new request after response
4. **Connection limits**: Monitor concurrent connections
5. **Error handling**: Handle network errors and retry

## Comparison with Short Polling

| Aspect | Short Polling | Long Polling |
|--------|--------------|--------------|
| Requests | Constant (every N seconds) | Only when data changes |
| Latency | Up to polling interval | Immediate when data changes |
| Server Load | High (many requests) | Medium (held connections) |
| Complexity | Simple | Moderate |
