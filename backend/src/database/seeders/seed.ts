import { Sequelize } from 'sequelize-typescript';
import {Category} from "../../categories/models/category.model";
import {Product} from "../../products/models/product.model";
import {Customer} from "../../customers/models/customer.model";
export async function seedDatabase(sequelize: Sequelize) {
  try {
    // Create categories
    const categories = await Category.bulkCreate([
      {
        name: 'Coffee',
        description: 'Hot and cold coffee drinks',
        color: '#8B4513',
        isActive: true,
      },
      {
        name: 'Tea',
        description: 'Various tea selections',
        color: '#228B22',
        isActive: true,
      },
      {
        name: 'Pastries',
        description: 'Fresh baked goods',
        color: '#DAA520',
        isActive: true,
      },
      {
        name: 'Sandwiches',
        description: 'Fresh sandwiches and wraps',
        color: '#CD853F',
        isActive: true,
      },
    ], { returning: true });

    console.log('Categories created:', categories.length);

    // Create products
    const products = await Product.bulkCreate([
      // Coffee products
      {
        name: 'Espresso',
        description: 'Rich and bold',
        price: 2.50,
        cost: 0.75,
        categoryId: categories[0].id,
        isAvailable: true,
        stock: 100,
        minStockLevel: 10,
      },
      {
        name: 'Cappuccino',
        description: 'Creamy foam topping',
        price: 3.75,
        cost: 1.25,
        categoryId: categories[0].id,
        isAvailable: true,
        stock: 100,
        minStockLevel: 10,
      },
      {
        name: 'Latte',
        description: 'Smooth and milky',
        price: 4.25,
        cost: 1.50,
        categoryId: categories[0].id,
        isAvailable: true,
        stock: 100,
        minStockLevel: 10,
      },
      {
        name: 'Americano',
        description: 'Simple black coffee',
        price: 3.00,
        cost: 1.00,
        categoryId: categories[0].id,
        isAvailable: true,
        stock: 100,
        minStockLevel: 10,
      },
      // Tea products
      {
        name: 'Green Tea',
        description: 'Fresh green tea',
        price: 2.25,
        cost: 0.50,
        categoryId: categories[1].id,
        isAvailable: true,
        stock: 50,
        minStockLevel: 5,
      },
      {
        name: 'Earl Grey',
        description: 'Classic black tea',
        price: 2.50,
        cost: 0.60,
        categoryId: categories[1].id,
        isAvailable: true,
        stock: 50,
        minStockLevel: 5,
      },
      // Pastries
      {
        name: 'Croissant',
        description: 'Buttery and flaky',
        price: 3.50,
        cost: 1.75,
        categoryId: categories[2].id,
        isAvailable: true,
        stock: 30,
        minStockLevel: 5,
      },
      {
        name: 'Blueberry Muffin',
        description: 'Fresh blueberry muffin',
        price: 2.75,
        cost: 1.25,
        categoryId: categories[2].id,
        isAvailable: true,
        stock: 25,
        minStockLevel: 5,
      },
      // Sandwiches
      {
        name: 'Club Sandwich',
        description: 'Turkey, bacon, lettuce, tomato',
        price: 8.50,
        cost: 4.25,
        categoryId: categories[3].id,
        isAvailable: true,
        stock: 20,
        minStockLevel: 3,
      },
      {
        name: 'Grilled Cheese',
        description: 'Classic grilled cheese sandwich',
        price: 5.50,
        cost: 2.75,
        categoryId: categories[3].id,
        isAvailable: true,
        stock: 25,
        minStockLevel: 5,
      },
    ]);

    console.log('Products created:', products.length);

    // Create sample customers
    const customers = await Customer.bulkCreate([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        loyaltyPoints: 100,
        totalSpent: 45.50,
        isActive: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        loyaltyPoints: 250,
        totalSpent: 125.75,
        isActive: true,
      },
      {
        name: 'Bob Johnson',
        phone: '+1234567892',
        loyaltyPoints: 50,
        totalSpent: 23.25,
        isActive: true,
      },
    ]);

    console.log('Customers created:', customers.length);
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
