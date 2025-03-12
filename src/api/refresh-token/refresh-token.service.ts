import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import moment from 'moment';
import { Repository } from 'typeorm';
import { encrypt } from 'src/helpers/utils.helper';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Find refresh token by id
   * @param id
   * @returns
   */
  async findOne(id: string) {
    return await this.refreshTokenRepository.findOne({
      where: { id },
      relations: ['accessToken', 'accessToken.user'],
    });
  }

  /**
   * Create refresh token
   * @param decodedToken
   * @returns
   */
  async createToken(decodedToken: any) {
    const refreshTokenLifeTime = moment
      .unix(decodedToken.exp)
      .add(30, 'd')
      .toDate();

    const refreshToken = randomBytes(64).toString('hex');

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        id: refreshToken,
        accessToken: decodedToken.jti,
        expiresAt: refreshTokenLifeTime,
      }),
    );

    return encrypt(refreshToken);
  }

  /**
   * Revoke refresh token using JTI
   * @param jwtUniqueIdentifier
   */
  async revokeTokenUsingJti(jwtUniqueIdentifier: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { accessToken: { id: jwtUniqueIdentifier } },
    });

    refreshToken.isRevoked = true;
    await this.refreshTokenRepository.save(refreshToken);
  }
}
