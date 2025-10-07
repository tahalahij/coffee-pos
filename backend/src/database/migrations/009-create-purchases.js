'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchases', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
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

    // Add indexes
    await queryInterface.addIndex('purchases', ['supplier_name']);
    await queryInterface.addIndex('purchases', ['status']);
    await queryInterface.addIndex('purchases', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('purchases');
  }
};
