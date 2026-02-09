# Security Module

This module demonstrates various security concepts and best practices for frontend system design.

## Topics Covered

1. **[Cross-site Scripting (XSS)](./xss/)** - Preventing XSS attacks through input sanitization and CSP
2. **[iFrame Protection](./iframe-protection/)** - Protecting against clickjacking and iframe abuse
3. **[Security Headers](./security-headers/)** - HTTP security headers for defense in depth
4. **[Client-side Security](./client-security/)** - Secure storage, token handling, and DOM safety
5. **[Secure Communication (HTTPS)](./https/)** - TLS/SSL, certificate validation, secure cookies
6. **[Dependency Security](./dependency-security/)** - Managing third-party dependencies safely
7. **[Input Validation and Sanitization](./input-validation/)** - Server-side validation and sanitization
8. **[Server-Side Request Forgery (SSRF)](./ssrf/)** - Protecting against SSRF attacks
9. **[Server-side JavaScript Injection (SSJI)](./ssji/)** - Preventing code injection attacks
10. **[Feature Policy / Permissions-Policy](./feature-policy/)** - Controlling browser features
11. **[Subresource Integrity (SRI)](./sri/)** - Verifying external resource integrity
12. **[Cross-Origin Resource Sharing (CORS)](./cors/)** - Secure cross-origin requests
13. **[Cross-Site Request Forgery (CSRF)](./csrf/)** - CSRF token protection
14. **[Compliance & Regulation](./compliance/)** - GDPR, security standards, compliance

## Security Principles

### Defense in Depth
- Multiple layers of security
- Don't rely on a single security measure
- Fail securely

### Least Privilege
- Grant minimum necessary permissions
- Principle of least privilege
- Regular access reviews

### Secure by Default
- Secure configurations by default
- Explicitly enable features, not disable security
- Fail closed, not open

## Common Security Mistakes

1. **Trusting Client-Side Input** - Always validate on server
2. **Missing Security Headers** - Headers are first line of defense
3. **Weak CORS Configuration** - Overly permissive CORS
4. **Insecure Storage** - Storing sensitive data in localStorage
5. **Missing CSRF Protection** - Not protecting state-changing operations
6. **Insufficient Input Validation** - Not sanitizing user input
7. **Dependency Vulnerabilities** - Not updating dependencies
8. **Hardcoded Secrets** - Secrets in code or config files
9. **Missing HTTPS** - Transmitting data over HTTP
10. **Error Information Leakage** - Exposing sensitive info in errors

## Production Security Checklist

- [ ] All inputs validated and sanitized
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] CSRF protection enabled
- [ ] Dependencies scanned and updated
- [ ] Secrets in environment variables
- [ ] Error handling doesn't leak information
- [ ] Logging doesn't include sensitive data
- [ ] Rate limiting implemented
- [ ] Authentication and authorization in place
- [ ] Security monitoring and alerts

## Implementation Structure

Each topic includes:
- `server/` - Server-side security implementations
- `client-vanilla/` - Vanilla JavaScript examples
- `client-react/` - React-specific security patterns
- `vulnerable/` - Examples of vulnerable code (for learning)
- `secure/` - Secure implementations
- `README.md` - Security best practices and common mistakes
