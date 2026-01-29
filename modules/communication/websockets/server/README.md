# WebSocket Server

## Overview

WebSocket provides full-duplex communication channels over a single TCP connection. This allows both client and server to send messages at any time.

## How It Works

1. Client initiates WebSocket connection (HTTP upgrade request)
2. Server upgrades connection to WebSocket protocol
3. Both sides can send messages at any time
4. Connection remains open until closed by either side
5. Automatic reconnection on client side if connection drops

## Implementation Details

- **WebSocket Endpoint**: `ws://localhost:3003/ws`
- **HTTP Endpoints**:
  - `GET /status` - Get server status and connected clients count
  - `POST /broadcast` - Broadcast message to all connected clients
- **Message Types**:
  - `connection` - Welcome message on connect
  - `echo` - Echo of client message
  - `broadcast` - Message broadcast to all clients
  - `update` - Periodic server updates
  - `error` - Error messages

## Running the Server

```bash
cd modules/communication/websockets/server
npm install
npm start
```

Server runs on `http://localhost:3003` (HTTP) and `ws://localhost:3003/ws` (WebSocket)

## Characteristics

### Pros
- **Low Latency**: Real-time bidirectional communication
- **Efficient**: Single persistent connection
- **Full-Duplex**: Both sides can send simultaneously
- **Low Overhead**: Minimal protocol overhead after handshake

### Cons
- **Connection Management**: Need to handle reconnections
- **Stateful**: Server must track connected clients
- **Proxy/Firewall Issues**: Some proxies don't support WebSocket
- **More Complex**: More complex than HTTP polling

## When to Use

- Real-time chat applications
- Live data feeds (stocks, sports scores)
- Collaborative editing
- Gaming applications
- Live notifications
- Any bidirectional real-time communication

## Best Practices

1. **Reconnection Logic**: Implement exponential backoff on client
2. **Heartbeat/Ping**: Keep connection alive with ping/pong
3. **Message Format**: Use JSON for structured messages
4. **Error Handling**: Handle connection errors gracefully
5. **Connection Limits**: Monitor and limit concurrent connections
6. **Message Validation**: Validate incoming messages

## Message Format

All messages are JSON:

```json
{
  "type": "message-type",
  "id": 123,
  "data": {},
  "timestamp": 1234567890
}
```

## Comparison with Other Methods

| Aspect | Short Polling | Long Polling | WebSocket |
|--------|--------------|--------------|-----------|
| Latency | High | Medium | Low |
| Efficiency | Low | Medium | High |
| Complexity | Low | Medium | High |
| Bidirectional | No | No | Yes |
| Connection | Stateless | Stateful | Stateful |
