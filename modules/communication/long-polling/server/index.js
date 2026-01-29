const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Simulated data store
let dataVersion = 0;
let lastUpdateTime = Date.now();
let pendingRequests = []; // Store pending long polling requests

// Simulate data changes periodically (every 3-8 seconds)
setInterval(() => {
  dataVersion++;
  lastUpdateTime = Date.now();
  console.log(`[${new Date().toISOString()}] Data updated - Version: ${dataVersion}`);
  
  // Notify all pending requests
  const requests = [...pendingRequests];
  pendingRequests = [];
  
  requests.forEach(res => {
    const response = {
      version: dataVersion,
      timestamp: lastUpdateTime,
      message: `Data version ${dataVersion}`,
      serverTime: Date.now()
    };
    res.json(response);
  });
}, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds

// Long Polling endpoint
// Server holds the connection open until data changes or timeout occurs
app.get('/api/data', (req, res) => {
  const clientVersion = parseInt(req.query.version) || -1;
  const timeout = parseInt(req.query.timeout) || 30000; // Default 30 seconds
  const startTime = Date.now();

  console.log(`[${new Date().toISOString()}] Long poll request - Client version: ${clientVersion}`);

  // Check if data has already changed
  if (dataVersion > clientVersion) {
    // Data has changed, return immediately
    const response = {
      version: dataVersion,
      timestamp: lastUpdateTime,
      message: `Data version ${dataVersion}`,
      serverTime: Date.now()
    };
    console.log(`[${new Date().toISOString()}] Immediate response - Version: ${dataVersion}`);
    return res.json(response);
  }

  // Data hasn't changed, hold connection open
  const requestInfo = {
    res: res,
    clientVersion: clientVersion,
    startTime: startTime
  };

  pendingRequests.push(requestInfo);

  // Set timeout to prevent connection from staying open too long
  const timeoutId = setTimeout(() => {
    // Remove from pending requests
    const index = pendingRequests.findIndex(r => r === requestInfo);
    if (index !== -1) {
      pendingRequests.splice(index, 1);
      
      // Send timeout response
      res.json({
        version: dataVersion,
        timestamp: lastUpdateTime,
        message: 'No update (timeout)',
        serverTime: Date.now(),
        timeout: true
      });
      console.log(`[${new Date().toISOString()}] Timeout response - Client version: ${clientVersion}`);
    }
  }, Math.min(timeout, 30000)); // Cap at 30 seconds

  // Clean up timeout if request is removed (data changed)
  requestInfo.timeoutId = timeoutId;
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    pendingRequests: pendingRequests.length,
    currentVersion: dataVersion
  });
});

app.listen(PORT, () => {
  console.log(`Long Polling Server running on http://localhost:${PORT}`);
  console.log(`Data will update randomly every 3-8 seconds`);
  console.log(`Server holds connections open until data changes or timeout`);
});
