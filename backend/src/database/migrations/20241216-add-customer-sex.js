'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column already exists
    const tableInfo = await queryInterface.describeTable('customers');
    if (!tableInfo.sex) {
      // Add sex column to customers table
      await queryInterface.addColumn('customers', 'sex', {
        type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER'),
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if column exists before removing
    const tableInfo = await queryInterface.describeTable('customers');
    if (tableInfo.sex) {
      // Remove sex column
      await queryInterface.removeColumn('customers', 'sex');
    }
    
    // Drop the enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_customers_sex";');
  }
};
