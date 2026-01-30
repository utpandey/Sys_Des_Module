# Webhooks - Vanilla JavaScript Client

## Overview

This is a vanilla JavaScript implementation of a webhook client that can send webhooks and view webhook history.

## How to Run

1. Make sure the server is running (see `../server/README.md`)
2. Open `index.html` in a web browser
3. Use the form to send webhooks
4. View webhook history in the history section

## Features

- **Send Webhooks**: Send webhooks with custom payloads
- **Event Types**: Select from common event types
- **Webhook History**: View received webhooks
- **Signature Verification**: See verification status
- **Auto-refresh**: Refresh history after sending

## Key Implementation Details

### Sending Webhooks

```javascript
const response = await fetch('http://localhost:3005/webhook/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        url: webhookUrl,
        eventType: eventType,
        payload: payload
    })
});
```

### Loading History

```javascript
const response = await fetch('http://localhost:3005/webhook/history?limit=50');
const data = await response.json();
```

## Learning Points

- Webhooks are HTTP POST requests
- Signature verification is crucial for security
- Webhooks are event-driven and asynchronous
- Best for integrations with external services
