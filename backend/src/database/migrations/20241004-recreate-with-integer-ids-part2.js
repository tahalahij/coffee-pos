'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create campaigns table
    await queryInterface.createTable('campaigns', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('PERCENTAGE_DISCOUNT', 'FIXED_DISCOUNT', 'BUY_ONE_GET_ONE', 'LOYALTY_BONUS', 'BIRTHDAY_SPECIAL', 'SEASONAL', 'NEW_CUSTOMER', 'RETURN_CUSTOMER'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'DRAFT'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      discount_type: {
        type: Sequelize.ENUM('PERCENTAGE', 'FIXED_AMOUNT'),
        allowNull: false
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      min_purchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      max_discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      usage_limit: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      usage_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      target_tier: {
        type: Sequelize.ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'),
        allowNull: true
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

    // Create discount_codes table
    await queryInterface.createTable('discount_codes', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('PERCENTAGE', 'FIXED_AMOUNT'),
        allowNull: false
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      min_purchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      max_discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      usage_limit: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      usage_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Create sales table
    await queryInterface.createTable('sales', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      receipt_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_method: {
        type: Sequelize.ENUM('CASH', 'CARD', 'DIGITAL'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'COMPLETED'
      },
      cash_received: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      change_given: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      loyalty_points_used: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      loyalty_points_earned: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'campaigns',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      discount_code_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'discount_codes',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      notes: {
        type: Sequelize.TEXT,
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

    // Add indexes
    await queryInterface.addIndex('campaigns', ['status']);
    await queryInterface.addIndex('campaigns', ['start_date', 'end_date']);
    await queryInterface.addIndex('discount_codes', ['code']);
    await queryInterface.addIndex('discount_codes', ['customer_id']);
    await queryInterface.addIndex('sales', ['receipt_number']);
    await queryInterface.addIndex('sales', ['customer_id']);
    await queryInterface.addIndex('sales', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sales');
    await queryInterface.dropTable('discount_codes');
    await queryInterface.dropTable('campaigns');
  }
};