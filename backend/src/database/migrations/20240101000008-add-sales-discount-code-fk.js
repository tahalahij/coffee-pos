'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint for discount_code_id in sales table
    // This needs to be done after discount_codes table is created
    await queryInterface.addConstraint('sales', {
      fields: ['discount_code_id'],
      type: 'foreign key',
      name: 'fk_sales_discount_code',
      references: {
        table: 'discount_codes',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Add index for the foreign key
    await queryInterface.addIndex('sales', ['discount_code_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('sales', 'fk_sales_discount_code');
  }
};
