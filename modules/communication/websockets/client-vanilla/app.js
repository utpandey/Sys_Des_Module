// WebSocket Client - Vanilla JavaScript
// This demonstrates how to implement WebSocket communication
// with reconnection logic and message handling

class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.messageCount = 0;
        this.sentCount = 0;
        this.isManualClose = false;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.urlInput = document.getElementById('url');
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.statusEl = document.getElementById('status');
        this.messageCountEl = document.getElementById('messageCount');
        this.sentCountEl = document.getElementById('sentCount');
        this.messageInput = document.getElementById('message');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messagesContainer');
    }

    attachEventListeners() {
        this.connectBtn.addEventListener('click', () => this.connect());
        this.disconnectBtn.addEventListener('click', () => this.disconnect());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Allow Enter key to send message
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('Already connected');
            return;
        }

        this.isManualClose = false;
        this.updateStatus('connecting', 'Connecting...');
        
        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
                this.updateStatus('connected', 'Connected');
                this.connectBtn.disabled = true;
                this.disconnectBtn.disabled = false;
                this.sendBtn.disabled = false;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                    this.messageCount++;
                    this.updateUI();
                } catch (error) {
                    console.error('Error parsing message:', error);
                    this.displayMessage({
                        type: 'error',
                        message: 'Failed to parse message',
                        raw: event.data
                    });
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateStatus('error', 'Connection error');
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket closed', event.code, event.reason);
                this.updateStatus('disconnected', 'Disconnected');
                this.connectBtn.disabled = false;
                this.disconnectBtn.disabled = true;
                this.sendBtn.disabled = true;

                // Attempt to reconnect if not manually closed
                if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    this.displayMessage({
                        type: 'error',
                        message: 'Max reconnection attempts reached',
                        timestamp: Date.now()
                    });
                }
            };

        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            this.updateStatus('error', 'Failed to connect');
        }
    }

    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
        
        this.displayMessage({
            type: 'system',
            message: `Reconnecting in ${delay/1000}s... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
            timestamp: Date.now()
        });

        setTimeout(() => {
            if (!this.isManualClose) {
                this.connect();
            }
        }, delay);
    }

    disconnect() {
        this.isManualClose = true;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    sendMessage() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            alert('Not connected to WebSocket server');
            return;
        }

        const messageText = this.messageInput.value.trim();
        if (!messageText) {
            return;
        }

        try {
            // Try to parse as JSON, if fails send as plain text
            let message;
            try {
                message = JSON.parse(messageText);
            } catch (e) {
                // If not valid JSON, create a chat message
                message = {
                    type: 'chat',
                    message: messageText
                };
            }

            this.ws.send(JSON.stringify(message));
            this.sentCount++;
            this.updateUI();
            this.messageInput.value = '';

            // Display sent message
            this.displayMessage({
                type: 'sent',
                message: message.message || JSON.stringify(message),
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    }

    handleMessage(data) {
        this.displayMessage(data);
    }

    displayMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';

        const type = data.type || 'unknown';
        const timestamp = new Date(data.timestamp || Date.now()).toLocaleTimeString();
        
        let content = '';
        if (type === 'connection') {
            content = `Connected! Client ID: ${data.clientId || 'unknown'}`;
        } else if (type === 'echo') {
            content = `Echo: ${JSON.stringify(data.originalMessage)}`;
        } else if (type === 'broadcast') {
            content = `Broadcast from ${data.from}: ${data.message}`;
        } else if (type === 'update') {
            content = `Update: ${JSON.stringify(data.data)}`;
        } else if (type === 'sent') {
            content = `You sent: ${data.message}`;
        } else if (type === 'system') {
            content = data.message;
        } else {
            content = JSON.stringify(data);
        }

        messageDiv.innerHTML = `
            <div class="message-type">${type}</div>
            <div class="message-content">${content}</div>
            <div class="message-timestamp">${timestamp}</div>
        `;

        // Remove "No messages" placeholder if exists
        const placeholder = this.messagesContainer.querySelector('p');
        if (placeholder) {
            placeholder.remove();
        }

        this.messagesContainer.insertBefore(messageDiv, this.messagesContainer.firstChild);

        // Keep only last 50 messages
        while (this.messagesContainer.children.length > 50) {
            this.messagesContainer.removeChild(this.messagesContainer.lastChild);
        }
    }

    updateStatus(state, message) {
        const statusMap = {
            'connected': '<span class="connection-indicator connected"></span>Connected',
            'disconnected': '<span class="connection-indicator disconnected"></span>Disconnected',
            'connecting': '<span class="connection-indicator connecting"></span>Connecting...',
            'error': '<span class="connection-indicator disconnected"></span>Error'
        };

        this.statusEl.innerHTML = statusMap[state] || message;
        this.statusEl.className = `status-value ${state}`;
    }

    updateUI() {
        this.messageCountEl.textContent = this.messageCount;
        this.sentCountEl.textContent = this.sentCount;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WebSocketClient('ws://localhost:3003/ws');
});
