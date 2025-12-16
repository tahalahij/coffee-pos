import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SaleItem, SaleItemSchema } from './sale-item.model';

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  DIGITAL = 'DIGITAL'
}

export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type SaleDocument = Sale & Document;

@Schema({
  timestamps: true,
  collection: 'sales',
})
export class Sale {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  receiptNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  subtotal: number;

  @Prop({ default: 0, type: Number })
  taxAmount: number;

  @Prop({ default: 0, type: Number })
  discountAmount: number;

  @Prop({ required: true, type: Number })
  totalAmount: number;

  @Prop({ required: true, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop({ enum: SaleStatus, default: SaleStatus.COMPLETED })
  status: SaleStatus;

  @Prop({ type: Number })
  cashReceived: number;

  @Prop({ type: Number })
  changeGiven: number;

  @Prop({ default: 0 })
  loyaltyPointsUsed: number;

  @Prop({ default: 0 })
  loyaltyPointsEarned: number;

  @Prop({ type: Types.ObjectId, ref: 'Campaign' })
  campaignId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DiscountCode' })
  discountCodeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  discountCampaignId: Types.ObjectId;

  @Prop()
  notes: string;

  @Prop({ type: [SaleItemSchema], default: [] })
  items: SaleItem[];

  createdAt: Date;
  updatedAt: Date;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

// Virtual populate for customer
SaleSchema.virtual('customer', {
  ref: 'Customer',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true,
});

// Virtual populate for discountCode
SaleSchema.virtual('discountCode', {
  ref: 'DiscountCode',
  localField: 'discountCodeId',
  foreignField: '_id',
  justOne: true,
});

// Virtual populate for campaign
SaleSchema.virtual('campaign', {
  ref: 'Campaign',
  localField: 'campaignId',
  foreignField: '_id',
  justOne: true,
});

SaleSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});
