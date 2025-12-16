import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sale, SaleSchema } from '../sales/models/sale.model';
import { Product, ProductSchema } from '../products/models/product.model';
import { Customer, CustomerSchema } from '../customers/models/customer.model';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Sale.name, schema: SaleSchema },
    { name: Product.name, schema: ProductSchema },
    { name: Customer.name, schema: CustomerSchema },
  ])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
