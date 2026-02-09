const express = require('express');
const helmet = require('helmet');

const app = express();
const PORT = 4002;

// ✅ SECURE: Configure Helmet with iframe protection
app.use(helmet({
  // X-Frame-Options: DENY (prevents all iframe embedding)
  frameguard: { action: 'deny' },
  
  // Alternative: Allow same origin only
  // frameguard: { action: 'sameorigin' },
  
  // Alternative: Allow specific origin
  // frameguard: { action: 'allow-from', domain: 'https://trusted-domain.com' },
  
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // ✅ SECURE: Prevent iframe embedding via CSP
      frameAncestors: ["'none'"], // 'none' = no embedding allowed
      // Alternative: frameAncestors: ["'self'"], // Only same origin
      // Alternative: frameAncestors: ["https://trusted-domain.com"], // Whitelist
    },
  },
}));

// Serve static files
app.use(express.static('public'));

// ✅ SECURE: Protected page (cannot be embedded)
app.get('/protected', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Protected Page</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #1a1a1a;
          color: #e0e0e0;
          padding: 40px;
          text-align: center;
        }
        .success {
          background: #4caf50;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px auto;
          max-width: 600px;
        }
      </style>
    </head>
    <body>
      <h1>✅ Protected Page</h1>
      <div class="success">
        <p>This page is protected from iframe embedding.</p>
        <p>X-Frame-Options: DENY</p>
        <p>CSP frame-ancestors: 'none'</p>
        <p>Try embedding this page in an iframe - it won't work!</p>
      </div>
    </body>
    </html>
  `);
});

// ❌ VULNERABLE: Page without protection (for demonstration)
app.get('/vulnerable', (req, res) => {
  // DANGEROUS: No X-Frame-Options header
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vulnerable Page</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f44336;
          color: white;
          padding: 40px;
          text-align: center;
        }
        .warning {
          background: #ff9800;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px auto;
          max-width: 600px;
        }
      </style>
    </head>
    <body>
      <h1>❌ Vulnerable Page</h1>
      <div class="warning">
        <p>⚠️ This page has NO iframe protection!</p>
        <p>It can be embedded in malicious iframes.</p>
        <p>DO NOT use this pattern in production!</p>
      </div>
    </body>
    </html>
  `);
});

// Test page to demonstrate iframe embedding
app.get('/test-embed', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Iframe Embed Test</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #2a2a2a;
          color: #e0e0e0;
          padding: 20px;
        }
        .test-section {
          background: #1a1a1a;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        iframe {
          width: 100%;
          height: 400px;
          border: 2px solid #444;
          border-radius: 4px;
        }
        .success {
          color: #4caf50;
        }
        .error {
          color: #f44336;
        }
      </style>
    </head>
    <body>
      <h1>Iframe Embedding Test</h1>
      
      <div class="test-section">
        <h2>Test 1: Protected Page (Should Fail)</h2>
        <p class="error">This iframe should NOT load (protected by X-Frame-Options)</p>
        <iframe src="/protected"></iframe>
      </div>
      
      <div class="test-section">
        <h2>Test 2: Vulnerable Page (Will Load)</h2>
        <p class="error">⚠️ This iframe WILL load (no protection)</p>
        <iframe src="/vulnerable"></iframe>
      </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    protection: {
      xFrameOptions: 'DENY',
      cspFrameAncestors: "'none'",
      helmet: 'enabled'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Iframe Protection Server running on http://localhost:${PORT}`);
  console.log('\nEndpoints:');
  console.log('  /protected - Protected page (cannot be embedded)');
  console.log('  /vulnerable - Vulnerable page (no protection)');
  console.log('  /test-embed - Test iframe embedding');
  console.log('\nSecurity headers:');
  console.log('  X-Frame-Options: DENY');
  console.log('  CSP frame-ancestors: \'none\'');
});
