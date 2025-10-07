import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sale } from '../sales/models/sale.model';
import { Product } from '../products/models/product.model';
import { SaleItem } from '../sales/models/sale-item.model';
import { Customer } from '../customers/models/customer.model';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [SequelizeModule.forFeature([Sale, Product, SaleItem, Customer])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
