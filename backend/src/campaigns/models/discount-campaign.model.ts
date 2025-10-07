import { Column, Model, Table, DataType, BelongsTo, ForeignKey, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Customer } from '../../customers/models/customer.model';

export enum CampaignType {
  PRODUCT_DISCOUNT = 'PRODUCT_DISCOUNT',
  CATEGORY_DISCOUNT = 'CATEGORY_DISCOUNT',
  LOYALTY_BONUS = 'LOYALTY_BONUS',
  SEASONAL_OFFER = 'SEASONAL_OFFER',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SCHEDULED = 'SCHEDULED',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

@Table({
  tableName: 'discount_campaigns',
  timestamps: true,
})
export class DiscountCampaign extends Model<DiscountCampaign> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ENUM(...Object.values(CampaignType)),
    allowNull: false,
  })
  type: CampaignType;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'start_date',
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'end_date',
  })
  endDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(DiscountType)),
    allowNull: false,
    field: 'discount_type',
  })
  discountType: DiscountType;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'discount_value',
  })
  discountValue: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'min_purchase',
  })
  minPurchase: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'max_discount',
  })
  maxDiscount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'usage_limit',
  })
  usageLimit: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'usage_count',
  })
  usageCount: number;

  @Column({
    type: DataType.ENUM(...Object.values(LoyaltyTier)),
    allowNull: true,
    field: 'target_tier',
  })
  targetTier: LoyaltyTier;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  isActive: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(CampaignStatus)),
    allowNull: false,
    defaultValue: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @CreatedAt
  @Column({
    field: 'created_at',
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
  })
  updatedAt: Date;

  @HasMany(() => CampaignProduct)
  products: CampaignProduct[];

  @HasMany(() => CampaignParticipation)
  participations: CampaignParticipation[];
}

@Table({
  tableName: 'campaign_products',
  timestamps: false,
})
export class CampaignProduct extends Model<CampaignProduct> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => DiscountCampaign)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'campaign_id',
  })
  campaignId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'product_id',
  })
  productId: number;

  @BelongsTo(() => DiscountCampaign)
  campaign: DiscountCampaign;
}

@Table({
  tableName: 'campaign_participations',
  timestamps: true,
})
export class CampaignParticipation extends Model<CampaignParticipation> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => DiscountCampaign)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'campaign_id',
  })
  campaignId: number;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'customer_id',
  })
  customerId: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'participated_at',
  })
  participatedAt: Date;

  @CreatedAt
  @Column({
    field: 'created_at',
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
  })
  updatedAt: Date;

  @BelongsTo(() => DiscountCampaign)
  campaign: DiscountCampaign;

  @BelongsTo(() => Customer)
  customer: Customer;
}
