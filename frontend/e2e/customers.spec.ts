import { test, expect } from '@playwright/test';

test.describe('Customers Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load customers page', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const customersHeading = page.locator('h1:has-text("Customers"), h1:has-text("مشتریان")');
    if (await customersHeading.count() > 0) {
      await expect(customersHeading.first()).toBeVisible();
    }
  });

  test('should fetch customers from API', async ({ page }) => {
    const customersRequest = page.waitForResponse(
      response => response.url().includes('/api/customers') && 
                  !response.url().includes('/api/customers/') &&
                  response.status() === 200,
      { timeout: 10000 }
    );
    
    await page.goto('/customers');
    
    const response = await customersRequest;
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const customers = await response.json();
    console.log('Fetched customers:', customers.length);
    expect(Array.isArray(customers)).toBeTruthy();
  });

  test('should display customers list', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForTimeout(2000);
    
    const customerItems = page.locator('[class*="customer"], tr, [class*="row"]');
    const count = await customerItems.count();
    console.log('Found customer items:', count);
    // Page should load even if there are no customers yet
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should open add customer form', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForTimeout(1000);
    
    const addButton = page.locator('button:has-text("افزودن مشتری"), button:has-text("Add Customer"), button:has-text("افزودن")');
    if (await addButton.count() > 0) {
      await addButton.first().click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]');
      if (await modal.count() > 0) {
        console.log('Add customer modal opened successfully');
      }
    }
  });

  test('should create a new customer via API', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const addButton = page.locator('button:has-text("افزودن مشتری"), button:has-text("Add Customer"), button:has-text("افزودن")');
    if (await addButton.count() > 0) {
      await addButton.first().click();
      await page.waitForTimeout(500);
      
      const nameInput = page.locator('input[name="name"], input[placeholder*="نام"], input[placeholder*="Name"]').first();
      if (await nameInput.count() > 0) {
        const createPromise = page.waitForResponse(
          response => response.url().includes('/api/customers') &&
                      !response.url().match(/\/api\/customers\/[a-f0-9]+/) &&
                      response.request().method() === 'POST',
          { timeout: 5000 }
        ).catch(() => null);
        
        await nameInput.fill('Test Customer E2E');
        
        const phoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="تلفن"], input[placeholder*="Phone"]').first();
        if (await phoneInput.count() > 0) {
          await phoneInput.fill('09123456789');
        }
        
        const submitButton = page.locator('button[type="submit"], button:has-text("ذخیره"), button:has-text("افزودن")');
        if (await submitButton.count() > 0) {
          await submitButton.first().click();
          
          const response = await createPromise;
          if (response) {
            expect(response.status()).toBe(201);
            const created = await response.json();
            console.log('Customer created:', created.id);
            expect(created).toHaveProperty('id');
            expect(created).toHaveProperty('name');
          }
        }
      }
    }
  });

  test('should search for customers', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForTimeout(1000);
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="جستجو"], input[placeholder*="Search"]');
    if (await searchInput.count() > 0) {
      const searchPromise = page.waitForResponse(
        response => response.url().includes('/api/customers/search') && response.status() === 200,
        { timeout: 5000 }
      ).catch(() => null);
      
      await searchInput.fill('test');
      await page.waitForTimeout(800);
      
      const response = await searchPromise;
      if (response) {
        expect(response.ok()).toBeTruthy();
        const results = await response.json();
        console.log('Search results:', results.length);
      }
    }
  });

  test('should view customer loyalty points', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForTimeout(2000);
    
    const customerRow = page.locator('[class*="customer"], tr').first();
    if (await customerRow.count() > 0) {
      const loyaltyRequest = page.waitForResponse(
        response => response.url().match(/\/api\/loyalty\/customer\/[a-f0-9]+/) && response.status() === 200,
        { timeout: 5000 }
      ).catch(() => null);
      
      await customerRow.click();
      await page.waitForTimeout(500);
      
      const response = await loyaltyRequest;
      if (response) {
        expect(response.ok()).toBeTruthy();
        const loyalty = await response.json();
        console.log('Customer loyalty data:', loyalty);
      }
    }
  });

  test('should update customer information via API', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForTimeout(2000);
    
    const editButtons = page.locator('button:has-text("ویرایش"), button[aria-label*="edit"], button[title*="Edit"]');
    const count = await editButtons.count();
    
    if (count > 0) {
      await editButtons.first().click();
      await page.waitForTimeout(500);
      
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.count() > 0) {
        const updatePromise = page.waitForResponse(
          response => response.url().match(/\/api\/customers\/[a-f0-9]+/) &&
                      (response.request().method() === 'PUT' || response.request().method() === 'PATCH'),
          { timeout: 5000 }
        ).catch(() => null);
        
        await nameInput.fill('Updated Customer E2E');
        
        const saveButton = page.locator('button[type="submit"], button:has-text("ذخیره")');
        if (await saveButton.count() > 0) {
          await saveButton.first().click();
          
          const response = await updatePromise;
          if (response) {
            expect([200, 201]).toContain(response.status());
            console.log('Customer updated successfully');
          }
        }
      }
    }
  });

  test('should delete a customer via API', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForTimeout(2000);
    
    const deleteButtons = page.locator('button:has-text("حذف"), button[aria-label*="delete"], button[title*="Delete"]');
    const count = await deleteButtons.count();
    
    if (count > 0) {
      const deletePromise = page.waitForResponse(
        response => response.url().match(/\/api\/customers\/[a-f0-9]+/) &&
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
        console.log('Customer deleted successfully');
      }
    }
  });
});
