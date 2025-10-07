import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { LoyaltyService, LoyaltyTier } from './loyalty.service';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('customer/:customerId')
  async getCustomerLoyalty(@Param('customerId') customerId: string) {
    return this.loyaltyService.getCustomerLoyaltyValue(customerId);
  }

  @Get('customer/:customerId/history')
  async getLoyaltyHistory(@Param('customerId') customerId: string) {
    return this.loyaltyService.getLoyaltyHistory(customerId);
  }

  @Post('customer/:customerId/points')
  async addLoyaltyPoints(
    @Param('customerId') customerId: string,
    @Body() body: {
      points: number;
      type: string;
      description?: string;
      saleId?: string;
    },
  ) {
    return this.loyaltyService.addLoyaltyPoints(customerId, body);
  }

  @Post('customer/:customerId/redeem')
  async redeemLoyaltyPoints(
    @Param('customerId') customerId: string,
    @Body() body: { points: number },
  ) {
    return this.loyaltyService.redeemLoyaltyPoints(customerId, body.points);
  }

  @Post('customer/:customerId/bonus')
  async awardBonusPoints(
    @Param('customerId') customerId: string,
    @Body() body: { points: number; reason: string },
  ) {
    return this.loyaltyService.awardBonusPoints(customerId, body.points, body.reason);
  }

  @Patch('customer/:customerId/tier')
  async updateLoyaltyTier(
    @Param('customerId') customerId: string,
    @Body() body: { totalSpent: number },
  ) {
    return this.loyaltyService.updateLoyaltyTier(customerId, body.totalSpent);
  }

  @Get('stats')
  async getLoyaltyStats() {
    return this.loyaltyService.getLoyaltyStats();
  }

  @Post('calculate-points')
  async calculateLoyaltyPoints(
    @Body() body: { customerId: string; amount: number },
  ) {
    return this.loyaltyService.calculateLoyaltyPoints(body.customerId, body.amount);
  }
}
