# Accessibility Tools

## Overview

Tools for **testing, auditing, and automating** accessibility. A senior engineer should know how to use these in development, CI/CD, and production monitoring.

---

## Tool Categories

### 1. Automated Testing (Catches ~30-40% of issues)
| Tool | Type | Use |
|------|------|-----|
| **axe-core** | Library | Programmatic audit in tests |
| **axe DevTools** | Extension | Manual page audit |
| **Lighthouse** | DevTools/CI | Scoring & audit |
| **eslint-plugin-jsx-a11y** | ESLint | Catches issues at code time |
| **Pa11y** | CLI/CI | Automated testing |

### 2. Manual Testing (Catches the other 60-70%)
| Tool | Type | Use |
|------|------|-----|
| **VoiceOver** | macOS built-in | Screen reader testing |
| **NVDA** | Windows (free) | Screen reader testing |
| **Keyboard only** | Your keyboard | Tab/Enter/Escape testing |
| **Chrome DevTools** | Built-in | Accessibility tree, contrast |
| **Accessibility Inspector** | macOS built-in | macOS a11y tree |

### 3. Design-Time
| Tool | Type | Use |
|------|------|-----|
| **Stark** | Figma plugin | Contrast, color blindness sim |
| **A11y Annotation Kit** | Figma | Document a11y requirements |
| **Color Review** | Web | Contrast checking |

---

## axe-core (The Gold Standard)

axe-core is the engine behind most accessibility tools. It's used by:
- axe DevTools extension
- Lighthouse accessibility audits
- Playwright/Cypress a11y tests
- Storybook a11y addon

---

## Chrome DevTools Built-in Features

1. **Accessibility Tree**: Elements panel → Accessibility tab
2. **Contrast Checker**: Click color swatch → shows ratio
3. **Emulate vision deficiencies**: Rendering tab → Emulate
4. **CSS Overview**: Shows low-contrast text
5. **Lighthouse**: Audits tab → Accessibility
6. **Tab order visualization**: Elements panel → Accessibility

---

## ✅ Testing Strategy

```
Code Time (Developer)
├── eslint-plugin-jsx-a11y    → Catch issues as you type
├── TypeScript                → Enforce required props (alt, htmlFor)
└── Storybook a11y addon      → Visual check per component

Test Time (CI/CD)
├── vitest + axe-core          → Unit/integration a11y tests
├── Playwright + axe-core      → E2E a11y audit
├── Lighthouse CI              → Score tracking
└── Pa11y                      → Automated scans

Review Time (Manual)
├── Keyboard testing           → Tab through everything
├── Screen reader              → VoiceOver/NVDA walkthrough
├── Zoom to 200%               → Content still usable?
└── Color blindness sim        → Information preserved?
```

---

## Quick Setup Commands

```bash
# ESLint plugin
npm install eslint-plugin-jsx-a11y --save-dev

# axe-core for testing
npm install @axe-core/react axe-core --save-dev

# Playwright accessibility
npm install @axe-core/playwright --save-dev

# Storybook addon
npm install @storybook/addon-a11y --save-dev

# Pa11y CLI
npm install pa11y --save-dev
```
