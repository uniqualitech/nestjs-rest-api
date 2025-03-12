import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { I18nService } from 'nestjs-i18n';
import { Languages } from 'src/constants/app.constant';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/api/user/entities/user.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/passport/jwt-auth.guard';
import { RolesGuard } from 'src/passport/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/constants/user.constant';
import { AuthUser } from 'src/decorators/auth-user.decorator';

@ApiTags('Admin Auth')
@Controller('admin')
@UsePipes(ValidationPipe)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private i18n: I18nService,
  ) {}

  /**
   * Login admin
   * @param req
   * @param res
   * @returns
   */
  @Post('/login')
  async login(@Body() adminLoginDto: AdminLoginDto) {
    const user = await this.adminService.login(adminLoginDto);

    return {
      statusCode: HttpStatus.OK,
      message: this.i18n.t('translate.LOGGED_IN', { lang: Languages.EN }),
      data: plainToInstance(User, user, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Change admin password
   * @param req
   * @param res
   * @returns
   */
  @Post('/change-password')
  @ApiOperation({
    summary: 'Change Password',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async changePassword(
    @AuthUser() authUser: User,
    @Body() adminChangePasswordDto: AdminChangePasswordDto,
  ) {
    await this.adminService.changePassword(authUser, adminChangePasswordDto);

    return {
      statusCode: HttpStatus.OK,
      message: this.i18n.t('translate.PASSWORD_CHANGED', {
        lang: Languages.EN,
      }),
    };
    // return res.json({
    //   statusCode: HttpStatus.OK,
    //   message: 'Password has been changed successfully',
    // });
  }
  /**
   * Logout user
   * @param authUser
   * @returns
   */
  @Get('logout')
  @ApiOperation({
    summary: 'Logout user',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async logout(@AuthUser() authUser: User) {
    await this.adminService.logout(authUser);

    return {
      statusCode: HttpStatus.OK,
      message: this.i18n.t('translate.LOGGED_OUT'),
    };
  }

  /**
   * Dashboard data
   * @param req
   * @param res
   * @returns
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async dashboard() {
    const data = await this.adminService.dashboardData();

    return {
      statusCode: HttpStatus.OK,
      message: this.i18n.t('translate.SUCCESS'),
      data,
    };
  }
}
