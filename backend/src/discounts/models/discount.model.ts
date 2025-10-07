import { Column, Model, Table, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

@Table({
  tableName: 'discounts',
  timestamps: true,
})
export class Discount extends Model<Discount> {
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
    type: DataType.STRING,
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
    field: 'min_amount',
  })
  minAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'max_discount',
  })
  maxDiscount: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  isActive: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'start_date',
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'end_date',
  })
  endDate: Date;

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
}
