# Fixing (Debugging Production Issues)

## Overview

Fixing is the **last mile** of monitoring — going from "something is broken" to "here's exactly what happened and how to fix it." This requires source maps, error context, session replay, and systematic debugging.

---

## Debugging Workflow

```
1. DETECT → Alert fires or user reports issue
       ↓
2. TRIAGE → Severity? How many users? Since when?
       ↓
3. REPRODUCE → Source maps, breadcrumbs, session replay
       ↓
4. ROOT CAUSE → Stack trace, network logs, state at time of error
       ↓
5. FIX → Code change, deploy, verify fix
       ↓
6. POST-MORTEM → What happened, how to prevent, update monitoring
```

---

## Source Maps

### What Are They?
Source maps map minified/bundled code back to original source. Essential for debugging production errors.

### Setup:
```
app.min.js              →  Original source
//# sourceMappingURL=app.min.js.map
```

### ✅ DO's
1. **Generate source maps in CI/CD** (not in prod build output)
2. **Upload to error tracking service** (Sentry, Bugsnag)
3. **Keep source maps private** (don't serve publicly)
4. **Version source maps** with release/commit hash
5. **Delete old source maps** after retention period

### ❌ DON'Ts
1. **Don't ship source maps to production** — exposes your code
2. **Don't forget to upload** — minified stack traces are useless
3. **Don't lose source maps** — archive them with each release

---

## Key Debugging Tools

| Tool | Purpose |
|------|---------|
| **Source Maps** | Map minified code → original |
| **Breadcrumbs** | Trail of events before error |
| **Session Replay** | Video-like replay of user session |
| **Network Logs** | API calls, timing, payloads |
| **Console Logs** | Structured logging output |
| **User Context** | Who, where, device, browser |
| **Release Tracking** | Which deploy introduced the bug |

---

## ✅ DO's

1. **Always upload source maps** for every release
2. **Tag errors with release version** (correlate with deploys)
3. **Include breadcrumbs** (what happened before the error)
4. **Log structured data** (JSON, not strings)
5. **Track error resolution** (mark as resolved, detect regression)
6. **Do post-mortems** for critical incidents

## ❌ DON'Ts

1. **Don't ignore errors** because they're "rare"
2. **Don't debug production from memory** — use tools
3. **Don't log PII** (personal data in error reports)
4. **Don't rely on `console.log`** in production
5. **Don't skip post-mortems** — same bug will return

---

## Common Interview Questions

**Q: How do you debug an error that only happens in production?**
A: 1) Check error tracking (Sentry) for stack trace with source maps, 2) Look at breadcrumbs — what the user did before the error, 3) Check network logs — was an API call failing?, 4) Session replay if available, 5) Check if it correlates with a deploy, 6) Check browser/device — maybe it's browser-specific.

**Q: How do you handle source maps securely?**
A: Generate source maps in CI, upload to Sentry/Bugsnag (private), do NOT serve them publicly (exposes code). Use hidden source maps (`devtool: 'hidden-source-map'` in webpack) which generate maps but don't reference them in the bundle.
