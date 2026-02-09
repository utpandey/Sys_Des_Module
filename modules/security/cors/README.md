# Cross-Origin Resource Sharing (CORS)

## Overview

CORS is a security mechanism that allows or restricts web pages to make requests to a different domain than the one serving the web page.

## How CORS Works

1. Browser sends preflight OPTIONS request
2. Server responds with CORS headers
3. Browser allows or blocks the request

## CORS Headers

### Access-Control-Allow-Origin
- `*` - Allows all origins (insecure)
- `https://example.com` - Allows specific origin
- `null` - Allows no origins

### Access-Control-Allow-Methods
- Allowed HTTP methods (GET, POST, PUT, DELETE, etc.)

### Access-Control-Allow-Headers
- Allowed request headers

### Access-Control-Allow-Credentials
- Whether credentials (cookies, auth) can be sent

### Access-Control-Max-Age
- How long preflight response can be cached

## Production TODO

- [ ] Never use `Access-Control-Allow-Origin: *` with credentials
- [ ] Whitelist specific origins, not all
- [ ] Configure proper allowed methods
- [ ] Set appropriate allowed headers
- [ ] Use credentials only when necessary
- [ ] Set reasonable max-age for preflight
- [ ] Test CORS configuration
- [ ] Document allowed origins

## Common Mistakes

1. **Using `*` with credentials** - Cannot use wildcard with credentials
2. **Overly permissive origins** - Allowing all origins
3. **Missing preflight handling** - Not handling OPTIONS requests
4. **Incorrect headers** - Not setting all required headers
5. **Credentials without HTTPS** - Credentials require HTTPS

## DON'Ts

- ❌ Don't use `Access-Control-Allow-Origin: *` with credentials
- ❌ Don't allow all origins in production
- ❌ Don't forget to handle preflight requests
- ❌ Don't expose sensitive headers
- ❌ Don't use credentials over HTTP

## DO's

- ✅ Whitelist specific origins
- ✅ Handle preflight OPTIONS requests
- ✅ Set appropriate allowed methods
- ✅ Use credentials only when needed
- ✅ Test CORS configuration thoroughly
- ✅ Document CORS policy
