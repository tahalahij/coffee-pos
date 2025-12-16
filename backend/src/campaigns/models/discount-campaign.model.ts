import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CampaignType {
  PRODUCT_DISCOUNT = 'PRODUCT_DISCOUNT',
  CATEGORY_DISCOUNT = 'CATEGORY_DISCOUNT',
  LOYALTY_BONUS = 'LOYALTY_BONUS',
  SEASONAL_OFFER = 'SEASONAL_OFFER',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SCHEDULED = 'SCHEDULED',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

// Campaign Product subdocument
@Schema({ timestamps: false, _id: true })
export class CampaignProduct {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DiscountCampaign' })
  campaignId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;
}

export type CampaignProductDocument = CampaignProduct & Document;
export const CampaignProductSchema = SchemaFactory.createForClass(CampaignProduct);

// Campaign Participation subdocument
@Schema({ timestamps: true, _id: true, collection: 'campaign_participations' })
export class CampaignParticipation {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DiscountCampaign' })
  campaignId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ default: Date.now })
  participatedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type CampaignParticipationDocument = CampaignParticipation & Document;
export const CampaignParticipationSchema = SchemaFactory.createForClass(CampaignParticipation);

export type DiscountCampaignDocument = DiscountCampaign & Document;

@Schema({
  timestamps: true,
  collection: 'discount_campaigns',
})
export class DiscountCampaign {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: CampaignType })
  type: CampaignType;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, enum: DiscountType })
  discountType: DiscountType;

  @Prop({ required: true, type: Number })
  discountValue: number;

  @Prop({ type: Number })
  minPurchase: number;

  @Prop({ type: Number })
  maxDiscount: number;

  @Prop()
  usageLimit: number;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ enum: LoyaltyTier })
  targetTier: LoyaltyTier;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  productIds: Types.ObjectId[];

  @Prop({ type: [CampaignParticipationSchema], default: [] })
  participations: CampaignParticipation[];

  createdAt: Date;
  updatedAt: Date;
}

export const DiscountCampaignSchema = SchemaFactory.createForClass(DiscountCampaign);

// Virtual populate for products
DiscountCampaignSchema.virtual('products', {
  ref: 'Product',
  localField: 'productIds',
  foreignField: '_id',
});

DiscountCampaignSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

