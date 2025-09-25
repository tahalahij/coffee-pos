import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { testData } from './setup';

describe('SalesController (e2e)', () => {
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

    // Create test data with unique values to avoid conflicts
    createdCustomer = await prisma.customer.create({
      data: {
        name: 'Sales Test Customer',
        phone: '+1111111111', // Unique phone number for sales tests
        email: 'sales@test.com',
        loyaltyTier: 'BRONZE',
        loyaltyPoints: 50,
        totalSpent: 100,
        visitCount: 5,
      },
    });

    createdCategory = await prisma.category.create({
      data: {
        name: 'Sales Test Category',
        description: 'Category for sales testing',
        color: '#FF5733',
        isActive: true,
      },
    });

    createdProduct = await prisma.product.create({
      data: {
        name: 'Sales Test Product',
        description: 'Product for sales testing',
        price: 15.99,
        cost: 8.50,
        stock: 100,
        categoryId: createdCategory.id,
        isAvailable: true,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/sales (POST)', () => {
    it('should create a new sale', async () => {
      const saleData = {
        customerId: createdCustomer.id,
        items: [
          {
            productId: createdProduct.id,
            quantity: 2,
            unitPrice: createdProduct.price,
          },
        ],
        subtotal: Number(createdProduct.price) * 2,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: Number(createdProduct.price) * 2,
        paymentMethod: 'CASH',
        cashReceived: Number(createdProduct.price) * 2 + 5,
        changeGiven: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/sales')
        .send(saleData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('receiptNumber');
      expect(response.body.customerId).toBe(createdCustomer.id);
      expect(response.body.totalAmount).toBe(saleData.totalAmount.toString());
      expect(response.body.status).toBe('COMPLETED');

      createdSale = response.body;
    });

    it('should return 400 for invalid sale data', async () => {
      await request(app.getHttpServer())
        .post('/sales')
        .send({
          items: [],
          totalAmount: -10,
        })
        .expect(400);
    });
  });

  describe('/sales (GET)', () => {
    it('should return all sales with customer and items', async () => {
      const response = await request(app.getHttpServer())
        .get('/sales')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('receiptNumber');
      expect(response.body[0]).toHaveProperty('customer');
      expect(response.body[0]).toHaveProperty('items');
    });
  });

  describe('/sales/:id (GET)', () => {
    it('should return a specific sale', async () => {
      const response = await request(app.getHttpServer())
        .get(`/sales/${createdSale.id}`)
        .expect(200);

      expect(response.body.id).toBe(createdSale.id);
      expect(response.body.receiptNumber).toBe(createdSale.receiptNumber);
    });

    it('should return 404 for non-existent sale', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .get(`/sales/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/sales/stats/today (GET)', () => {
    it('should return today\'s sales statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/sales/stats/today')
        .expect(200);

      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('averageOrderValue');
      expect(typeof response.body.totalSales).toBe('number');
      expect(typeof response.body.totalOrders).toBe('number');
    });
  });

  describe('/sales/:id/status (PATCH)', () => {
    it('should update sale status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/sales/${createdSale.id}/status`)
        .send({ status: 'REFUNDED' })
        .expect(200);

      expect(response.body.status).toBe('REFUNDED');
    });

    it('should return 400 for invalid status', async () => {
      await request(app.getHttpServer())
        .patch(`/sales/${createdSale.id}/status`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  describe('/sales/receipt/:receiptNumber (GET)', () => {
    it('should return sale by receipt number', async () => {
      const response = await request(app.getHttpServer())
        .get(`/sales/receipt/${createdSale.receiptNumber}`)
        .expect(200);

      expect(response.body.id).toBe(createdSale.id);
      expect(response.body.receiptNumber).toBe(createdSale.receiptNumber);
    });

    it('should return 404 for non-existent receipt number', async () => {
      await request(app.getHttpServer())
        .get('/sales/receipt/NON-EXISTENT-RECEIPT')
        .expect(404);
    });
  });
});
