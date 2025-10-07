'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create all enums first as they're referenced by tables
    await queryInterface.sequelize.query(`
      CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'DIGITAL');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "SaleStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'RECEIVED', 'CANCELLED');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "LoyaltyTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTED', 'BONUS', 'SIGNUP_BONUS', 'REFERRAL_BONUS');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "CampaignType" AS ENUM ('LOYALTY_BONUS', 'PRODUCT_DISCOUNT', 'CATEGORY_DISCOUNT', 'BULK_DISCOUNT', 'SEASONAL', 'FLASH_SALE', 'CUSTOMER_TIER', 'REFERRAL', 'WELCOME');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "NotificationType" AS ENUM ('PROMOTION', 'LOYALTY', 'CAMPAIGN', 'SYSTEM', 'REMINDER');
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop enums in reverse order
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "NotificationType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "DiscountType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "CampaignStatus";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "CampaignType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "LoyaltyTransactionType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "LoyaltyTier";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "PurchaseStatus";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "SaleStatus";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "PaymentMethod";');
  }
};
