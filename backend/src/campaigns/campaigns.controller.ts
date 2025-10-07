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
  ParseIntPipe,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignStatus } from './models/discount-campaign.model';

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
    const customerIdNum = customerId ? parseInt(customerId, 10) : undefined;
    const productIdArray = productIds ? productIds.split(',').map(id => parseInt(id, 10)) : undefined;
    return this.campaignsService.getActiveCampaigns(customerIdNum, productIdArray);
  }

  @Get('recommendations/:customerId')
  async getRecommendedCampaigns(@Param('customerId') customerId: string) {
    const customerIdNum = parseInt(customerId, 10);
    return this.campaignsService.getRecommendedCampaigns(customerIdNum);
  }

  @Get(':id')
  async getCampaign(@Param('id', ParseIntPipe) id: number) {
    return this.campaignsService.getCampaignById(id);
  }

  @Put(':id')
  async updateCampaign(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCampaignDto: Partial<CreateCampaignDto>,
  ) {
    return this.campaignsService.updateCampaign(id, updateCampaignDto);
  }

  @Patch(':id/activate')
  async activateCampaign(@Param('id', ParseIntPipe) id: number) {
    return this.campaignsService.activateCampaign(id);
  }

  @Patch(':id/pause')
  async pauseCampaign(@Param('id', ParseIntPipe) id: number) {
    return this.campaignsService.pauseCampaign(id);
  }

  @Post(':id/apply')
  @HttpCode(HttpStatus.OK)
  async applyCampaignDiscount(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      customerId: string;
      subtotal: number;
      productIds?: number[];
    },
  ) {
    const customerIdNum = parseInt(body.customerId, 10);
    return this.campaignsService.applyCampaignDiscount(
      id,
      customerIdNum,
      body.subtotal,
    );
  }

  @Get(':id/analytics')
  async getCampaignAnalytics(@Param('id', ParseIntPipe) id: number) {
    return this.campaignsService.getCampaignAnalytics(id);
  }

  @Post('automatic')
  async createAutomaticCampaigns() {
    return this.campaignsService.createAutomaticCampaigns();
  }
}
