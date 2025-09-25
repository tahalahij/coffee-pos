import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { testData } from './setup';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdCategory: any;
  let createdProduct: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create a category for products
    createdCategory = await prisma.category.create({
      data: testData.categories[0],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products (POST)', () => {
    it('should create a new product', async () => {
      const productData = {
        ...testData.products[0],
        categoryId: createdCategory.id,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(productData.name);
      expect(response.body.price).toBe(productData.price.toString());
      expect(response.body.categoryId).toBe(createdCategory.id);

      createdProduct = response.body;
    });

    it('should return 400 for invalid product data', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: '',
          price: -10,
        })
        .expect(400);
    });
  });

  describe('/products (GET)', () => {
    it('should return all products with category info', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('category');
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a specific product', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${createdProduct.id}`)
        .expect(200);

      expect(response.body.id).toBe(createdProduct.id);
      expect(response.body.name).toBe(createdProduct.name);
    });

    it('should return 404 for non-existent product', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .get(`/products/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/products/:id (PUT)', () => {
    it('should update a product', async () => {
      const updateData = {
        name: 'Updated Test Espresso',
        price: 3.00,
        stock: 150,
      };

      const response = await request(app.getHttpServer())
        .put(`/products/${createdProduct.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price.toString());
      expect(response.body.stock).toBe(updateData.stock);
    });
  });

  describe('/products/:id/stock (PATCH)', () => {
    it('should update product stock', async () => {
      const newStock = 200;

      const response = await request(app.getHttpServer())
        .patch(`/products/${createdProduct.id}/stock`)
        .send({ stock: newStock })
        .expect(200);

      expect(response.body.stock).toBe(newStock);
    });

    it('should return 400 for negative stock', async () => {
      await request(app.getHttpServer())
        .patch(`/products/${createdProduct.id}/stock`)
        .send({ stock: -10 })
        .expect(400);
    });
  });

  describe('/products/:id/toggle-availability (PATCH)', () => {
    it('should toggle product availability', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/products/${createdProduct.id}/toggle-availability`)
        .expect(200);

      expect(response.body.isAvailable).toBe(!createdProduct.isAvailable);
    });
  });

  describe('/products/low-stock (GET)', () => {
    it('should return products with low stock', async () => {
      // Set product stock below alert level
      await prisma.product.update({
        where: { id: createdProduct.id },
        data: { stock: 5, lowStockAlert: 10 },
      });

      const response = await request(app.getHttpServer())
        .get('/products/low-stock')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const lowStockProduct = response.body.find(p => p.id === createdProduct.id);
      expect(lowStockProduct).toBeDefined();
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should delete a product', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${createdProduct.id}`)
        .expect(204);
    });

    it('should return 404 for deleting non-existent product', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .delete(`/products/${nonExistentId}`)
        .expect(404);
    });
  });
});
