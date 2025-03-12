import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscribeSubscriptionDto } from './dto/subscribe-subscription.dto';
import { plainToInstance } from 'class-transformer';
import { AppHeaders } from 'src/decorators/app-headers.decorator';
import { JwtAuthGuard } from 'src/passport/jwt-auth.guard';
import { RolesGuard } from 'src/passport/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/constants/user.constant';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionTypes } from 'src/constants/subscription.constant';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { User } from '../user/entities/user.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { CheckEmailAssociatedSubscriptionDto } from './dto/check-email-associated-subscription.dto';

@ApiTags('Subscription')
@Controller('api/v1/subscription')
@UsePipes(ValidationPipe)
@AppHeaders()
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * Get subscription plans
   * @param authUser object
   * @returns
   */
  @Get('plans')
  @ApiOperation({ summary: 'Get subscription plans' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  async getPlans() {
    const data = await this.subscriptionService.getPlans();

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: plainToInstance(SubscriptionPlan, data, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Buy subscription
   * @param buySubscriptionDto object
   * @param authUser object
   * @returns
   */
  @Post('subscribe')
  @ApiOperation({
    summary: 'Buy IN APP subscription',
    description: `    Buy IN APP subscription
- <b>type</b>: ${SubscriptionTypes.MONTHLY}, ${SubscriptionTypes.ANNUALLY}     
    `,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  async subscribeSubscription(
    @Body() subscribeSubscriptionDto: SubscribeSubscriptionDto,
    @AuthUser() authUser: User,
  ) {
    const data = await this.subscriptionService.subscribeSubscription(
      authUser,
      subscribeSubscriptionDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
      data: plainToInstance(UserSubscription, data, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Get subscription details
   * @param authUser object
   * @returns
   */
  @Get('details')
  @ApiOperation({
    summary: 'Get subscription details',
    description: `    Get subscription details
- <b>type</b>: ${SubscriptionTypes.MONTHLY}, ${SubscriptionTypes.ANNUALLY}     
    `,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  async getSubscription(@AuthUser() authUser: User) {
    const data = await this.subscriptionService.getSubscription(authUser);
    return { data };
  }

  /**
   * Check email association
   * @param checkEmailAssociatedSubscriptionDto object
   * @returns
   */
  @Post('check-email-associated')
  @ApiOperation({
    summary: 'Check email association',
    description: `    Check email association
<b>transactionId</b>: Pass transactionId for iOS.
<b>orderId</b>: Pass orderId for Android.
    `,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  async checkEmailAssociatedSubscription(
    @Body()
    checkEmailAssociatedSubscriptionDto: CheckEmailAssociatedSubscriptionDto,
  ) {
    const data =
      await this.subscriptionService.checkEmailAssociatedSubscription(
        checkEmailAssociatedSubscriptionDto,
      );

    return { statusCode: HttpStatus.OK, message: 'Success', data };
  }
}
