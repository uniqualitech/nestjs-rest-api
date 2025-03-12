import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'access_tokens' })
export class AccessToken {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: Relation<User>;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
