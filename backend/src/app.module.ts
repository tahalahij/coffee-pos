import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { PurchasesModule } from './purchases/purchases.module';
import { DiscountsModule } from './discounts/discounts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CustomersModule } from './customers/customers.module';
import { LoggerMiddleware } from './logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    PrismaModule,
    CustomersModule,
    CategoriesModule,
    ProductsModule,
    SalesModule,
    PurchasesModule,
    DiscountsModule,
    AnalyticsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
