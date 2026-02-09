/**
 * Accessibility Tools - Testing & Automation Examples
 * axe-core, Playwright, ESLint, React DevTools
 */

/* ============================================
   1. AXE-CORE IN TESTS (vitest)
   ============================================ */

/**
 * Unit test with axe-core
 * 
 * npm install axe-core @testing-library/react vitest jsdom
 */
/*
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button component', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Form component', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <form>
        <label htmlFor="name">Name</label>
        <input id="name" type="text" />
        <button type="submit">Submit</button>
      </form>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should fail without labels', async () => {
    const { container } = render(
      <form>
        <input type="text" />  // ❌ No label
        <button type="submit">Submit</button>
      </form>
    );
    const results = await axe(container);
    // This SHOULD fail — proving axe catches the issue
    expect(results.violations.length).toBeGreaterThan(0);
  });
});
*/


/* ============================================
   2. PLAYWRIGHT + AXE (E2E)
   ============================================ */

/**
 * E2E accessibility test with Playwright
 * 
 * npm install @playwright/test @axe-core/playwright
 */
/*
// tests/accessibility.spec.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should have no violations', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa']) // WCAG 2.1 AA
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('login page should have no violations', async ({ page }) => {
    await page.goto('/login');
    
    const results = await new AxeBuilder({ page })
      .exclude('.third-party-widget') // Exclude elements you don't control
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  // Test specific rules
  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withRules(['image-alt']) // Only check image alt
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  // Test keyboard navigation
  test('can navigate with keyboard only', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Should focus skip link first
    const focused = await page.evaluate(() => document.activeElement?.textContent);
    expect(focused).toContain('Skip');
    
    // Tab to navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should navigate
    await expect(page).toHaveURL(/about|home/);
  });
});
*/


/* ============================================
   3. @AXE-CORE/REACT (Development Overlay)
   ============================================ */

/**
 * Auto-report a11y issues in dev mode
 * Shows violations in browser console
 */
/*
// index.js or app entry point
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then(({ default: axe }) => {
    const React = require('react');
    const ReactDOM = require('react-dom');
    
    axe(React, ReactDOM, 1000, {
      // Configuration
      rules: [
        { id: 'color-contrast', enabled: true },
        { id: 'image-alt', enabled: true },
      ]
    });
    // Violations will appear in console with detailed info
  });
}
*/


/* ============================================
   4. ESLINT CONFIG FOR ACCESSIBILITY
   ============================================ */

const eslintA11yConfig = {
  // .eslintrc.js
  plugins: ['jsx-a11y'],
  extends: ['plugin:jsx-a11y/recommended'],
  rules: {
    // Enforce alt text
    'jsx-a11y/alt-text': 'error',
    
    // Enforce label association
    'jsx-a11y/label-has-associated-control': 'error',
    
    // No autofocus (confuses screen readers)
    'jsx-a11y/no-autofocus': 'warn',
    
    // No onClick without keyboard equivalent
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    
    // Enforce anchor href
    'jsx-a11y/anchor-is-valid': 'error',
    
    // Enforce heading order
    'jsx-a11y/heading-has-content': 'error',
    
    // ARIA rules
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
  },
};


/* ============================================
   5. STORYBOOK A11Y ADDON
   ============================================ */

/*
// .storybook/main.js
module.exports = {
  addons: [
    '@storybook/addon-a11y', // Adds a11y panel to Storybook
  ],
};

// In story file:
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
        ],
      },
    },
  },
};
*/


/* ============================================
   6. CUSTOM ACCESSIBILITY AUDIT SCRIPT
   ============================================ */

/**
 * Quick audit you can run in browser console
 */
function quickA11yAudit() {
  const issues = [];

  // Check images without alt
  document.querySelectorAll('img:not([alt])').forEach(img => {
    issues.push({
      type: 'error',
      rule: 'image-alt',
      message: 'Image missing alt attribute',
      element: img.outerHTML.slice(0, 100),
    });
  });

  // Check inputs without labels
  document.querySelectorAll('input:not([type="hidden"]):not([type="submit"])').forEach(input => {
    const id = input.id;
    const label = id ? document.querySelector(`label[for="${id}"]`) : null;
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledby = input.getAttribute('aria-labelledby');

    if (!label && !ariaLabel && !ariaLabelledby) {
      issues.push({
        type: 'error',
        rule: 'label',
        message: 'Input missing associated label',
        element: input.outerHTML.slice(0, 100),
      });
    }
  });

  // Check heading order
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach(h => {
    const level = parseInt(h.tagName[1]);
    if (level > lastLevel + 1) {
      issues.push({
        type: 'warning',
        rule: 'heading-order',
        message: `Heading skips from h${lastLevel} to h${level}`,
        element: h.outerHTML.slice(0, 100),
      });
    }
    lastLevel = level;
  });

  // Check for positive tabindex
  document.querySelectorAll('[tabindex]').forEach(el => {
    const value = parseInt(el.getAttribute('tabindex'));
    if (value > 0) {
      issues.push({
        type: 'warning',
        rule: 'tabindex',
        message: `Positive tabindex (${value}) disrupts natural tab order`,
        element: el.outerHTML.slice(0, 100),
      });
    }
  });

  // Check buttons with only icon (no accessible name)
  document.querySelectorAll('button').forEach(btn => {
    const text = btn.textContent.trim();
    const ariaLabel = btn.getAttribute('aria-label');
    const ariaLabelledby = btn.getAttribute('aria-labelledby');
    
    if (!text && !ariaLabel && !ariaLabelledby) {
      issues.push({
        type: 'error',
        rule: 'button-name',
        message: 'Button has no accessible name',
        element: btn.outerHTML.slice(0, 100),
      });
    }
  });

  // Check for outline:none without replacement
  const allFocusable = document.querySelectorAll('a, button, input, textarea, select, [tabindex="0"]');
  allFocusable.forEach(el => {
    const styles = window.getComputedStyle(el, ':focus');
    // Note: This is a simplified check
    if (styles.outlineStyle === 'none' && styles.boxShadow === 'none') {
      issues.push({
        type: 'warning',
        rule: 'focus-visible',
        message: 'Element may lack visible focus indicator',
        element: el.outerHTML.slice(0, 100),
      });
    }
  });

  console.group(`🔍 Accessibility Audit: ${issues.length} issues found`);
  issues.forEach(issue => {
    const icon = issue.type === 'error' ? '❌' : '⚠️';
    console.log(`${icon} [${issue.rule}] ${issue.message}`);
    console.log('   Element:', issue.element);
  });
  console.groupEnd();

  return issues;
}

// Run in browser console: quickA11yAudit()


/* ============================================
   7. PA11Y CI CONFIG
   ============================================ */

/*
// .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 10000,
    "wait": 1000,
    "ignore": [
      "WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2" // html lang (if handled by framework)
    ]
  },
  "urls": [
    "http://localhost:3000",
    "http://localhost:3000/login",
    "http://localhost:3000/dashboard",
    "http://localhost:3000/settings"
  ]
}

// package.json script:
// "test:a11y": "pa11y-ci"
*/


console.log('See README.md for documentation');
