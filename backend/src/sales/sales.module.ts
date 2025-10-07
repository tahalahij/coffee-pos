import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sale } from './models/sale.model';
import { SaleItem } from './models/sale-item.model';
import { Product } from '../products/models/product.model';
import { Customer } from '../customers/models/customer.model';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { ProductsService } from '../products/products.service';
import { Category } from '../categories/models/category.model';

@Module({
  imports: [SequelizeModule.forFeature([Sale, SaleItem, Product, Customer, Category])],
  controllers: [SalesController],
  providers: [SalesService, ProductsService],
  exports: [SalesService],
})
export class SalesModule {}
