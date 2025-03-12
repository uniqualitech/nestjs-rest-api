import { Expose, Transform, Type } from 'class-transformer';
import { User } from 'src/api/user/entities/user.entity';
import { DeviceTypes } from 'src/constants/app.constant';
import { dateToTimestamp } from 'src/helpers/date-format.helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserSubscription {
  @Expose()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  @Expose()
  productId: string;

  @Column({
    type: 'text',
    comment: 'purchaseToken: for Apple IAP',
  })
  purchaseToken: string;

  @Column({ default: false })
  @Expose()
  subscriptionState: boolean;

  @Column({ nullable: true })
  @Expose()
  originalTransactionId: string;

  @Column({ nullable: true })
  @Expose()
  orderId: string;

  @Column({ nullable: true })
  @Expose()
  subscriptionId: string;

  @Column({ type: 'enum', enum: DeviceTypes })
  @Expose()
  purchaseState: DeviceTypes;

  @Column({ default: false })
  @Expose()
  isAutoRenewing: boolean;

  @Column({ default: false })
  @Expose()
  isTrial: boolean;

  @Column({ default: true })
  @Expose()
  isTestEnvironment: boolean;

  @Expose()
  isSubscriptionRunning: boolean;

  @Column({ type: 'text' })
  receipt: string;

  @Column({ type: 'timestamp', nullable: true })
  @Expose()
  @Transform(({ value }) => dateToTimestamp(value))
  purchasedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Expose()
  @Transform(({ value }) => dateToTimestamp(value))
  expireAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  cancelledAt: Date;

  @Column({ default: true })
  @Expose()
  isCheckedAgain: boolean;

  @Column()
  @Expose()
  deviceId: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Type(() => User)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
