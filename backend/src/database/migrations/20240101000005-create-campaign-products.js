'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create campaign_products junction table
    await queryInterface.createTable('campaign_products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'campaigns',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add unique constraint and indexes
    await queryInterface.addConstraint('campaign_products', {
      fields: ['campaign_id', 'product_id'],
      type: 'unique',
      name: 'unique_campaign_product'
    });

    await queryInterface.addIndex('campaign_products', ['campaign_id']);
    await queryInterface.addIndex('campaign_products', ['product_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaign_products');
  }
};
