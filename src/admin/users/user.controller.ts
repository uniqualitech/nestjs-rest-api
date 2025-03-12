import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/api/user/entities/user.entity';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/constants/app.constant';
import { JwtAuthGuard } from 'src/passport/jwt-auth.guard';
import { RolesGuard } from 'src/passport/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/constants/user.constant';
import { UserService } from './user.service';

@Controller('admin/users')
@ApiTags('Admin Users')
@UsePipes(ValidationPipe)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get all users
   * @param search string
   * @param _page number
   * @param _limit number
   * @returns
   */
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async findAllUsers(
    @Query('search') search?: string,
    @Query('page') _page?: string,
    @Query('limit') _limit?: string,
  ) {
    const page = Number(_page) || DEFAULT_PAGE;
    const limit = Number(_limit) || DEFAULT_LIMIT;

    const [users, total] = await this.userService.findAllUsers(
      search,
      page,
      limit,
    );

    return {
      data: plainToInstance(User, users, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      meta: {
        totalItems: total,
        itemsPerPage: limit ? limit : total,
        totalPages: limit ? Math.ceil(Number(total) / limit) : 1,
        currentPage: page,
      },
    };
  }

  /**
   * Block/Unblock user
   * @param uid string
   * @returns
   */
  @Get(':id/blocked-unblocked')
  @ApiOperation({
    summary: 'Change Password',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async blockUnblockUser(@Param('uid') uid: string) {
    const user = await this.userService.blockUnblockUser(uid);

    return {
      message: `User has been successfully ${
        user.isBlocked ? 'blocked' : 'unblocked'
      }`,
      data: plainToInstance(User, user, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    };
  }
}
