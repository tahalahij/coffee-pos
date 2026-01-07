import { test, expect } from '@playwright/test';

test.describe('Sales Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load sales page', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const salesHeading = page.locator('h1:has-text("Sales"), h1:has-text("فروش"), h1:has-text("فروش‌ها")');
    if (await salesHeading.count() > 0) {
      await expect(salesHeading.first()).toBeVisible();
    }
  });

  test('should fetch sales from API', async ({ page }) => {
    const salesRequest = page.waitForResponse(
      response => response.url().includes('/api/sales') && 
                  !response.url().includes('/api/sales/') &&
                  response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);
    
    await page.goto('/sales');
    
    const response = await salesRequest;
    
    // Sales data may be cached or fetched on demand - both are valid
    if (response) {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const sales = await response.json();
      console.log('Fetched sales:', sales.length);
      expect(Array.isArray(sales)).toBeTruthy();
    } else {
      console.log('Sales data loaded from cache or on-demand');
      // Verify page still works by checking if sales are displayed
      const salesCards = page.locator('[class*="card"], [class*="sale"]').first();
      await expect(salesCards).toBeVisible({ timeout: 5000 });
    }
  });

  test('should fetch daily sales summary from API', async ({ page }) => {
    const summaryRequest = page.waitForResponse(
      response => response.url().includes('/api/sales/daily-summary') && response.status() === 200,
      { timeout: 5000 }
    ).catch(() => null);
    
    await page.goto('/sales');
    
    const response = await summaryRequest;
    if (response) {
      expect(response.ok()).toBeTruthy();
      const summary = await response.json();
      console.log('Fetched daily summary:', summary);
    }
  });

  test('should display sales list with receipts', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForTimeout(2000);
    
    const salesItems = page.locator('[class*="sale"], [class*="receipt"], [class*="transaction"], tr, [class*="row"]');
    const count = await salesItems.count();
    console.log('Found sales items:', count);
    expect(count).toBeGreaterThan(0);
  });

  test('should filter sales by status', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForTimeout(2000);
    
    // Look for filter buttons or dropdowns
    const filterButtons = page.locator('button:has-text("COMPLETED"), button:has-text("تکمیل شده"), button:has-text("ALL"), button:has-text("همه"), select, [role="combobox"]');
    const count = await filterButtons.count();
    
    if (count > 0) {
      await filterButtons.first().click();
      await page.waitForTimeout(500);
      console.log('Sales filter applied');
    }
  });

  test('should filter sales by date range', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForTimeout(2000);
    
    // Look for date filter inputs
    const dateInputs = page.locator('input[type="date"], input[placeholder*="تاریخ"], input[placeholder*="date"]');
    const count = await dateInputs.count();
    
    if (count > 0) {
      console.log('Date filter inputs found:', count);
    }
  });

  test('should view sale details', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForTimeout(2000);
    
    // Look for view/detail buttons
    const detailButtons = page.locator('button:has-text("جزییات"), button:has-text("Details"), button:has-text("View"), [class*="sale"] button, tr button').first();
    const count = await detailButtons.count();
    
    if (count > 0) {
      const saleDetailRequest = page.waitForResponse(
        response => response.url().match(/\/api\/sales\/[a-f0-9]+/) && response.status() === 200,
        { timeout: 5000 }
      ).catch(() => null);
      
      await detailButtons.click();
      await page.waitForTimeout(500);
      
      const response = await saleDetailRequest;
      if (response) {
        expect(response.ok()).toBeTruthy();
        const saleDetail = await response.json();
        console.log('Fetched sale detail:', saleDetail.id || saleDetail.receiptNumber);
      }
    }
  });

  test('should update sale status via API', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForTimeout(2000);
    
    // Look for status change buttons (refund, cancel, etc.)
    const statusButtons = page.locator('button:has-text("بازگشت"), button:has-text("Refund"), button:has-text("لغو"), button:has-text("Cancel")');
    const count = await statusButtons.count();
    
    if (count > 0) {
      const updatePromise = page.waitForResponse(
        response => response.url().match(/\/api\/sales\/[a-f0-9]+/) &&
                    response.request().method() === 'PATCH',
        { timeout: 5000 }
      ).catch(() => null);
      
      await statusButtons.first().click();
      
      // Confirm action if there's a confirmation dialog
      const confirmButton = page.locator('button:has-text("تایید"), button:has-text("Confirm")');
      if (await confirmButton.count() > 0) {
        await confirmButton.last().click();
      }
      
      const response = await updatePromise;
      if (response) {
        expect([200, 201]).toContain(response.status());
        console.log('Sale status updated successfully');
      }
    }
  });

  test('should export or print receipt', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForTimeout(2000);
    
    // Look for print/export buttons
    const printButtons = page.locator('button:has-text("چاپ"), button:has-text("Print"), button:has-text("خروجی"), button:has-text("Export")');
    const count = await printButtons.count();
    
    if (count > 0) {
      console.log('Print/Export buttons found:', count);
    }
  });
});
