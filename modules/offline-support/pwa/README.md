# Progressive Web Applications (PWAs)

## Overview

A PWA is a web app that uses modern APIs to deliver an **app-like experience**: installable, offline-capable, push notifications, background sync. It bridges the gap between web and native apps without requiring app stores.

---

## PWA Requirements

| Requirement | How | Why |
|-------------|-----|-----|
| **HTTPS** | SSL certificate | Security, required for SW |
| **Service Worker** | `sw.js` with fetch handler | Offline, caching, push |
| **Web App Manifest** | `manifest.json` | Install metadata |
| **Responsive** | Viewport meta + CSS | Mobile-first |
| **Offline page** | SW serves fallback | Graceful degradation |

### Lighthouse PWA Checklist:
- ✅ Registers a Service Worker that controls page and start_url
- ✅ Responds with 200 when offline
- ✅ Has a `<meta name="viewport">` tag
- ✅ Contains manifest with `name`, `icons`, `start_url`, `display`
- ✅ Redirects HTTP to HTTPS
- ✅ Configured for a custom splash screen
- ✅ Sets an address bar theme color

---

## Web App Manifest (manifest.json)

```json
{
  "name": "My Progressive Web App",
  "short_name": "MyPWA",
  "description": "A production-ready PWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    { "src": "/icons/icon-72.png",  "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96.png",  "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    { "src": "/screenshots/desktop.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" },
    { "src": "/screenshots/mobile.png",  "sizes": "750x1334", "type": "image/png", "form_factor": "narrow" }
  ],
  "shortcuts": [
    { "name": "New Post",  "url": "/new",      "icons": [{ "src": "/icons/new.png", "sizes": "96x96" }] },
    { "name": "Dashboard", "url": "/dashboard", "icons": [{ "src": "/icons/dash.png", "sizes": "96x96" }] }
  ]
}
```

### Display Modes:
| Mode | Behavior |
|------|----------|
| `fullscreen` | No browser UI, no status bar |
| `standalone` | Looks like native app, has status bar |
| `minimal-ui` | Minimal browser controls |
| `browser` | Normal browser tab (default) |

---

## Installation Flow

```
User visits site → Browser detects manifest + SW
    ↓
beforeinstallprompt event fires
    ↓
You save the event (don't show browser prompt yet)
    ↓
User clicks YOUR "Install" button
    ↓
You call event.prompt()
    ↓
User accepts → appinstalled event fires
    ↓
App appears on home screen / dock
```

---

## ✅ DO's

1. **Defer the install prompt** — show YOUR install button at the right moment
2. **Provide a compelling install experience** — explain benefits
3. **Include maskable icons** — adaptive icons for Android
4. **Set theme_color** — matches your brand in task switcher/address bar
5. **Add screenshots** — shown in install dialog on mobile
6. **Add shortcuts** — quick actions from long-press/right-click
7. **Handle display mode** — detect standalone mode for different UX

## ❌ DON'Ts

1. **Don't force install prompts** on first visit — annoying
2. **Don't forget iOS specifics** — Apple uses different meta tags
3. **Don't skip the offline page** — required for installability
4. **Don't use only one icon size** — different devices need different sizes
5. **Don't assume installed users** always have network

---

## iOS Specifics (Important!)

iOS doesn't fully support Web App Manifest. You need additional meta tags:

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="MyPWA">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="apple-touch-startup-image" href="/splash/splash.png">
```

### iOS PWA Limitations:
- No push notifications (added in iOS 16.4+ partially)
- No background sync
- SW storage can be evicted after ~7 days of inactivity
- No install prompt — users must use "Add to Home Screen" manually
- No badging API

---

## Common Interview Questions

**Q: What makes a web app a PWA?**
A: Three core requirements: 1) Served over HTTPS, 2) Has a Service Worker with a fetch handler, 3) Has a Web App Manifest with proper metadata. Additionally, it should work offline and be responsive.

**Q: PWA vs Native App — when to use which?**
A: PWA when: broad reach, no app store needed, content-heavy, tight budgets. Native when: need hardware access (Bluetooth, NFC, advanced camera), need background processing, need App Store presence, gaming/AR.

**Q: How does PWA installation work?**
A: Browser fires `beforeinstallprompt` when criteria are met. You intercept it, save the event, and show your own install UI at the right time. When user clicks your button, call `event.prompt()`. After install, `appinstalled` event fires.
