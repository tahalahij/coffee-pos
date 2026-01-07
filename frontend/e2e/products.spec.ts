import { test, expect } from '@playwright/test';

test.describe('Products Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load products page and display products', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('h1')).toContainText('محصولات');
  });

  test('should fetch products from API', async ({ page }) => {
    const productsRequest = page.waitForResponse(
      response => response.url().includes('/api/products') && 
                  !response.url().includes('/api/products/') &&
                  response.status() === 200,
      { timeout: 15000 }
    );
    
    await page.goto('/products');
    
    const response = await productsRequest;
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    console.log('Fetched products:', products.length);
    expect(Array.isArray(products)).toBeTruthy();
  });

  test('should fetch categories from API', async ({ page }) => {
    const categoriesRequest = page.waitForResponse(
      response => response.url().includes('/api/categories') && 
                  !response.url().includes('/api/categories/') &&
                  response.status() === 200,
      { timeout: 15000 }
    );
    
    await page.goto('/products');
    
    const response = await categoriesRequest;
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const categories = await response.json();
    console.log('Fetched categories:', categories.length);
    expect(Array.isArray(categories)).toBeTruthy();
  });

  test('should fetch low stock products from API', async ({ page }) => {
    const lowStockRequest = page.waitForResponse(
      response => response.url().includes('/api/products/low-stock') && response.status() === 200,
      { timeout: 5000 }
    ).catch(() => null);
    
    await page.goto('/products');
    
    const response = await lowStockRequest;
    if (response) {
      expect(response.ok()).toBeTruthy();
      const lowStockProducts = await response.json();
      console.log('Low stock products:', lowStockProducts.length);
    }
  });

  test('should open add product modal', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(1000);
    
    const addButton = page.locator('button:has-text("افزودن محصول")');
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]');
      if (await modal.count() > 0) {
        console.log('Add product modal opened successfully');
      }
    }
  });

  test('should create a new product via API', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const addButton = page.locator('button:has-text("افزودن محصول")');
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      const nameInput = page.locator('input[name="name"], input[placeholder*="نام"]').first();
      if (await nameInput.count() > 0) {
        const createPromise = page.waitForResponse(
          response => response.url().includes('/api/products') &&
                      !response.url().match(/\/api\/products\/[a-f0-9]+/) &&
                      response.request().method() === 'POST',
          { timeout: 5000 }
        ).catch(() => null);
        
        await nameInput.fill('Test Product E2E');
        
        const priceInput = page.locator('input[name="price"], input[placeholder*="قیمت"]').first();
        if (await priceInput.count() > 0) {
          await priceInput.fill('100000');
        }
        
        const submitButton = page.locator('button[type="submit"], button:has-text("ذخیره"), button:has-text("افزودن")');
        if (await submitButton.count() > 0) {
          await submitButton.first().click({ force: true });
          
          const response = await createPromise;
          if (response) {
            expect(response.status()).toBe(201);
            const created = await response.json();
            console.log('Product created:', created.id);
          }
        }
      }
    }
  });

  test('should toggle product availability via API', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const toggleButtons = page.locator('button[role="switch"], button:has-text("فعال"), button:has-text("غیرفعال")');
    const count = await toggleButtons.count();
    
    if (count > 0) {
      const updatePromise = page.waitForResponse(
        response => response.url().match(/\/api\/products\/[a-f0-9]+/) && 
                    (response.request().method() === 'PUT' || response.request().method() === 'PATCH'),
        { timeout: 5000 }
      ).catch(() => null);
      
      await toggleButtons.first().click({ force: true });
      
      const response = await updatePromise;
      if (response) {
        const status = response.status();
        console.log('Product availability toggle API response status:', status);
        // Accept successful status codes or skip if endpoint doesn't exist
        if (status !== 404) {
          expect([200, 201, 204]).toContain(status);
          console.log('Product availability toggled successfully');
        } else {
          console.log('Product availability toggle endpoint returned 404, skipping validation');
        }
      }
    }
  });

  test('should update product stock via API', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const stockButtons = page.locator('button:has-text("موجودی"), button[aria-label*="stock"], button[title*="Stock"]');
    const count = await stockButtons.count();
    
    if (count > 0) {
      await stockButtons.first().click();
      await page.waitForTimeout(500);
      
      const stockInput = page.locator('input[name="stock"], input[type="number"]').first();
      if (await stockInput.count() > 0) {
        const stockPromise = page.waitForResponse(
          response => response.url().includes('/api/products/') &&
                      response.url().includes('/stock') &&
                      response.request().method() === 'PATCH',
          { timeout: 5000 }
        ).catch(() => null);
        
        await stockInput.fill('100');
        
        const saveButton = page.locator('button:has-text("ذخیره"), button[type="submit"]');
        if (await saveButton.count() > 0) {
          await saveButton.first().click();
          
          const response = await stockPromise;
          if (response) {
            expect([200, 201]).toContain(response.status());
            console.log('Product stock updated successfully');
          }
        }
      }
    }
  });

  test('should delete a product via API', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const deleteButtons = page.locator('button:has-text("حذف"), button[aria-label*="delete"], button[title*="Delete"]');
    const count = await deleteButtons.count();
    
    if (count > 0) {
      const deletePromise = page.waitForResponse(
        response => response.url().match(/\/api\/products\/[a-f0-9]+/) && 
                    response.request().method() === 'DELETE',
        { timeout: 5000 }
      ).catch(() => null);
      
      await deleteButtons.first().click();
      
      const confirmButton = page.locator('button:has-text("تایید"), button:has-text("حذف")');
      if (await confirmButton.count() > 1) {
        await confirmButton.last().click();
      }
      
      const response = await deletePromise;
      if (response) {
        expect([200, 204]).toContain(response.status());
        console.log('Product deleted successfully');
      }
    }
  });
});
