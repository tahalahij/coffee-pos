import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('DiscountsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdCustomer: any;
  let createdDiscountCode: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create test customer
    createdCustomer = await prisma.customer.create({
      data: {
        name: 'Discount Test Customer',
        phone: '+3333333333',
        email: 'discount@test.com',
        loyaltyTier: 'GOLD',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/discounts/codes (POST)', () => {
    it('should create a new discount code', async () => {
      const discountCodeData = {
        name: 'Test Discount Code',
        description: 'Test discount for E2E testing',
        type: 'PERCENTAGE',
        value: 20,
        minPurchase: 30,
        maxDiscount: 50,
        usageLimit: 10,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/discounts/codes')
        .send(discountCodeData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('code');
      expect(response.body.name).toBe(discountCodeData.name);
      expect(response.body.type).toBe(discountCodeData.type);
      expect(response.body.value).toBe(discountCodeData.value.toString());
      expect(response.body.isActive).toBe(true);

      createdDiscountCode = response.body;
    });

    it('should return 400 for invalid discount code data', async () => {
      await request(app.getHttpServer())
        .post('/discounts/codes')
        .send({
          type: 'PERCENTAGE',
          value: 150, // Invalid percentage > 100
        })
        .expect(400);
    });
  });

  describe('/discounts/codes/all (GET)', () => {
    it('should return all discount codes', async () => {
      const response = await request(app.getHttpServer())
        .get('/discounts/codes/all')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('code');
    });

    it('should filter by customer ID', async () => {
      // Create a customer-specific discount code
      const customerCode = await prisma.discountCode.create({
        data: {
          code: 'CUSTOMER-SPECIFIC',
          type: 'FIXED_AMOUNT',
          value: 10,
          customerId: createdCustomer.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/discounts/codes/all')
        .query({ customerId: createdCustomer.id })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const foundCode = response.body.find(code => code.customerId === createdCustomer.id);
      expect(foundCode).toBeDefined();
    });
  });

  describe('/discounts/codes/:code/validate (GET)', () => {
    it('should validate a discount code', async () => {
      const response = await request(app.getHttpServer())
        .get(`/discounts/codes/${createdDiscountCode.code}/validate`)
        .query({
          customerId: createdCustomer.id,
          subtotal: '50'
        })
        .expect(200);

      expect(response.body.id).toBe(createdDiscountCode.id);
      expect(response.body.code).toBe(createdDiscountCode.code);
    });

    it('should return 400 for expired discount code', async () => {
      // Create expired discount code
      const expiredCode = await prisma.discountCode.create({
        data: {
          code: 'EXPIRED-CODE',
          type: 'PERCENTAGE',
          value: 10,
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
      });

      await request(app.getHttpServer())
        .get(`/discounts/codes/${expiredCode.code}/validate`)
        .expect(400);
    });

    it('should return 400 for minimum purchase not met', async () => {
      await request(app.getHttpServer())
        .get(`/discounts/codes/${createdDiscountCode.code}/validate`)
        .query({ subtotal: '10' }) // Below minimum purchase
        .expect(400);
    });
  });

  describe('/discounts/codes/:code/apply (POST)', () => {
    it('should apply discount code and calculate discount', async () => {
      const applyData = {
        subtotal: 100,
        customerId: createdCustomer.id,
      };

      const response = await request(app.getHttpServer())
        .post(`/discounts/codes/${createdDiscountCode.code}/apply`)
        .send(applyData)
        .expect(201);

      expect(response.body).toHaveProperty('discountAmount');
      expect(response.body).toHaveProperty('discountCodeId');
      expect(response.body.code).toBe(createdDiscountCode.code);
      expect(response.body.discountAmount).toBeGreaterThan(0);
    });
  });

  describe('/discounts/codes/:code/use (POST)', () => {
    it('should increment usage count when using discount code', async () => {
      // Create a fresh discount code for this test to avoid interference from previous tests
      const freshDiscountCodeData = {
        name: 'Fresh Test Discount Code',
        description: 'Fresh discount code for usage test',
        type: 'PERCENTAGE',
        value: 15,
        usageLimit: 5,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/discounts/codes')
        .send(freshDiscountCodeData)
        .expect(201);

      const freshDiscountCode = createResponse.body;

      const response = await request(app.getHttpServer())
        .post(`/discounts/codes/${freshDiscountCode.code}/use`)
        .expect(201);

      // Verify usage count increased
      const updatedCode = await prisma.discountCode.findUnique({
        where: { code: freshDiscountCode.code },
      });
      expect(updatedCode.usageCount).toBe(1);
    });
  });

  describe('/discounts/codes/personalized/:customerId (POST)', () => {
    it('should generate personalized discount codes', async () => {
      const response = await request(app.getHttpServer())
        .post(`/discounts/codes/personalized/${createdCustomer.id}`)
        .send({ count: 2 })
        .expect(201);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('code');
      expect(response.body[0].customerId).toBe(createdCustomer.id);
    });
  });

  describe('/discounts/codes/bulk (POST)', () => {
    it('should create bulk discount codes', async () => {
      const bulkData = {
        prefix: 'BULK',
        count: 5,
        type: 'PERCENTAGE',
        value: 15,
        usageLimit: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/discounts/codes/bulk')
        .send(bulkData)
        .expect(201);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(5);
      expect(response.body[0].code).toMatch(/^BULK\d{4}$/);
    });
  });

  describe('/discounts/codes/customer/:customerId/history (GET)', () => {
    it('should return customer discount history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/discounts/codes/customer/${createdCustomer.id}/history`)
        .expect(200);

      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('personalCodes');
      expect(response.body).toHaveProperty('usageHistory');
      expect(response.body).toHaveProperty('totalSavings');
    });
  });

  describe('/discounts/stats (GET)', () => {
    it('should return discount statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/discounts/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalCodes');
      expect(response.body).toHaveProperty('activeCodes');
      expect(response.body).toHaveProperty('expiredCodes');
      expect(response.body).toHaveProperty('totalUsage');
      expect(response.body).toHaveProperty('redemptionRate');
    });
  });

  describe('/discounts/codes/cleanup (POST)', () => {
    it('should cleanup expired discount codes', async () => {
      const response = await request(app.getHttpServer())
        .post('/discounts/codes/cleanup')
        .expect(201);

      expect(response.body).toHaveProperty('deactivatedCount');
      expect(typeof response.body.deactivatedCount).toBe('number');
    });
  });
});
