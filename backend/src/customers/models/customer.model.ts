import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export type CustomerDocument = Customer & Document;

@Schema({
  timestamps: true,
  collection: 'customers',
})
export class Customer {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop({ enum: Gender })
  sex: Gender;

  @Prop()
  dateOfBirth: Date;

  @Prop({ default: 0 })
  loyaltyPoints: number;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ default: 0 })
  visitCount: number;

  @Prop()
  lastVisit: Date;

  @Prop({ enum: LoyaltyTier, default: LoyaltyTier.BRONZE })
  loyaltyTier: LoyaltyTier;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});
