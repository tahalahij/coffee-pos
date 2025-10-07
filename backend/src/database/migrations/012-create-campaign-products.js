'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_products', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'campaigns',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
