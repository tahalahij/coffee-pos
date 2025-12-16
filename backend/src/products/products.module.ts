import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './models/product.model';
import { Category, CategorySchema } from '../categories/models/category.model';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Product.name, schema: ProductSchema },
    { name: Category.name, schema: CategorySchema },
  ])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
