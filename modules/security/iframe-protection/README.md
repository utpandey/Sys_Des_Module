# iFrame Protection

## Overview

iFrame protection prevents clickjacking attacks where malicious sites embed your site in an iframe to trick users.

## Attack Scenario

1. Attacker creates malicious page
2. Embeds your site in iframe
3. Overlays invisible elements
4. User clicks thinking they're on your site
5. Actually clicking attacker's elements

## Protection Methods

### 1. X-Frame-Options Header
```
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
X-Frame-Options: ALLOW-FROM https://example.com
```

### 2. Content Security Policy (CSP)
```
Content-Security-Policy: frame-ancestors 'none'
Content-Security-Policy: frame-ancestors 'self'
Content-Security-Policy: frame-ancestors https://example.com
```

### 3. iframe sandbox Attribute
```html
<iframe sandbox="allow-scripts allow-same-origin"></iframe>
```

## Production TODO

- [ ] Set X-Frame-Options header
- [ ] Configure CSP frame-ancestors
- [ ] Use sandbox attribute for iframes you control
- [ ] Test iframe embedding prevention
- [ ] Document iframe usage policy
- [ ] Monitor for clickjacking attempts

## Common Mistakes

1. **Missing X-Frame-Options** - Always set this header
2. **Using ALLOWALL** - Never allow all origins
3. **Not using CSP** - CSP is more flexible than X-Frame-Options
4. **Trusting iframe content** - Always use sandbox
5. **Allowing third-party iframes** - Whitelist only trusted sources

## DON'Ts

- ❌ Don't allow your site to be embedded without protection
- ❌ Don't use `X-Frame-Options: ALLOWALL`
- ❌ Don't trust iframe content without sandbox
- ❌ Don't allow iframes from untrusted domains

## DO's

- ✅ Always set X-Frame-Options or CSP frame-ancestors
- ✅ Use DENY or SAMEORIGIN for most sites
- ✅ Use sandbox attribute for iframes you control
- ✅ Whitelist specific domains if needed
- ✅ Test protection regularly
