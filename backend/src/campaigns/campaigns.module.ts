import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Campaign } from './models/campaign.model';
import { DiscountCampaign, CampaignProduct, CampaignParticipation } from './models/discount-campaign.model';
import { Customer } from '../customers/models/customer.model';
import { Sale } from '../sales/models/sale.model';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [SequelizeModule.forFeature([
    Campaign,
    DiscountCampaign,
    CampaignProduct,
    CampaignParticipation,
    Customer,
    Sale,
  ])],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
