# Accessibility - Senior Interview Guide

## Quick-Fire Questions & Answers

---

### Fundamentals

**Q: What is WCAG and what level should you target?**
A: WCAG (Web Content Accessibility Guidelines) is the W3C standard for web accessibility. Target **WCAG 2.1 Level AA** — it's the legal standard (ADA compliance). It follows four principles: **POUR** — Perceivable, Operable, Understandable, Robust.

**Q: What is the Accessibility Tree?**
A: The browser creates an Accessibility Tree from the DOM. Screen readers read THIS tree, not the DOM. Semantic HTML elements (`<button>`, `<nav>`, `<h1>`) automatically create correct nodes. `<div>` and `<span>` are invisible to it unless you add ARIA roles.

**Q: What's the first rule of ARIA?**
A: "**No ARIA is better than bad ARIA.**" Always use semantic HTML first (`<button>` over `<div role="button">`). ARIA only adds metadata to the accessibility tree — it doesn't add behavior (keyboard events, focus management).

**Q: What percentage of a11y issues can automated tools catch?**
A: About **30-40%**. Automated tools (axe, Lighthouse) catch things like missing alt text, contrast issues, missing labels. But they can't catch: poor alt text quality, logical keyboard flow, screen reader understandability, focus management issues. **Manual testing is essential.**

---

### Keyboard Accessibility

**Q: What's wrong with `<div onClick>` and how do you fix it?**
A: The `<div>` is not keyboard focusable, has no implicit role, and doesn't handle Enter/Space. Fix: **Use `<button>`**. If you must use div: add `role="button"`, `tabindex="0"`, `onKeyDown` for Enter/Space. But seriously, just use `<button>`.

**Q: What values should tabindex have?**
A:
- `tabindex="0"`: Element is in natural tab order (use for custom interactive elements)
- `tabindex="-1"`: Focusable programmatically but NOT in tab order (for containers, modals)
- `tabindex="1+"`: **NEVER USE.** Overrides natural order and creates confusion.

**Q: What is roving tabindex?**
A: A pattern for composite widgets (tabs, menus, toolbars) where only the active item has `tabindex="0"` and all others have `tabindex="-1"`. Arrow keys move the `tabindex="0"` between items. Tab moves focus OUT of the widget to the next component.

**Q: What is a skip navigation link?**
A: A visually hidden link that becomes visible on Tab, allowing keyboard users to skip repeated navigation and jump to main content. It should be the first focusable element on the page: `<a href="#main-content" class="skip-link">Skip to main content</a>`.

---

### Screen Reader

**Q: What are ARIA live regions and when do you use them?**
A:
- `aria-live="polite"`: Announce when user is idle (toast, search results count, status update)
- `aria-live="assertive"` / `role="alert"`: Interrupt and announce immediately (error messages, critical alerts)
- Important: The element must exist in DOM BEFORE the content changes. Injecting a new element with role="alert" may not be announced.

**Q: How do you make an image accessible?**
A:
- **Informative**: `alt="Chart showing 40% growth"` — describe what's conveyed
- **Decorative**: `alt=""` (empty string, NOT missing!) — hides from screen reader
- **Functional** (inside button/link): `alt="Close dialog"` — describe the action
- **Complex**: Brief alt + `aria-describedby` pointing to detailed description

**Q: How does a screen reader navigate a page?**
A: Users navigate by: **headings** (H key), **landmarks** (`<nav>`, `<main>`, `<footer>`), **links** (K key), **forms** (F key), and **tab order**. A good heading hierarchy and semantic landmarks are critical for efficient navigation.

---

### Focus Management

**Q: How do you implement a focus trap for a modal?**
A:
1. On open: Save previous focus, focus the modal
2. On Tab: If last focusable element → wrap to first. If Shift+Tab on first → wrap to last.
3. On Escape: Close modal
4. On close: Restore focus to the trigger element
5. Set `aria-modal="true"` and use `inert` on background content
**Or use native `<dialog>` which does all of this automatically.**

**Q: What should happen to focus after a route change in a SPA?**
A: Focus should move to the main content area or the `<h1>` of the new page. Without this, screen reader users don't know the page changed. Next.js App Router handles this automatically with its built-in route announcer.

**Q: What's the difference between `<dialog>` and a custom modal?**
A: Native `<dialog>` with `.showModal()` provides: automatic focus trap, Escape to close, focus restoration, backdrop, `inert` on background — all for free. Custom modals require implementing all of this manually. **Always prefer `<dialog>` when possible.**

---

### Color & Contrast

**Q: What are the WCAG contrast requirements?**
A:
- **Normal text**: 4.5:1 ratio (AA)
- **Large text** (24px or 18px bold): 3:1 ratio (AA)
- **UI components**: 3:1 ratio (AA)
- **Enhanced** (AAA): 7:1 for normal, 4.5:1 for large

**Q: How do you handle color blindness?**
A: **Never use color alone** to convey information. Always supplement with: icons (✓ / ✕), text labels, patterns, underlines, or shape changes. ~8% of males have some color vision deficiency.

**Q: What's wrong with `#999` text on white?**
A: Contrast ratio is only 2.85:1, which fails WCAG AA (needs 4.5:1). Use `#767676` (4.5:1, minimum pass) or `#595959` (7:1, comfortable) instead.

---

### Tools & Testing

**Q: How would you set up accessibility testing in CI/CD?**
A:
1. **Lint time**: `eslint-plugin-jsx-a11y` — catches issues as you type
2. **Unit tests**: `jest-axe` or `vitest` + `axe-core` — test components
3. **E2E tests**: Playwright + `@axe-core/playwright` — test full pages
4. **Lighthouse CI**: Track a11y score per build
5. **Manual**: Keyboard + screen reader testing before major releases

**Q: What's axe-core and why is it the standard?**
A: axe-core is the accessibility testing engine by Deque. It powers: axe DevTools extension, Lighthouse a11y audits, Playwright a11y tests, Storybook a11y addon. It has zero false positives by design — if it reports an issue, it IS an issue.

---

### Scenario Questions

**Q: You're tasked with making an existing React app accessible. What's your approach?**
A:
1. **Audit**: Run Lighthouse + axe to get baseline score and violation list
2. **Quick wins** (< 1 day): Add lang, alt text, labels, replace `<div onClick>` with `<button>`, add `:focus-visible`
3. **Structural fixes**: Add heading hierarchy, landmarks, skip nav
4. **Interactive fixes**: Focus management for modals, keyboard support for custom components
5. **Testing**: Add `jest-axe` to component tests, Playwright a11y to E2E
6. **CI/CD**: Add Lighthouse CI, eslint-plugin-jsx-a11y
7. **Manual QA**: Keyboard walkthrough + VoiceOver/NVDA test

**Q: How do you handle accessibility in a component library?**
A:
1. Every component passes axe-core with zero violations
2. All interactive components are keyboard accessible
3. ARIA attributes are built-in (not opt-in)
4. TypeScript enforces required props (alt text, labels)
5. Storybook with `@storybook/addon-a11y` for visual checks
6. Documentation includes a11y guidelines per component
7. Consumer can't easily break accessibility (e.g., alt is required, not optional)

**Q: A designer gives you a mock with light gray text on white. What do you do?**
A:
1. Check the contrast ratio (probably fails AA)
2. **Push back** — show the designer the WCAG requirements
3. Suggest the closest accessible alternative (darken the gray)
4. Show them the Chrome DevTools contrast checker
5. If they insist, escalate — it's a legal liability
6. Never silently ship inaccessible designs

**Q: How do you handle third-party widgets that aren't accessible?**
A:
1. Report issues to the vendor (with specific WCAG violations)
2. Apply fixes with CSS/JS if possible (add labels, fix contrast)
3. Wrap with accessible container (add ARIA labels, keyboard handlers)
4. If unfixable, consider alternatives
5. Document known issues and workarounds
6. Exclude from automated tests with documentation: `// a11y: known vendor issue, tracked in JIRA-123`
