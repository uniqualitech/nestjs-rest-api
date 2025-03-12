import { Expose, Transform } from 'class-transformer';

export class AuthTokenResource {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  @Transform(({ value }) => value * 1000)
  expiresAt: number;
}
