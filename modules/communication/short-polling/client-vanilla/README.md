# Short Polling - Vanilla JavaScript Client

## Overview

This is a vanilla JavaScript implementation of a short polling client. It demonstrates how to repeatedly request data from a server at fixed intervals.

## How to Run

1. Make sure the server is running (see `../server/README.md`)
2. Open `index.html` in a web browser
3. Click "Start Polling" to begin

## Features

- **Configurable interval**: Adjust polling frequency (500ms - 10s)
- **Start/Stop controls**: Control polling on demand
- **Status indicators**: Visual feedback on polling state
- **Error handling**: Tracks and displays errors
- **Data display**: Shows received data with timestamps
- **Version tracking**: Only displays new data versions

## Key Implementation Details

### Polling Logic

```javascript
// Start polling
this.pollingInterval = setInterval(() => {
    this.fetchData();
}, this.intervalMs);
```

### Fetching Data

Uses the Fetch API to make HTTP GET requests:

```javascript
const response = await fetch('http://localhost:3001/api/data');
const data = await response.json();
```

### Best Practices Implemented

1. **Immediate first request**: Fetches data immediately when starting, not after first interval
2. **Cleanup**: Properly clears interval when stopping
3. **Error handling**: Catches and displays errors without breaking polling
4. **Version checking**: Only displays new data to avoid clutter
5. **Resource management**: Limits displayed items to prevent memory issues

## Observations

When running this client, you'll notice:

- **Constant requests**: Even when server data hasn't changed
- **Latency**: Updates only appear at next poll interval
- **Server load**: Many requests per minute (30 requests/min at 2s interval)
- **Battery impact**: Continuous network activity

## Learning Points

- Simple to implement but inefficient
- Good for learning but not ideal for production
- Consider alternatives (Long Polling, WebSockets, SSE) for better efficiency
