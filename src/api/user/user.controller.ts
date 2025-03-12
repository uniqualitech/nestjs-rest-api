import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import {
  BAD_REQUEST_RESPONSE,
  UNAUTHORIZE_RESPONSE,
  USER_DELETE_PROFILE_RESPONSE,
  USER_RESPONSE,
  USER_UPDATE_PROFILE_RESPONSE,
} from 'src/constants/swagger.constant';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AppHeaders } from 'src/decorators/app-headers.decorator';
import { JwtAuthGuard } from 'src/passport/jwt-auth.guard';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { RolesGuard } from 'src/passport/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/constants/user.constant';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@Controller('api/v1/user')
@UsePipes(ValidationPipe)
@AppHeaders()
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** Get login user details
   * @param authUser
   * @returns
   */
  @Get()
  @ApiOperation({ summary: 'Get login user details' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse(USER_RESPONSE)
  @ApiResponse(UNAUTHORIZE_RESPONSE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  async userDetails(
    @AuthUser() authUser: User,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const user = await this.userService.getUserById(authUser.id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: plainToInstance(User, user, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Update user
   * @param authUser
   * @param updateProfileDto
   * @returns
   */
  @Put()
  @ApiOperation({
    summary: 'Update user details',
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse(USER_UPDATE_PROFILE_RESPONSE)
  @ApiResponse(UNAUTHORIZE_RESPONSE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profilePic'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  async updateProfile(
    @AuthUser() authUser: User,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() profilePic: Express.Multer.File,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const user = await this.userService.updateProfile(
      updateProfileDto,
      authUser,
      profilePic,
      i18n,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Your profile has been successfully updated',
      data: plainToInstance(User, user, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Change user password
   * @param authUser
   * @param changePasswordDto
   * @param i18n
   * @returns
   */
  @Post('change-password')
  @ApiOperation({
    summary: 'Change password',
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse(BAD_REQUEST_RESPONSE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  async changePassword(
    @AuthUser() authUser: User,
    @Body() changePasswordDto: ChangePasswordDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    await this.userService.changePassword(changePasswordDto, authUser, i18n);

    return {
      statusCode: HttpStatus.OK,
      message: i18n.t('translate.PASSWORD_CHANGED'),
    };
  }

  /**
   * Delete user
   * @param authUser
   * @returns
   */
  @Delete()
  @ApiOperation({
    summary: 'Delete user',
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse(USER_DELETE_PROFILE_RESPONSE)
  @ApiResponse(UNAUTHORIZE_RESPONSE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  async deleteProfile(
    @AuthUser() authUser: User,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    await this.userService.deleteProfile(authUser, deleteUserDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Your profile has been successfully deleted',
    };
  }
}
