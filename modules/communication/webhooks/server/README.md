# Webhook Server

## Overview

Webhooks are HTTP callbacks that allow external services to notify your application when events occur. This server demonstrates both receiving and sending webhooks.

## How It Works

1. **Receiving Webhooks**: External service sends HTTP POST to `/webhook/receive`
2. **Signature Verification**: Verifies HMAC signature for security
3. **Processing**: Processes the webhook payload
4. **Response**: Responds quickly (best practice)
5. **History**: Stores webhook events for debugging

## Implementation Details

- **Receiver Endpoint**: `POST /webhook/receive`
- **Sender Endpoint**: `POST /webhook/send` - Simulates sending webhooks
- **History Endpoint**: `GET /webhook/history` - View received webhooks
- **Signature Verification**: HMAC SHA-256 signature verification
- **Retry Logic**: Sender includes retry mechanism with exponential backoff

## Running the Server

```bash
cd modules/communication/webhooks/server
npm install
npm start
```

**Note**: This server uses `fetch()` which requires Node.js 18+. For older versions, install `node-fetch`.

Server runs on `http://localhost:3005`

## Webhook Security

### Signature Verification

Webhooks should be verified using HMAC signatures:

```javascript
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

### Headers

Common webhook headers:
- `X-Webhook-Signature`: HMAC signature
- `X-Webhook-Timestamp`: Timestamp (for replay attack prevention)
- `X-Webhook-Event`: Event type

## Characteristics

### Pros
- **Event-Driven**: Decoupled, asynchronous communication
- **Scalable**: No persistent connections needed
- **Simple**: Standard HTTP POST requests
- **Reliable**: Can implement retry logic

### Cons
- **Delivery Guarantees**: Need to handle failures
- **Security**: Must verify signatures
- **Idempotency**: Handle duplicate deliveries
- **Ordering**: Events may arrive out of order

## When to Use

- Payment processing (Stripe, PayPal)
- CI/CD notifications (GitHub, GitLab)
- Third-party integrations
- Event notifications
- External service callbacks

## Best Practices

1. **Verify Signatures**: Always verify webhook signatures
2. **Respond Quickly**: Return 200 OK immediately, process asynchronously
3. **Idempotency**: Handle duplicate webhooks gracefully
4. **Retry Logic**: Implement retry with exponential backoff when sending
5. **Logging**: Log all webhook events for debugging
6. **Timeouts**: Set appropriate timeouts for webhook processing

## Webhook Flow

```
External Service → POST /webhook/receive → Verify Signature → Process → Respond 200 OK
                                                                    ↓
                                                          Store in History
```

## Sending Webhooks

The server includes a webhook sender that demonstrates:
- Signature generation
- Retry logic with exponential backoff
- Error handling

Example:
```bash
curl -X POST http://localhost:3005/webhook/send \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3005/webhook/receive",
    "eventType": "user.created",
    "payload": {"userId": "123", "email": "user@example.com"}
  }'
```
