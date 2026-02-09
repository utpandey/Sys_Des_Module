# CORS Security Server

## Overview

This server demonstrates secure and insecure CORS configurations.

## CORS Configuration

### Secure Configuration
- Whitelisted specific origins
- Credentials enabled
- Proper preflight handling
- Appropriate allowed methods and headers

### Vulnerable Examples
- Wildcard origin (`*`)
- Missing CORS headers
- Overly permissive configuration

## Running the Server

```bash
cd modules/security/cors/server
npm install
npm start
```

Server runs on `http://localhost:4004`

## Testing CORS

### From Browser Console
```javascript
// Test from allowed origin
fetch('http://localhost:4004/api/data', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log);

// Test from different origin (should fail)
fetch('http://localhost:4004/api/data', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Using curl
```bash
# Preflight request
curl -X OPTIONS http://localhost:4004/api/data \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Actual request
curl -X GET http://localhost:4004/api/data \
  -H "Origin: http://localhost:3000" \
  -v
```

## Production TODO

- [ ] Whitelist specific origins only
- [ ] Never use `*` with credentials
- [ ] Handle preflight OPTIONS requests
- [ ] Set appropriate allowed methods
- [ ] Configure allowed headers
- [ ] Use credentials only when needed
- [ ] Test CORS from all allowed origins
- [ ] Document CORS policy
- [ ] Monitor CORS errors

## Common Mistakes

1. **Using `*` with credentials** - Cannot combine
2. **Allowing all origins** - Security risk
3. **Missing preflight handling** - Requests will fail
4. **Incorrect headers** - Browser will block
5. **Credentials over HTTP** - Must use HTTPS
