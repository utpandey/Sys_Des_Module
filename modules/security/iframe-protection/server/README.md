# Iframe Protection Server

## Overview

This server demonstrates how to protect your application from clickjacking attacks using X-Frame-Options and Content Security Policy headers.

## Protection Methods

### 1. X-Frame-Options
- `DENY` - Prevents all iframe embedding
- `SAMEORIGIN` - Only allows same-origin embedding
- `ALLOW-FROM` - Deprecated, use CSP instead

### 2. Content Security Policy (CSP)
- `frame-ancestors 'none'` - No embedding allowed
- `frame-ancestors 'self'` - Same origin only
- `frame-ancestors https://example.com` - Whitelist specific domains

## Running the Server

```bash
cd modules/security/iframe-protection/server
npm install
npm start
```

Server runs on `http://localhost:4002`

## Endpoints

### GET /protected
Protected page with X-Frame-Options: DENY and CSP frame-ancestors: 'none'

### GET /vulnerable
⚠️ Vulnerable page without protection (for demonstration only)

### GET /test-embed
Test page that attempts to embed both protected and vulnerable pages

## Production TODO

- [ ] Set X-Frame-Options header on all pages
- [ ] Configure CSP frame-ancestors directive
- [ ] Use DENY or SAMEORIGIN for most pages
- [ ] Test iframe embedding prevention
- [ ] Document iframe usage policy
- [ ] Monitor for clickjacking attempts
- [ ] Use Helmet middleware for easy configuration

## Common Mistakes

1. **Missing X-Frame-Options** - Always set this header
2. **Using ALLOWALL** - Never allow all origins
3. **Not using CSP** - CSP is more flexible
4. **Trusting iframe content** - Always use sandbox
5. **Allowing third-party iframes** - Whitelist only trusted sources
