import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  REGISTER_DEVICE_TOKEN_RESPONSE,
  SEND_PUSH_RESPONSE,
} from 'src/constants/swagger.constant';
import { DeviceTokenService } from './device-token.service';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { AppHeaders } from 'src/decorators/app-headers.decorator';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from 'src/passport/jwt-auth.guard';
import { RolesGuard } from 'src/passport/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/constants/user.constant';

@ApiTags('App Device Token')
@Controller('api/v1/')
@UsePipes(ValidationPipe)
@AppHeaders()
export class DeviceTokenController {
  constructor(private readonly deviceTokenService: DeviceTokenService) {}

  /**
   * Register device token for push notification
   * @param authUser
   * @param createDeviceTokenDto
   * @returns
   */
  @Post('device-token')
  @ApiOperation({
    summary: 'Register device token for push notification',
    description: '    deviceType: iOS | Android',
  })
  @ApiResponse(REGISTER_DEVICE_TOKEN_RESPONSE)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AuthUser() authUser: User,
    @Body() createDeviceTokenDto: CreateDeviceTokenDto,
  ) {
    await this.deviceTokenService.create(createDeviceTokenDto, authUser);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Device token registered successfully',
    };
  }

  /**
   * Send test push notification
   * @param sendNotificationDto
   * @returns
   */
  @Post('send-notification')
  @ApiOperation({
    summary: 'Send test push notification',
  })
  @ApiResponse(SEND_PUSH_RESPONSE)
  @HttpCode(HttpStatus.OK)
  async sendPush(@Body() sendNotificationDto: SendNotificationDto) {
    await this.deviceTokenService.sendPush(sendNotificationDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification successfully sent',
    };
  }
}
