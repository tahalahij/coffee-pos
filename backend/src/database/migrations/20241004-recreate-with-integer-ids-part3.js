'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create sale_items table
    await queryInterface.createTable('sale_items', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sales',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    });

    // Create purchases table
    await queryInterface.createTable('purchases', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      supplier_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      supplier_contact: {
        type: Sequelize.STRING,
        allowNull: true
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'RECEIVED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      received_at: {
        type: Sequelize.DATE,
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

    // Create purchase_items table
    await queryInterface.createTable('purchase_items', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      purchase_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'purchases',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unit_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    });

    // Create loyalty_transactions table
    await queryInterface.createTable('loyalty_transactions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('EARNED', 'REDEEMED', 'EXPIRED', 'BONUS', 'ADJUSTMENT'),
        allowNull: false
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sale_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sales',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('sale_items', ['sale_id']);
    await queryInterface.addIndex('sale_items', ['product_id']);
    await queryInterface.addIndex('purchases', ['status']);
    await queryInterface.addIndex('purchases', ['created_at']);
    await queryInterface.addIndex('purchase_items', ['purchase_id']);
    await queryInterface.addIndex('purchase_items', ['product_id']);
    await queryInterface.addIndex('loyalty_transactions', ['customer_id']);
    await queryInterface.addIndex('loyalty_transactions', ['type']);
    await queryInterface.addIndex('loyalty_transactions', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('loyalty_transactions');
    await queryInterface.dropTable('purchase_items');
    await queryInterface.dropTable('purchases');
    await queryInterface.dropTable('sale_items');
  }
};