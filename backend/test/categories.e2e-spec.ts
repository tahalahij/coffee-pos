import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { testData } from './setup';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdCategory: any;

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

  describe('/categories (POST)', () => {
    it('should create a new category', async () => {
      // Use unique data to avoid conflicts
      const categoryData = {
        name: 'E2E Test Category',
        description: 'Category for e2e testing',
        color: '#FF6B35',
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(categoryData.name);
      expect(response.body.description).toBe(categoryData.description);
      expect(response.body.color).toBe(categoryData.color);
      expect(response.body.isActive).toBe(categoryData.isActive);

      createdCategory = response.body;
    });

    it('should return 400 for invalid category data', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: '', // Empty name should fail validation
          color: 'invalid-color',
        })
        .expect(400);
    });

    it('should return 409 for duplicate category name', async () => {
      const categoryData = testData.categories[0];

      await request(app.getHttpServer())
        .post('/categories')
        .send(categoryData)
        .expect(409);
    });
  });

  describe('/categories (GET)', () => {
    it('should return all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('/categories/:id (GET)', () => {
    it('should return a specific category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${createdCategory.id}`)
        .expect(200);

      expect(response.body.id).toBe(createdCategory.id);
      expect(response.body.name).toBe(createdCategory.name);
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .get(`/categories/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/categories/:id (PUT)', () => {
    it('should update a category', async () => {
      const updateData = {
        name: 'Updated Test Coffee',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .put(`/categories/${createdCategory.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 404 for updating non-existent category', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .put(`/categories/${nonExistentId}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('/categories/:id/toggle-active (PATCH)', () => {
    it('should toggle category active status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/categories/${createdCategory.id}/toggle-active`)
        .expect(200);

      expect(response.body.isActive).toBe(!createdCategory.isActive);
    });
  });

  describe('/categories/:id (DELETE)', () => {
    it('should return 400 when trying to delete category with products', async () => {
      // First create a product in this category
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 10.00,
          categoryId: createdCategory.id,
        },
      });

      await request(app.getHttpServer())
        .delete(`/categories/${createdCategory.id}`)
        .expect(400);

      // Clean up the product
      await prisma.product.delete({ where: { id: product.id } });
    });

    it('should delete a category without products', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${createdCategory.id}`)
        .expect(204);
    });

    it('should return 404 for deleting non-existent category', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .delete(`/categories/${nonExistentId}`)
        .expect(404);
    });
  });
});
