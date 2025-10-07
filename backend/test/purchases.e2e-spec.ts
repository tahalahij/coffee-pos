import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('PurchasesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdCategory: any;
  let createdProduct: any;
  let createdPurchase: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create test data
    createdCategory = await prisma.category.create({
      data: {
        name: 'Purchase Test Category',
        color: '#0000FF',
        isActive: true,
      },
    });

    createdProduct = await prisma.product.create({
      data: {
        name: 'Purchase Test Product',
        price: 20.00,
        cost: 8.00,
        stock: 50,
        categoryId: createdCategory.id,
        isAvailable: true,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/purchases (POST)', () => {
    it('should create a new purchase', async () => {
      const purchaseData = {
        supplierName: 'Test Supplier Co.',
        supplierContact: 'supplier@test.com',
        items: [
          {
            productId: createdProduct.id,
            quantity: 20,
            unitCost: 8.00,
          },
        ],
        notes: 'Test purchase order',
      };

      const response = await request(app.getHttpServer())
        .post('/purchases')
        .send(purchaseData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.supplierName).toBe(purchaseData.supplierName);
      expect(response.body.supplierContact).toBe(purchaseData.supplierContact);
      expect(response.body.totalAmount).toBe('160.00'); // 20 * 8.00
      expect(response.body.status).toBe('PENDING');
      expect(response.body.items).toHaveLength(1);

      createdPurchase = response.body;
    });

    it('should return 400 for invalid purchase data', async () => {
      await request(app.getHttpServer())
        .post('/purchases')
        .send({
          supplierName: '',
          items: [], // Empty items should fail
        })
        .expect(400);
    });
  });

  describe('/purchases (GET)', () => {
    it('should return all purchases with items', async () => {
      const response = await request(app.getHttpServer())
        .get('/purchases')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('supplierName');
      expect(response.body[0]).toHaveProperty('items');
    });
  });

  describe('/purchases/:id (GET)', () => {
    it('should return a specific purchase', async () => {
      const response = await request(app.getHttpServer())
        .get(`/purchases/${createdPurchase.id}`)
        .expect(200);

      expect(response.body.id).toBe(createdPurchase.id);
      expect(response.body.supplierName).toBe(createdPurchase.supplierName);
      expect(response.body.items).toHaveLength(1);
    });

    it('should return 404 for non-existent purchase', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .get(`/purchases/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/purchases/:id (PUT)', () => {
    it('should update a purchase', async () => {
      const updateData = {
        supplierName: 'Updated Supplier Co.',
        supplierContact: 'updated@supplier.com',
        notes: 'Updated purchase notes',
      };

      const response = await request(app.getHttpServer())
        .put(`/purchases/${createdPurchase.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.supplierName).toBe(updateData.supplierName);
      expect(response.body.supplierContact).toBe(updateData.supplierContact);
      expect(response.body.notes).toBe(updateData.notes);
    });
  });

  describe('/purchases/:id/status (PATCH)', () => {
    it('should update purchase status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/purchases/${createdPurchase.id}/status`)
        .send({ status: 'RECEIVED' })
        .expect(200);

      expect(response.body.status).toBe('RECEIVED');
      expect(response.body.receivedAt).toBeDefined();
    });

    it('should return 400 for invalid status', async () => {
      await request(app.getHttpServer())
        .patch(`/purchases/${createdPurchase.id}/status`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  describe('/purchases/:id/receive (POST)', () => {
    it('should receive purchase and update product stock', async () => {
      // Ensure the product still exists (in case global cleanup affected it)
      let testProduct = await prisma.product.findUnique({
        where: { id: createdProduct.id },
      });

      // If product was deleted by global cleanup, recreate it
      if (!testProduct) {
        // Ensure category exists too
        let testCategory = await prisma.category.findUnique({
          where: { id: createdCategory.id },
        });

        if (!testCategory) {
          testCategory = await prisma.category.create({
            data: {
              name: 'Purchase Test Category',
              color: '#0000FF',
              isActive: true,
            },
          });
          createdCategory = testCategory;
        }

        testProduct = await prisma.product.create({
          data: {
            name: 'Purchase Test Product',
            price: 20.00,
            cost: 8.00,
            stock: 50,
            categoryId: testCategory.id,
            isAvailable: true,
          },
        });
        createdProduct = testProduct;
      }

      // First create a new purchase to receive
      const newPurchase = await prisma.purchase.create({
        data: {
          supplierName: 'Stock Test Supplier',
          totalAmount: 160.00,
          status: 'PENDING',
        },
      });

      await prisma.purchaseItem.create({
        data: {
          purchaseId: newPurchase.id,
          productId: testProduct.id,
          quantity: 25,
          unitCost: 8.00,
          totalCost: 200.00,
        },
      });

      // Get initial stock
      const initialProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });

      const response = await request(app.getHttpServer())
        .post(`/purchases/${newPurchase.id}/receive`)
        .expect(200);

      expect(response.body.status).toBe('RECEIVED');

      // Verify stock was updated
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });

      expect(updatedProduct.stock).toBe(initialProduct.stock + 25);
    });

    it('should return 400 for already received purchase', async () => {
      // Try to receive the same purchase again
      await request(app.getHttpServer())
        .post(`/purchases/${createdPurchase.id}/receive`)
        .expect(400);
    });
  });

  describe('/purchases/stats (GET)', () => {
    it('should return purchase statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/purchases/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalPurchases');
      expect(response.body).toHaveProperty('pendingPurchases');
      expect(response.body).toHaveProperty('receivedPurchases');
      expect(response.body).toHaveProperty('totalAmount');
      expect(typeof response.body.totalPurchases).toBe('number');
    });
  });

  describe('/purchases/:id (DELETE)', () => {
    it('should return 400 when trying to delete received purchase', async () => {
      await request(app.getHttpServer())
        .delete(`/purchases/${createdPurchase.id}`)
        .expect(400);
    });

    it('should delete a pending purchase', async () => {
      // Create a pending purchase to delete
      const pendingPurchase = await prisma.purchase.create({
        data: {
          supplierName: 'Delete Test Supplier',
          totalAmount: 50.00,
          status: 'PENDING',
        },
      });

      await request(app.getHttpServer())
        .delete(`/purchases/${pendingPurchase.id}`)
        .expect(204);
    });

    it('should return 404 for deleting non-existent purchase', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .delete(`/purchases/${nonExistentId}`)
        .expect(404);
    });
  });
});
