import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AnalyticsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdCustomer: any;
  let createdCategory: any;
  let createdProduct: any;
  let createdSale: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create test data for analytics
    createdCustomer = await prisma.customer.create({
      data: {
        name: 'Analytics Test Customer',
        phone: '+4444444444',
        email: 'analytics@test.com',
      },
    });

    createdCategory = await prisma.category.create({
      data: {
        name: 'Analytics Test Category',
        color: '#00FF00',
        isActive: true,
      },
    });

    createdProduct = await prisma.product.create({
      data: {
        name: 'Analytics Test Product',
        price: 15.00,
        cost: 5.00,
        stock: 100,
        categoryId: createdCategory.id,
        isAvailable: true,
      },
    });

    // Create a sale for analytics
    createdSale = await prisma.sale.create({
      data: {
        receiptNumber: `TEST-${Date.now()}`,
        customerId: createdCustomer.id,
        subtotal: 15.00,
        totalAmount: 15.00,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
      },
    });

    await prisma.saleItem.create({
      data: {
        saleId: createdSale.id,
        productId: createdProduct.id,
        quantity: 1,
        unitPrice: 15.00,
        totalAmount: 15.00,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/analytics/dashboard (GET)', () => {
    it('should return dashboard analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/dashboard')
        .expect(200);

      expect(response.body).toHaveProperty('todaySales');
      expect(response.body).toHaveProperty('todayOrders');
      expect(response.body).toHaveProperty('monthSales');
      expect(response.body).toHaveProperty('monthOrders');
      expect(response.body).toHaveProperty('totalProducts');
      expect(response.body).toHaveProperty('lowStockProducts');
      expect(response.body).toHaveProperty('recentSales');

      expect(typeof response.body.todaySales).toBe('number');
      expect(typeof response.body.todayOrders).toBe('number');
      expect(Array.isArray(response.body.recentSales)).toBe(true);
    });
  });

  describe('/analytics/sales/:period (GET)', () => {
    it('should return today sales analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/sales/today')
        .expect(200);

      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('hourlyBreakdown');
      expect(Array.isArray(response.body.hourlyBreakdown)).toBe(true);
    });

    it('should return week sales analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/sales/week')
        .expect(200);

      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('dailyBreakdown');
      expect(Array.isArray(response.body.dailyBreakdown)).toBe(true);
    });

    it('should return month sales analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/sales/month')
        .expect(200);

      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('dailyBreakdown');
      expect(Array.isArray(response.body.dailyBreakdown)).toBe(true);
    });

    it('should return 400 for invalid period', async () => {
      await request(app.getHttpServer())
        .get('/analytics/sales/invalid')
        .expect(400);
    });
  });

  describe('/analytics/products/top (GET)', () => {
    it('should return top selling products', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/products/top')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should limit results when specified', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/products/top')
        .query({ limit: '5' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });
  });

  describe('/analytics/customers/top (GET)', () => {
    it('should return top customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/customers/top')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/analytics/revenue/trends (GET)', () => {
    it('should return revenue trends', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/revenue/trends')
        .expect(200);

      expect(response.body).toHaveProperty('daily');
      expect(response.body).toHaveProperty('weekly');
      expect(response.body).toHaveProperty('monthly');
      expect(Array.isArray(response.body.daily)).toBe(true);
    });
  });
});
