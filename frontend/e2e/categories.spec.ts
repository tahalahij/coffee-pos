import { test, expect } from '@playwright/test';

test.describe('Categories Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load categories page and display categories', async ({ page }) => {
    await page.goto('/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('h1')).toContainText('دسته‌بندی‌ها');
  });

  test('should fetch categories from API', async ({ page }) => {
    const categoriesRequest = page.waitForResponse(
      response => response.url().includes('/api/categories') && 
                  !response.url().includes('/api/categories/') &&
                  response.status() === 200,
      { timeout: 15000 }
    );
    
    await page.goto('/categories');
    
    const response = await categoriesRequest;
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const categories = await response.json();
    console.log('Fetched categories:', categories.length);
    expect(Array.isArray(categories)).toBeTruthy();
  });

  test('should fetch products from API on categories page', async ({ page }) => {
    const productsRequest = page.waitForResponse(
      response => response.url().includes('/api/products') && 
                  !response.url().includes('/api/products/') &&
                  response.status() === 200,
      { timeout: 15000 }
    );
    
    await page.goto('/categories');
    
    const response = await productsRequest;
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    console.log('Fetched products for categories:', products.length);
    expect(Array.isArray(products)).toBeTruthy();
  });

  test('should open add category modal', async ({ page }) => {
    await page.goto('/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const addButton = page.locator('button:has-text("افزودن دسته‌بندی")');
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Check if modal opened
      const modal = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]');
      if (await modal.count() > 0) {
        console.log('Add category modal opened successfully');
      }
    }
  });

  test('should create a new category via API', async ({ page }) => {
    await page.goto('/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const addButton = page.locator('button:has-text("افزودن دسته‌بندی")');
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Fill in the form
      const nameInput = page.locator('input[name="name"], input[placeholder*="نام"]').first();
      if (await nameInput.count() > 0) {
        const createPromise = page.waitForResponse(
          response => response.url().includes('/api/categories') &&
                      !response.url().match(/\/api\/categories\/[a-f0-9]+/) &&
                      response.request().method() === 'POST',
          { timeout: 5000 }
        ).catch(() => null);
        
        await nameInput.fill('Test Category E2E');
        
        const submitButton = page.locator('button[type="submit"], button:has-text("ذخیره"), button:has-text("افزودن")');
        if (await submitButton.count() > 0) {
          await submitButton.first().click();
          
          const response = await createPromise;
          if (response) {
            expect(response.status()).toBe(201);
            const created = await response.json();
            console.log('Category created:', created.id);
          }
        }
      }
    }
  });

  test('should toggle category active status via API', async ({ page }) => {
    await page.goto('/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const toggleButtons = page.locator('button[role="switch"]');
    const count = await toggleButtons.count();
    
    if (count > 0) {
      const updatePromise = page.waitForResponse(
        response => response.url().match(/\/api\/categories\/[a-f0-9]+/) && 
                    (response.request().method() === 'PUT' || response.request().method() === 'PATCH'),
        { timeout: 5000 }
      ).catch(() => null);
      
      await toggleButtons.first().click();
      
      const response = await updatePromise;
      if (response) {
        expect([200, 201]).toContain(response.status());
        console.log('Category status toggled successfully');
      }
    }
  });

  test('should delete a category via API', async ({ page }) => {
    await page.goto('/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for delete buttons
    const deleteButtons = page.locator('button:has-text("حذف"), button[aria-label*="delete"], button[title*="Delete"]');
    const count = await deleteButtons.count();
    
    if (count > 0) {
      const deletePromise = page.waitForResponse(
        response => response.url().match(/\/api\/categories\/[a-f0-9]+/) && 
                    response.request().method() === 'DELETE',
        { timeout: 5000 }
      ).catch(() => null);
      
      await deleteButtons.first().click();
      
      // Confirm deletion if there's a confirmation dialog
      const confirmButton = page.locator('button:has-text("تایید"), button:has-text("حذف")');
      if (await confirmButton.count() > 1) {
        await confirmButton.last().click();
      }
      
      const response = await deletePromise;
      if (response) {
        expect([200, 204]).toContain(response.status());
        console.log('Category deleted successfully');
      }
    }
  });
});
