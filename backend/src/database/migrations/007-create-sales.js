'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      receipt_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      customer_id: {
        type: Sequelize.UUID,
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
        type: Sequelize.ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'),
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
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'campaigns',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      discount_code_id: {
        type: Sequelize.UUID,
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
    await queryInterface.addIndex('sales', ['receipt_number']);
    await queryInterface.addIndex('sales', ['customer_id']);
    await queryInterface.addIndex('sales', ['status']);
    await queryInterface.addIndex('sales', ['payment_method']);
    await queryInterface.addIndex('sales', ['campaign_id']);
    await queryInterface.addIndex('sales', ['discount_code_id']);
    await queryInterface.addIndex('sales', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sales');
  }
};
