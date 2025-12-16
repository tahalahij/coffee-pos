import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampaignParticipationDocument = CampaignParticipation & Document;

@Schema({
  timestamps: true,
  collection: 'campaign_participations',
})
export class CampaignParticipation {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ default: 0 })
  usageCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const CampaignParticipationSchema = SchemaFactory.createForClass(CampaignParticipation);

// Virtual populate for campaign
CampaignParticipationSchema.virtual('campaign', {
  ref: 'Campaign',
  localField: 'campaignId',
  foreignField: '_id',
  justOne: true,
});

// Virtual populate for customer
CampaignParticipationSchema.virtual('customer', {
  ref: 'Customer',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true,
});

CampaignParticipationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});