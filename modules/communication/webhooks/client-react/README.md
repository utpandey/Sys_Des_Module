# Webhooks - React Client

## Overview

This is a React implementation of a webhook client for sending webhooks and viewing webhook history.

## How to Run

1. Make sure the server is running (see `../server/README.md`)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- **Send Webhooks**: Send webhooks with custom payloads
- **Event Types**: Select from common event types
- **Webhook History**: View received webhooks with verification status
- **Real-time Updates**: Refresh history after sending

## Key Implementation Details

### Sending Webhooks

```javascript
const response = await fetch('/webhook/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        url: webhookUrl,
        eventType: eventType,
        payload: payloadData
    })
});
```

### Loading History

```javascript
useEffect(() => {
    loadHistory();
}, []);

const loadHistory = async () => {
    const response = await fetch('/webhook/history?limit=50');
    const data = await response.json();
    setWebhooks(data.webhooks || []);
};
```

## Learning Points

- Webhooks are HTTP POST requests
- Signature verification is crucial
- Webhooks are event-driven
- Best for external service integrations
