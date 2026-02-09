# Security Headers

## Overview

HTTP security headers provide defense-in-depth protection against various attacks. They are the first line of defense for web applications.

## Essential Security Headers

### 1. Content Security Policy (CSP)
Prevents XSS attacks by controlling resource loading.

### 2. Strict-Transport-Security (HSTS)
Forces HTTPS connections.

### 3. X-Content-Type-Options
Prevents MIME type sniffing.

### 4. X-Frame-Options
Prevents clickjacking (covered in iframe-protection).

### 5. Referrer-Policy
Controls referrer information.

### 6. Permissions-Policy (Feature-Policy)
Controls browser features.

### 7. X-XSS-Protection
Legacy XSS protection (use CSP instead).

## Production TODO

- [ ] Implement strict CSP
- [ ] Enable HSTS with appropriate max-age
- [ ] Set X-Content-Type-Options: nosniff
- [ ] Configure Referrer-Policy
- [ ] Set Permissions-Policy
- [ ] Test headers with security scanner
- [ ] Monitor CSP violations
- [ ] Use Helmet.js or similar middleware

## Common Mistakes

1. **Missing CSP** - Most important header
2. **Weak CSP** - Too permissive policies
3. **No HSTS** - Allows downgrade attacks
4. **Missing X-Content-Type-Options** - MIME sniffing vulnerability
5. **Overly permissive Referrer-Policy** - Information leakage

## Header Reference

| Header | Purpose | Example |
|--------|---------|---------|
| CSP | XSS prevention | `default-src 'self'` |
| HSTS | HTTPS enforcement | `max-age=31536000` |
| X-Content-Type-Options | MIME sniffing | `nosniff` |
| X-Frame-Options | Clickjacking | `DENY` |
| Referrer-Policy | Referrer control | `strict-origin-when-cross-origin` |
| Permissions-Policy | Feature control | `geolocation=()`, `camera=()` |
