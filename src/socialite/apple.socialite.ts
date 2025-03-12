import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/api/user/entities/user.entity';
import { ProviderTypes } from 'src/constants/user.constant';
import { Repository } from 'typeorm';
import verifyAppleToken from 'verify-apple-id-token';

@Injectable()
export class SocialiteApple {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Generate user from token
   * @param token string
   * @returns Promise<object>
   */
  async generateUserFromToken(token: string) {
    try {
      const jwtClaims = await verifyAppleToken({
        idToken: token,
        clientId: [
          process.env.APPLE_CLIENT_ID_IOS,
          process.env.APPLE_CLIENT_ID_ANDROID,
        ],
      });

      const { sub, email } = jwtClaims;

      const user = await this.userRepository.findOneBy({
        providerType: ProviderTypes.APPLE,
        providerId: sub,
      });

      return {
        providerId: user?.providerId || sub,
        email: user?.email || email,
      };
    } catch (err) {
      throw new UnauthorizedException('Error while authenticating apple user');
    }
  }
}
