import { Module } from '@nestjs/common';
import { DisplayGateway } from './display.gateway';
import { GiftChainGateway } from './gift-chain.gateway';
import { DisplayController } from './display.controller';

@Module({
  providers: [DisplayGateway, GiftChainGateway],
  controllers: [DisplayController],
  exports: [DisplayGateway, GiftChainGateway], // Export so other modules can use it
})
export class DisplayModule {}
