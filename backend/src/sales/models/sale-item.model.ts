import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import { Sale } from './sale.model';
import { Product } from '../../products/models/product.model';

@Table({
  tableName: 'sale_items',
  timestamps: true,
  underscored: true,
})
export class SaleItem extends Model<SaleItem> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Sale)
  @AllowNull(false)
  @Column({ field: 'sale_id' })
  saleId: number;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column({ field: 'product_id' })
  productId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  quantity: number;

  @AllowNull(false)
  @Column({ type: DataType.DECIMAL(10, 2), field: 'unit_price' })
  unitPrice: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(10, 2), field: 'discount_amount' })
  discountAmount: number;

  @AllowNull(false)
  @Column({ type: DataType.DECIMAL(10, 2), field: 'total_amount' })
  totalAmount: number;

  @BelongsTo(() => Sale)
  sale: Sale;

  @BelongsTo(() => Product)
  product: Product;
}
