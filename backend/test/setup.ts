import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Clean up database before running tests
  await prisma.$connect();

  // Clear all tables in correct order to avoid foreign key constraints
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.campaignProduct.deleteMany();
  await prisma.campaignParticipation.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.discountCode.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Global test data
export const testData = {
  categories: [
    {
      name: 'Test Coffee',
      description: 'Test coffee category',
      color: '#8B4513',
      isActive: true,
    },
    {
      name: 'Test Pastries',
      description: 'Test pastries category',
      color: '#DAA520',
      isActive: true,
    },
  ],
  products: [
    {
      name: 'Test Espresso',
      description: 'Test espresso product',
      price: 2.50,
      cost: 0.75,
      stock: 100,
      lowStockAlert: 20,
      isAvailable: true,
    },
    {
      name: 'Test Croissant',
      description: 'Test croissant product',
      price: 3.50,
      cost: 1.20,
      stock: 50,
      lowStockAlert: 10,
      isAvailable: true,
    },
  ],
  customers: [
    {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
    },
    {
      name: 'Jane Smith',
      phone: '+0987654321',
      email: 'jane@example.com',
    },
  ],
};
