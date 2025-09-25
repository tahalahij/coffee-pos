import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('CampaignsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdCustomer: any;
  let createdCategory: any;
  let createdProduct: any;
  let createdCampaign: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create test data
    createdCustomer = await prisma.customer.create({
      data: {
        name: 'Campaign Test Customer',
        phone: '+1111111111',
        email: 'campaign@test.com',
        loyaltyTier: 'SILVER',
      },
    });

    createdCategory = await prisma.category.create({
      data: {
        name: 'Campaign Test Category',
        color: '#FF0000',
        isActive: true,
      },
    });

    createdProduct = await prisma.product.create({
      data: {
        name: 'Campaign Test Product',
        price: 10.00,
        categoryId: createdCategory.id,
        stock: 50,
        isAvailable: true,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/campaigns (POST)', () => {
    it('should create a new campaign', async () => {
      const campaignData = {
        name: 'Test Percentage Campaign',
        description: 'Test campaign for E2E testing',
        type: 'PERCENTAGE_DISCOUNT',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minPurchase: 25,
        usageLimit: 100,
        targetTier: 'SILVER',
        productIds: [createdProduct.id],
      };

      const response = await request(app.getHttpServer())
        .post('/campaigns')
        .send(campaignData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(campaignData.name);
      expect(response.body.type).toBe(campaignData.type);
      expect(response.body.discountValue).toBe(campaignData.discountValue.toString());
      expect(response.body.status).toBe('DRAFT');

      createdCampaign = response.body;
    });

    it('should return 400 for invalid campaign data', async () => {
      await request(app.getHttpServer())
        .post('/campaigns')
        .send({
          name: '',
          discountValue: -10,
          startDate: new Date(Date.now() + 10000).toISOString(),
          endDate: new Date().toISOString(), // End date before start date
        })
        .expect(400);
    });
  });

  describe('/campaigns (GET)', () => {
    it('should return all campaigns', async () => {
      const response = await request(app.getHttpServer())
        .get('/campaigns')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('products');
    });
  });

  describe('/campaigns/active (GET)', () => {
    it('should return active campaigns', async () => {
      // First activate the campaign
      await request(app.getHttpServer())
        .patch(`/campaigns/${createdCampaign.id}/activate`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/campaigns/active')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter campaigns by customer', async () => {
      const response = await request(app.getHttpServer())
        .get('/campaigns/active')
        .query({ customerId: createdCustomer.id })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/campaigns/:id (GET)', () => {
    it('should return a specific campaign', async () => {
      const response = await request(app.getHttpServer())
        .get(`/campaigns/${createdCampaign.id}`)
        .expect(200);

      expect(response.body.id).toBe(createdCampaign.id);
      expect(response.body.name).toBe(createdCampaign.name);
    });
  });

  describe('/campaigns/:id/apply (POST)', () => {
    it('should apply campaign discount', async () => {
      const applyData = {
        customerId: createdCustomer.id,
        subtotal: 50,
        productIds: [createdProduct.id],
      };

      const response = await request(app.getHttpServer())
        .post(`/campaigns/${createdCampaign.id}/apply`)
        .send(applyData)
        .expect(200);

      expect(response.body).toHaveProperty('discountAmount');
      expect(response.body.campaignId).toBe(createdCampaign.id);
      expect(response.body.discountAmount).toBeGreaterThan(0);
    });

    it('should return 400 for insufficient purchase amount', async () => {
      const applyData = {
        customerId: createdCustomer.id,
        subtotal: 10, // Below minimum purchase
        productIds: [createdProduct.id],
      };

      await request(app.getHttpServer())
        .post(`/campaigns/${createdCampaign.id}/apply`)
        .send(applyData)
        .expect(400);
    });
  });

  describe('/campaigns/recommendations/:customerId (GET)', () => {
    it('should return recommended campaigns for customer', async () => {
      const response = await request(app.getHttpServer())
        .get(`/campaigns/recommendations/${createdCustomer.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/campaigns/:id/analytics (GET)', () => {
    it('should return campaign analytics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/campaigns/${createdCampaign.id}/analytics`)
        .expect(200);

      expect(response.body).toHaveProperty('campaign');
      expect(response.body).toHaveProperty('performance');
      expect(response.body.campaign.id).toBe(createdCampaign.id);
    });
  });

  describe('/campaigns/:id/pause (PATCH)', () => {
    it('should pause a campaign', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/campaigns/${createdCampaign.id}/pause`)
        .expect(200);

      expect(response.body.status).toBe('PAUSED');
    });
  });
});
