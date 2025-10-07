import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, Unique, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany, Default } from 'sequelize-typescript';
import { Customer } from '../../customers/models/customer.model';
import { SaleItem } from './sale-item.model';
import { DiscountCode } from '../../discounts/models/discount-code.model';
import { Campaign } from '../../campaigns/models/campaign.model';

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  DIGITAL = 'DIGITAL'
}

export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Table({
  tableName: 'sales',
  timestamps: true,
  underscored: true,
})
export class Sale extends Model<Sale> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Unique
  @AllowNull(false)
  @Column({ field: 'receipt_number' })
  receiptNumber: string;

  @ForeignKey(() => Customer)
  @Column({ field: 'customer_id' })
  customerId: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  subtotal: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(10, 2), field: 'tax_amount' })
  taxAmount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(10, 2), field: 'discount_amount' })
  discountAmount: number;

  @AllowNull(false)
  @Column({ type: DataType.DECIMAL(10, 2), field: 'total_amount' })
  totalAmount: number;

  @AllowNull(false)
  @Column({ field: 'payment_method' })
  paymentMethod: PaymentMethod;

  @Default(SaleStatus.COMPLETED)
  @Column(DataType.ENUM(...Object.values(SaleStatus)))
  status: SaleStatus;

  @Column({ type: DataType.DECIMAL(10, 2), field: 'cash_received' })
  cashReceived: number;

  @Column({ type: DataType.DECIMAL(10, 2), field: 'change_given' })
  changeGiven: number;

  @Default(0)
  @Column({ field: 'loyalty_points_used' })
  loyaltyPointsUsed: number;

  @Default(0)
  @Column({ field: 'loyalty_points_earned' })
  loyaltyPointsEarned: number;

  @ForeignKey(() => Campaign)
  @Column({ field: 'campaign_id' })
  campaignId: number;

  @ForeignKey(() => DiscountCode)
  @Column({ field: 'discount_code_id' })
  discountCodeId: number;

  @Column({ field: 'discount_campaign_id' })
  discountCampaignId: number;

  @Column(DataType.TEXT)
  notes: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @BelongsTo(() => Customer)
  customer: Customer;

  @BelongsTo(() => DiscountCode)
  discountCode: DiscountCode;

  @BelongsTo(() => Campaign)
  campaign: Campaign;

  @HasMany(() => SaleItem)
  items: SaleItem[];
}
