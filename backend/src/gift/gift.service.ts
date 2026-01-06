import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GiftUnit, GiftUnitDocument } from './schemas/gift-unit.schema';
import { GiftChainGateway } from '../display/gift-chain.gateway';

export interface CreateGiftUnitDto {
  productId: string;
  productName: string;
  productType?: string;
  quantity?: number;
  originalOrderId: string;
  giftedByCustomerId?: string;
  giftedByName?: string;
  continuedFromGiftUnitId?: string;
}

export interface ClaimGiftUnitDto {
  giftUnitId: string;
  claimedByOrderId: string;
  claimedByCustomerId?: string;
}

@Injectable()
export class GiftService {
  private readonly logger = new Logger(GiftService.name);

  constructor(
    @InjectModel(GiftUnit.name) private giftUnitModel: Model<GiftUnitDocument>,
    private giftChainGateway: GiftChainGateway,
  ) {}

  /**
   * Find all available gift units
   */
  async findAvailable(): Promise<GiftUnit[]> {
    return this.giftUnitModel
      .find({
        status: 'AVAILABLE',
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find available gift units for a specific product
   */
  async findAvailableByProduct(productId: string): Promise<GiftUnit[]> {
    return this.giftUnitModel
      .find({
        productId,
        status: 'AVAILABLE',
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      })
      .sort({ createdAt: 1 }) // FIFO: oldest first
      .exec();
  }

  /**
   * Find a gift unit by ID
   */
  async findById(giftUnitId: string): Promise<GiftUnit> {
    const giftUnit = await this.giftUnitModel.findById(giftUnitId).exec();
    if (!giftUnit) {
      throw new NotFoundException(`Gift unit ${giftUnitId} not found`);
    }
    return giftUnit;
  }

  /**
   * Create a new gift unit
   * Handles chain continuation automatically
   */
  async createGiftUnit(dto: CreateGiftUnitDto): Promise<GiftUnit> {
    let chainPosition = 1;
    let continuedFromGiftUnitId = dto.continuedFromGiftUnitId;

    // If this is a chain continuation, determine position
    if (continuedFromGiftUnitId) {
      const previousGift = await this.findById(continuedFromGiftUnitId);
      chainPosition = previousGift.chainPosition + 1;

      // Mark previous gift as continued
      await this.giftUnitModel.findByIdAndUpdate(continuedFromGiftUnitId, {
        continuedAt: new Date(),
        $push: { continuedByGiftUnitIds: null }, // Will be updated after creation
      });
    }

    const giftUnit = new this.giftUnitModel({
      productId: dto.productId,
      productName: dto.productName,
      productType: dto.productType,
      quantity: dto.quantity || 1,
      originalOrderId: dto.originalOrderId,
      giftedByCustomerId: dto.giftedByCustomerId,
      giftedByName: dto.giftedByName,
      continuedFromGiftUnitId,
      chainPosition,
      status: 'AVAILABLE',
      createdAt: new Date(),
    });

    const saved = await giftUnit.save();

    // Update previous gift with new gift ID
    if (continuedFromGiftUnitId) {
      await this.giftUnitModel.findByIdAndUpdate(continuedFromGiftUnitId, {
        $set: { [`continuedByGiftUnitIds.${chainPosition - 2}`]: saved._id.toString() },
      });

      // Emit chain continuation event
      this.giftChainGateway.broadcastGiftChainContinued(
        continuedFromGiftUnitId,
        saved.continuedAt?.toISOString() || new Date().toISOString(),
        this.mapToGiftUnitEvent(saved),
      );
    }

    // Emit gift created event
    this.giftChainGateway.broadcastGiftCreated(this.mapToGiftUnitEvent(saved));

    this.logger.log(
      `Created gift unit ${saved._id} for product ${dto.productName} (chain position: ${chainPosition})`,
    );

    return saved;
  }

  /**
   * Claim a gift unit
   * This marks the gift as claimed but does NOT modify inventory
   * Inventory deduction happens in the order service
   */
  async claimGiftUnit(dto: ClaimGiftUnitDto): Promise<GiftUnit> {
    const giftUnit = await this.findById(dto.giftUnitId);

    if (giftUnit.status !== 'AVAILABLE') {
      throw new Error(`Gift unit ${dto.giftUnitId} is not available (status: ${giftUnit.status})`);
    }

    const updated = await this.giftUnitModel.findByIdAndUpdate(
      dto.giftUnitId,
      {
        status: 'CLAIMED',
        claimedAt: new Date(),
        claimedByOrderId: dto.claimedByOrderId,
        claimedByCustomerId: dto.claimedByCustomerId,
      },
      { new: true },
    );

    // Emit claimed event
    this.giftChainGateway.broadcastGiftClaimed(
      dto.giftUnitId,
      updated.claimedAt.toISOString(),
    );

    this.logger.log(
      `Claimed gift unit ${dto.giftUnitId} by order ${dto.claimedByOrderId}`,
    );

    return updated;
  }

  /**
   * Bulk create gift units from an order
   * Used after payment to create gifts for next customers
   */
  async createGiftsFromOrder(
    orderId: string,
    items: Array<{
      productId: string;
      productName: string;
      productType?: string;
      quantity: number;
    }>,
    metadata?: {
      giftedByCustomerId?: string;
      giftedByName?: string;
      claimedGiftUnitId?: string; // For chain continuation
    },
  ): Promise<GiftUnit[]> {
    const createdGifts: GiftUnit[] = [];

    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        const gift = await this.createGiftUnit({
          productId: item.productId,
          productName: item.productName,
          productType: item.productType,
          quantity: 1,
          originalOrderId: orderId,
          giftedByCustomerId: metadata?.giftedByCustomerId,
          giftedByName: metadata?.giftedByName,
          continuedFromGiftUnitId: metadata?.claimedGiftUnitId,
        });
        createdGifts.push(gift);
      }
    }

    return createdGifts;
  }

  /**
   * Get count of available gifts
   */
  async getAvailableCount(): Promise<number> {
    return this.giftUnitModel.countDocuments({
      status: 'AVAILABLE',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    });
  }

  /**
   * Get gift chain history for a specific gift
   */
  async getChainHistory(giftUnitId: string): Promise<GiftUnit[]> {
    const gift = await this.findById(giftUnitId);
    const chain: GiftUnit[] = [gift];

    // Walk backwards
    let current = gift;
    while (current.continuedFromGiftUnitId) {
      current = await this.findById(current.continuedFromGiftUnitId);
      chain.unshift(current);
    }

    // Walk forwards
    for (const nextId of gift.continuedByGiftUnitIds) {
      if (nextId) {
        const next = await this.findById(nextId);
        chain.push(next);
      }
    }

    return chain;
  }

  /**
   * Map database model to gateway event format
   */
  private mapToGiftUnitEvent(giftUnit: GiftUnitDocument): any {
    return {
      id: giftUnit._id.toString(),
      giftedByName: giftUnit.giftedByName || 'Anonymous',
      productName: giftUnit.productName,
      productType: giftUnit.productType,
      createdAt: giftUnit.createdAt.toISOString(),
      claimedAt: giftUnit.claimedAt?.toISOString(),
      continuedAt: giftUnit.continuedAt?.toISOString(),
      chainPosition: giftUnit.chainPosition,
    };
  }
}
