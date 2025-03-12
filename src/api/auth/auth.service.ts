import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogoutDto } from './dto/logout.dto';
import moment from 'moment';
import { MailerService } from '@nestjs-modules/mailer';
import { VerifyVerificationCodeDto } from './dto/verify-verification-code.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { Languages } from 'src/constants/app.constant';
import { RegisterDto } from './dto/register.dto';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserService } from '../user/user.service';
import { AccessTokenService } from '../access-token/access-token.service';
import { User } from '../user/entities/user.entity';
import { DeviceToken } from '../device-token/entities/device-token.entity';
import { generateOtp } from 'src/helpers/utils.helper';
import { comparePassword, encodePassword } from 'src/helpers/bcrypt.helper';
import { ProviderTypes } from 'src/constants/user.constant';
import SocialiteGoogle from 'src/socialite/google.socialite';
import { SocialiteApple } from 'src/socialite/apple.socialite';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private accessTokenService: AccessTokenService,
    private refreshTokenService: RefreshTokenService,
    private mailerService: MailerService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
  ) {}

  /**
   * Register user
   * @param loginDto
   * @returns
   */
  async register(
    registerDto: RegisterDto,
    i18n: I18nContext<I18nTranslations>,
  ) {
    registerDto.email = registerDto.email.trim().toLowerCase();
    const user = await this.userService.getUserByEmail(registerDto.email);

    if (user) {
      if (user.isBlocked) {
        throw new BadRequestException(
          i18n.t('exception.USER_BLOCKED_BY_ADMIN'),
        );
      }

      if (user.deletedAt) {
        throw new BadRequestException(i18n.t('exception.ACCOUNT_DISABLED'));
      }

      /* check social login user */
      if (user.providerType && user.providerId) {
        throw new BadRequestException(
          i18n.t('exception.EMAIL_ASSOCIATED_WITH_SOCIAL_PLATFORM', {
            args: { property: user?.providerType },
          }),
        );
      }

      throw new BadRequestException(
        i18n.t('exception.USER_ALREADY_REGISTERED'),
      );
    }

    /* send verification code */
    const verificationCode = generateOtp();
    const verificationCodeExpiredAt = moment().add(10, 'minutes').toDate();

    /* store user details */
    const registeredUser = await this.userService.createOrUpdate(
      {
        email: registerDto.email,
        password: encodePassword(registerDto.password),
        language: i18n.lang,
        verificationCode: verificationCode,
        verificationCodeExpiredAt: verificationCodeExpiredAt,
      },
      null,
      i18n,
    );

    this.sendVerifyAccountMail(registeredUser, i18n);

    return registeredUser;
  }

  /**
   * Send Verification code to user
   * @param user object
   */
  async sendVerifyAccountMail(user: User, i18n: I18nContext<I18nTranslations>) {
    /* send verification code mail */
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: i18n.t('email.VERIFICATION_MAIL_SUBJECT'),
        template: `verify-email/en`, //`verify-email/${i18n.lang}`,
        context: { verificationCode: user.verificationCode },
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Login User
   * @param loginDto object
   * @param i18n object
   * @returns Promise<User>
   */
  async loginUser(loginDto: LoginDto, i18n: I18nContext<I18nTranslations>) {
    const { email, password } = loginDto;
    const user = await this.userService.getUserByEmailWithConditions(
      email.trim().toLowerCase(),
      i18n,
    );

    if (!comparePassword(password, user.password)) {
      throw new ConflictException(i18n.t('exception.INVALID_PASSWORD'));
    }

    const setUserData: Partial<User> = {
      language: i18n.lang,
      isFirstTimeUser: !user.verifiedAt,
      ...(user.verifiedAt
        ? {}
        : {
            verificationCode: generateOtp(),
            verificationCodeExpiredAt: moment().add(10, 'minutes').toDate(),
            verifiedAt: null,
          }),
    };

    const updatedUser = await this.userService.createOrUpdate(
      setUserData,
      user.id,
      i18n,
    );

    if (!user.verifiedAt) {
      await this.sendVerifyAccountMail(updatedUser, i18n);
    }

    const authentication = user.verifiedAt
      ? await this.generateTokens(updatedUser)
      : null;

    return { ...updatedUser, authentication };
  }

  /**
   * Generate JWT tokens
   * @param user
   * @returns
   */
  async generateTokens(user: User) {
    const { decodedToken, jwtToken } =
      await this.accessTokenService.createToken(user);

    const refreshToken = await this.refreshTokenService.createToken(
      decodedToken,
    );

    return {
      accessToken: jwtToken,
      refreshToken,
      expiresAt: decodedToken['exp'],
    };
  }

  /**
   * Verify OTP
   * @param verifyVerificationCodeDto
   * @returns
   */
  async verifyVerificationCode(
    verifyVerificationCodeDto: VerifyVerificationCodeDto,
    i18n: I18nContext<I18nTranslations>,
  ) {
    const email = verifyVerificationCodeDto.email.trim().toLowerCase();
    const { otp } = verifyVerificationCodeDto;

    /* find user by email */
    const user = await this.userService.getUserByEmailWithConditions(
      email,
      i18n,
    );

    /* Validate user status */
    if (user.verifiedAt) {
      throw new BadRequestException(i18n.t('exception.EMAIL_ALREADY_VERIFIED'));
    }

    /* Check OTP */
    if (user.verificationCode !== otp) {
      throw new BadRequestException(i18n.t('exception.INVALID_OTP'));
    }

    /* Check if OTP is expired */
    if (moment().isAfter(user.verificationCodeExpiredAt)) {
      throw new BadRequestException(i18n.t('exception.OTP_EXPIRED'));
    }

    /* Update user verification status */
    const loggedUser = await this.userService.createOrUpdate(
      {
        verificationCode: null,
        verificationCodeExpiredAt: null,
        verifiedAt: moment().toDate(),
      },
      user.id,
      i18n,
    );

    /* Generate authentication tokens */
    const authentication = await this.generateTokens(loggedUser);

    return { ...loggedUser, authentication };
  }

  /**
   * Resend OTP
   * @param sendVerificationCodeDto
   * @returns
   */
  async sendVerificationCode(
    sendVerificationCodeDto: SendVerificationCodeDto,
    i18n: I18nContext<I18nTranslations>,
  ) {
    const email = sendVerificationCodeDto.email.trim().toLowerCase();
    const { isForgotPasswordOtp } = sendVerificationCodeDto;

    /* Find user */
    const user = await this.userService.getUserByEmailWithConditions(
      email,
      i18n,
    );

    if (!isForgotPasswordOtp && user.verifiedAt) {
      throw new BadRequestException(i18n.t('exception.EMAIL_ALREADY_VERIFIED'));
    }

    /* Generate OTP */
    const verificationCode = generateOtp();
    const codeExpiredAt = moment().add(10, 'minutes').toDate();

    /* Send mail */
    try {
      const subjectKey = isForgotPasswordOtp
        ? 'email.FORGOT_PASSWORD_MAIL_SUBJECT'
        : 'email.VERIFICATION_MAIL_SUBJECT';

      const template = isForgotPasswordOtp
        ? `forgot-password/en`
        : `verify-email/en`;

      const context = isForgotPasswordOtp
        ? { user, forgotPasswordCode: verificationCode }
        : { verificationCode };

      this.mailerService.sendMail({
        to: email,
        subject: i18n.t(subjectKey),
        template,
        context,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }

    /* Update user */
    const updateData = isForgotPasswordOtp
      ? {
          forgotPasswordCode: verificationCode,
          forgotPasswordCodeExpiredAt: codeExpiredAt,
        }
      : {
          verificationCode,
          verificationCodeExpiredAt: codeExpiredAt,
          verifiedAt: null,
        };

    await this.userService.createOrUpdate(updateData, user.id, i18n);
  }

  /**
   * Verify Reset Password OTP
   * @param verifyVerificationCodeDto
   */
  async verifyResetPasswordOtp(
    verifyVerificationCodeDto: VerifyVerificationCodeDto,
    i18n: I18nContext<I18nTranslations>,
  ) {
    const email = verifyVerificationCodeDto.email.trim().toLowerCase();
    const otp = Number(verifyVerificationCodeDto.otp); // Ensure OTP is a number

    /* Find user */
    const user = await this.userService.getUserByEmailWithConditions(
      email,
      i18n,
    );

    /* OTP Validation */
    if (Number(user.forgotPasswordCode) !== otp) {
      throw new BadRequestException(i18n.t('exception.INVALID_OTP'));
    }

    if (
      !user.forgotPasswordCodeExpiredAt ||
      Date.now() > user.forgotPasswordCodeExpiredAt.getTime()
    ) {
      throw new BadRequestException(i18n.t('exception.OTP_EXPIRED'));
    }

    /* Clear OTP */
    await this.userService.createOrUpdate(
      { forgotPasswordCode: null, forgotPasswordCodeExpiredAt: null },
      user.id,
      i18n,
    );
  }

  /**
   * Reset Password
   * @param resetPasswordDto
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    i18n: I18nContext<I18nTranslations>,
  ) {
    const email = resetPasswordDto.email.trim().toLowerCase();
    const newPassword = resetPasswordDto.password;

    /* Find user */
    const user = await this.userService.getUserByEmailWithConditions(
      email,
      i18n,
    );

    /* Update password and clear OTP */
    await this.userService.createOrUpdate(
      {
        password: encodePassword(newPassword),
        forgotPasswordCode: null, // Clear OTP
        forgotPasswordCodeExpiredAt: null, // Clear expiration date
      },
      user.id,
      i18n,
    );
  }

  /**
   * Social login
   * @param socialLoginDto
   * @returns
   */
  async socialLogin(
    socialLoginDto: SocialLoginDto,
    i18n: I18nContext<I18nTranslations>,
  ) {
    let socialUser: any;

    /* Identify social provider and fetch user */
    switch (socialLoginDto.providerType) {
      case ProviderTypes.GOOGLE:
        socialUser = await new SocialiteGoogle().generateUserFromToken(
          socialLoginDto.token,
        );
        break;
      case ProviderTypes.APPLE:
        socialUser = await new SocialiteApple(
          this.userRepository,
        ).generateUserFromToken(socialLoginDto.token);
        break;
      default:
        throw new BadRequestException(
          i18n.t('exception.INVALID_SOCIAL_PROVIDER'),
        );
    }

    /* Ensure social user data is valid */
    if (!socialUser) {
      throw new BadRequestException(
        i18n.t('exception.NOT_FOUND', { args: { property: 'User' } }),
      );
    }

    socialUser.email = socialUser.email ?? socialLoginDto.email;
    socialUser.providerType = socialLoginDto.providerType;

    /* Check if a user exists with this email */
    const existingUser = await this.userService.getUserByEmail(
      socialUser.email,
    );

    if (existingUser && existingUser.providerType !== socialUser.providerType) {
      if (existingUser.deletedAt) {
        throw new BadRequestException(i18n.t('exception.ACCOUNT_DISABLED'));
      }
      throw new BadRequestException(
        i18n.t('exception.USER_ALREADY_REGISTERED'),
      );
    }

    /* Find user by provider type & ID */
    const user = await this.userService.getUserByProviderTypeAndId(
      socialUser.providerType,
      socialUser.providerId ?? null,
    );

    socialUser.isSocialLoggedIn = true;

    /* Create or update user */
    const newUser = user
      ? await this.userService.createOrUpdate(
          { isFirstTimeUser: false, language: i18n?.lang ?? Languages.EN },
          user.id,
          i18n,
        )
      : await this.userService.createOrUpdate(
          {
            ...socialUser,
            isFirstTimeUser: true,
            verifiedAt: moment().toDate(),
            fullName: socialLoginDto.fullName,
            language: i18n?.lang ?? Languages.EN,
            isValidUser: true,
          },
          null,
          i18n,
        );

    /* Generate authentication tokens */
    const tokens = await this.generateTokens(newUser);

    return { ...newUser, authentication: { ...tokens } };
  }

  /**
   * Logout user
   * @param user
   */
  async logout(user: User, logoutDto: LogoutDto) {
    if (logoutDto.deviceId) {
      await this.deviceTokenRepository.delete({ deviceId: logoutDto.deviceId });
    }

    await Promise.all([
      this.accessTokenService.revokeToken(user.jti),
      this.refreshTokenService.revokeTokenUsingJti(user.jti),
    ]);
  }
}
