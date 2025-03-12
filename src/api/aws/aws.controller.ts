import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AwsService } from './aws.service';
import { JwtAuthGuard } from 'src/passport/jwt-auth.guard';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('App AWS')
@Controller('api/v1/aws')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UsePipes(ValidationPipe)
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  /**
   *
   * @param authUser
   * @returns
   */
  @Get('/temp-token')
  @ApiOperation({ summary: 'Generate token' })
  @HttpCode(HttpStatus.CREATED)
  async generateTemporaryCredentials(@AuthUser() authUser: User) {
    const data = await this.awsService.generateTemporaryCredentials(authUser);

    return {
      statusCode: HttpStatus.CREATED,
      data: {
        token: data.Token,
        identityId: data.IdentityId,
      },
    };
  }
}
