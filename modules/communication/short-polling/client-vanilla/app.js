// Short Polling Client - Vanilla JavaScript
// This demonstrates how to implement short polling where the client
// repeatedly requests data from the server at fixed intervals

class ShortPollingClient {
    constructor() {
        this.pollingInterval = null;
        this.intervalMs = 2000; // Default 2 seconds
        this.isPolling = false;
        this.requestCount = 0;
        this.errorCount = 0;
        this.lastDataVersion = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.intervalInput = document.getElementById('interval');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusEl = document.getElementById('status');
        this.lastRequestEl = document.getElementById('lastRequest');
        this.requestCountEl = document.getElementById('requestCount');
        this.errorCountEl = document.getElementById('errorCount');
        this.dataContainer = document.getElementById('dataContainer');
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.startPolling());
        this.stopBtn.addEventListener('click', () => this.stopPolling());
        this.intervalInput.addEventListener('change', (e) => {
            this.intervalMs = parseInt(e.target.value);
            // If currently polling, restart with new interval
            if (this.isPolling) {
                this.stopPolling();
                this.startPolling();
            }
        });
    }

    async fetchData() {
        try {
            const response = await fetch('http://localhost:3001/api/data');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.handleData(data);
            this.updateStatus('success');
            this.requestCount++;
            this.updateUI();
            
        } catch (error) {
            console.error('Polling error:', error);
            this.errorCount++;
            this.updateStatus('error', error.message);
            this.updateUI();
        }
    }

    handleData(data) {
        // Check if this is a new version
        const isNewVersion = this.lastDataVersion === null || 
                           data.version !== this.lastDataVersion;
        
        if (isNewVersion) {
            this.lastDataVersion = data.version;
            this.displayData(data);
        }
    }

    displayData(data) {
        const dataItem = document.createElement('div');
        dataItem.className = 'data-item';
        
        const timeDiff = Date.now() - data.timestamp;
        const timeAgo = timeDiff < 1000 
            ? 'just now' 
            : `${Math.floor(timeDiff / 1000)}s ago`;

        dataItem.innerHTML = `
            <div class="data-version">Version ${data.version}</div>
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
        this.intervalMs = parseInt(this.intervalInput.value);
        
        // Make immediate request
        this.fetchData();
        
        // Then poll at intervals
        this.pollingInterval = setInterval(() => {
            this.fetchData();
        }, this.intervalMs);

        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.intervalInput.disabled = true;
        this.updateStatus('active');
    }

    stopPolling() {
        if (!this.isPolling) return;

        this.isPolling = false;
        
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.intervalInput.disabled = false;
        this.updateStatus('stopped');
    }

    updateStatus(state, errorMessage = '') {
        const statusText = {
            'active': '<span class="poll-indicator"></span>Polling...',
            'stopped': 'Stopped',
            'success': '<span class="poll-indicator"></span>Polling...',
            'error': `<span class="poll-indicator stopped"></span>Error: ${errorMessage}`
        };

        this.statusEl.innerHTML = statusText[state] || 'Unknown';
    }

    updateUI() {
        this.lastRequestEl.textContent = new Date().toLocaleTimeString();
        this.requestCountEl.textContent = this.requestCount;
        this.errorCountEl.textContent = this.errorCount;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ShortPollingClient();
});
