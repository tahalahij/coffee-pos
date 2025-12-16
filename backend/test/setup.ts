import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Set environment variable for tests
  process.env.MONGODB_URI = uri;
  
  // Connect mongoose
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Cleanup
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
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
      price: 25000,
      cost: 7500,
      stock: 100,
      lowStockAlert: 20,
      isAvailable: true,
    },
    {
      name: 'Test Croissant',
      description: 'Test croissant product',
      price: 35000,
      cost: 12000,
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
