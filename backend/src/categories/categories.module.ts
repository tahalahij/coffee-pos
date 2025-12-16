import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './models/category.model';
import { Product, ProductSchema } from '../products/models/product.model';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Category.name, schema: CategorySchema },
    { name: Product.name, schema: ProductSchema },
  ])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
