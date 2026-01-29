# Short Polling Server

## Overview

Short polling is a technique where the client repeatedly requests data from the server at fixed, regular intervals (e.g., every 2 seconds, 5 seconds).

## How It Works

1. Client makes HTTP GET request to `/api/data`
2. Server immediately responds with current data
3. Client waits for the polling interval
4. Client makes another request
5. Process repeats

## Implementation Details

- **Endpoint**: `GET /api/data`
- **Response**: JSON with data version, timestamp, and message
- **Data Updates**: Simulated every 5-10 seconds randomly

## Running the Server

```bash
cd modules/communication/short-polling/server
npm install
npm start
```

Server runs on `http://localhost:3001`

## Characteristics

### Pros
- Simple to implement
- Works with any HTTP server
- Stateless (each request is independent)
- Easy to debug

### Cons
- **High server load**: Constant requests even when no data changes
- **Inefficient**: Many requests return the same data
- **Latency**: Updates only detected at next poll interval
- **Battery drain**: On mobile devices, constant requests drain battery

## When to Use

- Simple applications with low update frequency
- When WebSockets/SSE are not available
- For prototyping or learning
- When updates are not time-critical

## Best Practices

1. **Configurable intervals**: Allow clients to adjust polling frequency
2. **Exponential backoff**: Increase interval on errors
3. **Version checking**: Include version numbers to detect changes
4. **Request limiting**: Prevent abuse with rate limiting
