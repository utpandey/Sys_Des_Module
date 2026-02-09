# Focus Management

## Overview

Focus management is about **controlling where keyboard focus goes** as the UI changes. Modals, route changes, dynamic content, and form submissions all need focus management to be usable by keyboard and screen reader users.

---

## Key Concepts

### Focus Trap
Keep focus INSIDE a component (modal, dialog). User can't Tab out to the page behind.

### Focus Restoration
When a modal/popup closes, return focus to the element that opened it.

### Focus Redirect
After a route change or form submission, move focus to the new content or confirmation.

---

## When to Manage Focus

| Scenario | Focus Action |
|----------|-------------|
| Modal opens | Trap focus inside modal, focus first focusable element |
| Modal closes | Return focus to trigger element |
| Route change (SPA) | Focus main content or h1 |
| Form submitted | Focus success/error message |
| Toast appears | Use aria-live (don't move focus) |
| Accordion opens | Keep focus on trigger (don't move) |
| Item deleted from list | Focus next item or previous |

---

## ✅ DO's

1. **Trap focus in modals/dialogs** — Tab should cycle within
2. **Restore focus on close** — back to the trigger element
3. **Focus new content on route change** — SPA navigation
4. **Use `tabindex="-1"` for programmatic focus** — non-interactive containers
5. **Focus error summary** on form validation failure
6. **Make focus visible** — never hide focus outlines

## ❌ DON'Ts

1. **Don't move focus unexpectedly** — confusing for screen reader users
2. **Don't trap focus accidentally** — user must be able to escape
3. **Don't forget to restore focus** — lost focus = lost user
4. **Don't use `autofocus` carelessly** — can confuse screen readers
5. **Don't focus non-interactive elements without reason**

---

## Native `<dialog>` (Modern Best Practice)

The `<dialog>` element provides:
- ✅ Focus trap automatically
- ✅ Escape to close
- ✅ Focus restoration on close
- ✅ `inert` on background content
- ✅ Backdrop click handling

**Use `<dialog>` over custom modals whenever possible.**

---

## Common Mistakes (Interview)

| Mistake | Impact | Fix |
|---------|--------|-----|
| No focus trap in modal | User tabs to hidden content | Implement focus trap |
| Focus not restored on close | User lost after modal | Save trigger ref, restore on close |
| SPA route change — no focus management | Screen reader doesn't know page changed | Focus main heading on route change |
| autofocus on form field in modal | Screen reader misses modal title | Focus the modal heading or first content |
