import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { PurchasesModule } from './purchases/purchases.module';
import { DiscountsModule } from './discounts/discounts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CustomersModule } from './customers/customers.module';
import { LoggerMiddleware } from './logger.middleware';
import { CampaignsModule } from './campaigns/campaigns.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { DisplayModule } from './display/display.module';
import { GiftModule } from './gift/gift.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    DatabaseModule,
    CustomersModule,
    CategoriesModule,
    ProductsModule,
    SalesModule,
    PurchasesModule,
    DiscountsModule,
    AnalyticsModule,
    CampaignsModule,
    LoyaltyModule,
    DisplayModule,
    GiftModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
