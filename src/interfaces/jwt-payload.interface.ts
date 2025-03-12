export interface JwtPayload {
  jti: string;
  uid: string;
  iat: number;
  exp: number;
}
