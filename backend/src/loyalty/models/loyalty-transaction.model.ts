import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LoyaltyTransactionType {
  EARNED = 'EARNED',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
  BONUS = 'BONUS',
  ADJUSTMENT = 'ADJUSTMENT'
}

export type LoyaltyTransactionDocument = LoyaltyTransaction & Document;

@Schema({
  timestamps: true,
  collection: 'loyalty_transactions',
})
export class LoyaltyTransaction {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true, enum: LoyaltyTransactionType })
  type: LoyaltyTransactionType;

  @Prop({ required: true })
  points: number;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Sale' })
  saleId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const LoyaltyTransactionSchema = SchemaFactory.createForClass(LoyaltyTransaction);

// Virtual populate for customer
LoyaltyTransactionSchema.virtual('customer', {
  ref: 'Customer',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true,
});

LoyaltyTransactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});
