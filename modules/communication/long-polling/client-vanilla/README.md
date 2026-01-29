# Long Polling - Vanilla JavaScript Client

## Overview

This is a vanilla JavaScript implementation of a long polling client. The server holds the connection open until data changes or a timeout occurs.

## How to Run

1. Make sure the server is running (see `../server/README.md`)
2. Open `index.html` in a web browser
3. Click "Start Long Polling" to begin

## Features

- **Sequential Long Polling**: Immediately makes new request after receiving response
- **Version Tracking**: Sends current version to server to avoid unnecessary updates
- **Timeout Handling**: Configurable timeout (5-60 seconds)
- **Error Recovery**: Automatically retries on errors
- **Request Cancellation**: Properly cancels requests when stopping

## Key Implementation Details

### Sequential Long Polling

```javascript
async longPoll() {
    const response = await fetch(url);
    const data = await response.json();
    this.handleData(data);
    
    // Immediately make another request
    if (this.isPolling) {
        this.longPoll();
    }
}
```

### Version Tracking

Client sends its last known version to the server:

```javascript
const url = `http://localhost:3002/api/data?version=${this.currentVersion}&timeout=${this.timeoutMs}`;
```

### Request Cancellation

Uses AbortController to cancel requests when stopping:

```javascript
const controller = new AbortController();
this.currentRequest = controller;
const response = await fetch(url, { signal: controller.signal });
```

## Observations

When running this client, you'll notice:

- **Fewer requests**: Only makes requests when data changes or timeout
- **Lower latency**: Updates appear immediately when server data changes
- **Connection held**: Browser shows connection as "pending" while waiting
- **Automatic reconnection**: Immediately makes new request after each response

## Learning Points

- More efficient than short polling
- Better for near real-time updates
- Requires proper timeout and error handling
- Sequential requests (not parallel)
