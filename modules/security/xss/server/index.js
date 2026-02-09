const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = 4001;

// Create DOMPurify instance for server-side sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SECURE: Helmet sets security headers including CSP
app.use(helmet({
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
    },
  },
  crossOriginEmbedderPolicy: false
}));

// ✅ SECURE: HTML encoding function
function escapeHtml(text) {
  if (typeof text !== 'string') {
    return '';
  }
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ✅ SECURE: Sanitize user input
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  // Trim whitespace
  sanitized = sanitized.trim();
  // Use DOMPurify for HTML sanitization
  return DOMPurify.sanitize(sanitized, { 
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: []
  });
}

// ✅ SECURE: Endpoint with input sanitization
app.post('/api/comment', (req, res) => {
  const { comment, username } = req.body;

  // Validate input
  if (!comment || typeof comment !== 'string') {
    return res.status(400).json({ error: 'Invalid comment' });
  }

  // ✅ SECURE: Sanitize input
  const sanitizedComment = sanitizeInput(comment);
  const sanitizedUsername = sanitizeInput(username || 'Anonymous');

  // In production, store sanitized data in database
  const response = {
    success: true,
    message: 'Comment received',
    data: {
      username: sanitizedUsername,
      comment: sanitizedComment,
      timestamp: new Date().toISOString()
    }
  };

  res.json(response);
});

// ✅ SECURE: Endpoint that returns sanitized data
app.get('/api/comments', (req, res) => {
  // Simulated comments (in production, fetch from database)
  const comments = [
    { username: 'User1', comment: 'Great article!' },
    { username: 'User2', comment: 'Very helpful, thanks!' }
  ];

  // ✅ SECURE: Sanitize all data before sending
  const sanitizedComments = comments.map(comment => ({
    username: escapeHtml(comment.username),
    comment: escapeHtml(comment.comment)
  }));

  res.json({ comments: sanitizedComments });
});

// ❌ VULNERABLE: Example of what NOT to do
app.post('/api/vulnerable/comment', (req, res) => {
  const { comment } = req.body;
  
  // DANGEROUS: Returning unsanitized user input
  // This would allow XSS if rendered with innerHTML
  res.json({
    success: true,
    comment: comment // ❌ NOT SANITIZED
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    security: {
      csp: 'enabled',
      sanitization: 'enabled',
      helmet: 'enabled'
    }
  });
});

app.listen(PORT, () => {
  console.log(`XSS Security Server running on http://localhost:${PORT}`);
  console.log('Security features enabled:');
  console.log('  - Content Security Policy (CSP)');
  console.log('  - Input sanitization');
  console.log('  - HTML encoding');
  console.log('  - Helmet security headers');
});
