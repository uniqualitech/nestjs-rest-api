import { Expose, Transform, Type } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Languages } from 'src/constants/app.constant';
import { dateToTimestamp } from 'src/helpers/date-format.helper';
import {
  AdminRoles,
  ProviderTypes,
  UserRoles,
} from 'src/constants/user.constant';
import { isUrlValid } from 'src/helpers/utils.helper';
import { castToStorage } from 'src/helpers/fileupload.helper';
import { AuthTokenResource } from 'src/resources/auth-token.resource';

@Entity({ name: 'users' })
export class User {
  public jti?: string;

  @Expose()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @Transform(({ value }) => Number(value))
  id: number;

  @Expose()
  @Column({ unique: true })
  uid: string;

  @Expose()
  @Column({ type: 'enum', enum: Languages, default: Languages.EN })
  language: Languages | string;

  @Expose()
  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.USER })
  role: UserRoles | string;

  @Expose()
  @Column({ type: 'enum', enum: AdminRoles, nullable: true })
  adminRole: AdminRoles | string;

  @Expose()
  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: true })
  verificationCodeExpiredAt: Date;

  @Expose()
  @Transform(({ value }) => dateToTimestamp(value))
  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Expose()
  @Column({ nullable: true })
  fullName: string;

  @Expose()
  @Transform(({ value }) => (isUrlValid(value) ? value : castToStorage(value)))
  @Column({ nullable: true, default: null })
  profilePic: string;

  @Column({ nullable: true })
  forgotPasswordCode: string;

  @Column({ nullable: true })
  forgotPasswordCodeExpiredAt: Date;

  @Expose()
  @Column({ default: true })
  isNotificationOn: boolean;

  @Expose()
  @Column({ default: false })
  isBlocked: boolean;

  @Expose()
  @Column({ default: true })
  isFirstTimeUser: boolean;

  @Column({ default: false })
  @Expose()
  isSocialLoggedIn: boolean;

  @Column({ nullable: true })
  providerId: string;

  @Expose()
  @Column({ nullable: true, type: 'enum', enum: ProviderTypes })
  providerType: ProviderTypes;

  @Expose()
  @Transform(({ value }) => dateToTimestamp(value))
  @Column({ nullable: true })
  subscriptionExpireAt: Date;

  @CreateDateColumn()
  @Expose()
  @Transform(({ value }) => dateToTimestamp(value))
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @Expose()
  @Type(() => AuthTokenResource)
  authentication: AuthTokenResource;
}
