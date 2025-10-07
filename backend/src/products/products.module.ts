import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './models/product.model';
import { Category } from '../categories/models/category.model';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [SequelizeModule.forFeature([Product, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
