import { test, expect } from '@playwright/test';

test.describe('E2E Testing Examples', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto('/');
  });

  test('should display homepage correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Home/);
    
    // Check main heading
    const heading = page.getByRole('heading', { name: /welcome/i });
    await expect(heading).toBeVisible();
  });

  test('should complete login flow', async ({ page }) => {
    // Navigate to login
    await page.getByRole('link', { name: /login/i }).click();
    
    // Fill login form
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify successful login
    await expect(page.getByText(/welcome/i)).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /register/i }).click();
    
    // Verify validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should complete checkout flow', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.getByRole('button', { name: /add to cart/i }).first().click();
    
    // Go to cart
    await page.getByRole('link', { name: /cart/i }).click();
    
    // Proceed to checkout
    await page.getByRole('button', { name: /checkout/i }).click();
    
    // Fill shipping information
    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByLabel('Address').fill('123 Main St');
    await page.getByLabel('City').fill('New York');
    
    // Complete checkout
    await page.getByRole('button', { name: /place order/i }).click();
    
    // Verify success
    await expect(page.getByText(/order confirmed/i)).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API call and return error
    await page.route('**/api/users', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await page.goto('/profile');
    
    // Verify error message displayed
    await expect(page.getByText(/something went wrong/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verify mobile layout
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
    
    // Verify navigation is hidden
    const desktopNav = page.getByRole('navigation');
    await expect(desktopNav).not.toBeVisible();
  });
});

test.describe('Accessibility Testing', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA labels
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
