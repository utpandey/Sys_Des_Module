const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3004;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Store connected clients
const clients = new Set();
let eventId = 0;

// SSE endpoint
// Server pushes events to client over HTTP
app.get('/events', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection message
  eventId++;
  res.write(`id: ${eventId}\n`);
  res.write(`event: connection\n`);
  res.write(`data: ${JSON.stringify({ message: 'Connected to SSE stream', timestamp: Date.now() })}\n\n`);

  // Add client to set
  clients.add(res);
  console.log(`[${new Date().toISOString()}] Client connected. Total clients: ${clients.size}`);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    if (!clients.has(res)) {
      clearInterval(heartbeatInterval);
      return;
    }
    
    try {
      eventId++;
      res.write(`id: ${eventId}\n`);
      res.write(`event: heartbeat\n`);
      res.write(`data: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);
    } catch (error) {
      console.error('Error sending heartbeat:', error);
      clients.delete(res);
      clearInterval(heartbeatInterval);
    }
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    clients.delete(res);
    clearInterval(heartbeatInterval);
    console.log(`[${new Date().toISOString()}] Client disconnected. Total clients: ${clients.size}`);
  });

  // Handle errors
  req.on('error', (error) => {
    console.error('SSE connection error:', error);
    clients.delete(res);
    clearInterval(heartbeatInterval);
  });
});

// Function to broadcast event to all connected clients
function broadcastEvent(eventType, data) {
  eventId++;
  const message = `id: ${eventId}\nevent: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  
  const disconnectedClients = [];
  clients.forEach(client => {
    try {
      client.write(message);
    } catch (error) {
      console.error('Error broadcasting to client:', error);
      disconnectedClients.push(client);
    }
  });

  // Remove disconnected clients
  disconnectedClients.forEach(client => clients.delete(client));
}

// Simulate periodic data updates
setInterval(() => {
  const updateData = {
    type: 'data-update',
    value: Math.floor(Math.random() * 1000),
    timestamp: Date.now(),
    message: 'Random data update'
  };
  broadcastEvent('update', updateData);
  console.log(`[${new Date().toISOString()}] Broadcasted update event`);
}, 5000); // Every 5 seconds

// HTTP endpoint to trigger custom event
app.post('/trigger', (req, res) => {
  const { eventType, data } = req.body;
  
  if (!eventType) {
    return res.status(400).json({ error: 'eventType is required' });
  }

  broadcastEvent(eventType, data || { message: 'Custom event', timestamp: Date.now() });
  
  res.json({
    success: true,
    message: 'Event broadcasted',
    clients: clients.size
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connectedClients: clients.size,
    timestamp: Date.now()
  });
});

app.listen(PORT, () => {
  console.log(`Server-Sent Events Server running on http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/events`);
  console.log(`Trigger endpoint: http://localhost:${PORT}/trigger`);
  console.log(`Data updates will be sent every 5 seconds`);
});
