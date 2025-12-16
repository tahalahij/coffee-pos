import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from './models/purchase.model';
import { Product, ProductSchema } from '../products/models/product.model';
import { Category, CategorySchema } from '../categories/models/category.model';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { ProductsService } from '../products/products.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Purchase.name, schema: PurchaseSchema },
    { name: Product.name, schema: ProductSchema },
    { name: Category.name, schema: CategorySchema },
  ])],
  controllers: [PurchasesController],
  providers: [PurchasesService, ProductsService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
