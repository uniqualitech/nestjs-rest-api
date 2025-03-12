import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import moment from 'moment';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { AccessToken } from './entities/access-token.entity';

@Injectable()
export class AccessTokenService {
  constructor(
    @InjectRepository(AccessToken)
    private accessTokenRepository: Repository<AccessToken>,

    private jwtService: JwtService,
  ) {}

  /**
   * Find one access token by id
   * @param id
   */
  async findOne(id: string) {
    return await this.accessTokenRepository.findOne({
      where: {
        id: id,
        expiresAt: MoreThan(moment().toDate()),
        isRevoked: false,
        user: {
          isBlocked: false,
          deletedAt: IsNull(),
          verifiedAt: Not(IsNull()),
        },
      },
      relations: ['user'],
    });
  }

  /**
   * Create JWT token
   * @param user
   * @returns
   */
  async createToken(user: User) {
    const jwtToken = this.jwtService.sign({
      uid: user.uid,
      jti: randomBytes(32).toString('hex'),
    });

    const decodedToken = await this.jwtService.decode(jwtToken);

    const { iat, exp, jti } = decodedToken;
    const createdAt = moment.unix(iat).toDate();
    const expiresAt = moment.unix(exp).toDate();

    const accessToken = await this.accessTokenRepository.save(
      this.accessTokenRepository.create({
        id: jti,
        expiresAt,
        createdAt,
        user: { id: user.id },
      }),
    );

    return { accessToken, jwtToken, decodedToken };
  }

  /**
   * Revoke access token using Jwt Unique Identifier
   * @param jwtUniqueIdentifier
   */
  async revokeToken(jwtUniqueIdentifier: string) {
    await this.accessTokenRepository.save({
      id: jwtUniqueIdentifier,
      isRevoked: true,
    });
  }

  /**
   * Check JWT Token validity
   * @param jwtToken
   * @return boolean
   */
  async hasTokenExpired(jwtToken: any) {
    const accessToken = await this.findOne(jwtToken['jti']);
    const todaysDate = new Date();

    return !accessToken ||
      accessToken.isRevoked ||
      accessToken.expiresAt < todaysDate
      ? true
      : false;
  }
}
