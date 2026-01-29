# Communication Module

This module demonstrates various client-server communication patterns used in modern web applications.

## Topics Covered

1. **[Short Polling](./short-polling/)** - Client repeatedly requests data at fixed intervals
2. **[Long Polling](./long-polling/)** - Server holds request open until data is available
3. **[WebSockets](./websockets/)** - Full-duplex bidirectional communication
4. **[Server-Sent Events](./server-sent-events/)** - Server pushes events to client over HTTP
5. **[WebHooks](./webhooks/)** - Event-driven HTTP callbacks

## When to Use Each Pattern

### Short Polling
- **Use when**: Simple implementation needed, low update frequency acceptable
- **Pros**: Simple, works everywhere, stateless
- **Cons**: High server load, inefficient, latency issues

### Long Polling
- **Use when**: Need near real-time updates but WebSockets not available
- **Pros**: Better than short polling, reduces unnecessary requests
- **Cons**: Connection overhead, timeout management needed

### WebSockets
- **Use when**: Real-time bidirectional communication needed (chat, gaming, live updates)
- **Pros**: Low latency, efficient, full-duplex
- **Cons**: More complex, requires persistent connection, proxy/firewall issues

### Server-Sent Events (SSE)
- **Use when**: Server needs to push updates to client (notifications, live feeds)
- **Pros**: Simple, automatic reconnection, works over HTTP
- **Cons**: One-way only (server to client), limited browser support

### WebHooks
- **Use when**: External services need to notify your application of events
- **Pros**: Event-driven, scalable, decoupled
- **Cons**: Security concerns, delivery guarantees needed

## Implementation Structure

Each topic includes:
- `server/` - Node.js/Express server implementation
- `client-vanilla/` - Vanilla JavaScript client (no build step)
- `client-react/` - React client with hooks and best practices
