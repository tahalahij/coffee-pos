import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Purchase } from './purchase.model';
import { Product } from '../../products/models/product.model';

@Table({
  tableName: 'purchase_items',
  timestamps: false,
  underscored: true,
})
export class PurchaseItem extends Model<PurchaseItem> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Purchase)
  @AllowNull(false)
  @Column({ field: 'purchase_id' })
  purchaseId: number;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column({ field: 'product_id' })
  productId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  quantity: number;

  @AllowNull(false)
  @Column({ field: 'unit_cost' })
  unitCost: number;

  @AllowNull(false)
  @Column({ field: 'total_cost' })
  totalCost: number;

  @BelongsTo(() => Purchase)
  purchase: Purchase;

  @BelongsTo(() => Product)
  product: Product;
}
