import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseItemDocument = PurchaseItem & Document;

@Schema({
  timestamps: false,
  _id: true,
})
export class PurchaseItem {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true, type: Number })
  unitCost: number;

  @Prop({ required: true, type: Number })
  totalCost: number;
}

export const PurchaseItemSchema = SchemaFactory.createForClass(PurchaseItem);

// Virtual populate for product
PurchaseItemSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});

PurchaseItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});
