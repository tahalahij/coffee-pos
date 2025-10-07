'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create campaign_products table
    await queryInterface.createTable('campaign_products', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
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
      }
    });

    // Create campaign_participations table
    await queryInterface.createTable('campaign_participations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
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
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create notifications table
    await queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('CAMPAIGN', 'LOYALTY_REWARD', 'BIRTHDAY', 'LOW_POINTS', 'SPECIAL_OFFER', 'GENERAL'),
        allowNull: false
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add unique constraints and indexes
    await queryInterface.addConstraint('campaign_products', {
      fields: ['campaign_id', 'product_id'],
      type: 'unique',
      name: 'unique_campaign_product'
    });

    await queryInterface.addConstraint('campaign_participations', {
      fields: ['campaign_id', 'customer_id'],
      type: 'unique',
      name: 'unique_campaign_participation'
    });

    // Add indexes
    await queryInterface.addIndex('campaign_products', ['campaign_id']);
    await queryInterface.addIndex('campaign_products', ['product_id']);
    await queryInterface.addIndex('campaign_participations', ['campaign_id']);
    await queryInterface.addIndex('campaign_participations', ['customer_id']);
    await queryInterface.addIndex('notifications', ['customer_id']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['is_read']);
    await queryInterface.addIndex('notifications', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('campaign_participations');
    await queryInterface.dropTable('campaign_products');
  }
};