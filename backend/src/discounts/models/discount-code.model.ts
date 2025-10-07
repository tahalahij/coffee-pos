import { Column, Model, Table, DataType, BelongsTo, ForeignKey, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Customer } from '../../customers/models/customer.model';
import { Sale } from '../../sales/models/sale.model';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

@Table({
  tableName: 'discount_codes',
  timestamps: true,
})
export class DiscountCode extends Model<DiscountCode> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  code: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ENUM(...Object.values(DiscountType)),
    allowNull: false,
  })
  type: DiscountType;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  value: number;

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

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'customer_id',
  })
  customerId: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'expires_at',
  })
  expiresAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  isActive: boolean;

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

  @BelongsTo(() => Customer)
  customer: Customer;

  @HasMany(() => Sale)
  sales: Sale[];
}
