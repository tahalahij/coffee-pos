'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loyalty_transactions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      customer_id: {
        type: Sequelize.UUID,
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
        type: Sequelize.UUID,
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
    await queryInterface.addIndex('loyalty_transactions', ['customer_id']);
    await queryInterface.addIndex('loyalty_transactions', ['type']);
    await queryInterface.addIndex('loyalty_transactions', ['sale_id']);
    await queryInterface.addIndex('loyalty_transactions', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('loyalty_transactions');
  }
};
