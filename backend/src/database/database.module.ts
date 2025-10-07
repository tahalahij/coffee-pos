import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Category } from '../categories/models/category.model';
import { Product } from '../products/models/product.model';
import { Customer } from '../customers/models/customer.model';
import { Sale } from '../sales/models/sale.model';
import { SaleItem } from '../sales/models/sale-item.model';
import { Purchase } from '../purchases/models/purchase.model';
import { PurchaseItem } from '../purchases/models/purchase-item.model';
import { DiscountCode } from '../discounts/models/discount-code.model';
import { Campaign } from '../campaigns/models/campaign.model';
import { CampaignProduct } from '../campaigns/models/campaign-product.model';
import { CampaignParticipation } from '../campaigns/models/campaign-participation.model';
import { LoyaltyTransaction } from '../loyalty/models/loyalty-transaction.model';
import { Notification } from '../notifications/models/notification.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('DB_PASSWORD') || '',
        database: configService.get('DB_NAME') || 'cafe_pos',
        models: [Category, Product, Customer, Sale, SaleItem, Purchase, PurchaseItem, DiscountCode, Campaign, CampaignProduct, CampaignParticipation, LoyaltyTransaction, Notification],
        autoLoadModels: true,
        synchronize: true, // Enable synchronization to create tables
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
