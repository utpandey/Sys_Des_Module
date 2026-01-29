const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const PORT = 3003;

// Enable CORS for HTTP routes
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/ws'
});

// Store connected clients
const clients = new Set();
let messageId = 0;

// Broadcast function to send message to all connected clients
function broadcast(data, excludeClient = null) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  clients.add(ws);
  
  console.log(`[${new Date().toISOString()}] Client connected: ${clientId}`);
  console.log(`[${new Date().toISOString()}] Total clients: ${clients.size}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    clientId: clientId,
    message: 'Connected to WebSocket server',
    timestamp: Date.now()
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`[${new Date().toISOString()}] Received from ${clientId}:`, data);

      messageId++;

      // Echo message back to sender
      ws.send(JSON.stringify({
        type: 'echo',
        id: messageId,
        originalMessage: data,
        timestamp: Date.now()
      }));

      // Broadcast to all other clients (if it's a chat message)
      if (data.type === 'chat' || data.type === 'message') {
        broadcast({
          type: 'broadcast',
          id: messageId,
          from: clientId,
          message: data.message || data.text,
          timestamp: Date.now()
        }, ws);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: Date.now()
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[${new Date().toISOString()}] Client disconnected: ${clientId}`);
    console.log(`[${new Date().toISOString()}] Total clients: ${clients.size}`);
    
    // Notify other clients
    broadcast({
      type: 'client-disconnected',
      clientId: clientId,
      timestamp: Date.now()
    });
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] WebSocket error for ${clientId}:`, error);
  });

  // Send periodic updates (simulate real-time data)
  const updateInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'update',
        id: messageId++,
        data: {
          serverTime: Date.now(),
          connectedClients: clients.size,
          randomValue: Math.floor(Math.random() * 1000)
        },
        timestamp: Date.now()
      }));
    } else {
      clearInterval(updateInterval);
    }
  }, 5000); // Send update every 5 seconds

  // Store interval for cleanup
  ws.updateInterval = updateInterval;
});

// HTTP endpoint to get server status
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    connectedClients: clients.size,
    timestamp: Date.now()
  });
});

// HTTP endpoint to broadcast message (for testing)
app.post('/broadcast', (req, res) => {
  const { message } = req.body;
  messageId++;
  
  broadcast({
    type: 'server-broadcast',
    id: messageId,
    message: message || 'Server broadcast message',
    timestamp: Date.now()
  });

  res.json({
    success: true,
    message: 'Broadcast sent',
    clients: clients.size
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket Server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`HTTP status endpoint: http://localhost:${PORT}/status`);
});
