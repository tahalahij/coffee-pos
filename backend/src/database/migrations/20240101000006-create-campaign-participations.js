'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create campaign_participations table
    await queryInterface.createTable('campaign_participations', {
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
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      usage_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.addConstraint('campaign_participations', {
      fields: ['campaign_id', 'customer_id'],
      type: 'unique',
      name: 'unique_campaign_customer'
    });

    await queryInterface.addIndex('campaign_participations', ['campaign_id']);
    await queryInterface.addIndex('campaign_participations', ['customer_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaign_participations');
  }
};
