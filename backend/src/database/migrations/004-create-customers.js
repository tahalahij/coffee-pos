'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
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
    await queryInterface.addIndex('customers', ['phone']);
    await queryInterface.addIndex('customers', ['email']);
    await queryInterface.addIndex('customers', ['loyalty_tier']);
    await queryInterface.addIndex('customers', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customers');
  }
};
