import { DeviceTypes } from 'src/constants/app.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AppVersions {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @Column()
  minVersion: number;

  @Column()
  latestVersion: number;

  @Column({ nullable: true })
  link: string;

  @Column({ type: 'enum', enum: DeviceTypes })
  platform: DeviceTypes;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
