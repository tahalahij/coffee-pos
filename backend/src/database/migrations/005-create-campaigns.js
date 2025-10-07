'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaigns', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
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
        type: Sequelize.ENUM('LOYALTY_BONUS', 'PRODUCT_DISCOUNT', 'CATEGORY_DISCOUNT', 'BULK_DISCOUNT', 'SEASONAL', 'FLASH_SALE', 'CUSTOMER_TIER', 'REFERRAL', 'WELCOME'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'),
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

    // Add indexes
    await queryInterface.addIndex('campaigns', ['type']);
    await queryInterface.addIndex('campaigns', ['status']);
    await queryInterface.addIndex('campaigns', ['start_date', 'end_date']);
    await queryInterface.addIndex('campaigns', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaigns');
  }
};
