import { Expose, Transform } from 'class-transformer';
import { dateToTimestamp } from 'src/helpers/date-format.helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'improvements' })
export class Improvement {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Expose()
  @Transform(({ value }) => Number(value))
  id: number;

  @Column()
  @Expose()
  iid: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: Relation<User>;

  @Column({ nullable: true, type: 'text' })
  @Expose()
  description: string;

  @CreateDateColumn()
  @Expose()
  @Transform(({ value }) => dateToTimestamp(value))
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
