# Screen Reader

## Overview

Screen readers convert on-screen content to speech or braille. They navigate via the **Accessibility Tree**, not the DOM. Your job: ensure the accessibility tree accurately represents your UI using semantic HTML and ARIA.

---

## Popular Screen Readers

| Screen Reader | OS | Browser | Cost |
|---------------|:--:|---------|:----:|
| **VoiceOver** | macOS/iOS | Safari | Free |
| **NVDA** | Windows | Firefox/Chrome | Free |
| **JAWS** | Windows | Chrome/IE | $$$ |
| **TalkBack** | Android | Chrome | Free |

### Quick Test: macOS VoiceOver
1. `Cmd + F5` → Enable VoiceOver
2. `Ctrl + Option + Right Arrow` → Navigate forward
3. `Ctrl + Option + Space` → Activate element
4. Navigate your app. Can you understand what's on screen?

---

## ARIA (Accessible Rich Internet Applications)

### The First Rule of ARIA:
> **"No ARIA is better than bad ARIA."**
> Use semantic HTML first. Only add ARIA when HTML can't express your intent.

### ARIA Categories

| Category | Purpose | Examples |
|----------|---------|---------|
| **Roles** | What the element IS | `role="button"`, `role="dialog"`, `role="alert"` |
| **Properties** | Characteristics | `aria-label`, `aria-required`, `aria-haspopup` |
| **States** | Current condition | `aria-expanded`, `aria-selected`, `aria-disabled` |

### Most Important ARIA Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-label` | Label when no visible text | `<button aria-label="Close">✕</button>` |
| `aria-labelledby` | Point to visible label element | `aria-labelledby="heading-id"` |
| `aria-describedby` | Additional description | `aria-describedby="help-text-id"` |
| `aria-expanded` | Collapsible state | `aria-expanded="true/false"` |
| `aria-hidden` | Hide from screen reader | `aria-hidden="true"` (decorative) |
| `aria-live` | Announce dynamic content | `aria-live="polite/assertive"` |
| `aria-current` | Current item in a set | `aria-current="page"` (nav) |
| `aria-invalid` | Form validation state | `aria-invalid="true"` |
| `aria-busy` | Loading state | `aria-busy="true"` |

---

## Live Regions (Dynamic Content)

When content updates dynamically, screen readers need to know about it.

| Value | Behavior | Use Case |
|-------|----------|----------|
| `aria-live="polite"` | Announce when user is idle | Toast messages, search results count |
| `aria-live="assertive"` | Interrupt and announce immediately | Error messages, alerts |
| `role="alert"` | Shorthand for `aria-live="assertive"` | Form errors, critical warnings |
| `role="status"` | Shorthand for `aria-live="polite"` | Loading states, success messages |
| `role="log"` | For sequential information | Chat messages |

---

## ✅ DO's

1. **Use semantic HTML first** — `<button>`, `<nav>`, `<main>`, `<h1-h6>`
2. **All images need alt text** — Decorative: `alt=""`, Informative: describe content
3. **Label all form inputs** — `<label>` or `aria-label`
4. **Use aria-live for dynamic content** — polite for non-urgent, assertive for urgent
5. **Use aria-expanded on toggleable elements** — accordions, dropdowns, menus
6. **Hide decorative elements** — `aria-hidden="true"` on icons next to text
7. **Use landmark roles** — `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`

## ❌ DON'Ts

1. **Don't use `role="button"` when `<button>` works** — unnecessary complexity
2. **Don't override native semantics** — `<h2 role="button">` is confusing
3. **Don't use `aria-label` on non-interactive elements** — not supported
4. **Don't hide content from screen readers unintentionally** — `display:none` hides from all
5. **Don't use `aria-hidden="true"` on focusable elements** — creates ghost focus
6. **Don't duplicate information** — `<button aria-label="Submit"><span>Submit</span></button>` says "Submit" twice

---

## alt Text Best Practices

| Image Type | alt Value | Example |
|-----------|-----------|---------|
| Informative | Describe the content | `alt="Chart showing 40% growth in Q4"` |
| Decorative | Empty string | `alt=""` |
| Functional (in button/link) | Describe the action | `alt="Search"`, `alt="Close dialog"` |
| Complex (charts/diagrams) | Brief summary + `aria-describedby` | `alt="Sales chart" aria-describedby="chart-desc"` |
| Text in image | Reproduce the text | `alt="Sale: 50% off all items"` |
