import { SubscriptionReceiptVerificationService } from 'src/helpers/subscription-receipt-verify.helper';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscribeSubscriptionDto } from './dto/subscribe-subscription.dto';
import moment from 'moment';
import { UserSubscription } from './entities/user-subscription.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import {
  SubscriptionReceipt,
  SubscriptionReceiptPayload,
} from 'src/interfaces/subscription.interface';
import { CheckEmailAssociatedSubscriptionDto } from './dto/check-email-associated-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionReceiptVerificationService: SubscriptionReceiptVerificationService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,

    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
  ) {}

  /**
   * Get subscription plans
   * @returns
   */
  async getPlans() {
    return await this.subscriptionPlanRepository.find();
  }

  /**
   * Get subscription details by user id
   * @param authUser object
   * @returns
   */
  async getSubscriptionByUserId(authUser: User) {
    return await this.userSubscriptionRepository.findOne({
      where: { user: { id: authUser.id } },
      order: { id: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Create or update subscription
   * @param data object
   * @param userSubscriptionsId number
   */
  async createOrUpdateUserSubscription(
    data: any,
    user: User,
    userSubscriptionsId = null,
  ) {
    if (userSubscriptionsId) {
      // Update subscription by its ID
      await this.userSubscriptionRepository.update(userSubscriptionsId, data);
    } else {
      // Create a new subscription
      await this.userSubscriptionRepository.save(
        this.userSubscriptionRepository.create(data),
      );
    }

    // user subscription expiry
    await this.userRepository.update(
      { id: user.id },
      { subscriptionExpireAt: data.subscriptionExpireAt },
    );

    const subscriptionDetails = await this.getSubscriptionByUserId(data.user);
    return subscriptionDetails;
  }

  /**
   * Store subscription
   * @param authUser object
   * @param buySubscriptionDto object
   * @returns
   */
  async subscribeSubscription(
    authUser: User,
    subscribeSubscriptionDto: SubscribeSubscriptionDto,
  ) {
    const { productId } = subscribeSubscriptionDto;

    // Get plan details
    const planDetails = await this.subscriptionPlanRepository.findOne({
      where: { productId },
    });

    if (!planDetails) {
      throw new BadRequestException('Oops! Plan details not found');
    }

    // check previous subscription
    const checkSubscription = await this.getSubscriptionByUserId(authUser);

    const receipt = {
      packageName: process.env.IN_APP_PACKAGE_NAME,
      productId,
      purchaseToken: subscribeSubscriptionDto.purchaseToken,
      platform: subscribeSubscriptionDto.purchaseState,
    };

    // subscribe
    const subscriptionReceiptPayload = await this.handleSubscriptionByReceipt(
      receipt,
      subscribeSubscriptionDto,
    );

    // update in DB
    const subscriptionDetails = await this.createOrUpdateUserSubscription(
      subscriptionReceiptPayload,
      authUser,
      checkSubscription?.id,
    );

    return {
      ...subscriptionDetails,
      isSubscriptionRunning:
        subscriptionDetails &&
        moment.utc(subscriptionDetails.expireAt).isAfter(moment.utc()),
    };
  }

  /**
   * Get subscription details
   * @param authUser object
   * @returns
   */
  async getSubscription(user: User) {
    const checkSubscription = await this.getSubscriptionByUserId(user);

    if (!checkSubscription) return null;

    // If subscription expire then renew subscription
    if (moment.utc(checkSubscription.expireAt).isBefore(moment.utc())) {
      return await this.renewSubscription(checkSubscription, user);
    }

    return {
      ...checkSubscription,
      isSubscriptionRunning:
        moment.utc(checkSubscription?.expireAt).isAfter(moment.utc()) || false,
    };
  }

  /**
   * Renew subscription
   * @param userSubscription object
   * @param user object
   * @returns
   */
  async renewSubscription(userSubscription: UserSubscription, user: User) {
    try {
      const receiptPayload =
        await this.subscriptionReceiptVerificationService.verifyInAppReceipt(
          {
            packageName: process.env.IN_APP_PACKAGE_NAME,
            productId: userSubscription.productId,
            purchaseToken: userSubscription.purchaseToken,
            platform: userSubscription.purchaseState,
          },
          userSubscription.isTestEnvironment,
        );

      const expiryTime = moment.unix(receiptPayload.expiryTimestamp);
      const isFutureDate = expiryTime.isAfter(moment());
      const isExpired = expiryTime.isSameOrBefore(moment());

      if (isFutureDate || isExpired) {
        userSubscription = await this.createOrUpdateUserSubscription(
          {
            ...receiptPayload,
            purchaseToken: userSubscription.purchaseToken,
            purchasedAt: moment(receiptPayload.startTimestamp).toDate(),
            purchaseState: userSubscription.purchaseState,
            isAutoRenewing: receiptPayload.isAutoRenewing,
            subscriptionExpireAt: moment(
              receiptPayload.expiryTimestamp,
            ).toDate(),
            receipt: JSON.stringify(receiptPayload),
            isTestEnvironment: userSubscription.isTestEnvironment,
          },
          user,
          userSubscription.id,
        );
      }

      return {
        ...userSubscription,
        isSubscriptionRunning:
          userSubscription &&
          moment.utc(userSubscription.expireAt).isAfter(moment.utc()),
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Subscribe subscription
   * @param receipt object
   * @param subscribeSubscriptionDto object
   * @param authUser object
   * @returns Promise<object>
   */
  async handleSubscriptionByReceipt(
    receipt: SubscriptionReceipt,
    subscribeSubscriptionDto: SubscribeSubscriptionDto,
  ) {
    try {
      const receiptPayload: SubscriptionReceiptPayload =
        await this.subscriptionReceiptVerificationService.verifyInAppReceipt(
          receipt,
          subscribeSubscriptionDto.isTestEnvironment,
        );

      return {
        ...receiptPayload,
        purchaseToken: subscribeSubscriptionDto.purchaseToken,
        purchasedAt: moment(receiptPayload.startTimestamp).toDate(),
        purchaseState: subscribeSubscriptionDto.purchaseState,
        isAutoRenewing: receiptPayload.isAutoRenewing,
        subscriptionExpireAt: moment(receiptPayload.expiryTimestamp).toDate(),
        receipt: JSON.stringify(receiptPayload),
        isTestEnvironment: subscribeSubscriptionDto.isTestEnvironment,
        type: subscribeSubscriptionDto.type,
      };
    } catch (error: any) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Check email associated subscription
   * @param checkEmailAssociatedSubscriptionDto object
   * @returns
   */
  async checkEmailAssociatedSubscription(
    checkEmailAssociatedSubscriptionDto: CheckEmailAssociatedSubscriptionDto,
  ) {
    const { transactionId, orderId } = checkEmailAssociatedSubscriptionDto;

    // Find an existing subscription
    const existingSubscription = await this.userSubscriptionRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .where(
        transactionId
          ? 's.originalTransactionId LIKE :transactionId OR s.transactionId LIKE :transactionId'
          : 's.orderId LIKE :orderId',
        { transactionId, orderId },
      )
      .getOne();

    // Return early if no subscription is found
    if (!existingSubscription) {
      return { email: null, isPurchased: false };
    }

    // Retrieve subscription details
    const { isSubscriptionRunning } = await this.getSubscription(
      existingSubscription.user,
    );

    // Return result based on subscription status
    return isSubscriptionRunning
      ? { email: existingSubscription.user.email, isPurchased: true }
      : { email: null, isPurchased: false };
  }
}
