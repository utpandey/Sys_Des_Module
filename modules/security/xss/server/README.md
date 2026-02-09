# XSS Protection Server

## Overview

This server demonstrates secure practices for preventing XSS attacks on the server-side.

## Security Features

### 1. Content Security Policy (CSP)
- Implemented via Helmet middleware
- Restricts script sources
- Prevents inline script execution
- Configurable directives

### 2. Input Sanitization
- DOMPurify for HTML sanitization
- HTML entity encoding
- Null byte removal
- Input validation

### 3. Output Encoding
- All user data encoded before rendering
- HTML entities escaped
- JSON responses sanitized

## Running the Server

```bash
cd modules/security/xss/server
npm install
npm start
```

Server runs on `http://localhost:4001`

## API Endpoints

### POST /api/comment
Secure endpoint that sanitizes input before processing.

**Request:**
```json
{
  "comment": "Great article!",
  "username": "John"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "John",
    "comment": "Great article!",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/comments
Returns sanitized comments.

### POST /api/vulnerable/comment
⚠️ **VULNERABLE ENDPOINT** - Demonstrates what NOT to do.

## Production TODO

- [ ] Enable strict CSP in production
- [ ] Use nonces for inline scripts if needed
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Log security events
- [ ] Regular security audits
- [ ] Use HTTPS only
- [ ] Set secure cookie flags

## Common Mistakes

1. **Not sanitizing on server** - Always sanitize server-side
2. **Trusting client validation** - Client can be bypassed
3. **Weak CSP** - Use strict CSP policies
4. **Allowing inline scripts** - Disable or use nonces
5. **Not encoding output** - Always encode before rendering
