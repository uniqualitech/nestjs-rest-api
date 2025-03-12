import { UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

const { GOOGLE_CLIENT_ID_ANDROID, GOOGLE_CLIENT_ID_IOS } = process.env;
const client = new OAuth2Client();

export default class SocialiteGoogle {
  async generateUserFromToken(token: string) {
    try {
      const googleClientAudience = [
        GOOGLE_CLIENT_ID_ANDROID,
        GOOGLE_CLIENT_ID_IOS,
      ];

      const login = await client.verifyIdToken({
        idToken: token,
        audience: googleClientAudience,
      });

      const payload = login.getPayload();
      const audience = payload.aud;

      if (!googleClientAudience.includes(audience)) {
        throw new UnauthorizedException(
          `Error while authenticating google user: audience mismatch`,
        );
      }

      return {
        providerId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profilePic: payload.picture,
      };
    } catch (err) {
      throw new UnauthorizedException('Error while authenticating google user');
    }
  }
}
