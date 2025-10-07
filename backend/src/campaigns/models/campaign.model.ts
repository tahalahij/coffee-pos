import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, CreatedAt, UpdatedAt, HasMany, Default } from 'sequelize-typescript';
import { Sale } from '../../sales/models/sale.model';
import { LoyaltyTier } from '../../customers/models/customer.model';
import { CampaignProduct } from './campaign-product.model';
import { CampaignParticipation } from './campaign-participation.model';

export enum CampaignType {
  PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT',
  FIXED_DISCOUNT = 'FIXED_DISCOUNT',
  BUY_ONE_GET_ONE = 'BUY_ONE_GET_ONE',
  LOYALTY_BONUS = 'LOYALTY_BONUS',
  BIRTHDAY_SPECIAL = 'BIRTHDAY_SPECIAL',
  SEASONAL = 'SEASONAL',
  NEW_CUSTOMER = 'NEW_CUSTOMER',
  RETURN_CUSTOMER = 'RETURN_CUSTOMER'
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

@Table({
  tableName: 'campaigns',
  timestamps: true,
  underscored: true,
})
export class Campaign extends Model<Campaign> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(CampaignType)))
  type: CampaignType;

  @Default(CampaignStatus.DRAFT)
  @Column(DataType.ENUM(...Object.values(CampaignStatus)))
  status: CampaignStatus;

  @AllowNull(false)
  @Column({ field: 'start_date' })
  startDate: Date;

  @AllowNull(false)
  @Column({ field: 'end_date' })
  endDate: Date;

  @AllowNull(false)
  @Column({ field: 'discount_type' })
  discountType: DiscountType;

  @AllowNull(false)
  @Column({ field: 'discount_value' })
  discountValue: number;

  @Column({ field: 'min_purchase' })
  minPurchase: number;

  @Column({ field: 'max_discount' })
  maxDiscount: number;

  @Column({ field: 'usage_limit' })
  usageLimit: number;

  @Default(0)
  @Column({ field: 'usage_count' })
  usageCount: number;

  @Column({ field: 'target_tier' })
  targetTier: LoyaltyTier;

  @Default(true)
  @Column({ field: 'is_active' })
  isActive: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @HasMany(() => Sale)
  sales: Sale[];

  @HasMany(() => CampaignProduct)
  campaignProducts: CampaignProduct[];

  @HasMany(() => CampaignParticipation)
  campaignParticipations: CampaignParticipation[];
}
