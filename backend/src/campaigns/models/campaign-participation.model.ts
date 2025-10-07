import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, CreatedAt, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import { Campaign } from './campaign.model';
import { Customer } from '../../customers/models/customer.model';

@Table({
  tableName: 'campaign_participations',
  timestamps: true,
  underscored: true,
})
export class CampaignParticipation extends Model<CampaignParticipation> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Campaign)
  @AllowNull(false)
  @Column({ field: 'campaign_id' })
  campaignId: number;

  @ForeignKey(() => Customer)
  @AllowNull(false)
  @Column({ field: 'customer_id' })
  customerId: number;

  @Default(0)
  @Column({ field: 'usage_count' })
  usageCount: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @BelongsTo(() => Campaign)
  campaign: Campaign;

  @BelongsTo(() => Customer)
  customer: Customer;
}