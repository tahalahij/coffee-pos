import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { GiftService, CreateGiftUnitDto, ClaimGiftUnitDto } from './gift.service';

@Controller('gifts')
export class GiftController {
  private readonly logger = new Logger(GiftController.name);

  constructor(private readonly giftService: GiftService) {}

  /**
   * GET /gifts/available
   * Returns all available gift units
   */
  @Get('available')
  async getAvailable(@Query('productId') productId?: string) {
    if (productId) {
      return this.giftService.findAvailableByProduct(productId);
    }
    return this.giftService.findAvailable();
  }

  /**
   * GET /gifts/available/count
   * Returns count of available gifts
   */
  @Get('available/count')
  async getAvailableCount() {
    const count = await this.giftService.getAvailableCount();
    return { count };
  }

  /**
   * GET /gifts/:id
   * Get a specific gift unit by ID
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.giftService.findById(id);
  }

  /**
   * GET /gifts/:id/chain
   * Get the full chain history for a gift
   */
  @Get(':id/chain')
  async getChainHistory(@Param('id') id: string) {
    return this.giftService.getChainHistory(id);
  }

  /**
   * POST /gifts
   * Create a new gift unit
   * (Usually called internally after payment, but exposed for testing)
   */
  @Post()
  async createGift(@Body() dto: CreateGiftUnitDto) {
    return this.giftService.createGiftUnit(dto);
  }

  /**
   * POST /gifts/:id/claim
   * Claim a gift unit
   * (Should be called during checkout after payment)
   */
  @Post(':id/claim')
  async claimGift(
    @Param('id') id: string,
    @Body() body: Omit<ClaimGiftUnitDto, 'giftUnitId'>,
  ) {
    return this.giftService.claimGiftUnit({
      giftUnitId: id,
      ...body,
    });
  }
}
