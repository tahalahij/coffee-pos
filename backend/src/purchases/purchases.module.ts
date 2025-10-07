import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Purchase } from './models/purchase.model';
import { PurchaseItem } from './models/purchase-item.model';
import { Product } from '../products/models/product.model';
import { Category } from '../categories/models/category.model';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { ProductsService } from '../products/products.service';

@Module({
  imports: [SequelizeModule.forFeature([Purchase, PurchaseItem, Product, Category])],
  controllers: [PurchasesController],
  providers: [PurchasesService, ProductsService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
