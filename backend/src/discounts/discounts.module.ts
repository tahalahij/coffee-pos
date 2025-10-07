import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Discount } from './models/discount.model';
import { DiscountCode } from './models/discount-code.model';
import { Customer } from '../customers/models/customer.model';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';

@Module({
  imports: [SequelizeModule.forFeature([Discount, DiscountCode, Customer])],
  controllers: [DiscountsController],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}
