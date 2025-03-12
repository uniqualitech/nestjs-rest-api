import { AccessToken } from 'src/api/access-token/entities/access-token.entity';
import { Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => AccessToken, (token) => token.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  accessToken: Relation<AccessToken>;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ default: null })
  expiresAt: Date;
}
