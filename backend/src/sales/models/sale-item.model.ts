import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SaleItemDocument = SaleItem & Document;

@Schema({
  timestamps: false,
  _id: true,
})
export class SaleItem {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true, type: Number })
  unitPrice: number;

  @Prop({ default: 0, type: Number })
  discountAmount: number;

  @Prop({ required: true, type: Number })
  totalAmount: number;
}

export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);

// Virtual populate for product
SaleItemSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});

SaleItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});
