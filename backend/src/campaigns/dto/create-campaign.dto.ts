import { CampaignType, DiscountType, LoyaltyTier } from '../models/discount-campaign.model';

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
  productIds?: number[];
}
