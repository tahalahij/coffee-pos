import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export type DiscountCodeDocument = DiscountCode & Document;

@Schema({
  timestamps: true,
  collection: 'discount_codes',
})
export class DiscountCode {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: DiscountType })
  type: DiscountType;

  @Prop({ required: true, type: Number })
  value: number;

  @Prop({ type: Number })
  minPurchase: number;

  @Prop({ type: Number })
  maxDiscount: number;

  @Prop()
  usageLimit: number;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId: Types.ObjectId;

  @Prop()
  startsAt: Date;

  @Prop()
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  productRestricted: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  productIds: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const DiscountCodeSchema = SchemaFactory.createForClass(DiscountCode);

// Virtual populate for customer
DiscountCodeSchema.virtual('customer', {
  ref: 'Customer',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true,
});

// Virtual populate for products
DiscountCodeSchema.virtual('products', {
  ref: 'Product',
  localField: 'productIds',
  foreignField: '_id',
});

DiscountCodeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});
