'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop all existing tables if they exist
    const tables = [
      'notifications', 'campaign_participations', 'campaign_products', 
      'loyalty_transactions', 'purchase_items', 'purchases', 
      'sale_items', 'sales', 'discount_codes', 'campaigns', 
      'customers', 'products', 'categories'
    ];
    
    for (const table of tables) {
      await queryInterface.dropTable(table, { cascade: true }).catch(() => {});
    }

    // Create categories table
    await queryInterface.createTable('categories', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '#6B7280'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create products table
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      low_stock_alert: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      min_stock_level: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create customers table
    await queryInterface.createTable('customers', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: true
      },
      loyalty_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_spent: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      visit_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_visit: {
        type: Sequelize.DATE,
        allowNull: true
      },
      loyalty_tier: {
        type: Sequelize.ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'),
        allowNull: false,
        defaultValue: 'BRONZE'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('categories', ['name']);
    await queryInterface.addIndex('categories', ['is_active']);
    await queryInterface.addIndex('products', ['name']);
    await queryInterface.addIndex('products', ['category_id']);
    await queryInterface.addIndex('products', ['is_available']);
    await queryInterface.addIndex('customers', ['phone']);
    await queryInterface.addIndex('customers', ['email']);
    await queryInterface.addIndex('customers', ['loyalty_tier']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('customers');
    await queryInterface.dropTable('categories');
  }
};