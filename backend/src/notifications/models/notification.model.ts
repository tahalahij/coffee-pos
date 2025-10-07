import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, CreatedAt, Default } from 'sequelize-typescript';

export enum NotificationType {
  CAMPAIGN = 'CAMPAIGN',
  LOYALTY_REWARD = 'LOYALTY_REWARD',
  BIRTHDAY = 'BIRTHDAY',
  LOW_POINTS = 'LOW_POINTS',
  SPECIAL_OFFER = 'SPECIAL_OFFER',
  GENERAL = 'GENERAL'
}

@Table({
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
})
export class Notification extends Model<Notification> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column({ field: 'customer_id' })
  customerId: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  message: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(NotificationType)))
  type: NotificationType;

  @Default(false)
  @Column({ field: 'is_read' })
  isRead: boolean;

  @Column({ field: 'scheduled_at' })
  scheduledAt: Date;

  @Column({ field: 'sent_at' })
  sentAt: Date;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;
}