import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { testData } from './setup';

describe('CustomersController (e2e)', () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/customers (POST)', () => {
    it('should create a new customer', async () => {
      const customerData = testData.customers[0];

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(customerData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(customerData.name);
      expect(response.body.phone).toBe(customerData.phone);
      expect(response.body.email).toBe(customerData.email);
      expect(response.body.loyaltyPoints).toBe(0); // Should start with 0 points

      createdCustomer = response.body;
    });

    it('should return 400 for invalid customer data', async () => {
      await request(app.getHttpServer())
        .post('/customers')
        .send({
          name: '',
          phone: 'invalid-phone',
        })
        .expect(400);
    });

    it('should return 409 for duplicate phone number', async () => {
      const customerData = testData.customers[0];

      await request(app.getHttpServer())
        .post('/customers')
        .send(customerData)
        .expect(409);
    });
  });

  describe('/customers (GET)', () => {
    it('should return all customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('loyaltyTier');
    });
  });

  describe('/customers/search (GET)', () => {
    it('should search customers by query', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers/search')
        .query({ q: 'John' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const foundCustomer = response.body.find(c => c.name.includes('John'));
      expect(foundCustomer).toBeDefined();
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers/search')
        .query({ q: 'NonExistentCustomer' })
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('/customers/:id (GET)', () => {
    it('should return a specific customer', async () => {
      const response = await request(app.getHttpServer())
        .get(`/customers/${createdCustomer.id}`)
        .expect(200);

      expect(response.body.id).toBe(createdCustomer.id);
      expect(response.body.name).toBe(createdCustomer.name);
    });

    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .get(`/customers/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/customers/:id (PUT)', () => {
    it('should update a customer', async () => {
      const updateData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
      };

      const response = await request(app.getHttpServer())
        .put(`/customers/${createdCustomer.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(updateData.email);
    });
  });

  describe('/customers/:id/discount-codes (POST)', () => {
    it('should generate discount code for customer', async () => {
      const discountData = {
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        discountId: 'test-discount-id',
      };

      const response = await request(app.getHttpServer())
        .post(`/customers/${createdCustomer.id}/discount-codes`)
        .send(discountData)
        .expect(201);

      expect(response.body).toHaveProperty('code');
      expect(response.body.customerId).toBe(createdCustomer.id);
    });
  });

  describe('/customers/:id/discount-codes (GET)', () => {
    it('should get customer discount codes', async () => {
      const response = await request(app.getHttpServer())
        .get(`/customers/${createdCustomer.id}/discount-codes`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/customers/:id (DELETE)', () => {
    it('should delete a customer', async () => {
      await request(app.getHttpServer())
        .delete(`/customers/${createdCustomer.id}`)
        .expect(204);
    });

    it('should return 404 for deleting non-existent customer', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .delete(`/customers/${nonExistentId}`)
        .expect(404);
    });
  });
});
