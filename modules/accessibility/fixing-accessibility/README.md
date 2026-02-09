# How to Fix Accessibility

## Overview

Fixing accessibility is a **systematic process**: audit, prioritize, fix, verify. This guide covers common issues and their exact fixes — your go-to remediation reference.

---

## Audit Workflow

```
1. AUTOMATED SCAN → axe-core, Lighthouse (catches 30-40%)
       ↓
2. KEYBOARD TEST → Tab through entire app
       ↓
3. SCREEN READER TEST → VoiceOver/NVDA walkthrough
       ↓
4. VISUAL CHECK → Zoom 200%, color contrast, reflow
       ↓
5. PRIORITIZE → Critical (legal risk) → High → Medium → Low
       ↓
6. FIX → Semantic HTML first, ARIA second
       ↓
7. VERIFY → Re-test with same tools + manual check
```

---

## Top 10 Most Common Issues & Fixes

### 1. Missing Alternative Text
```html
<!-- ❌ Bad -->
<img src="hero.jpg">
<img src="icon.svg" alt="icon">

<!-- ✅ Fix -->
<img src="hero.jpg" alt="Team collaborating in modern office space">
<img src="icon.svg" alt="" role="presentation"> <!-- decorative -->
```

### 2. Missing Form Labels
```html
<!-- ❌ Bad -->
<input type="email" placeholder="Email">

<!-- ✅ Fix: Explicit label -->
<label for="email">Email</label>
<input type="email" id="email">

<!-- ✅ Fix: aria-label (when visual label not desired) -->
<input type="search" aria-label="Search products">
```

### 3. Insufficient Color Contrast
```css
/* ❌ Bad: 2.85:1 */
.text { color: #999999; }

/* ✅ Fix: 7:1 */
.text { color: #595959; }
```

### 4. Missing Document Language
```html
<!-- ❌ Bad -->
<html>

<!-- ✅ Fix -->
<html lang="en">
```

### 5. Empty Links / Buttons
```html
<!-- ❌ Bad -->
<a href="/settings"><i class="icon-gear"></i></a>

<!-- ✅ Fix -->
<a href="/settings" aria-label="Settings">
  <i class="icon-gear" aria-hidden="true"></i>
</a>
```

### 6. Missing Heading Structure
```html
<!-- ❌ Bad: Skipped levels -->
<h1>Title</h1>
<h4>Subtitle</h4>  <!-- Jumped from h1 to h4! -->

<!-- ✅ Fix: Sequential order -->
<h1>Title</h1>
<h2>Subtitle</h2>
```

### 7. No Focus Indicator
```css
/* ❌ Bad: Removed all focus */
*:focus { outline: none; }

/* ✅ Fix: Custom focus-visible */
*:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}
```

### 8. Div Used as Button
```html
<!-- ❌ Bad -->
<div onclick="submit()">Submit</div>

<!-- ✅ Fix -->
<button onclick="submit()">Submit</button>
```

### 9. No Skip Navigation
```html
<!-- ✅ Add as first element in body -->
<a href="#main-content" class="skip-link">Skip to main content</a>
<!-- ... header/nav ... -->
<main id="main-content">
```

### 10. Dynamic Content Not Announced
```html
<!-- ❌ Bad: Screen reader doesn't know about update -->
<div id="status">3 items in cart</div>

<!-- ✅ Fix: Live region -->
<div id="status" aria-live="polite" aria-atomic="true">3 items in cart</div>
```

---

## Priority Matrix

| Priority | Issue | Risk |
|:--------:|-------|------|
| 🔴 **Critical** | No keyboard access, missing alt text, no labels | Legal, blocked users |
| 🟠 **High** | Poor contrast, missing headings, no skip nav | Degraded experience |
| 🟡 **Medium** | Missing ARIA states, poor focus management | Confusing experience |
| 🟢 **Low** | Missing landmarks, heading order, ARIA best practices | Sub-optimal |

---

## ✅ Quick Wins (Fix in < 1 Hour)

1. Add `lang="en"` to `<html>`
2. Add alt text to all images
3. Add labels to all form inputs
4. Replace `<div onClick>` with `<button>`
5. Add `:focus-visible` styles
6. Add `aria-live` to dynamic content areas
7. Add skip navigation link
8. Fix heading hierarchy

---

## Next.js Specific Fixes

```jsx
// ✅ next/image enforces alt text (compile error if missing)
<Image src="/photo.jpg" alt="Description" width={800} height={600} />

// ✅ next/link preserves native anchor behavior
<Link href="/about">About</Link>

// ✅ Metadata for page title (screen readers announce)
export const metadata = { title: 'About | MyApp' };

// ✅ App Router includes route announcer automatically

// ✅ Use <html lang> in root layout
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
```
