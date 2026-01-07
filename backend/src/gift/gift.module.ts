import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GiftUnit, GiftUnitSchema } from './schemas/gift-unit.schema';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { PostPaymentGiftHandler } from './post-payment-gift.handler';
import { DisplayModule } from '../display/display.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GiftUnit.name, schema: GiftUnitSchema }]),
    DisplayModule, // For GiftChainGateway
    ProductsModule, // For ProductsService in PostPaymentGiftHandler
  ],
  providers: [GiftService, PostPaymentGiftHandler],
  controllers: [GiftController],
  exports: [GiftService, PostPaymentGiftHandler], // Export for use in other modules (e.g., SalesModule)
})
export class GiftModule {}
