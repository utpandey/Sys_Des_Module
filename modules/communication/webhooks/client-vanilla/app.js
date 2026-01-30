// Webhook Client - Vanilla JavaScript
// This demonstrates how to send webhooks and view webhook history

class WebhookClient {
    constructor() {
        this.baseUrl = 'http://localhost:3005';
        this.initializeElements();
        this.attachEventListeners();
        this.loadHistory();
    }

    initializeElements() {
        this.webhookUrlInput = document.getElementById('webhookUrl');
        this.eventTypeSelect = document.getElementById('eventType');
        this.payloadTextarea = document.getElementById('payload');
        this.sendBtn = document.getElementById('sendBtn');
        this.sendStatusDiv = document.getElementById('sendStatus');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.webhookListDiv = document.getElementById('webhookList');
    }

    attachEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendWebhook());
        this.refreshBtn.addEventListener('click', () => this.loadHistory());
    }

    async sendWebhook() {
        const url = this.webhookUrlInput.value.trim();
        const eventType = this.eventTypeSelect.value;
        let payload;

        try {
            const payloadText = this.payloadTextarea.value.trim();
            if (payloadText) {
                payload = JSON.parse(payloadText);
            } else {
                payload = {
                    userId: Math.floor(Math.random() * 1000).toString(),
                    email: `user${Date.now()}@example.com`,
                    timestamp: Date.now()
                };
            }
        } catch (error) {
            this.showStatus('error', 'Invalid JSON payload');
            return;
        }

        this.sendBtn.disabled = true;
        this.showStatus('info', 'Sending webhook...');

        try {
            const response = await fetch(`${this.baseUrl}/webhook/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    eventType: eventType,
                    payload: payload,
                    secret: 'your-webhook-secret-key-change-in-production'
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showStatus('success', `Webhook sent successfully! Attempt: ${result.result.attempt}`);
                this.loadHistory();
            } else {
                this.showStatus('error', `Failed: ${result.error}`);
            }
        } catch (error) {
            this.showStatus('error', `Error: ${error.message}`);
        } finally {
            this.sendBtn.disabled = false;
        }
    }

    async loadHistory() {
        try {
            const response = await fetch(`${this.baseUrl}/webhook/history?limit=50`);
            const data = await response.json();

            this.displayWebhooks(data.webhooks);
        } catch (error) {
            this.webhookListDiv.innerHTML = `<p style="color: #f44336;">Error loading history: ${error.message}</p>`;
        }
    }

    displayWebhooks(webhooks) {
        if (webhooks.length === 0) {
            this.webhookListDiv.innerHTML = '<p style="color: #888;">No webhooks received yet.</p>';
            return;
        }

        this.webhookListDiv.innerHTML = webhooks.map(webhook => {
            const verified = webhook.verified ? 'verified' : 'unverified';
            const badge = webhook.verified 
                ? '<span class="badge verified">Verified</span>' 
                : '<span class="badge unverified">Unverified</span>';

            return `
                <div class="webhook-item ${verified}">
                    <div class="webhook-header">
                        <span class="webhook-event">${webhook.eventType} ${badge}</span>
                        <span class="webhook-time">${new Date(webhook.receivedAt).toLocaleString()}</span>
                    </div>
                    <div class="webhook-payload">${JSON.stringify(webhook.payload, null, 2)}</div>
                </div>
            `;
        }).join('');
    }

    showStatus(type, message) {
        this.sendStatusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
        setTimeout(() => {
            this.sendStatusDiv.innerHTML = '';
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WebhookClient();
});
