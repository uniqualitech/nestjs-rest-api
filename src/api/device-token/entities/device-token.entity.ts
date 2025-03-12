import { User } from 'src/api/user/entities/user.entity';
import { DeviceTypes } from 'src/constants/app.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class DeviceToken {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @Column()
  deviceId: string;

  @Column({
    type: 'enum',
    enum: DeviceTypes,
    default: DeviceTypes.IOS,
  })
  deviceType: DeviceTypes;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: Relation<User>;
}
