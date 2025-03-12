import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { I18n, I18nContext } from 'nestjs-i18n';
import {
  BAD_REQUEST_RESPONSE,
  UNAUTHORIZE_RESPONSE,
  USER_EXISTS_RESPONSE,
  USER_LOGIN_RESPONSE,
  USER_LOGOUT_RESPONSE,
  USER_RESPONSE,
  USER_VERIFICATION_CODE_SEND_RESPONSE,
} from 'src/constants/swagger.constant';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RegisterDto } from './dto/register.dto';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { AppHeaders } from 'src/decorators/app-headers.decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from 'src/passport/jwt-auth.guard';
import { RolesGuard } from 'src/passport/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/constants/user.constant';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { VerifyVerificationCodeDto } from './dto/verify-verification-code.dto';

@ApiTags('Auth')
@Controller('api/v1/auth')
@UsePipes(ValidationPipe)
@AppHeaders()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register user
   * @param registerDto
   * @returns
   */
  @Post('register')
  @ApiOperation({
    summary: 'Register user',
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse(USER_VERIFICATION_CODE_SEND_RESPONSE)
  @ApiResponse(USER_EXISTS_RESPONSE)
  async register(
    @Body() registerDto: RegisterDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const user = await this.authService.register(registerDto, i18n);

    return {
      statusCode: HttpStatus.CREATED,
      message: i18n.t('translate.REGISTER_SUCCESS'),
      data: plainToInstance(User, user, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Registration/Login user
   * @param loginDto object
   * @returns
   */
  @Post('login')
  @ApiOperation({ summary: 'Register/Login user' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse(USER_EXISTS_RESPONSE)
  @ApiResponse(USER_RESPONSE)
  async loginUser(
    @Body() loginDto: LoginDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const user = await this.authService.loginUser(loginDto, i18n);

    return {
      statusCode: HttpStatus.OK,
      message: i18n.t(
        user?.authentication
          ? 'translate.LOGGED_IN'
          : 'translate.VERIFICATION_CODE_SENT',
      ),
      data: plainToInstance(User, user, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Resend OTP
   * @param sendVerificationCodeDto
   * @param i18n
   * @returns
   */
  @Post('send-verification-code')
  @ApiOperation({
    summary: 'Send verification code',
    description: `Send Verification Code
- Resend OTP
- Forgot Password OTP
    `,
  })
  @ApiResponse(BAD_REQUEST_RESPONSE)
  @HttpCode(HttpStatus.OK)
  async sendVerificationCode(
    @Body() sendVerificationCodeDto: SendVerificationCodeDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    await this.authService.sendVerificationCode(sendVerificationCodeDto, i18n);

    return {
      statusCode: HttpStatus.OK,
      message: i18n.t('translate.CONFIRM_MAIL'),
    };
  }

  /**
   * Verify verification code
   * @param verifyOtpDto object
   * @returns
   */
  @Post('verify-verification-code')
  @ApiOperation({
    summary: 'Verify registration OTP',
  })
  @ApiResponse(USER_LOGIN_RESPONSE)
  @ApiResponse(BAD_REQUEST_RESPONSE)
  @HttpCode(HttpStatus.OK)
  async verifyVerificationCode(
    @Body() verifyVerificationCodeDto: VerifyVerificationCodeDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const user = await this.authService.verifyVerificationCode(
      verifyVerificationCodeDto,
      i18n,
    );

    return {
      statusCode: HttpStatus.OK,
      message: i18n.t('translate.OTP_VERIFIED'),
      data: plainToInstance(User, user, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Verify reset password OTP
   * @param verifyResetPasswordOtpDto
   * @param i18n
   * @returns
   */
  @Post('verify-forgot-password-otp')
  @ApiOperation({
    summary: 'Verify Reset Password OTP',
  })
  // @ApiResponse(VERIFY_RESET_PASSWORD_OTP_RESPONSE)
  @ApiResponse(BAD_REQUEST_RESPONSE)
  @HttpCode(HttpStatus.OK)
  async verifyResetPasswordOTP(
    @Body() verifyVerificationCodeDto: VerifyVerificationCodeDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    await this.authService.verifyResetPasswordOtp(
      verifyVerificationCodeDto,
      i18n,
    );

    return {
      statusCode: HttpStatus.OK,
      message: i18n.t('translate.OTP_VERIFIED'),
    };
  }

  /**
   * Reset password
   * @param resetPasswordDto
   * @param i18n
   * @returns
   */
  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset Password',
  })
  // @ApiResponse(RESET_PASSWORD_RESPONSE)
  @ApiResponse(BAD_REQUEST_RESPONSE)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    await this.authService.resetPassword(resetPasswordDto, i18n);
    return {
      statusCode: HttpStatus.OK,
      message: i18n.t('translate.PASSWORD_CHANGED'),
    };
  }

  /**
   * Social login
   * @param socialLoginDto
   * @returns
   */
  @Post('social-login')
  @ApiOperation({
    summary: 'Social login',
    description: `    providerType = google, apple
    pass idToken for google/apple login => idToken
    pass email if mail is hidden in apple login
    pass fullName if providerType = apple`,
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse(USER_LOGIN_RESPONSE)
  @ApiResponse(UNAUTHORIZE_RESPONSE)
  async socialLogin(
    @Body() socialLoginDto: SocialLoginDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const user = await this.authService.socialLogin(socialLoginDto, i18n);

    return {
      statusCode: HttpStatus.OK,
      message: i18n.t('translate.LOGGED_IN'),
      data: plainToInstance(User, user, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Logout user
   * @param authUser
   * @returns
   */
  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse(USER_LOGOUT_RESPONSE)
  @ApiResponse(UNAUTHORIZE_RESPONSE)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  async logout(
    @AuthUser() authUser: User,
    @Body() logoutDto: LogoutDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    await this.authService.logout(authUser, logoutDto);

    return {
      statusCode: HttpStatus.OK,
      message: i18n.t('translate.LOGGED_OUT'),
    };
  }
}
