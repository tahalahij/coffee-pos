import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, Unique, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany, Default } from 'sequelize-typescript';
import { Category } from '../../categories/models/category.model';
import { SaleItem } from '../../sales/models/sale-item.model';
import { PurchaseItem } from '../../purchases/models/purchase-item.model';
import { CampaignProduct } from '../../campaigns/models/campaign-product.model';

@Table({
  tableName: 'products',
  timestamps: true,
  underscored: true,
})
export class Product extends Model<Product> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  price: number;

  @Column(DataType.DECIMAL(10, 2))
  cost: number;

  @Unique
  @Column(DataType.STRING)
  sku: string;

  @Column({ field: 'image_url' })
  imageUrl: string;

  @ForeignKey(() => Category)
  @AllowNull(false)
  @Column({ field: 'category_id' })
  categoryId: number;

  @Default(true)
  @Column({ field: 'is_available' })
  isAvailable: boolean;

  @Default(0)
  @Column(DataType.INTEGER)
  stock: number;

  @Column({ field: 'low_stock_alert' })
  lowStockAlert: number;

  @Column({ field: 'min_stock_level' })
  minStockLevel: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @BelongsTo(() => Category)
  category: Category;

  @HasMany(() => SaleItem)
  saleItems: SaleItem[];

  @HasMany(() => PurchaseItem)
  purchaseItems: PurchaseItem[];

  @HasMany(() => CampaignProduct)
  campaignProducts: CampaignProduct[];
}
