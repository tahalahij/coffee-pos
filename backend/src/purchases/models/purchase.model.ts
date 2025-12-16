import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PurchaseItem, PurchaseItemSchema } from './purchase-item.model';

export enum PurchaseStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export type PurchaseDocument = Purchase & Document;

@Schema({
  timestamps: true,
  collection: 'purchases',
})
export class Purchase {
  _id: Types.ObjectId;

  @Prop({ required: true })
  supplierName: string;

  @Prop()
  supplierContact: string;

  @Prop({ required: true, type: Number })
  totalAmount: number;

  @Prop({ enum: PurchaseStatus, default: PurchaseStatus.PENDING })
  status: PurchaseStatus;

  @Prop()
  notes: string;

  @Prop()
  receivedAt: Date;

  @Prop({ type: [PurchaseItemSchema], default: [] })
  items: PurchaseItem[];

  createdAt: Date;
  updatedAt: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);

PurchaseSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});
