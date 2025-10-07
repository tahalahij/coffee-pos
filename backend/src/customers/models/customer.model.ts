import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, Unique, CreatedAt, UpdatedAt, HasMany, Default } from 'sequelize-typescript';
import { Sale } from '../../sales/models/sale.model';
import { LoyaltyTransaction } from '../../loyalty/models/loyalty-transaction.model';
import { CampaignParticipation } from '../../campaigns/models/campaign-participation.model';

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

@Table({
  tableName: 'customers',
  timestamps: true,
  underscored: true,
})
export class Customer extends Model<Customer> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  phone: string;

  @Unique
  @Column(DataType.STRING)
  email: string;

  @Column({ field: 'date_of_birth' })
  dateOfBirth: Date;

  @Default(0)
  @Column({ field: 'loyalty_points' })
  loyaltyPoints: number;

  @Default(0)
  @Column({ field: 'total_spent' })
  totalSpent: number;

  @Default(0)
  @Column({ field: 'visit_count' })
  visitCount: number;

  @Column({ field: 'last_visit' })
  lastVisit: Date;

  @Default(LoyaltyTier.BRONZE)
  @Column({ field: 'loyalty_tier' })
  loyaltyTier: LoyaltyTier;

  @Default(true)
  @Column({ field: 'is_active' })
  isActive: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @HasMany(() => Sale)
  sales: Sale[];

  @HasMany(() => LoyaltyTransaction)
  loyaltyTransactions: LoyaltyTransaction[];

  @HasMany(() => CampaignParticipation)
  campaignParticipations: CampaignParticipation[];
}
