'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add starts_at column to discount_codes
    await queryInterface.addColumn('discount_codes', 'starts_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add product_restricted flag to discount_codes
    await queryInterface.addColumn('discount_codes', 'product_restricted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // Create discount_code_products junction table
    await queryInterface.createTable('discount_code_products', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      discount_code_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'discount_codes',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for the junction table
    await queryInterface.addIndex('discount_code_products', ['discount_code_id']);
    await queryInterface.addIndex('discount_code_products', ['product_id']);
    await queryInterface.addIndex('discount_code_products', ['discount_code_id', 'product_id'], {
      unique: true,
      name: 'discount_code_products_unique',
    });

    // Add index for starts_at
    await queryInterface.addIndex('discount_codes', ['starts_at']);
  },

  async down(queryInterface, Sequelize) {
    // Drop the junction table
    await queryInterface.dropTable('discount_code_products');

    // Remove the columns from discount_codes
    await queryInterface.removeColumn('discount_codes', 'starts_at');
    await queryInterface.removeColumn('discount_codes', 'product_restricted');
  },
};
