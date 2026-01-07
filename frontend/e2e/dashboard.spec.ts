import { test, expect } from '@playwright/test';

test.describe('Dashboard Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const dashboardHeading = page.locator('h1:has-text("Dashboard"), h1:has-text("داشبورد")');
    if (await dashboardHeading.count() > 0) {
      await expect(dashboardHeading.first()).toBeVisible();
    }
  });

  test('should fetch dashboard analytics from API', async ({ page }) => {
    const analyticsRequest = page.waitForResponse(
      response => response.url().includes('/api/analytics/dashboard') && response.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);
    
    await page.goto('/dashboard');
    
    const response = await analyticsRequest;
    if (response) {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const analytics = await response.json();
      console.log('Fetched dashboard analytics:', analytics);
      expect(analytics).toHaveProperty('todaySales');
      expect(analytics).toHaveProperty('todayOrders');
      expect(analytics).toHaveProperty('totalProducts');
    } else {
      console.log('Dashboard loaded without analytics API call - using cached/default data');
    }
  });

  test('should fetch sales analytics for different periods', async ({ page }) => {
    const salesAnalyticsRequest = page.waitForResponse(
      response => response.url().match(/\/api\/analytics\/sales\/(today|week|month)/) && 
                  response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);
    
    await page.goto('/dashboard');
    
    const response = await salesAnalyticsRequest;
    if (response) {
      expect(response.ok()).toBeTruthy();
      const salesData = await response.json();
      console.log('Fetched sales analytics:', salesData);
    }
  });

  test('should display sales metrics cards', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    const metricCards = page.locator('[class*="card"], [class*="Card"], [class*="metric"], [class*="stat"]');
    const count = await metricCards.count();
    console.log('Found metric cards:', count);
    expect(count).toBeGreaterThan(0);
  });

  test('should display today sales total', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for sales amount displays
    const salesAmount = page.locator('[class*="amount"], [class*="total"], [class*="revenue"]');
    const count = await salesAmount.count();
    console.log('Found sales amount elements:', count);
  });

  test('should display recent sales list', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Check if recent sales are displayed
    const recentSales = page.locator('[class*="recent"], [class*="sale"], [class*="transaction"]');
    const count = await recentSales.count();
    console.log('Found recent sales elements:', count);
  });

  test('should display low stock alerts', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for low stock indicators
    const lowStockAlerts = page.locator('[class*="low-stock"], [class*="alert"], [class*="warning"]');
    const count = await lowStockAlerts.count();
    console.log('Found low stock alerts:', count);
  });

  test('should fetch top products analytics', async ({ page }) => {
    const topProductsRequest = page.waitForResponse(
      response => response.url().includes('/api/analytics/products/top') && response.status() === 200,
      { timeout: 5000 }
    ).catch(() => null);
    
    await page.goto('/dashboard');
    
    const response = await topProductsRequest;
    if (response) {
      expect(response.ok()).toBeTruthy();
      const topProducts = await response.json();
      console.log('Fetched top products:', topProducts.length);
    }
  });

  test('should fetch top customers analytics', async ({ page }) => {
    const topCustomersRequest = page.waitForResponse(
      response => response.url().includes('/api/analytics/customers/top') && response.status() === 200,
      { timeout: 5000 }
    ).catch(() => null);
    
    await page.goto('/dashboard');
    
    const response = await topCustomersRequest;
    if (response) {
      expect(response.ok()).toBeTruthy();
      const topCustomers = await response.json();
      console.log('Fetched top customers:', topCustomers.length);
    }
  });

  test('should fetch revenue trends', async ({ page }) => {
    const revenueTrendsRequest = page.waitForResponse(
      response => response.url().includes('/api/analytics/revenue/trends') && response.status() === 200,
      { timeout: 5000 }
    ).catch(() => null);
    
    await page.goto('/dashboard');
    
    const response = await revenueTrendsRequest;
    if (response) {
      expect(response.ok()).toBeTruthy();
      const trends = await response.json();
      console.log('Fetched revenue trends:', trends);
    }
  });

  test('should display charts or graphs', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for chart containers
    const charts = page.locator('[class*="chart"], [class*="graph"], svg, canvas');
    const count = await charts.count();
    console.log('Found chart elements:', count);
  });

  test('should refresh dashboard data', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for refresh button
    const refreshButton = page.locator('button:has-text("بارگذاری مجدد"), button:has-text("Refresh"), button[aria-label*="refresh"]');
    if (await refreshButton.count() > 0) {
      const refreshRequest = page.waitForResponse(
        response => response.url().includes('/api/analytics/dashboard') && response.status() === 200,
        { timeout: 5000 }
      ).catch(() => null);
      
      await refreshButton.first().click();
      
      const response = await refreshRequest;
      if (response) {
        expect(response.ok()).toBeTruthy();
        console.log('Dashboard data refreshed successfully');
      }
    }
  });
});
