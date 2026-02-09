# Security Headers Server

## Overview

This server demonstrates how to configure essential HTTP security headers for defense-in-depth protection.

## Security Headers Implemented

### 1. Content Security Policy (CSP)
- Prevents XSS attacks
- Controls resource loading
- Restricts script sources

### 2. Strict-Transport-Security (HSTS)
- Forces HTTPS connections
- Prevents downgrade attacks
- Includes subdomains

### 3. X-Content-Type-Options
- Prevents MIME type sniffing
- Forces declared content type

### 4. X-Frame-Options
- Prevents clickjacking
- Set to DENY

### 5. Referrer-Policy
- Controls referrer information
- Prevents information leakage

### 6. Permissions-Policy
- Controls browser features
- Disables unnecessary APIs

### 7. X-XSS-Protection
- Legacy XSS protection
- Use with CSP

## Running the Server

```bash
cd modules/security/security-headers/server
npm install
npm start
```

Server runs on `http://localhost:4003`

## Verifying Headers

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Click on the request
5. Check "Response Headers" section

Or use curl:
```bash
curl -I http://localhost:4003
```

## Production TODO

- [ ] Configure strict CSP for your application
- [ ] Set HSTS max-age appropriately (1 year recommended)
- [ ] Enable HSTS preload for your domain
- [ ] Test headers with security scanner (securityheaders.com)
- [ ] Monitor CSP violations
- [ ] Review and adjust Permissions-Policy
- [ ] Use Helmet.js or similar middleware
- [ ] Document header configuration

## Common Mistakes

1. **Missing CSP** - Most important header
2. **Weak CSP** - Too permissive policies
3. **No HSTS** - Allows downgrade attacks
4. **Missing X-Content-Type-Options** - MIME sniffing vulnerability
5. **Overly permissive Referrer-Policy** - Information leakage

## Header Testing Tools

- [securityheaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- Browser DevTools Network tab
