const express = require('express');
const helmet = require('helmet');

const app = express();
const PORT = 4003;

// ✅ SECURE: Configure all security headers with Helmet
app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for demo
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"], // Prevent iframe embedding
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [], // Upgrade HTTP to HTTPS
    },
  },
  
  // Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // X-Content-Type-Options
  noSniff: true, // Prevents MIME type sniffing
  
  // X-Frame-Options
  frameguard: { action: 'deny' },
  
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // Permissions Policy (formerly Feature-Policy)
  permissionsPolicy: {
    features: {
      geolocation: [], // Disable geolocation
      camera: [], // Disable camera
      microphone: [], // Disable microphone
      payment: [], // Disable payment API
      usb: [], // Disable USB
      magnetometer: [], // Disable magnetometer
      gyroscope: [], // Disable gyroscope
      accelerometer: [], // Disable accelerometer
    },
  },
  
  // X-XSS-Protection (legacy, but still useful)
  xssFilter: true,
  
  // Expect-CT (Certificate Transparency)
  expectCt: {
    maxAge: 86400,
    enforce: true
  }
}));

// ✅ SECURE: Additional custom headers
app.use((req, res, next) => {
  // X-DNS-Prefetch-Control
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  // X-Download-Options (IE8+)
  res.setHeader('X-Download-Options', 'noopen');
  
  // X-Permitted-Cross-Domain-Policies
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  next();
});

// Demo page showing security headers
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Security Headers Demo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #1a1a1a;
          color: #e0e0e0;
          padding: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }
        h1 { color: #4caf50; }
        .header-list {
          background: #2a2a2a;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .header-item {
          padding: 10px;
          margin: 5px 0;
          background: #1a1a1a;
          border-left: 3px solid #4caf50;
          font-family: 'Courier New', monospace;
          font-size: 12px;
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
      <h1>✅ Security Headers Demo</h1>
      <div class="info">
        <p>This page is protected by multiple security headers.</p>
        <p>Open browser DevTools → Network tab → Check Response Headers</p>
      </div>
      <div class="header-list">
        <h2>Security Headers Configured:</h2>
        <div class="header-item">Content-Security-Policy: default-src 'self'</div>
        <div class="header-item">Strict-Transport-Security: max-age=31536000; includeSubDomains; preload</div>
        <div class="header-item">X-Content-Type-Options: nosniff</div>
        <div class="header-item">X-Frame-Options: DENY</div>
        <div class="header-item">Referrer-Policy: strict-origin-when-cross-origin</div>
        <div class="header-item">Permissions-Policy: geolocation=(), camera=(), microphone=()</div>
        <div class="header-item">X-XSS-Protection: 1; mode=block</div>
        <div class="header-item">X-DNS-Prefetch-Control: off</div>
        <div class="header-item">X-Download-Options: noopen</div>
        <div class="header-item">X-Permitted-Cross-Domain-Policies: none</div>
      </div>
      <div class="info">
        <h3>How to Verify:</h3>
        <ol>
          <li>Open browser DevTools (F12)</li>
          <li>Go to Network tab</li>
          <li>Refresh the page</li>
          <li>Click on the request</li>
          <li>Check "Response Headers" section</li>
        </ol>
      </div>
    </body>
    </html>
  `);
});

// API endpoint to check headers
app.get('/api/headers', (req, res) => {
  const headers = {
    'Content-Security-Policy': req.get('Content-Security-Policy'),
    'Strict-Transport-Security': req.get('Strict-Transport-Security'),
    'X-Content-Type-Options': req.get('X-Content-Type-Options'),
    'X-Frame-Options': req.get('X-Frame-Options'),
    'Referrer-Policy': req.get('Referrer-Policy'),
    'Permissions-Policy': req.get('Permissions-Policy'),
    'X-XSS-Protection': req.get('X-XSS-Protection'),
  };
  
  res.json({
    message: 'Security headers are configured',
    headers: headers,
    note: 'Check Response Headers in browser DevTools for actual values'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    security: {
      helmet: 'enabled',
      csp: 'enabled',
      hsts: 'enabled',
      allHeaders: 'configured'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Security Headers Server running on http://localhost:${PORT}`);
  console.log('\nSecurity Headers Configured:');
  console.log('  ✅ Content-Security-Policy');
  console.log('  ✅ Strict-Transport-Security (HSTS)');
  console.log('  ✅ X-Content-Type-Options');
  console.log('  ✅ X-Frame-Options');
  console.log('  ✅ Referrer-Policy');
  console.log('  ✅ Permissions-Policy');
  console.log('  ✅ X-XSS-Protection');
  console.log('\nVisit http://localhost:4003 to see the demo');
  console.log('Check Response Headers in browser DevTools');
});
