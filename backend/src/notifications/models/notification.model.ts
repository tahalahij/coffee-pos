import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  CAMPAIGN = 'CAMPAIGN',
  LOYALTY_REWARD = 'LOYALTY_REWARD',
  BIRTHDAY = 'BIRTHDAY',
  LOW_POINTS = 'LOW_POINTS',
  SPECIAL_OFFER = 'SPECIAL_OFFER',
  GENERAL = 'GENERAL'
}

export type NotificationDocument = Notification & Document;

@Schema({
  timestamps: true,
  collection: 'notifications',
})
export class Notification {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  scheduledAt: Date;

  @Prop()
  sentAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});
