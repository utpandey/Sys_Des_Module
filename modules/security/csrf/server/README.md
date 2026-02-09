# CSRF Protection Server

## Overview

This server demonstrates CSRF protection using tokens, SameSite cookies, and Origin validation.

## CSRF Protection Methods

### 1. CSRF Tokens
- Server generates unique token per session
- Token included in requests
- Server validates token

### 2. SameSite Cookies
- `SameSite=Strict` - Never send cross-site
- `SameSite=Lax` - Send in top-level navigation
- `SameSite=None` - Always send (requires Secure)

### 3. Origin Validation
- Check Origin header
- Reject if doesn't match

## Running the Server

```bash
cd modules/security/csrf/server
npm install
npm start
```

Server runs on `http://localhost:4005`

## API Endpoints

### GET /api/csrf-token
Get CSRF token for current session.

**Response:**
```json
{
  "csrfToken": "abc123..."
}
```

### POST /api/transfer
Protected endpoint requiring CSRF token.

**Headers:**
```
X-CSRF-Token: abc123...
Cookie: sessionId=xyz789...
```

**Body:**
```json
{
  "amount": 100,
  "to": "account@example.com",
  "csrfToken": "abc123..."
}
```

## Testing CSRF Protection

### Valid Request
```bash
# 1. Get CSRF token
curl -c cookies.txt http://localhost:4005/api/csrf-token

# 2. Extract token from response and use in request
curl -b cookies.txt -X POST http://localhost:4005/api/transfer \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -d '{"amount": 100, "to": "account@example.com"}'
```

### Invalid Request (Missing Token)
```bash
curl -b cookies.txt -X POST http://localhost:4005/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "to": "account@example.com"}'
# Returns 403 Forbidden
```

## Production TODO

- [ ] Use secure, random token generation
- [ ] Store tokens in httpOnly cookies
- [ ] Set SameSite cookie attribute
- [ ] Validate Origin header
- [ ] Rotate tokens on login/logout
- [ ] Use HTTPS (required for SameSite=None)
- [ ] Implement token expiration
- [ ] Log CSRF failures for monitoring

## Common Mistakes

1. **Missing CSRF protection** - Not protecting state-changing operations
2. **Weak token generation** - Predictable tokens
3. **Token not validated** - Generating but not checking
4. **SameSite=None without Secure** - Won't work
5. **Storing tokens in localStorage** - XSS risk
