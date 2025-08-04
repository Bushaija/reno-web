import { test, expect } from '@playwright/test';

test.describe('Shift Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('/test-shifts');
  });

  test('should create a shift successfully', async ({ page }) => {
    // Fill in the form
    await page.fill('input[type="number"]', '1'); // Worker ID
    await page.fill('input[placeholder*="Department"]', 'Emergency Department');
    await page.fill('input[type="datetime-local"]:nth-of-type(1)', '2025-07-30T08:00');
    await page.fill('input[type="datetime-local"]:nth-of-type(2)', '2025-07-30T16:00');
    await page.fill('input[type="number"]:nth-of-type(2)', '3'); // Max Staff
    await page.fill('input[placeholder*="Notes"]', 'Test shift creation');

    // Click the test button
    await page.click('button:has-text("Test Create Shift")');

    // Wait for success message
    await expect(page.locator('text=Shift created successfully')).toBeVisible();
  });

  test('should handle validation errors', async ({ page }) => {
    // Try to create with invalid data (empty department)
    await page.fill('input[type="number"]', '1');
    await page.fill('input[placeholder*="Department"]', ''); // Empty department
    await page.fill('input[type="datetime-local"]:nth-of-type(1)', '2025-07-30T08:00');
    await page.fill('input[type="datetime-local"]:nth-of-type(2)', '2025-07-30T16:00');

    await page.click('button:has-text("Test Create Shift")');

    // Should show error
    await expect(page.locator('text=Test failed')).toBeVisible();
  });

  test('should load predefined test cases', async ({ page }) => {
    // Click on a predefined test case
    await page.click('button:has-text("Valid Shift")');

    // Check that the form is populated
    await expect(page.locator('input[placeholder*="Department"]')).toHaveValue('Emergency');
    await expect(page.locator('input[type="number"]:nth-of-type(2)')).toHaveValue('3');
  });

  test('should show loading state', async ({ page }) => {
    // Fill form and click test
    await page.fill('input[type="number"]', '1');
    await page.fill('input[placeholder*="Department"]', 'Test');
    await page.fill('input[type="datetime-local"]:nth-of-type(1)', '2025-07-30T08:00');
    await page.fill('input[type="datetime-local"]:nth-of-type(2)', '2025-07-30T16:00');

    await page.click('button:has-text("Test Create Shift")');

    // Should show loading state
    await expect(page.locator('button:has-text("Creating...")')).toBeVisible();
  });

  test('should display current test data', async ({ page }) => {
    // Fill some data
    await page.fill('input[placeholder*="Department"]', 'ICU');
    await page.fill('input[type="number"]:nth-of-type(2)', '5');

    // Check that the JSON display updates
    await expect(page.locator('pre')).toContainText('"department": "ICU"');
    await expect(page.locator('pre')).toContainText('"maxStaff": 5');
  });
}); 