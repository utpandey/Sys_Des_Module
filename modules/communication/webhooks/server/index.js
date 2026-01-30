const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3005;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Webhook secret (in production, store in environment variable)
const WEBHOOK_SECRET = 'your-webhook-secret-key-change-in-production';

// Store webhook events for history
const webhookHistory = [];
const MAX_HISTORY = 100;

// Webhook receiver endpoint
// This simulates your application receiving webhooks from external services
app.post('/webhook/receive', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const eventType = req.headers['x-webhook-event'] || 'unknown';

  const webhookData = {
    id: crypto.randomUUID(),
    eventType: eventType,
    payload: req.body,
    headers: req.headers,
    timestamp: Date.now(),
    receivedAt: new Date().toISOString()
  };

  // Verify signature (HMAC)
  if (signature) {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.log(`[${new Date().toISOString()}] Invalid signature for webhook ${webhookData.id}`);
      webhookData.verified = false;
      webhookData.error = 'Invalid signature';
    } else {
      webhookData.verified = true;
      console.log(`[${new Date().toISOString()}] Verified webhook ${webhookData.id}`);
    }
  } else {
    webhookData.verified = false;
    webhookData.error = 'No signature provided';
  }

  // Store in history
  webhookHistory.unshift(webhookData);
  if (webhookHistory.length > MAX_HISTORY) {
    webhookHistory.pop();
  }

  // Simulate processing
  console.log(`[${new Date().toISOString()}] Received webhook: ${eventType}`, webhookData.id);

  // Respond quickly (webhook best practice)
  res.status(200).json({
    success: true,
    id: webhookData.id,
    message: 'Webhook received',
    timestamp: Date.now()
  });
});

// Webhook sender endpoint (simulates external service sending webhooks)
app.post('/webhook/send', (req, res) => {
  const { url, eventType, payload, secret } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const webhookPayload = payload || {
    event: eventType || 'test-event',
    data: {
      message: 'Test webhook payload',
      timestamp: Date.now()
    }
  };

  // Generate signature
  const signature = crypto
    .createHmac('sha256', secret || WEBHOOK_SECRET)
    .update(JSON.stringify(webhookPayload))
    .digest('hex');

  // Send webhook with retry logic
  const sendWebhook = async (attempt = 1, maxAttempts = 3) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': Date.now().toString(),
          'X-Webhook-Event': eventType || 'test-event',
          'User-Agent': 'Webhook-Sender/1.0'
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        status: response.status,
        attempt: attempt
      };
    } catch (error) {
      console.error(`Webhook send attempt ${attempt} failed:`, error.message);

      if (attempt < maxAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return sendWebhook(attempt + 1, maxAttempts);
      }

      throw error;
    }
  };

  // Send webhook
  sendWebhook()
    .then(result => {
      res.json({
        success: true,
        message: 'Webhook sent successfully',
        result: result
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        error: error.message
      });
    });
});

// Get webhook history
app.get('/webhook/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({
    total: webhookHistory.length,
    webhooks: webhookHistory.slice(0, limit)
  });
});

// Get specific webhook by ID
app.get('/webhook/:id', (req, res) => {
  const webhook = webhookHistory.find(w => w.id === req.params.id);
  if (!webhook) {
    return res.status(404).json({ error: 'Webhook not found' });
  }
  res.json(webhook);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    webhooksReceived: webhookHistory.length
  });
});

// Note: In a real application, you would use a proper HTTP client library
// For this demo, we're using fetch which is available in Node.js 18+
// For older versions, you would need to install node-fetch

app.listen(PORT, () => {
  console.log(`Webhook Server running on http://localhost:${PORT}`);
  console.log(`Webhook receiver: http://localhost:${PORT}/webhook/receive`);
  console.log(`Webhook sender: http://localhost:${PORT}/webhook/send`);
  console.log(`Webhook history: http://localhost:${PORT}/webhook/history`);
  console.log(`\nNote: This server uses fetch() which requires Node.js 18+`);
});
