import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GiftUnitDocument = GiftUnit & Document;

@Schema({ timestamps: true })
export class GiftUnit {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop()
  productType?: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true })
  originalOrderId: string;

  @Prop()
  giftedByCustomerId?: string;

  @Prop()
  giftedByName?: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop()
  claimedAt?: Date;

  @Prop()
  claimedByOrderId?: string;

  @Prop()
  claimedByCustomerId?: string;

  @Prop()
  continuedAt?: Date;

  @Prop()
  continuedFromGiftUnitId?: string;

  @Prop({ type: [String], default: [] })
  continuedByGiftUnitIds: string[];

  @Prop({ required: true, default: 1 })
  chainPosition: number;

  @Prop({ required: true, default: 'AVAILABLE' })
  status: 'AVAILABLE' | 'CLAIMED' | 'EXPIRED';

  @Prop()
  expiresAt?: Date;
}

export const GiftUnitSchema = SchemaFactory.createForClass(GiftUnit);

// Indexes for performance
GiftUnitSchema.index({ status: 1, createdAt: -1 });
GiftUnitSchema.index({ originalOrderId: 1 });
GiftUnitSchema.index({ claimedByOrderId: 1 });
GiftUnitSchema.index({ continuedFromGiftUnitId: 1 });
