# Cross-Site Request Forgery (CSRF)

## Overview

CSRF attacks trick users into performing actions they didn't intend on a website where they're authenticated.

## Attack Scenario

1. User is logged into bank.com
2. User visits malicious-site.com
3. Malicious site sends request to bank.com/transfer
4. Browser includes user's cookies automatically
5. Bank processes request as if user initiated it

## Protection Methods

### 1. CSRF Tokens
- Server generates unique token per session
- Token included in forms/requests
- Server validates token on each request

### 2. SameSite Cookies
- `SameSite=Strict` - Never send in cross-site requests
- `SameSite=Lax` - Send in top-level navigation
- `SameSite=None` - Always send (requires Secure)

### 3. Origin/Referer Validation
- Check Origin header
- Check Referer header
- Reject if doesn't match

### 4. Double Submit Cookie
- Token in cookie and form
- Compare both values

## Production TODO

- [ ] Implement CSRF tokens for state-changing operations
- [ ] Set SameSite cookie attribute
- [ ] Validate Origin/Referer headers
- [ ] Use HTTPS for SameSite=None
- [ ] Rotate CSRF tokens regularly
- [ ] Store tokens securely
- [ ] Invalidate tokens on logout
- [ ] Test CSRF protection

## Common Mistakes

1. **Missing CSRF protection** - Not protecting state-changing operations
2. **Weak token generation** - Predictable tokens
3. **Token not validated** - Generating but not checking
4. **SameSite=None without Secure** - Cookies won't work
5. **Not protecting GET requests** - Some frameworks require protection

## DON'Ts

- ❌ Don't skip CSRF protection for state-changing operations
- ❌ Don't use predictable tokens
- ❌ Don't store tokens in localStorage (XSS risk)
- ❌ Don't use SameSite=None without Secure flag
- ❌ Don't trust Referer header alone

## DO's

- ✅ Use CSRF tokens for POST/PUT/DELETE
- ✅ Set SameSite cookie attribute
- ✅ Validate Origin/Referer headers
- ✅ Use HTTPS with SameSite=None
- ✅ Rotate tokens on login/logout
- ✅ Store tokens in httpOnly cookies
