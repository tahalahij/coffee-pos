import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('LoyaltyController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdCustomer: any;

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
        name: 'Loyalty Test Customer',
        phone: '+2222222222',
        email: 'loyalty@test.com',
        loyaltyPoints: 100,
        totalSpent: 250,
        loyaltyTier: 'SILVER',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/loyalty/customer/:customerId (GET)', () => {
    it('should return customer loyalty information', async () => {
      const response = await request(app.getHttpServer())
        .get(`/loyalty/customer/${createdCustomer.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('recentTransactions');
      expect(response.body.customer.id).toBe(createdCustomer.id);
      expect(response.body.customer.loyaltyPoints).toBe(createdCustomer.loyaltyPoints);
    });

    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .get(`/loyalty/customer/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/loyalty/customer/:customerId/points (POST)', () => {
    it('should add loyalty points to customer', async () => {
      const pointsData = {
        points: 50,
        type: 'EARNED',
        description: 'Test points earned',
      };

      const response = await request(app.getHttpServer())
        .post(`/loyalty/customer/${createdCustomer.id}/points`)
        .send(pointsData)
        .expect(201);

      expect(typeof response.body).toBe('number');
      expect(response.body).toBe(createdCustomer.loyaltyPoints + pointsData.points);
    });

    it('should return 400 for invalid points data', async () => {
      await request(app.getHttpServer())
        .post(`/loyalty/customer/${createdCustomer.id}/points`)
        .send({
          points: -1000, // Invalid negative points for EARNED type
          type: 'EARNED',
        })
        .expect(400);
    });
  });

  describe('/loyalty/customer/:customerId/redeem (POST)', () => {
    it('should redeem loyalty points', async () => {
      const redeemData = { points: 25 };

      const response = await request(app.getHttpServer())
        .post(`/loyalty/customer/${createdCustomer.id}/redeem`)
        .send(redeemData)
        .expect(201);

      expect(typeof response.body).toBe('number');
      expect(response.body).toBeLessThan(createdCustomer.loyaltyPoints + 50); // Previous points + earned - redeemed
    });

    it('should return 400 for insufficient points', async () => {
      await request(app.getHttpServer())
        .post(`/loyalty/customer/${createdCustomer.id}/redeem`)
        .send({ points: 10000 }) // More than available
        .expect(400);
    });
  });

  describe('/loyalty/customer/:customerId/bonus (POST)', () => {
    it('should award bonus points', async () => {
      const bonusData = {
        points: 100,
        reason: 'Test bonus points',
      };

      const response = await request(app.getHttpServer())
        .post(`/loyalty/customer/${createdCustomer.id}/bonus`)
        .send(bonusData)
        .expect(201);

      expect(typeof response.body).toBe('number');
    });
  });

  describe('/loyalty/customer/:customerId/history (GET)', () => {
    it('should return customer loyalty history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/loyalty/customer/${createdCustomer.id}/history`)
        .expect(200);

      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('tierThresholds');
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });
  });

  describe('/loyalty/customer/:customerId/tier (PATCH)', () => {
    it('should update customer loyalty tier', async () => {
      const tierData = { totalSpent: 1000 }; // Should upgrade to GOLD

      const response = await request(app.getHttpServer())
        .patch(`/loyalty/customer/${createdCustomer.id}/tier`)
        .send(tierData)
        .expect(200);

      expect(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).toContain(response.body);
    });
  });

  describe('/loyalty/stats (GET)', () => {
    it('should return loyalty program statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/loyalty/stats')
        .expect(200);

      expect(response.body).toHaveProperty('tierDistribution');
      expect(response.body).toHaveProperty('totalCustomers');
      expect(response.body).toHaveProperty('totalPointsIssued');
      expect(response.body).toHaveProperty('totalPointsRedeemed');
      expect(response.body).toHaveProperty('redemptionRate');
    });
  });

  describe('/loyalty/calculate-points (POST)', () => {
    it('should calculate loyalty points for amount', async () => {
      const calculateData = {
        customerId: createdCustomer.id,
        amount: 100,
      };

      const response = await request(app.getHttpServer())
        .post('/loyalty/calculate-points')
        .send(calculateData)
        .expect(201);

      expect(typeof response.body).toBe('number');
      expect(response.body).toBeGreaterThan(0);
    });
  });
});
