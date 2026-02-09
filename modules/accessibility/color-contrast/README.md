# Color Contrast

## Overview

Color contrast is the difference in luminance between foreground (text) and background colors. **Insufficient contrast makes content unreadable** for users with low vision, color blindness, or anyone using a screen in bright sunlight.

---

## WCAG Contrast Requirements

| Level | Normal Text (< 18px) | Large Text (≥ 18px bold / ≥ 24px) | UI Components |
|:-----:|:-------------------:|:---------------------------------:|:-------------:|
| **AA** | **4.5:1** | **3:1** | **3:1** |
| **AAA** | 7:1 | 4.5:1 | N/A |

> **Target: AA (4.5:1)** — This is the legal standard.

### What Counts as "Large Text"?
- **24px** regular weight, OR
- **18.66px (≈19px)** bold weight

---

## Color Blindness Types

| Type | Prevalence | Affected Colors |
|------|:----------:|----------------|
| Deuteranopia (green-blind) | ~5% male | Red/Green confusion |
| Protanopia (red-blind) | ~1% male | Red/Green confusion |
| Tritanopia (blue-blind) | ~0.01% | Blue/Yellow confusion |
| Achromatopsia (total) | ~0.003% | All colors |

---

## ✅ DO's

1. **Check contrast ratios** for ALL text-background combinations
2. **Don't use color alone** to convey information (add icons, text, patterns)
3. **Test with color blindness simulators**
4. **Ensure focus indicators** have sufficient contrast (3:1)
5. **Check dark mode separately** — contrast can be worse
6. **Use tools**: WebAIM Contrast Checker, axe DevTools
7. **Design with contrast in mind** from the start

## ❌ DON'Ts

1. **Don't use light gray text on white** (common design "sin")
2. **Don't use red/green as only differentiator** (color blindness)
3. **Don't reduce contrast for "aesthetic"** — it's inaccessible
4. **Don't forget disabled states** — still need some contrast
5. **Don't skip checking over images/gradients** — text on backgrounds

---

## Common Failures (Interview)

| Issue | Example | Fix |
|-------|---------|-----|
| Light gray on white | `#999 on #fff` (2.85:1 ❌) | Use `#595959` (7:1 ✅) |
| Placeholder text too light | `#ccc on #fff` (1.6:1 ❌) | Use `#767676` (4.5:1 ✅) |
| Red text on dark bg | `#ff0000 on #333` (3.5:1 ❌) | Use `#ff6666` (4.9:1 ✅) |
| Link color = body text | Can't distinguish links | Underline + different color |
| Error shown only in red | Color blind can't see | Add ⚠️ icon + text |
| Text over image | Varies per image | Semi-transparent overlay |

---

## Tools for Checking Contrast

| Tool | Type | Use |
|------|------|-----|
| **WebAIM Contrast Checker** | Web | Quick check of two colors |
| **axe DevTools** | Extension | Full page automated scan |
| **Lighthouse** | DevTools | Catches contrast issues |
| **Stark** | Figma/Sketch | Design-time checking |
| **Chrome DevTools** | Built-in | Hover shows contrast ratio |
| **Sim Daltonism** | macOS app | Color blindness simulation |

### Chrome DevTools Quick Check:
1. Inspect element → Styles → Click color swatch
2. Shows contrast ratio with ✅ or ❌
3. Suggests accessible alternatives
