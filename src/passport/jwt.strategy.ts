import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccessTokenService } from 'src/api/access-token/access-token.service';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private accessTokensService: AccessTokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.APP_KEY,
    });
  }

  /**
   * validate user
   * @param payload
   * @returns
   */
  async validate(payload: JwtPayload) {
    const accessToken = await this.accessTokensService.findOne(payload?.jti);

    if (!accessToken || !accessToken.user) {
      throw new UnauthorizedException();
    }

    return { ...accessToken.user, jti: payload?.jti };
  }
}
