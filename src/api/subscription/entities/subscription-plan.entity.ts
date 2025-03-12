import { Expose, Transform } from 'class-transformer';
import { SubscriptionTypes } from 'src/constants/subscription.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'subscription_plans' })
export class SubscriptionPlan {
  @Expose()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @Transform(({ value }) => Number(value))
  id: number;

  @Expose()
  @Column()
  uniqueId: string;

  @Expose()
  @Column({ default: null, type: 'enum', enum: SubscriptionTypes })
  type: SubscriptionTypes;

  @Column()
  @Expose()
  title: string;

  @Column({ nullable: true, comment: 'in $' })
  @Expose()
  @Transform(({ value }) => Number(value))
  originalPrice: string;

  @Expose()
  @Transform(({ value }) => Number(value))
  @Column({ nullable: true, comment: 'in %' })
  discount: string;

  @Column({ nullable: true, comment: 'in $' })
  @Expose()
  @Transform(({ value }) => Number(value))
  price: string;

  @Column({ nullable: true })
  @Expose()
  productId: string;

  @Column({ nullable: true, type: 'longtext' })
  @Expose()
  features: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
