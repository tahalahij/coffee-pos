import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Campaign } from './campaign.model';
import { Product } from '../../products/models/product.model';

@Table({
  tableName: 'campaign_products',
  timestamps: false,
  underscored: true,
})
export class CampaignProduct extends Model<CampaignProduct> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Campaign)
  @Column({ field: 'campaign_id' })
  campaignId: number;

  @ForeignKey(() => Product)
  @Column({ field: 'product_id' })
  productId: number;

  @BelongsTo(() => Campaign)
  campaign: Campaign;

  @BelongsTo(() => Product)
  product: Product;
}