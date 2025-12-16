import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LoyaltyTier } from '../../customers/models/customer.model';

export enum CampaignType {
  PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT',
  FIXED_DISCOUNT = 'FIXED_DISCOUNT',
  BUY_ONE_GET_ONE = 'BUY_ONE_GET_ONE',
  LOYALTY_BONUS = 'LOYALTY_BONUS',
  BIRTHDAY_SPECIAL = 'BIRTHDAY_SPECIAL',
  SEASONAL = 'SEASONAL',
  NEW_CUSTOMER = 'NEW_CUSTOMER',
  RETURN_CUSTOMER = 'RETURN_CUSTOMER'
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export type CampaignDocument = Campaign & Document;

@Schema({
  timestamps: true,
  collection: 'campaigns',
})
export class Campaign {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: CampaignType })
  type: CampaignType;

  @Prop({ enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  productIds: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// Virtual populate for products
CampaignSchema.virtual('products', {
  ref: 'Product',
  localField: 'productIds',
  foreignField: '_id',
});

CampaignSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});
