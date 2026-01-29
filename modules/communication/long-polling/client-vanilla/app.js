// Long Polling Client - Vanilla JavaScript
// This demonstrates how to implement long polling where the server
// holds the connection open until data changes or timeout occurs

class LongPollingClient {
    constructor() {
        this.isPolling = false;
        this.currentVersion = -1;
        this.timeoutMs = 30000; // Default 30 seconds
        this.requestCount = 0;
        this.errorCount = 0;
        this.currentRequest = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.timeoutInput = document.getElementById('timeout');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusEl = document.getElementById('status');
        this.currentVersionEl = document.getElementById('currentVersion');
        this.requestCountEl = document.getElementById('requestCount');
        this.errorCountEl = document.getElementById('errorCount');
        this.dataContainer = document.getElementById('dataContainer');
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.startPolling());
        this.stopBtn.addEventListener('click', () => this.stopPolling());
        this.timeoutInput.addEventListener('change', (e) => {
            this.timeoutMs = parseInt(e.target.value);
        });
    }

    async longPoll() {
        if (!this.isPolling) return;

        try {
            this.updateStatus('waiting', 'Waiting for update...');
            
            // Make request with current version and timeout
            const url = `http://localhost:3002/api/data?version=${this.currentVersion}&timeout=${this.timeoutMs}`;
            
            // Create AbortController for cancellation
            const controller = new AbortController();
            this.currentRequest = controller;

            const response = await fetch(url, {
                signal: controller.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Check if this request was cancelled
            if (!this.isPolling) return;

            this.handleData(data);
            this.updateStatus('active', 'Connected');
            this.requestCount++;
            this.updateUI();

            // Immediately make another request (sequential long polling)
            if (this.isPolling) {
                this.longPoll();
            }
            
        } catch (error) {
            // Don't count abort errors
            if (error.name === 'AbortError') {
                return;
            }

            console.error('Long polling error:', error);
            this.errorCount++;
            this.updateStatus('error', `Error: ${error.message}`);
            this.updateUI();

            // Retry after a short delay
            if (this.isPolling) {
                setTimeout(() => {
                    if (this.isPolling) {
                        this.longPoll();
                    }
                }, 2000); // Wait 2 seconds before retry
            }
        }
    }

    handleData(data) {
        // Check if this is a new version
        if (data.version > this.currentVersion) {
            this.currentVersion = data.version;
            this.displayData(data);
        } else if (data.timeout) {
            // Timeout occurred, but still make another request
            console.log('Request timed out, making new request...');
        }
    }

    displayData(data) {
        const dataItem = document.createElement('div');
        dataItem.className = 'data-item';
        
        const timeDiff = Date.now() - data.timestamp;
        const timeAgo = timeDiff < 1000 
            ? 'just now' 
            : `${Math.floor(timeDiff / 1000)}s ago`;

        const isTimeout = data.timeout ? ' (Timeout)' : '';

        dataItem.innerHTML = `
            <div class="data-version">Version ${data.version}${isTimeout}</div>
            <div style="margin-top: 5px;">${data.message}</div>
            <div class="data-timestamp">Server time: ${new Date(data.timestamp).toLocaleTimeString()} (${timeAgo})</div>
        `;

        // Add to top of container
        this.dataContainer.insertBefore(dataItem, this.dataContainer.firstChild);

        // Keep only last 10 items
        while (this.dataContainer.children.length > 10) {
            this.dataContainer.removeChild(this.dataContainer.lastChild);
        }
    }

    startPolling() {
        if (this.isPolling) return;

        this.isPolling = true;
        this.timeoutMs = parseInt(this.timeoutInput.value);
        this.currentVersion = -1; // Reset version
        this.requestCount = 0;
        this.errorCount = 0;
        this.dataContainer.innerHTML = '<p style="color: #888;">Waiting for updates...</p>';

        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.timeoutInput.disabled = true;
        
        // Start long polling
        this.longPoll();
    }

    stopPolling() {
        if (!this.isPolling) return;

        this.isPolling = false;
        
        // Cancel current request if it exists
        if (this.currentRequest) {
            this.currentRequest.abort();
            this.currentRequest = null;
        }

        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.timeoutInput.disabled = false;
        this.updateStatus('stopped', 'Stopped');
    }

    updateStatus(state, message = '') {
        const statusMap = {
            'active': `<span class="poll-indicator"></span>Connected`,
            'waiting': `<span class="poll-indicator waiting"></span>Waiting for update...`,
            'stopped': 'Stopped',
            'error': `<span class="poll-indicator stopped"></span>${message}`
        };

        this.statusEl.innerHTML = statusMap[state] || 'Unknown';
        this.statusEl.className = `status-value ${state}`;
    }

    updateUI() {
        this.currentVersionEl.textContent = this.currentVersion >= 0 ? this.currentVersion : '-';
        this.requestCountEl.textContent = this.requestCount;
        this.errorCountEl.textContent = this.errorCount;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LongPollingClient();
});
