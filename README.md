# Frontend System Design — Senior Engineer Interview Prep

A comprehensive, hands-on learning project for mastering **Frontend System Design** concepts through practical implementation. Every module covers real-world patterns with Vanilla JS, React/Next.js examples, production best practices, and senior-level interview Q&A.

> **Goal:** One repo to rule them all — your personal tutor, checklist, and interview reference. No need to revisit course materials.

---

## 📦 Project Structure

```
sysdes/
├── modules/
│   ├── communication/        # Client-server communication patterns
│   ├── security/             # Frontend security patterns & defenses
│   ├── testing/              # Testing strategies & frameworks
│   ├── performance/          # Performance monitoring & optimization
│   ├── database-caching/     # Client-side storage & caching
│   ├── logging-monitoring/   # Telemetry, alerting, debugging
│   ├── accessibility/        # WCAG, ARIA, keyboard, screen readers
│   ├── offline-support/      # Service Workers & PWAs
│   └── networking/           # (Placeholder — covered in course)
├── shared/
│   ├── server/               # Shared server utilities
│   └── client/               # Shared client utilities
└── README.md                 # ← You are here
```

---

## 🗂️ Modules Overview

### 1. 📡 [Communication](./modules/communication/)
Client-server communication patterns with full server + client implementations.

| Topic | Server | Vanilla JS | React |
|-------|:------:|:----------:|:-----:|
| Short Polling | ✅ | ✅ | ✅ |
| Long Polling | ✅ | ✅ | ✅ |
| WebSockets | ✅ | ✅ | ✅ |
| Server-Sent Events (SSE) | ✅ | ✅ | ✅ |
| WebHooks | ✅ | ✅ | ✅ |

---

### 2. 🔒 [Security](./modules/security/)
Frontend security patterns with vulnerable ❌ vs secure ✅ examples.

| Topic | Description |
|-------|-------------|
| XSS (Cross-Site Scripting) | DOM/Reflected/Stored XSS, sanitization, CSP |
| iFrame Protection | X-Frame-Options, CSP frame-ancestors, sandbox |
| Security Headers | CSP, HSTS, X-Content-Type-Options, Referrer-Policy |
| CORS | Preflight, whitelisted origins, credentials |
| CSRF | Token-based, SameSite cookies, HMAC signatures |
| + Input Validation, SRI, HTTPS, Feature Policy, SSRF, SSJI, Dependency Security |

---

### 3. 🧪 [Testing](./modules/testing/)
Testing strategies, frameworks, and patterns for production apps.

| Topic | Description |
|-------|-------------|
| Unit & Integration Testing | Vitest, React Testing Library, mocking |
| E2E & Automation Testing | Playwright, page objects, CI setup |
| A/B Testing | Feature flags, experiment design, statistical significance |
| Performance Testing | Lighthouse CI, Core Web Vitals, budgets |
| TDD | Red-Green-Refactor cycle |
| Security Testing | OWASP, automated scanning, penetration testing |

---

### 4. ⚡ [Performance](./modules/performance/)
Performance monitoring, tools, and optimization techniques.

| Topic | Description |
|-------|-------------|
| Performance Monitoring | Core Web Vitals (LCP, FID, CLS, INP, TTFB) |
| Performance Tools | Lighthouse, DevTools, WebPageTest |
| Network Optimization | Critical Rendering Path, Resource Hinting, HTTP Caching, Service Worker Caching, Compression, HTTP/2+3 |
| Rendering Patterns | SSR, SSG, ISR, CSR, Streaming SSR |
| Build Optimization | Tree shaking, code splitting, bundle analysis |

---

### 5. 💾 [Database & Caching](./modules/database-caching/)
Client-side storage, caching strategies, and state management.

| Topic | Description |
|-------|-------------|
| Local Storage | Persistent key-value, TTL wrapper, 5MB limit |
| Session Storage | Tab-scoped, form drafts, wizard state |
| Cookie Storage | HttpOnly, Secure, SameSite, auth tokens |
| IndexedDB | Structured data, offline storage, async API |
| Normalization | Flat state shape, entity relationships |
| HTTP Caching | Cache-Control, ETag, stale-while-revalidate |
| Service Worker Caching | Cache First, Network First, SWR strategies |
| API Caching | SWR, React Query, request deduplication |
| State Management | Context API, Zustand, Redux Toolkit |

---

### 6. 📊 [Logging & Monitoring](./modules/logging-monitoring/)
Production observability — errors, performance, and debugging.

| Topic | Description |
|-------|-------------|
| Telemetry | Error tracking, CWV performance, event tracking, sampling |
| Alerting | Threshold rules, cooldowns, webhook/beacon channels |
| Fixing / Debugging | Structured logging, source maps, breadcrumbs, error context |

---

### 7. ♿ [Accessibility](./modules/accessibility/)
WCAG 2.1 compliance, ARIA, keyboard navigation, and screen reader support.

| Topic | Vanilla JS | React/Next.js |
|-------|:----------:|:-------------:|
| Keyboard Accessibility | ✅ interactive HTML | ✅ hooks + components |
| Screen Reader (ARIA) | ✅ interactive HTML | ✅ hooks + components |
| Focus Management | ✅ interactive HTML | ✅ hooks + components |
| Color Contrast | ✅ JS utilities | ✅ hooks + components |
| Accessibility Tools | ✅ audit scripts | ✅ axe + Playwright |
| Fixing Accessibility | ✅ before/after | ✅ components |

---

### 8. 📴 [Offline Support](./modules/offline-support/)
Service Workers, PWAs, caching strategies, and offline-first architecture.

| Topic | Vanilla JS | React/Next.js |
|-------|:----------:|:-------------:|
| Service Workers | ✅ Full SW + registration | ✅ hooks (useServiceWorker, useOnlineStatus, useOfflineQueue) |
| PWAs | ✅ interactive HTML | ✅ hooks (usePWAInstall, useDisplayMode, usePushNotifications) |

---

## 📝 Interview Guides

Every module includes a dedicated `INTERVIEW_GUIDE.md` with:
- ✅ Quick-fire Q&A (senior level)
- ✅ Scenario-based questions ("Design an offline-first app...")
- ✅ Common mistakes and how to fix them
- ✅ System design trade-off discussions

| Module | Interview Guide |
|--------|:---------------:|
| Testing | [INTERVIEW_GUIDE.md](./modules/testing/INTERVIEW_GUIDE.md) |
| Performance | [INTERVIEW_GUIDE.md](./modules/performance/INTERVIEW_GUIDE.md) |
| Database & Caching | [INTERVIEW_GUIDE.md](./modules/database-caching/INTERVIEW_GUIDE.md) |
| Logging & Monitoring | [INTERVIEW_GUIDE.md](./modules/logging-monitoring/INTERVIEW_GUIDE.md) |
| Accessibility | [INTERVIEW_GUIDE.md](./modules/accessibility/INTERVIEW_GUIDE.md) |
| Offline Support | [INTERVIEW_GUIDE.md](./modules/offline-support/INTERVIEW_GUIDE.md) |

---

## 🚀 Getting Started

```bash
# Clone and navigate
cd sysdes/

# Pick any module/topic and follow its README
cd modules/communication/websockets/
cat README.md

# For runnable servers (Communication module)
cd server && npm install && npm start

# For React clients
cd client-react && npm install && npm start

# Vanilla JS examples — open .html files directly in browser
open modules/accessibility/keyboard-accessibility/vanilla-examples.html
```

---

## 🎯 How to Use This Repo

### As a Learning Tool
Navigate to any module → read the README → explore examples → modify and experiment.

### As an Interview Prep Checklist
1. Open the module's `INTERVIEW_GUIDE.md`
2. Try answering each question before reading the answer
3. Review the code examples for practical implementation details
4. Focus on trade-offs and "when to use what"

### As a Quick Reference
Each topic README includes:
- ✅ DO's and ❌ DON'Ts
- Common mistakes tables
- Production checklists
- Code examples (both Vanilla JS and React/Next.js)

---

## 📐 Approach & Philosophy

| Principle | How |
|-----------|-----|
| **Practical** | Every concept has runnable code — not just theory |
| **Senior-level** | Covers production concerns, trade-offs, and edge cases |
| **Both perspectives** | Vanilla JS for fundamentals + React/Next.js for real-world |
| **Interview-ready** | Every module has an interview guide with scenario questions |
| **Self-contained** | No external courses needed — this repo IS the reference |

---

## 📈 Progress

| Module | Status | Topics |
|--------|:------:|:------:|
| Communication | ✅ Complete | 5 |
| Security | ✅ Complete | 12+ |
| Testing | ✅ Complete | 6 |
| Performance | ✅ Complete | 5 |
| Database & Caching | ✅ Complete | 9 |
| Logging & Monitoring | ✅ Complete | 3 |
| Accessibility | ✅ Complete | 6 |
| Offline Support | ✅ Complete | 2 |
| Networking | ⏭️ Skipped | — |
