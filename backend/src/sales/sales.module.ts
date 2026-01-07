import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sale, SaleSchema } from './models/sale.model';
import { Product, ProductSchema } from '../products/models/product.model';
import { Customer, CustomerSchema } from '../customers/models/customer.model';
import { Category, CategorySchema } from '../categories/models/category.model';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { ProductsService } from '../products/products.service';
import { GiftModule } from '../gift/gift.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    GiftModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, ProductsService],
  exports: [SalesService],
})
export class SalesModule {}
