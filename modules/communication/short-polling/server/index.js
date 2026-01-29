const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Simulated data store that changes over time
let dataVersion = 0;
let lastUpdateTime = Date.now();

// Simulate data changes periodically (every 5-10 seconds)
setInterval(() => {
  dataVersion++;
  lastUpdateTime = Date.now();
  console.log(`[${new Date().toISOString()}] Data updated - Version: ${dataVersion}`);
}, Math.random() * 5000 + 5000); // Random interval between 5-10 seconds

// Short Polling endpoint
// Client will call this repeatedly at fixed intervals
app.get('/api/data', (req, res) => {
  const currentTime = Date.now();
  
  // Return current data state
  const response = {
    version: dataVersion,
    timestamp: lastUpdateTime,
    message: `Data version ${dataVersion}`,
    serverTime: currentTime,
    hasUpdate: true // In real scenario, compare with client's last known version
  };

  console.log(`[${new Date().toISOString()}] GET /api/data - Returning version ${dataVersion}`);
  
  res.json(response);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Short Polling Server running on http://localhost:${PORT}`);
  console.log(`Data will update randomly every 5-10 seconds`);
  console.log(`Try polling /api/data endpoint from client`);
});
