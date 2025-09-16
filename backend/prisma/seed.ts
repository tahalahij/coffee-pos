import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables from .env file
config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Coffee',
        description: 'Hot and cold coffee drinks',
        color: '#8B4513',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tea',
        description: 'Various tea selections',
        color: '#228B22',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pastries',
        description: 'Fresh baked goods',
        color: '#DAA520',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sandwiches',
        description: 'Fresh sandwiches and wraps',
        color: '#CD853F',
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create products
  const products = await Promise.all([
    // Coffee products
    prisma.product.create({
      data: {
        name: 'Espresso',
        description: 'Rich and bold espresso shot',
        price: 2.50,
        cost: 0.75,
        categoryId: categories[0].id,
        stock: 100,
        lowStockAlert: 20,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and foam',
        price: 3.75,
        cost: 1.25,
        categoryId: categories[0].id,
        stock: 80,
        lowStockAlert: 15,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Latte',
        description: 'Smooth espresso with steamed milk',
        price: 4.25,
        cost: 1.50,
        categoryId: categories[0].id,
        stock: 90,
        lowStockAlert: 15,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Americano',
        description: 'Espresso with hot water',
        price: 3.00,
        cost: 0.85,
        categoryId: categories[0].id,
        stock: 120,
        lowStockAlert: 25,
      },
    }),
    // Tea products
    prisma.product.create({
      data: {
        name: 'Green Tea',
        description: 'Fresh organic green tea',
        price: 2.25,
        cost: 0.50,
        categoryId: categories[1].id,
        stock: 60,
        lowStockAlert: 10,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Earl Grey',
        description: 'Classic black tea with bergamot',
        price: 2.50,
        cost: 0.60,
        categoryId: categories[1].id,
        stock: 50,
        lowStockAlert: 10,
      },
    }),
    // Pastries
    prisma.product.create({
      data: {
        name: 'Croissant',
        description: 'Buttery and flaky croissant',
        price: 3.50,
        cost: 1.20,
        categoryId: categories[2].id,
        stock: 25,
        lowStockAlert: 5,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Blueberry Muffin',
        description: 'Fresh baked blueberry muffin',
        price: 2.75,
        cost: 1.00,
        categoryId: categories[2].id,
        stock: 30,
        lowStockAlert: 8,
      },
    }),
    // Sandwiches
    prisma.product.create({
      data: {
        name: 'Turkey Club',
        description: 'Turkey, bacon, lettuce, tomato on toasted bread',
        price: 8.50,
        cost: 3.50,
        categoryId: categories[3].id,
        stock: 15,
        lowStockAlert: 5,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Veggie Wrap',
        description: 'Fresh vegetables in a tortilla wrap',
        price: 7.25,
        cost: 2.75,
        categoryId: categories[3].id,
        stock: 20,
        lowStockAlert: 5,
      },
    }),
  ]);

  console.log('✅ Products created');

  // Create sample discounts
  const discounts = await Promise.all([
    prisma.discount.create({
      data: {
        name: 'Happy Hour',
        description: '10% off during happy hours',
        type: 'PERCENTAGE',
        value: 10,
        minAmount: 5.00,
        isActive: true,
      },
    }),
    prisma.discount.create({
      data: {
        name: 'Student Discount',
        description: '$2 off for students',
        type: 'FIXED_AMOUNT',
        value: 2.00,
        minAmount: 8.00,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Discounts created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
