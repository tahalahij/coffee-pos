import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
  collection: 'products',
})
export class Product {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: Number })
  cost: number;

  @Prop({ unique: true, sparse: true })
  sku: string;

  @Prop()
  imageUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: 0 })
  stock: number;

  @Prop()
  lowStockAlert: number;

  @Prop()
  minStockLevel: number;

  createdAt: Date;
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Virtual populate for category
ProductSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

ProductSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});
