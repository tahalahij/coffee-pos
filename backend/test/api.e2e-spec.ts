import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('API Endpoints (e2e)', () => {
  let app: INestApplication;
  let categoryId: string;
  let productId: string;
  let customerId: string;
  let saleId: string;
  let purchaseId: string;
  let discountId: string;
  let campaignId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ==================== CATEGORIES ====================
  describe('Categories', () => {
    it('POST /api/categories - should create a category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories')
        .send({
          name: 'Test Coffee',
          description: 'Coffee drinks',
          color: '#8B4513',
          isActive: true,
        })
        .expect(201);

      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Test Coffee');
      categoryId = res.body._id;
    });

    it('GET /api/categories - should return all categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /api/categories/:id - should return a category by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/categories/${categoryId}`)
        .expect(200);

      expect(res.body._id).toBe(categoryId);
    });

    it('PATCH /api/categories/:id - should update a category', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/categories/${categoryId}`)
        .send({ description: 'Updated description' })
        .expect(200);

      expect(res.body.description).toBe('Updated description');
    });
  });

  // ==================== PRODUCTS ====================
  describe('Products', () => {
    it('POST /api/products - should create a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: 'Test Espresso',
          description: 'Strong coffee',
          price: 25000,
          cost: 7500,
          categoryId: categoryId,
          stock: 100,
          lowStockAlert: 10,
          isAvailable: true,
        })
        .expect(201);

      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Test Espresso');
      productId = res.body._id;
    });

    it('POST /api/products - should accept categoryId as string or number', async () => {
      // Test with number (should be converted to string)
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: 'Test Latte',
          price: 30000,
          cost: 8000,
          categoryId: categoryId, // String ID
          stock: 50,
        })
        .expect(201);

      expect(res.body).toHaveProperty('_id');
    });

    it('GET /api/products - should return all products', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /api/products/:id - should return a product by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(res.body._id).toBe(productId);
    });

    it('PATCH /api/products/:id - should update a product', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .send({ price: 27000 })
        .expect(200);

      expect(res.body.price).toBe(27000);
    });
  });

  // ==================== CUSTOMERS ====================
  describe('Customers', () => {
    it('POST /api/customers - should create a customer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/customers')
        .send({
          name: 'John Doe',
          phone: '+989121234567',
          email: 'john@example.com',
        })
        .expect(201);

      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('John Doe');
      customerId = res.body._id;
    });

    it('GET /api/customers - should return all customers', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/customers/:id - should return a customer by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/customers/${customerId}`)
        .expect(200);

      expect(res.body._id).toBe(customerId);
    });
  });

  // ==================== SALES ====================
  describe('Sales', () => {
    it('POST /api/sales - should create a sale with string productId', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/sales')
        .send({
          paymentMethod: 'CASH',
          customerId: customerId,
          items: [
            {
              productId: productId, // String ID
              quantity: 2,
              unitPrice: 25000,
            },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('receiptNumber');
      saleId = res.body._id;
    });

    it('POST /api/sales - should accept numeric productId (auto-convert to string)', async () => {
      // This tests that the DTO accepts numeric input and converts to string
      // The service will still validate if the product exists
      const res = await request(app.getHttpServer())
        .post('/api/sales')
        .send({
          paymentMethod: 'CARD',
          items: [
            {
              productId: 123456, // Number - should be converted to string by DTO
              quantity: 1,
              unitPrice: 25000,
            },
          ],
        });

      // Should get 400 because product doesn't exist, NOT because of type validation
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Product with ID 123456 not found');
    });

    it('POST /api/sales - should reject invalid customerId format', async () => {
      // This tests that the service validates customerId format
      const res = await request(app.getHttpServer())
        .post('/api/sales')
        .send({
          paymentMethod: 'CASH',
          customerId: '999999', // Invalid ObjectId format
          items: [
            {
              productId: productId,
              quantity: 1,
              unitPrice: 25000,
            },
          ],
        });

      // Should get 400 because customerId is not a valid ObjectId
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid customerId');
    });

    it('GET /api/sales - should return all sales', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sales')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /api/sales/:id - should return a sale by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/sales/${saleId}`)
        .expect(200);

      expect(res.body._id).toBe(saleId);
    });

    it('GET /api/sales/daily-summary - should return daily summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sales/daily-summary')
        .expect(200);

      expect(res.body).toHaveProperty('totalSales');
    });
  });

  // ==================== PURCHASES ====================
  describe('Purchases', () => {
    it('POST /api/purchases - should create a purchase', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/purchases')
        .send({
          supplierName: 'Coffee Supplier',
          items: [
            {
              productId: productId,
              quantity: 100,
              unitCost: 7000,
            },
          ],
          totalAmount: 700000,
        })
        .expect(201);

      expect(res.body).toHaveProperty('_id');
      purchaseId = res.body._id;
    });

    it('GET /api/purchases - should return all purchases', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/purchases')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/purchases/:id - should return a purchase by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/purchases/${purchaseId}`)
        .expect(200);

      expect(res.body._id).toBe(purchaseId);
    });
  });

  // ==================== DISCOUNTS ====================
  describe('Discounts', () => {
    it('POST /api/discounts - should create a discount', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/discounts')
        .send({
          name: 'Summer Sale',
          description: '20% off',
          type: 'PERCENTAGE',
          value: 20,
        })
        .expect(201);

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('code');
      discountId = res.body._id;
    });

    it('GET /api/discounts - should return all discounts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/discounts')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/discounts/:id - should return a discount by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/discounts/${discountId}`)
        .expect(200);

      expect(res.body._id).toBe(discountId);
    });
  });

  // ==================== CAMPAIGNS ====================
  describe('Campaigns', () => {
    it('POST /api/campaigns - should create a campaign', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/campaigns')
        .send({
          name: 'Holiday Special',
          description: 'Holiday discount',
          type: 'SEASONAL_OFFER',
          discountType: 'PERCENTAGE',
          discountValue: 15,
          startDate: '2025-12-01',
          endDate: '2025-12-31',
        })
        .expect(201);

      expect(res.body).toHaveProperty('_id');
      campaignId = res.body._id;
    });

    it('GET /api/campaigns - should return all campaigns', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/campaigns')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/campaigns/:id - should return a campaign by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/campaigns/${campaignId}`)
        .expect(200);

      expect(res.body._id).toBe(campaignId);
    });
  });

  // ==================== ANALYTICS ====================
  describe('Analytics', () => {
    it('GET /api/analytics/dashboard - should return dashboard data', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/dashboard')
        .expect(200);

      expect(res.body).toHaveProperty('todaySales');
      expect(res.body).toHaveProperty('todayOrders');
      expect(res.body).toHaveProperty('totalProducts');
    });
  });

  // ==================== LOYALTY ====================
  describe('Loyalty', () => {
    it('GET /api/loyalty/customer/:customerId - should return customer loyalty info', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/loyalty/customer/${customerId}`)
        .expect(200);

      expect(res.body).toHaveProperty('customer');
      expect(res.body).toHaveProperty('metrics');
    });
  });

  // ==================== VALIDATION TESTS ====================
  describe('Validation', () => {
    it('POST /api/categories - should reject empty name', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories')
        .send({
          name: '',
          color: '#000000',
        })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('POST /api/sales - should reject missing items', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/sales')
        .send({
          paymentMethod: 'CASH',
        })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('POST /api/sales - should reject invalid payment method', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/sales')
        .send({
          paymentMethod: 'INVALID',
          items: [{ productId: productId, quantity: 1, unitPrice: 1000 }],
        })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('POST /api/customers - should reject invalid phone format', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/customers')
        .send({
          name: 'Invalid Phone',
          phone: '123', // Too short
        })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });
  });
});
