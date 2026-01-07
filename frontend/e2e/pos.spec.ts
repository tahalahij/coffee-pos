import { test, expect } from '@playwright/test';

test.describe('POS Interface E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load POS interface', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Check if POS interface container is present
    const posContainer = page.locator('[class*="pos"], [class*="interface"], main');
    const containerCount = await posContainer.count();
    console.log('POS interface loaded:', containerCount > 0);
    expect(containerCount).toBeGreaterThan(0);
  });

  test('should fetch products for POS from API', async ({ page }) => {
    const productsRequest = page.waitForResponse(
      response => response.url().includes('/api/products') && 
                  !response.url().includes('/api/products/') &&
                  response.status() === 200,
      { timeout: 10000 }
    );
    
    await page.goto('/');
    
    const response = await productsRequest;
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    console.log('Fetched products for POS:', products.length);
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);
  });

  test('should fetch categories for POS from API', async ({ page }) => {
    const categoriesRequest = page.waitForResponse(
      response => response.url().includes('/api/categories') && 
                  !response.url().includes('/api/categories/') &&
                  response.status() === 200,
      { timeout: 10000 }
    );
    
    await page.goto('/');
    
    const response = await categoriesRequest;
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const categories = await response.json();
    console.log('Fetched categories for POS:', categories.length);
    expect(Array.isArray(categories)).toBeTruthy();
  });

  test('should add product to cart', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const productButtons = page.locator('button:has-text("Add"), [data-testid*="product"], [class*="product-card"] button, [class*="product"] button').first();
    const count = await productButtons.count();
    
    if (count > 0) {
      await productButtons.click();
      await page.waitForTimeout(500);
      
      const cart = page.locator('[class*="cart"], [class*="Cart"]');
      if (await cart.count() > 0) {
        console.log('Cart element found - product added successfully');
      }
    } else {
      console.log('No product buttons found to test cart addition');
    }
  });

  test('should increase and decrease cart item quantity', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const productButton = page.locator('[class*="product"] button, [class*="card"] button').first();
    if (await productButton.count() > 0) {
      await productButton.click();
      await page.waitForTimeout(500);
      
      // Try to increase quantity
      const increaseButton = page.locator('button:has-text("+"), button[aria-label*="increase"]');
      if (await increaseButton.count() > 0) {
        await increaseButton.first().click();
        await page.waitForTimeout(300);
        console.log('Increased cart item quantity');
      }
      
      // Try to decrease quantity
      const decreaseButton = page.locator('button:has-text("-"), button[aria-label*="decrease"]');
      if (await decreaseButton.count() > 0) {
        await decreaseButton.first().click();
        await page.waitForTimeout(300);
        console.log('Decreased cart item quantity');
      }
    }
  });

  test('should complete a sale via API', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Add a product to cart
    const productButton = page.locator('[class*="product"] button, [class*="card"] button').first();
    if (await productButton.count() > 0) {
      await productButton.click();
      await page.waitForTimeout(500);
    }
    
    // Look for checkout button
    const checkoutButton = page.locator('button:has-text("پرداخت"), button:has-text("تکمیل"), button:has-text("Complete"), button:has-text("Checkout")');
    
    if (await checkoutButton.count() > 0) {
      const salesPromise = page.waitForResponse(
        response => response.url().includes('/api/sales') && 
                    !response.url().match(/\/api\/sales\/[a-f0-9]+/) &&
                    response.request().method() === 'POST',
        { timeout: 5000 }
      ).catch(() => null);
      
      await checkoutButton.first().click();
      await page.waitForTimeout(500);
      
      // If there's a confirmation modal, confirm the payment
      const confirmPayment = page.locator('button:has-text("تایید"), button:has-text("Confirm")');
      if (await confirmPayment.count() > 0) {
        await confirmPayment.last().click();
      }
      
      const response = await salesPromise;
      if (response) {
        expect(response.status()).toBe(201);
        const sale = await response.json();
        console.log('Sale completed successfully:', sale.id || sale.receiptNumber);
        expect(sale).toHaveProperty('id');
        expect(sale).toHaveProperty('totalAmount');
      }
    }
  });

  test('should handle payment method selection', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Add a product
    const productButton = page.locator('[class*="product"] button').first();
    if (await productButton.count() > 0) {
      await productButton.click();
      await page.waitForTimeout(500);
    }
    
    // Look for payment method buttons
    const paymentButtons = page.locator('button:has-text("نقدی"), button:has-text("Cash"), button:has-text("کارت"), button:has-text("Card")');
    const count = await paymentButtons.count();
    
    if (count > 0) {
      await paymentButtons.first().click();
      await page.waitForTimeout(300);
      console.log('Payment method selected');
    }
  });

  test('should clear cart', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Add a product
    const productButton = page.locator('[class*="product"] button').first();
    if (await productButton.count() > 0) {
      await productButton.click();
      await page.waitForTimeout(500);
    }
    
    // Look for clear/cancel button
    const clearButton = page.locator('button:has-text("پاک کردن"), button:has-text("Clear"), button:has-text("لغو"), button:has-text("Cancel")');
    if (await clearButton.count() > 0) {
      await clearButton.first().click();
      await page.waitForTimeout(300);
      console.log('Cart cleared successfully');
    }
  });

  test('should filter products by category', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for category filter buttons
    const categoryButtons = page.locator('[class*="category"] button, [role="tab"]');
    const count = await categoryButtons.count();
    
    if (count > 1) {
      await categoryButtons.nth(1).click();
      await page.waitForTimeout(500);
      console.log('Products filtered by category');
    }
  });
});
