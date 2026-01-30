import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [webhookUrl, setWebhookUrl] = useState('/webhook/receive');
  const [eventType, setEventType] = useState('user.created');
  const [payload, setPayload] = useState('');
  const [webhooks, setWebhooks] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/webhook/history?limit=50');
      const data = await response.json();
      setWebhooks(data.webhooks || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const sendWebhook = async () => {
    let payloadData;
    try {
      if (payload.trim()) {
        payloadData = JSON.parse(payload);
      } else {
        payloadData = {
          userId: Math.floor(Math.random() * 1000).toString(),
          email: `user${Date.now()}@example.com`,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Invalid JSON payload' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Sending webhook...' });

    try {
      const response = await fetch('/webhook/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          eventType: eventType,
          payload: payloadData
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ 
          type: 'success', 
          message: `Webhook sent! Attempt: ${result.result.attempt}` 
        });
        loadHistory();
      } else {
        setStatus({ type: 'error', message: result.error });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Webhook Demo</h1>
      <p className="subtitle">Send and receive webhooks with signature verification</p>

      <div className="section">
        <h2>Send Webhook</h2>
        <div className="form-group">
          <label htmlFor="webhookUrl">Webhook URL:</label>
          <input
            type="url"
            id="webhookUrl"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="/webhook/receive"
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventType">Event Type:</label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="user.created">User Created</option>
            <option value="user.updated">User Updated</option>
            <option value="payment.completed">Payment Completed</option>
            <option value="order.shipped">Order Shipped</option>
            <option value="test">Test Event</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="payload">Payload (JSON):</label>
          <textarea
            id="payload"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder='{"userId": "123", "email": "user@example.com"}'
          />
        </div>
        <button onClick={sendWebhook} disabled={loading}>
          {loading ? 'Sending...' : 'Send Webhook'}
        </button>
        {status && (
          <div className={`status ${status.type}`}>
            {status.message}
          </div>
        )}
      </div>

      <div className="section">
        <h2>Webhook History</h2>
        <button onClick={loadHistory}>Refresh</button>
        <div className="webhook-list">
          {webhooks.length === 0 ? (
            <p className="no-webhooks">No webhooks received yet.</p>
          ) : (
            webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className={`webhook-item ${webhook.verified ? 'verified' : 'unverified'}`}
              >
                <div className="webhook-header">
                  <span className="webhook-event">
                    {webhook.eventType}
                    <span className={`badge ${webhook.verified ? 'verified' : 'unverified'}`}>
                      {webhook.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </span>
                  <span className="webhook-time">
                    {new Date(webhook.receivedAt).toLocaleString()}
                  </span>
                </div>
                <div className="webhook-payload">
                  {JSON.stringify(webhook.payload, null, 2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
