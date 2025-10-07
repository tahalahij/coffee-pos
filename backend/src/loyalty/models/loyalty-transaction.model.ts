import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, CreatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Customer } from '../../customers/models/customer.model';

export enum LoyaltyTransactionType {
  EARNED = 'EARNED',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
  BONUS = 'BONUS',
  ADJUSTMENT = 'ADJUSTMENT'
}

@Table({
  tableName: 'loyalty_transactions',
  timestamps: true,
  underscored: true,
})
export class LoyaltyTransaction extends Model<LoyaltyTransaction> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Customer)
  @AllowNull(false)
  @Column({ field: 'customer_id' })
  customerId: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(LoyaltyTransactionType)))
  type: LoyaltyTransactionType;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  points: number;

  @Column(DataType.TEXT)
  description: string;

  @Column({ field: 'sale_id' })
  saleId: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @BelongsTo(() => Customer)
  customer: Customer;
}