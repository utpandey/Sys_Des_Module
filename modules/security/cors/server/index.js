const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4004;

app.use(express.json());

// ✅ SECURE: Proper CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://yourdomain.com',
  'https://app.yourdomain.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// ✅ SECURE: Apply CORS middleware
app.use(cors(corsOptions));

// ✅ SECURE: API endpoint with CORS
app.get('/api/data', (req, res) => {
  res.json({
    message: 'This endpoint has proper CORS configuration',
    data: {
      timestamp: Date.now(),
      origin: req.headers.origin
    }
  });
});

// ✅ SECURE: POST endpoint with CORS
app.post('/api/data', (req, res) => {
  res.json({
    message: 'POST request successful',
    received: req.body
  });
});

// ❌ VULNERABLE: Overly permissive CORS (for demonstration)
app.get('/api/vulnerable', cors({
  origin: '*', // DANGEROUS: Allows all origins
  credentials: false // Cannot use credentials with *
}), (req, res) => {
  res.json({
    message: '⚠️ This endpoint has insecure CORS configuration',
    warning: 'Access-Control-Allow-Origin: * is dangerous'
  });
});

// ❌ VULNERABLE: Missing CORS headers
app.get('/api/no-cors', (req, res) => {
  // DANGEROUS: No CORS headers - will be blocked by browser
  res.json({
    message: 'This endpoint has no CORS headers'
  });
});

// Manual CORS implementation (alternative to cors middleware)
app.options('/api/manual', (req, res) => {
  // ✅ SECURE: Handle preflight request
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  
  res.sendStatus(200);
});

app.get('/api/manual', (req, res) => {
  // ✅ SECURE: Set CORS headers manually
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.json({
    message: 'Manual CORS implementation',
    origin: origin
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    cors: {
      configured: true,
      allowedOrigins: allowedOrigins.length,
      credentials: true
    }
  });
});

app.listen(PORT, () => {
  console.log(`CORS Security Server running on http://localhost:${PORT}`);
  console.log('\nCORS Configuration:');
  console.log('  ✅ Whitelisted origins:', allowedOrigins.join(', '));
  console.log('  ✅ Credentials: enabled');
  console.log('  ✅ Methods: GET, POST, PUT, DELETE, OPTIONS');
  console.log('\nEndpoints:');
  console.log('  GET  /api/data - Secure CORS endpoint');
  console.log('  POST /api/data - Secure CORS endpoint');
  console.log('  GET  /api/vulnerable - ⚠️ Insecure CORS (wildcard)');
  console.log('  GET  /api/no-cors - No CORS headers');
  console.log('  GET  /api/manual - Manual CORS implementation');
});
