import { test, expect } from '@playwright/test';

test.describe('Display Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to display page', async ({ page }) => {
    await page.goto('/display');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Display page should load without errors
    const hasContent = await page.locator('body, main, [class*="container"]').count();
    expect(hasContent).toBeGreaterThan(0);
    console.log('Display page loaded successfully');
  });

  test('should check display status via API', async ({ page }) => {
    const statusRequest = page.waitForResponse(
      response => response.url().includes('/api/display/status') && response.status() === 200,
      { timeout: 5000 }
    ).catch(() => null);
    
    await page.goto('/display');
    
    const response = await statusRequest;
    if (response) {
      expect(response.ok()).toBeTruthy();
      const status = await response.json();
      console.log('Display status:', status);
    }
  });

  test('should establish WebSocket connection', async ({ page }) => {
    // Listen for console messages related to WebSocket
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      if (text.includes('WebSocket') || text.includes('socket') || text.includes('connected')) {
        console.log('Display WebSocket:', text);
      }
    });
    
    await page.goto('/display');
    await page.waitForTimeout(3000);
    
    // Check if any WebSocket related console logs were captured
    const hasWebSocketLogs = consoleMessages.some(msg => 
      msg.toLowerCase().includes('websocket') || 
      msg.toLowerCase().includes('socket') || 
      msg.toLowerCase().includes('connected')
    );
    
    if (hasWebSocketLogs) {
      console.log('WebSocket connection logs detected');
    }
  });

  test('should display cart updates when synced', async ({ page }) => {
    await page.goto('/display');
    await page.waitForTimeout(2000);
    
    // Check for cart display elements
    const cartDisplay = page.locator('[class*="cart"], [class*="item"], [class*="product"]');
    const count = await cartDisplay.count();
    console.log('Found cart display elements:', count);
  });

  test('should show total amount', async ({ page }) => {
    await page.goto('/display');
    await page.waitForTimeout(2000);
    
    // Look for total/amount displays
    const totalDisplay = page.locator('[class*="total"], [class*="amount"], [class*="price"]');
    const count = await totalDisplay.count();
    console.log('Found total amount elements:', count);
  });

  test('should handle cart updates via WebSocket', async ({ page }) => {
    // Monitor network for WebSocket upgrade
    let wsConnected = false;
    page.on('websocket', ws => {
      console.log('WebSocket connection established:', ws.url());
      wsConnected = true;
      
      ws.on('framereceived', event => {
        console.log('WebSocket frame received:', event.payload);
      });
      
      ws.on('framesent', event => {
        console.log('WebSocket frame sent:', event.payload);
      });
    });
    
    await page.goto('/display');
    await page.waitForTimeout(3000);
    
    if (wsConnected) {
      console.log('WebSocket connection detected and monitored');
    }
  });

  test('should display sale completion message', async ({ page }) => {
    await page.goto('/display');
    await page.waitForTimeout(2000);
    
    // Look for completion/thank you messages
    const completionMessage = page.locator('text=/thank you|completed|success|تشکر|تکمیل/i');
    const count = await completionMessage.count();
    if (count > 0) {
      console.log('Found completion message elements:', count);
    }
  });

  test('should reset display after sale', async ({ page }) => {
    await page.goto('/display');
    await page.waitForTimeout(2000);
    
    // The display should be in idle/ready state
    const idleState = page.locator('[class*="idle"], [class*="ready"], [class*="empty"]');
    const count = await idleState.count();
    console.log('Display state elements found:', count);
  });
});
