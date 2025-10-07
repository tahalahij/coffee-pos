'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing fields to customers table to match Prisma schema
    await queryInterface.addColumn('customers', 'visit_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('customers', 'last_visit', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('customers', 'loyalty_tier', {
      type: Sequelize.ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'),
      allowNull: false,
      defaultValue: 'BRONZE'
    });

    // Add missing fields to products table to match Prisma schema
    await queryInterface.addColumn('products', 'low_stock_alert', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Add missing fields to sales table to match Prisma schema
    await queryInterface.addColumn('sales', 'loyalty_points_used', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('sales', 'loyalty_points_earned', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('sales', 'campaign_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'campaigns',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('sales', 'discount_code_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Add indexes for new columns
    await queryInterface.addIndex('customers', ['loyalty_tier']);
    await queryInterface.addIndex('customers', ['visit_count']);
    await queryInterface.addIndex('products', ['low_stock_alert']);
    await queryInterface.addIndex('sales', ['campaign_id']);
    await queryInterface.addIndex('sales', ['loyalty_points_earned']);
  },

  async down(queryInterface, Sequelize) {
    // Remove added columns
    await queryInterface.removeColumn('sales', 'discount_code_id');
    await queryInterface.removeColumn('sales', 'campaign_id');
    await queryInterface.removeColumn('sales', 'loyalty_points_earned');
    await queryInterface.removeColumn('sales', 'loyalty_points_used');
    await queryInterface.removeColumn('products', 'low_stock_alert');
    await queryInterface.removeColumn('customers', 'loyalty_tier');
    await queryInterface.removeColumn('customers', 'last_visit');
    await queryInterface.removeColumn('customers', 'visit_count');
  }
};
