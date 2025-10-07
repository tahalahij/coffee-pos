import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, Unique, CreatedAt, UpdatedAt, HasMany, Default } from 'sequelize-typescript';
import { Product } from '../../products/models/product.model';

@Table({
  tableName: 'categories',
  timestamps: true,
  underscored: true,
})
export class Category extends Model<Category> {
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

  @Default('#6B7280')
  @Column(DataType.STRING)
  color: string;

  @Default(true)
  @Column({ field: 'is_active' })
  isActive: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @HasMany(() => Product)
  products: Product[];
}
