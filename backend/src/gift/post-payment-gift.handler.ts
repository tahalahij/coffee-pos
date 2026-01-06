import { Injectable, Logger } from '@nestjs/common';
import { GiftService } from '../gift/gift.service';

export interface PostPaymentGiftContext {
  orderId: string;
  customerId?: string;
  items: Array<{
    productId: string;
    productName: string;
    productType?: string;
    quantity: number;
    price: number;
  }>;
  giftMetadata?: {
    claimedGiftIds?: string[];
    buyForNext?: boolean;
    gifterName?: string;
  };
}

/**
 * PostPaymentGiftHandler
 * 
 * Handles gift unit claiming and creation AFTER payment is successful.
 * This is called by the SalesService or OrderService as a non-blocking
 * post-payment hook.
 * 
 * CRITICAL: This must NOT interfere with existing payment, receipt, or
 * inventory logic. It only handles gift-related database updates and events.
 */
@Injectable()
export class PostPaymentGiftHandler {
  private readonly logger = new Logger(PostPaymentGiftHandler.name);

  constructor(private readonly giftService: GiftService) {}

  /**
   * Process gifts after successful payment
   * 
   * Steps:
   * 1. Claim any selected gift units
   * 2. Create new gift units if buyForNext is enabled
   * 3. Link new gifts to claimed gifts for chain continuation
   * 
   * This method is idempotent and safe to retry.
   */
  async processPostPaymentGifts(context: PostPaymentGiftContext): Promise<void> {
    const { orderId, customerId, items, giftMetadata } = context;

    if (!giftMetadata) {
      this.logger.debug(`No gift metadata for order ${orderId}, skipping`);
      return;
    }

    try {
      // Step 1: Claim selected gift units
      const claimedGiftIds = giftMetadata.claimedGiftIds || [];
      if (claimedGiftIds.length > 0) {
        await this.claimGifts(orderId, customerId, claimedGiftIds);
      }

      // Step 2: Create new gift units if buyForNext is enabled
      if (giftMetadata.buyForNext) {
        await this.createGiftsForNext(
          orderId,
          customerId,
          items,
          giftMetadata.gifterName,
          claimedGiftIds[0], // First claimed gift for chain continuation
        );
      }

      this.logger.log(`Processed gifts for order ${orderId}`);
    } catch (error) {
      // Log error but don't throw - gift processing should not block order completion
      this.logger.error(
        `Failed to process gifts for order ${orderId}:`,
        error.stack,
      );
    }
  }

  /**
   * Claim gift units
   */
  private async claimGifts(
    orderId: string,
    customerId: string | undefined,
    giftIds: string[],
  ): Promise<void> {
    this.logger.debug(`Claiming ${giftIds.length} gifts for order ${orderId}`);

    for (const giftId of giftIds) {
      try {
        await this.giftService.claimGiftUnit({
          giftUnitId: giftId,
          claimedByOrderId: orderId,
          claimedByCustomerId: customerId,
        });
      } catch (error) {
        this.logger.error(`Failed to claim gift ${giftId}:`, error.message);
        // Continue with other gifts even if one fails
      }
    }
  }

  /**
   * Create gift units for next customers
   */
  private async createGiftsForNext(
    orderId: string,
    customerId: string | undefined,
    items: PostPaymentGiftContext['items'],
    gifterName: string | undefined,
    continuedFromGiftId: string | undefined,
  ): Promise<void> {
    this.logger.debug(
      `Creating gifts for next customer from order ${orderId}`,
    );

    // Filter out zero-price or negative items (shouldn't gift those)
    const giftableItems = items.filter((item) => item.price > 0);

    if (giftableItems.length === 0) {
      this.logger.warn(`No giftable items in order ${orderId}`);
      return;
    }

    try {
      await this.giftService.createGiftsFromOrder(
        orderId,
        giftableItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productType: item.productType,
          quantity: item.quantity,
        })),
        {
          giftedByCustomerId: customerId,
          giftedByName: gifterName,
          claimedGiftUnitId: continuedFromGiftId,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to create gifts from order ${orderId}:`,
        error.message,
      );
    }
  }

  /**
   * Get gift discount items for applying to cart
   * 
   * This is called BEFORE payment to add 100% discount line items
   * for each claimed gift.
   * 
   * Returns discount line items that can be added to the existing discount logic.
   */
  async getGiftDiscountItems(giftIds: string[]): Promise<
    Array<{
      giftId: string;
      productId: string;
      productName: string;
      discountAmount: number; // Should be 100% of product price
      discountType: 'GIFT';
    }>
  > {
    const discountItems = [];

    for (const giftId of giftIds) {
      try {
        const gift = await this.giftService.findById(giftId);
        
        if (gift.status !== 'AVAILABLE') {
          this.logger.warn(`Gift ${giftId} is not available, skipping`);
          continue;
        }

        // Note: In real implementation, you'd need to fetch the product price
        // from your product service. For now, return placeholder.
        // The actual discount amount should be calculated in your checkout logic.
        discountItems.push({
          giftId: gift._id.toString(),
          productId: gift.productId,
          productName: gift.productName,
          discountAmount: 0, // Placeholder - calculate actual price in checkout
          discountType: 'GIFT' as const,
        });
      } catch (error) {
        this.logger.error(`Failed to get gift ${giftId}:`, error.message);
      }
    }

    return discountItems;
  }
}
