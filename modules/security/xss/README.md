# Cross-Site Scripting (XSS)

## Overview

XSS attacks occur when malicious scripts are injected into web pages viewed by other users. This is one of the most common web vulnerabilities.

## Types of XSS

### 1. Stored XSS (Persistent)
- Malicious script stored in database
- Executed when page is loaded
- Most dangerous type

### 2. Reflected XSS (Non-Persistent)
- Malicious script in URL parameters
- Reflected back to user
- Requires user to click malicious link

### 3. DOM-based XSS
- Client-side JavaScript manipulation
- No server involvement
- Harder to detect

## Common XSS Attack Vectors

```javascript
// Dangerous: Direct innerHTML
element.innerHTML = userInput; // ❌ VULNERABLE

// Dangerous: eval()
eval(userInput); // ❌ VULNERABLE

// Dangerous: document.write()
document.write(userInput); // ❌ VULNERABLE

// Dangerous: setTimeout/setInterval with strings
setTimeout(userInput, 1000); // ❌ VULNERABLE
```

## Prevention Strategies

### 1. Input Sanitization
- Sanitize all user input
- Use libraries like DOMPurify
- Whitelist allowed HTML tags

### 2. Output Encoding
- Encode data before rendering
- Use textContent instead of innerHTML
- Escape special characters

### 3. Content Security Policy (CSP)
- Restrict script sources
- Prevent inline scripts
- Report violations

### 4. HttpOnly Cookies
- Prevent JavaScript access to cookies
- Reduces impact of XSS

## Production TODO

- [ ] Implement Content Security Policy
- [ ] Sanitize all user inputs
- [ ] Use textContent instead of innerHTML where possible
- [ ] Set HttpOnly flag on cookies
- [ ] Regular security audits
- [ ] XSS vulnerability scanning
- [ ] Input validation on server-side
- [ ] Output encoding for all dynamic content

## Common Mistakes

1. **Trusting client-side validation only** - Always validate on server
2. **Using innerHTML with user data** - Use textContent or sanitize
3. **Missing CSP headers** - CSP is crucial for XSS prevention
4. **Not encoding output** - Always encode before rendering
5. **Allowing inline scripts** - Disable inline scripts via CSP
6. **Trusting third-party libraries** - Review and sanitize third-party code

## DON'Ts

- ❌ Don't use `innerHTML` with user input
- ❌ Don't use `eval()` with user data
- ❌ Don't use `document.write()` with user input
- ❌ Don't trust client-side validation
- ❌ Don't allow inline scripts without nonce
- ❌ Don't store sensitive data in localStorage without encryption

## DO's

- ✅ Always sanitize user input
- ✅ Use `textContent` for user data
- ✅ Implement strict CSP
- ✅ Validate and sanitize on server-side
- ✅ Use HttpOnly cookies
- ✅ Encode output before rendering
- ✅ Use Content Security Policy
- ✅ Regular security testing
