import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from './models/campaign.model';
import {
  DiscountCampaign,
  DiscountCampaignSchema,
  CampaignProduct,
  CampaignProductSchema,
  CampaignParticipation,
  CampaignParticipationSchema,
} from './models/discount-campaign.model';
import { Customer, CustomerSchema } from '../customers/models/customer.model';
import { Sale, SaleSchema } from '../sales/models/sale.model';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Campaign.name, schema: CampaignSchema },
    { name: DiscountCampaign.name, schema: DiscountCampaignSchema },
    { name: CampaignProduct.name, schema: CampaignProductSchema },
    { name: CampaignParticipation.name, schema: CampaignParticipationSchema },
    { name: Customer.name, schema: CustomerSchema },
    { name: Sale.name, schema: SaleSchema },
  ])],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
