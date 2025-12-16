import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DiscountCodeProductDocument = DiscountCodeProduct & Document;

@Schema({ timestamps: true, collection: 'discount_code_products' })
export class DiscountCodeProduct {
  @Prop({ type: Types.ObjectId, ref: 'DiscountCode', required: true })
  discountCodeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;
}

export const DiscountCodeProductSchema = SchemaFactory.createForClass(DiscountCodeProduct);
