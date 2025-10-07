import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, CreatedAt, UpdatedAt, HasMany, Default } from 'sequelize-typescript';
import { PurchaseItem } from './purchase-item.model';

export enum PurchaseStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

@Table({
  tableName: 'purchases',
  timestamps: true,
  underscored: true,
})
export class Purchase extends Model<Purchase> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column({ field: 'supplier_name' })
  supplierName: string;

  @Column({ field: 'supplier_contact' })
  supplierContact: string;

  @AllowNull(false)
  @Column({ field: 'total_amount' })
  totalAmount: number;

  @Default(PurchaseStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(PurchaseStatus)))
  status: PurchaseStatus;

  @Column(DataType.TEXT)
  notes: string;

  @Column({ field: 'received_at' })
  receivedAt: Date;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @HasMany(() => PurchaseItem)
  items: PurchaseItem[];
}
