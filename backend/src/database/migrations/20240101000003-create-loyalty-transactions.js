'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create loyalty_transactions table
    await queryInterface.createTable('loyalty_transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
        type: Sequelize.ENUM('EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTED', 'BONUS', 'SIGNUP_BONUS', 'REFERRAL_BONUS'),
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
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('loyalty_transactions', ['customer_id']);
    await queryInterface.addIndex('loyalty_transactions', ['type']);
    await queryInterface.addIndex('loyalty_transactions', ['sale_id']);
    await queryInterface.addIndex('loyalty_transactions', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('loyalty_transactions');
  }
};
