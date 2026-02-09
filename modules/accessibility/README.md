# Accessibility (a11y)

## Overview

Accessibility means making your web application **usable by everyone**, including people with visual, motor, auditory, and cognitive disabilities. It's not optional — it's a legal requirement (ADA, WCAG) and a core engineering skill for senior engineers.

> **"The power of the Web is in its universality."** — Tim Berners-Lee

---

## Why Accessibility Matters (Senior Perspective)

| Reason | Detail |
|--------|--------|
| **Legal** | ADA lawsuits growing 300%+ since 2018. WCAG 2.1 AA is the standard. |
| **Business** | ~15% of world population has a disability. That's 1B+ potential users. |
| **SEO** | Semantic HTML, alt text, headings → better search ranking |
| **Engineering** | Accessible code is better code — semantic, testable, maintainable |
| **Ethics** | It's the right thing to do |

---

## WCAG 2.1 — The Standard (MUST KNOW)

### Four Principles (POUR)

| Principle | Meaning | Examples |
|-----------|---------|---------|
| **Perceivable** | Users can perceive the content | Alt text, captions, color contrast |
| **Operable** | Users can interact | Keyboard nav, focus management, timing |
| **Understandable** | Users can understand | Clear language, predictable UI, error help |
| **Robust** | Works with assistive tech | Semantic HTML, ARIA, valid markup |

### Conformance Levels

| Level | Description | Target |
|:-----:|-------------|--------|
| **A** | Minimum | Basic barriers removed |
| **AA** | Standard | **This is what you target** (legal standard) |
| **AAA** | Enhanced | Best possible, but not always feasible |

---

## The Accessibility Tree

```
DOM Tree                    Accessibility Tree
┌──────────┐               ┌──────────────────┐
│ <div>    │               │ (ignored)        │
│  <nav>   │    ───►       │ navigation       │
│   <a>    │               │  link "Home"     │
│   <a>    │               │  link "About"    │
│  <main>  │               │ main             │
│   <h1>   │               │  heading L1      │
│   <p>    │               │  paragraph       │
│   <img>  │               │  image "alt..."  │
│   <div>  │               │  (ignored)       │
└──────────┘               └──────────────────┘
```

The browser builds an **Accessibility Tree** from the DOM. Screen readers read THIS tree, not the DOM. Semantic HTML automatically creates correct tree nodes. `<div>` and `<span>` are invisible to it.

---

## Module Topics

1. [Keyboard Accessibility](./keyboard-accessibility/) - Tab order, keyboard traps, shortcuts
2. [Screen Reader](./screen-reader/) - ARIA roles, live regions, announcements
3. [Focus Management](./focus-management/) - Focus traps, restoration, visible focus
4. [Color Contrast](./color-contrast/) - WCAG ratios, checking tools, dark mode
5. [Accessibility Tools](./accessibility-tools/) - Axe, Lighthouse, screen readers
6. [Fixing Accessibility](./fixing-accessibility/) - Auditing and remediation

---

## Quick Rules (80/20 for Senior Engineers)

1. **Use semantic HTML** — `<button>`, `<nav>`, `<main>`, `<h1-h6>`, not `<div onClick>`
2. **All images need alt text** — Decorative images: `alt=""`
3. **Everything keyboard accessible** — If you can click it, you can Tab + Enter it
4. **Visible focus indicators** — Never `outline: none` without replacement
5. **Color contrast ≥ 4.5:1** for text (AA), ≥ 3:1 for large text
6. **ARIA is a last resort** — "No ARIA is better than bad ARIA"
7. **Form inputs need labels** — `<label>` or `aria-label`
8. **Dynamic content needs announcements** — `aria-live` regions
9. **Modals need focus traps** — Focus can't escape to background
10. **Test with keyboard only** — Unplug your mouse

---

## Production Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Visible focus indicators on all focusable elements
- [ ] All images have appropriate alt text
- [ ] Color contrast meets WCAG AA (4.5:1 normal, 3:1 large)
- [ ] Form inputs have associated labels
- [ ] Page has proper heading hierarchy (h1 → h2 → h3)
- [ ] Dynamic content uses aria-live regions
- [ ] Modals trap focus correctly
- [ ] Skip navigation link for keyboard users
- [ ] Page works at 200% zoom
- [ ] Error messages are accessible
- [ ] No keyboard traps
- [ ] Runs axe-core with 0 violations
- [ ] Tested with screen reader (VoiceOver/NVDA)
