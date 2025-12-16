import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from '../customers/models/customer.model';
import { Sale, SaleSchema } from '../sales/models/sale.model';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Customer.name, schema: CustomerSchema },
    { name: Sale.name, schema: SaleSchema },
  ])],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
