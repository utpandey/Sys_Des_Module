/**
 * Cookie Storage - Vanilla JS, React & Server Examples
 * Focus on security best practices for senior engineers
 */

/* ============================================
   VANILLA JS - CLIENT SIDE
   ============================================ */

/**
 * 1. Cookie utility (client-side)
 * 
 * Note: document.cookie API is notoriously awkward.
 * This wrapper makes it usable.
 */
const cookies = {
  get(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
  },

  set(name, value, options = {}) {
    let cookie = `${name}=${encodeURIComponent(value)}`;
    
    if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
    if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
    if (options.path) cookie += `; Path=${options.path}`;
    if (options.domain) cookie += `; Domain=${options.domain}`;
    if (options.secure) cookie += '; Secure';
    if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
    // Note: HttpOnly CANNOT be set via JavaScript (that's the point!)
    
    document.cookie = cookie;
  },

  remove(name, options = {}) {
    this.set(name, '', { ...options, maxAge: 0 });
  },

  getAll() {
    if (!document.cookie) return {};
    return Object.fromEntries(
      document.cookie.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, decodeURIComponent(val.join('='))];
      })
    );
  }
};

// Usage:
// cookies.set('theme', 'dark', { maxAge: 86400 * 365, path: '/', sameSite: 'Lax', secure: true });
// cookies.get('theme'); // 'dark'
// cookies.remove('theme', { path: '/' });


/**
 * 2. Cookie Consent Manager
 * 
 * ✅ GDPR/privacy compliance pattern
 */
class CookieConsent {
  constructor() {
    this.CONSENT_KEY = 'cookie_consent';
    this.consent = this.loadConsent();
  }

  loadConsent() {
    const raw = cookies.get(this.CONSENT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setConsent(preferences) {
    // preferences: { necessary: true, analytics: false, marketing: false }
    const consent = {
      ...preferences,
      necessary: true, // Always required
      timestamp: Date.now(),
      version: '1.0'
    };

    cookies.set(this.CONSENT_KEY, JSON.stringify(consent), {
      maxAge: 86400 * 365, // 1 year
      path: '/',
      sameSite: 'Lax',
      secure: true
    });

    this.consent = consent;
    this.applyConsent(consent);
  }

  applyConsent(consent) {
    if (consent.analytics) {
      // Load analytics scripts
    }
    if (consent.marketing) {
      // Load marketing scripts
    }
  }

  hasConsent() {
    return this.consent !== null;
  }

  hasCategory(category) {
    return this.consent?.[category] === true;
  }
}


/**
 * 3. Modern Cookie Store API (Chrome 87+)
 * 
 * ✅ Async, observable, much better than document.cookie
 */
async function modernCookieAPI() {
  if (!('cookieStore' in window)) {
    console.log('Cookie Store API not supported');
    return;
  }

  // Set a cookie (async!)
  await cookieStore.set({
    name: 'preference',
    value: 'dark',
    expires: Date.now() + 86400000,
    sameSite: 'lax'
  });

  // Get a specific cookie
  const cookie = await cookieStore.get('preference');
  console.log(cookie); // { name, value, domain, path, expires, ... }

  // Get all cookies
  const allCookies = await cookieStore.getAll();

  // Delete a cookie
  await cookieStore.delete('preference');

  // Watch for cookie changes (reactive!)
  cookieStore.addEventListener('change', (event) => {
    for (const cookie of event.changed) {
      console.log('Cookie changed:', cookie.name, cookie.value);
    }
    for (const cookie of event.deleted) {
      console.log('Cookie deleted:', cookie.name);
    }
  });
}


/* ============================================
   SERVER SIDE - Express.js
   ============================================ */

/**
 * 4. Secure cookie setup (Express)
 */
function serverCookieExamples(app) {
  // ❌ BAD: Insecure cookie
  app.get('/bad-login', (req, res) => {
    res.cookie('token', 'jwt-token-here');
    // Missing: HttpOnly, Secure, SameSite, Path
    res.send('Logged in (insecurely)');
  });

  // ✅ GOOD: Secure auth cookie
  app.get('/good-login', (req, res) => {
    res.cookie('__Host-token', 'jwt-token-here', {
      httpOnly: true,     // ✅ JavaScript can't read this
      secure: true,       // ✅ HTTPS only
      sameSite: 'strict', // ✅ Not sent cross-site
      path: '/',          // ✅ Required for __Host- prefix
      maxAge: 3600000,    // ✅ 1 hour
      // No domain set    // ✅ Required for __Host- prefix
    });
    res.send('Logged in (securely)');
  });

  // Session cookie with proper config
  app.get('/session', (req, res) => {
    res.cookie('session_id', 'abc123', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    res.send('Session created');
  });

  // ✅ Clear cookie properly
  app.get('/logout', (req, res) => {
    res.clearCookie('__Host-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
    res.send('Logged out');
  });
}


/* ============================================
   REACT / NEXT.JS EXAMPLES
   ============================================ */

/**
 * 5. useCookie Hook (React)
 */
function useCookie(name) {
  const [value, setValue] = React.useState(() => {
    if (typeof document === 'undefined') return null;
    return cookies.get(name);
  });

  const setCookie = React.useCallback((newValue, options = {}) => {
    cookies.set(name, newValue, {
      path: '/',
      sameSite: 'Lax',
      secure: window.location.protocol === 'https:',
      ...options
    });
    setValue(newValue);
  }, [name]);

  const removeCookie = React.useCallback((options = {}) => {
    cookies.remove(name, { path: '/', ...options });
    setValue(null);
  }, [name]);

  return [value, setCookie, removeCookie];
}

// Usage:
// function ThemeToggle() {
//   const [theme, setTheme, removeTheme] = useCookie('theme');
//   return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme}</button>;
// }


/**
 * 6. Next.js Server-Side Cookie Handling
 */

// Next.js Middleware (edge runtime)
/*
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  
  // Read cookie
  const token = request.cookies.get('token')?.value;
  
  // Set cookie
  response.cookies.set('visited', 'true', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 86400
  });
  
  // Delete cookie
  response.cookies.delete('old-cookie');
  
  return response;
}
*/

// Next.js Server Component (App Router)
/*
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  
  // Read cookie (server-side)
  const theme = cookieStore.get('theme')?.value;
  
  return <div data-theme={theme}>Content</div>;
}
*/

// Next.js Server Action
/*
'use server';
import { cookies } from 'next/headers';

export async function setTheme(theme) {
  const cookieStore = await cookies();
  cookieStore.set('theme', theme, {
    httpOnly: false, // Allow client JS to read theme
    secure: true,
    sameSite: 'lax',
    maxAge: 86400 * 365
  });
}
*/


console.log('See README.md for documentation');
