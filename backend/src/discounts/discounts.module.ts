import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscountCode, DiscountCodeSchema } from './models/discount-code.model';
import { DiscountCodeProduct, DiscountCodeProductSchema } from './models/discount-code-product.model';
import { Customer, CustomerSchema } from '../customers/models/customer.model';
import { Product, ProductSchema } from '../products/models/product.model';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';

@Module({
  imports: [MongooseModule.forFeature([
    { name: DiscountCode.name, schema: DiscountCodeSchema },
    { name: DiscountCodeProduct.name, schema: DiscountCodeProductSchema },
    { name: Customer.name, schema: CustomerSchema },
    { name: Product.name, schema: ProductSchema },
  ])],
  controllers: [DiscountsController],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}
