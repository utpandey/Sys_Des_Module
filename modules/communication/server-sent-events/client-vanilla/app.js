// Server-Sent Events Client - Vanilla JavaScript
// This demonstrates how to implement SSE client using EventSource API

class SSEClient {
    constructor(url) {
        this.url = url;
        this.eventSource = null;
        this.eventCount = 0;
        this.lastEventId = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.statusEl = document.getElementById('status');
        this.eventCountEl = document.getElementById('eventCount');
        this.lastEventIdEl = document.getElementById('lastEventId');
        this.eventsContainer = document.getElementById('eventsContainer');
    }

    attachEventListeners() {
        this.connectBtn.addEventListener('click', () => this.connect());
        this.disconnectBtn.addEventListener('click', () => this.disconnect());
    }

    connect() {
        if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
            console.log('Already connected');
            return;
        }

        try {
            // Create EventSource connection
            // EventSource automatically handles reconnection
            this.eventSource = new EventSource(this.url);

            // Handle connection open
            this.eventSource.onopen = () => {
                console.log('SSE connection opened');
                this.updateStatus('connected', 'Connected');
                this.connectBtn.disabled = true;
                this.disconnectBtn.disabled = false;
            };

            // Handle generic messages (event type not specified)
            this.eventSource.onmessage = (event) => {
                this.handleEvent('message', event);
            };

            // Handle connection event
            this.eventSource.addEventListener('connection', (event) => {
                this.handleEvent('connection', event);
            });

            // Handle update events
            this.eventSource.addEventListener('update', (event) => {
                this.handleEvent('update', event);
            });

            // Handle heartbeat events
            this.eventSource.addEventListener('heartbeat', (event) => {
                this.handleEvent('heartbeat', event);
            });

            // Handle errors
            this.eventSource.onerror = (error) => {
                console.error('SSE error:', error);
                
                // Check connection state
                if (this.eventSource.readyState === EventSource.CLOSED) {
                    this.updateStatus('disconnected', 'Connection closed');
                    this.connectBtn.disabled = false;
                    this.disconnectBtn.disabled = true;
                } else if (this.eventSource.readyState === EventSource.CONNECTING) {
                    this.updateStatus('connecting', 'Reconnecting...');
                }
            };

        } catch (error) {
            console.error('Failed to create EventSource:', error);
            this.updateStatus('error', 'Failed to connect');
        }
    }

    handleEvent(eventType, event) {
        try {
            const data = JSON.parse(event.data);
            this.eventCount++;
            this.lastEventId = event.lastEventId || event.id || null;
            
            this.displayEvent({
                type: eventType,
                id: this.lastEventId,
                data: data,
                timestamp: data.timestamp || Date.now()
            });

            this.updateUI();
        } catch (error) {
            console.error('Error parsing event data:', error);
            this.displayEvent({
                type: eventType,
                id: event.lastEventId,
                data: { raw: event.data },
                timestamp: Date.now()
            });
        }
    }

    displayEvent(event) {
        const eventDiv = document.createElement('div');
        eventDiv.className = `event event-${event.type}`;

        const timestamp = new Date(event.timestamp).toLocaleTimeString();
        let content = '';

        if (event.type === 'connection') {
            content = event.data.message || 'Connected to SSE stream';
        } else if (event.type === 'update') {
            content = `${event.data.message || 'Update'}: ${JSON.stringify(event.data)}`;
        } else if (event.type === 'heartbeat') {
            content = 'Heartbeat (connection alive)';
        } else {
            content = JSON.stringify(event.data);
        }

        eventDiv.innerHTML = `
            <div class="event-type">${event.type} ${event.id ? `(ID: ${event.id})` : ''}</div>
            <div class="event-content">${content}</div>
            <div class="event-timestamp">${timestamp}</div>
        `;

        // Remove "No events" placeholder if exists
        const placeholder = this.eventsContainer.querySelector('p');
        if (placeholder) {
            placeholder.remove();
        }

        this.eventsContainer.insertBefore(eventDiv, this.eventsContainer.firstChild);

        // Keep only last 50 events
        while (this.eventsContainer.children.length > 50) {
            this.eventsContainer.removeChild(this.eventsContainer.lastChild);
        }
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.updateStatus('disconnected', 'Disconnected');
        this.connectBtn.disabled = false;
        this.disconnectBtn.disabled = true;
    }

    updateStatus(state, message) {
        const statusMap = {
            'connected': '<span class="connection-indicator connected"></span>Connected',
            'disconnected': '<span class="connection-indicator disconnected"></span>Disconnected',
            'connecting': '<span class="connection-indicator disconnected"></span>Reconnecting...',
            'error': '<span class="connection-indicator disconnected"></span>Error'
        };

        this.statusEl.innerHTML = statusMap[state] || message;
        this.statusEl.className = `status-value ${state}`;
    }

    updateUI() {
        this.eventCountEl.textContent = this.eventCount;
        this.lastEventIdEl.textContent = this.lastEventId || '-';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SSEClient('http://localhost:3004/events');
});
