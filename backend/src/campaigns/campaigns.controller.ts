import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignStatus } from '@prisma/client';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(createCampaignDto);
  }

  @Get()
  async getCampaigns(@Query('status') status?: CampaignStatus) {
    return this.campaignsService.getCampaigns(status);
  }

  @Get('active')
  async getActiveCampaigns(
    @Query('customerId') customerId?: string,
    @Query('productIds') productIds?: string,
  ) {
    const productIdArray = productIds ? productIds.split(',') : undefined;
    return this.campaignsService.getActiveCampaigns(customerId, productIdArray);
  }

  @Get('recommendations/:customerId')
  async getRecommendedCampaigns(@Param('customerId') customerId: string) {
    return this.campaignsService.getRecommendedCampaigns(customerId);
  }

  @Get(':id')
  async getCampaign(@Param('id') id: string) {
    return this.campaignsService.getCampaignById(id);
  }

  @Put(':id')
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: Partial<CreateCampaignDto>,
  ) {
    return this.campaignsService.updateCampaign(id, updateCampaignDto);
  }

  @Patch(':id/activate')
  async activateCampaign(@Param('id') id: string) {
    return this.campaignsService.activateCampaign(id);
  }

  @Patch(':id/pause')
  async pauseCampaign(@Param('id') id: string) {
    return this.campaignsService.pauseCampaign(id);
  }

  @Post(':id/apply')
  @HttpCode(HttpStatus.OK)
  async applyCampaignDiscount(
    @Param('id') id: string,
    @Body() body: {
      customerId: string;
      subtotal: number;
      productIds?: string[];
    },
  ) {
    return this.campaignsService.applyCampaignDiscount(
      id,
      body.customerId,
      body.subtotal,
      body.productIds,
    );
  }

  @Get(':id/analytics')
  async getCampaignAnalytics(@Param('id') id: string) {
    return this.campaignsService.getCampaignAnalytics(id);
  }

  @Post('automatic')
  async createAutomaticCampaigns() {
    return this.campaignsService.createAutomaticCampaigns();
  }
}
