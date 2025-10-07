'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing min_stock_level column to products table
    await queryInterface.addColumn('products', 'min_stock_level', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Add missing discount_campaign_id column to sales table
    await queryInterface.addColumn('sales', 'discount_campaign_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the columns if rolling back
    await queryInterface.removeColumn('products', 'min_stock_level');
    await queryInterface.removeColumn('sales', 'discount_campaign_id');
  }
};
