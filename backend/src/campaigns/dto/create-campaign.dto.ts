import { CampaignType, DiscountType, LoyaltyTier } from '@prisma/client';

export class CreateCampaignDto {
  name: string;
  description?: string;
  type: CampaignType;
  startDate: string;
  endDate: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  targetTier?: LoyaltyTier;
  productIds?: string[];
}
