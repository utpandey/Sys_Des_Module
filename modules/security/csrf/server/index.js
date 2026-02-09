const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const PORT = 4005;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// In-memory session store (use Redis in production)
const sessions = new Map();

// ✅ SECURE: Generate CSRF token
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ✅ SECURE: Get or create session
function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      csrfToken: generateCSRFToken(),
      createdAt: Date.now()
    });
  }
  return sessions.get(sessionId);
}

// ✅ SECURE: Validate CSRF token
function validateCSRFToken(sessionId, token) {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }
  return session.csrfToken === token;
}

// ✅ SECURE: Validate Origin header
function validateOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  
  if (!origin) {
    // Some requests don't have Origin (same-origin, GET requests)
    return true;
  }
  
  // Check if origin matches host
  const originHost = new URL(origin).host;
  return originHost === host || originHost === `localhost:${PORT}`;
}

// ✅ SECURE: Get CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  const sessionId = req.cookies.sessionId || crypto.randomUUID();
  const session = getSession(sessionId);
  
  // ✅ SECURE: Set httpOnly, SameSite cookie
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  });
  
  res.json({
    csrfToken: session.csrfToken
  });
});

// ✅ SECURE: Protected endpoint with CSRF token
app.post('/api/transfer', (req, res) => {
  const sessionId = req.cookies.sessionId;
  const csrfToken = req.headers['x-csrf-token'] || req.body.csrfToken;
  
  // Validate session
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Invalid session' });
  }
  
  // Validate CSRF token
  if (!csrfToken || !validateCSRFToken(sessionId, csrfToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  // Validate Origin
  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  
  // Process request
  const { amount, to } = req.body;
  res.json({
    success: true,
    message: `Transferred $${amount} to ${to}`,
    timestamp: Date.now()
  });
});

// ✅ SECURE: Using SameSite cookies
app.post('/api/secure-action', (req, res) => {
  // With SameSite=Strict, cookies won't be sent in cross-site requests
  // This provides CSRF protection without tokens
  
  const sessionId = req.cookies.sessionId;
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Validate Origin as additional protection
  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  
  res.json({
    success: true,
    message: 'Action completed',
    timestamp: Date.now()
  });
});

// ❌ VULNERABLE: No CSRF protection
app.post('/api/vulnerable/transfer', (req, res) => {
  // DANGEROUS: No CSRF protection
  // Attacker can trick user into making this request
  
  const { amount, to } = req.body;
  res.json({
    success: true,
    message: `⚠️ VULNERABLE: Transferred $${amount} to ${to}`,
    warning: 'This endpoint has no CSRF protection!'
  });
});

// Demo page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CSRF Protection Demo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #1a1a1a;
          color: #e0e0e0;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 { color: #4caf50; }
        .form-group {
          margin: 15px 0;
        }
        label {
          display: block;
          margin-bottom: 5px;
          color: #ccc;
        }
        input {
          width: 100%;
          padding: 8px;
          background: #2a2a2a;
          border: 1px solid #444;
          border-radius: 4px;
          color: #e0e0e0;
        }
        button {
          padding: 10px 20px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        }
        .info {
          background: #2a2a2a;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
          border-left: 3px solid #4a9eff;
        }
      </style>
    </head>
    <body>
      <h1>CSRF Protection Demo</h1>
      <div class="info">
        <p>This page demonstrates CSRF protection using tokens and SameSite cookies.</p>
        <p>Open browser DevTools → Application → Cookies to see the session cookie.</p>
      </div>
      <form id="transferForm">
        <div class="form-group">
          <label>Amount:</label>
          <input type="number" name="amount" value="100" required>
        </div>
        <div class="form-group">
          <label>To:</label>
          <input type="text" name="to" value="attacker@evil.com" required>
        </div>
        <input type="hidden" name="csrfToken" id="csrfToken">
        <button type="submit">Transfer (Protected)</button>
      </form>
      <div id="result" style="margin-top: 20px;"></div>
      <script>
        // Get CSRF token on page load
        fetch('/api/csrf-token', { credentials: 'include' })
          .then(r => r.json())
          .then(data => {
            document.getElementById('csrfToken').value = data.csrfToken;
          });
        
        // Handle form submission
        document.getElementById('transferForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);
          
          const response = await fetch('/api/transfer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': data.csrfToken
            },
            credentials: 'include',
            body: JSON.stringify(data)
          });
          
          const result = await response.json();
          document.getElementById('result').textContent = JSON.stringify(result, null, 2);
        });
      </script>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    csrf: {
      protection: 'enabled',
      tokenGeneration: 'enabled',
      originValidation: 'enabled',
      sameSiteCookies: 'enabled'
    }
  });
});

app.listen(PORT, () => {
  console.log(`CSRF Security Server running on http://localhost:${PORT}`);
  console.log('\nCSRF Protection Features:');
  console.log('  ✅ CSRF token generation');
  console.log('  ✅ Token validation');
  console.log('  ✅ Origin header validation');
  console.log('  ✅ SameSite cookies');
  console.log('\nEndpoints:');
  console.log('  GET  /api/csrf-token - Get CSRF token');
  console.log('  POST /api/transfer - Protected endpoint');
  console.log('  POST /api/vulnerable/transfer - ⚠️ Vulnerable endpoint');
});
