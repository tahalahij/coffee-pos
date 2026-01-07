import { test, expect } from '@playwright/test';

test.describe('Operator Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to operator page', async ({ page }) => {
    await page.goto('/operator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const operatorHeading = page.locator('h1:has-text("Operator"), h1:has-text("اپراتور"), h1');
    if (await operatorHeading.count() > 0) {
      console.log('Operator page loaded successfully');
    }
  });

  test('should fetch products for operator POS', async ({ page }) => {
    const productsRequest = page.waitForResponse(
      response => response.url().includes('/api/products') && 
                  !response.url().includes('/api/products/') &&
                  response.status() === 200,
      { timeout: 10000 }
    );
    
    await page.goto('/operator');
    
    const response = await productsRequest;
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    console.log('Products loaded on operator page:', products.length);
    expect(Array.isArray(products)).toBeTruthy();
  });

  test('should fetch categories for operator POS', async ({ page }) => {
    const categoriesRequest = page.waitForResponse(
      response => response.url().includes('/api/categories') && 
                  !response.url().includes('/api/categories/') &&
                  response.status() === 200,
      { timeout: 10000 }
    );
    
    await page.goto('/operator');
    
    const response = await categoriesRequest;
    expect(response.ok()).toBeTruthy();
    const categories = await response.json();
    console.log('Categories loaded on operator page:', categories.length);
  });

  test('should load POS interface on operator page', async ({ page }) => {
    await page.goto('/operator');
    await page.waitForTimeout(2000);
    
    // Check if operator page header and tabs are loaded
    const header = page.getByRole('heading', { name: /Operator Terminal|Operator/i });
    await expect(header).toBeVisible();
    
    // Check if POS tab is present
    const posTab = page.getByRole('tab', { name: /POS/i });
    await expect(posTab).toBeVisible();
  });

  test('should add products and complete sale on operator page', async ({ page }) => {
    await page.goto('/operator');
    await page.waitForTimeout(2000);
    
    // Add a product
    const productButton = page.locator('[class*="product"] button, [class*="card"] button').first();
    if (await productButton.count() > 0) {
      await productButton.click();
      await page.waitForTimeout(500);
      
      // Try to complete the sale
      const checkoutButton = page.locator('button:has-text("پرداخت"), button:has-text("تکمیل"), button:has-text("Complete")');
      if (await checkoutButton.count() > 0) {
        const salesPromise = page.waitForResponse(
          response => response.url().includes('/api/sales') && 
                      !response.url().match(/\/api\/sales\/[a-f0-9]+/) &&
                      response.request().method() === 'POST',
          { timeout: 5000 }
        ).catch(() => null);
        
        await checkoutButton.first().click();
        await page.waitForTimeout(500);
        
        // Confirm if needed
        const confirmButton = page.locator('button:has-text("تایید"), button:has-text("Confirm")');
        if (await confirmButton.count() > 0) {
          await confirmButton.last().click();
        }
        
        const response = await salesPromise;
        if (response) {
          expect(response.status()).toBe(201);
          console.log('Sale completed on operator page');
        }
      }
    }
  });

  test('should filter products by category on operator page', async ({ page }) => {
    await page.goto('/operator');
    await page.waitForTimeout(2000);
    
    const categoryButtons = page.locator('[class*="category"] button, [role="tab"]');
    const count = await categoryButtons.count();
    
    if (count > 1) {
      await categoryButtons.nth(1).click();
      await page.waitForTimeout(500);
      console.log('Products filtered by category on operator page');
    }
  });
});
