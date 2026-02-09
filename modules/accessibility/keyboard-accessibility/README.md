# Keyboard Accessibility

## Overview

**Every interactive element must be usable with keyboard alone.** Many users rely on keyboard-only navigation — people with motor disabilities, power users, screen reader users, and anyone with a broken mouse.

---

## Essential Keyboard Interactions

| Key | Expected Behavior |
|-----|------------------|
| `Tab` | Move to next focusable element |
| `Shift+Tab` | Move to previous focusable element |
| `Enter` | Activate links, buttons, submit forms |
| `Space` | Activate buttons, toggle checkboxes |
| `Arrow keys` | Navigate within components (tabs, menus, radio groups) |
| `Escape` | Close modals, menus, popups |
| `Home/End` | Jump to first/last item in a list |

---

## Natively Focusable Elements (FREE keyboard support)

These elements are keyboard accessible **by default** — no extra work needed:
- `<a href="...">` — Enter to activate
- `<button>` — Enter/Space to activate
- `<input>`, `<textarea>`, `<select>` — Tab to focus
- `<details>/<summary>` — Enter/Space to toggle

### Not Focusable by Default:
- `<div>`, `<span>`, `<p>`, `<li>` — need `tabindex` + keyboard handlers

---

## ✅ DO's

1. **Use semantic elements** — `<button>` not `<div onClick>`
2. **Maintain logical tab order** — follows visual order (don't use `tabindex > 0`)
3. **Add `tabindex="0"`** to custom interactive elements
4. **Handle both Enter AND Space** on custom buttons
5. **Provide skip navigation link** for bypassing repeated content
6. **Use roving tabindex** for composite widgets (tabs, toolbars)
7. **Test with keyboard only** — unplug your mouse regularly

## ❌ DON'Ts

1. **Never use `<div onClick>` without keyboard support**
2. **Never use `tabindex > 0`** — breaks natural tab order
3. **Never remove focus outlines** without a visible replacement
4. **Don't create keyboard traps** (user can't Tab out)
5. **Don't rely on hover** for important content/actions
6. **Don't use `accessKey`** — conflicts with screen reader shortcuts

---

## Common Mistakes (Interview)

| Mistake | Impact | Fix |
|---------|--------|-----|
| `<div onClick>` with no keyboard handler | Keyboard users can't interact | Use `<button>` or add `tabindex`, `role`, `onKeyDown` |
| `outline: none` globally | No visible focus indicator | Custom focus styles with `:focus-visible` |
| `tabindex="5"` | Messes up tab order for everyone | Only use `0` or `-1` |
| Mouse-only drag & drop | Keyboard users excluded | Add keyboard alternatives |
| Dropdown opens on hover only | Keyboard/mobile can't open it | Open on focus/click too |
