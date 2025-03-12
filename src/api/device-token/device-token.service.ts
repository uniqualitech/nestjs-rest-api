import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { DeviceToken } from './entities/device-token.entity';
import { User } from '../user/entities/user.entity';
import { sendPush } from 'src/helpers/send-push.helper';
import { NotificationTypes } from 'src/constants/notification.constant';

@Injectable()
export class DeviceTokenService {
  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
  ) {}

  /**
   * Register device token for push notification
   * @param createDeviceTokenDto
   * @param authUser
   * @returns
   */
  async create(
    createDeviceTokenDto: CreateDeviceTokenDto,
    authUser: User,
  ): Promise<DeviceToken> {
    const checkToken = await this.deviceTokenRepository.findOne({
      where: {
        deviceId: createDeviceTokenDto.deviceId,
        user: { id: authUser.id },
      },
    });

    if (checkToken) {
      await this.deviceTokenRepository.update(
        { id: checkToken.id },
        createDeviceTokenDto,
      );
    } else {
      await this.deviceTokenRepository.save({
        ...createDeviceTokenDto,
        user: { id: authUser.id },
      });
    }

    return;
  }

  /**
   * Send test push notification
   * @param sendNotificationDto
   * @returns
   */
  async sendPush(sendNotificationDto: SendNotificationDto) {
    return await sendPush([sendNotificationDto.token], {
      notification: {
        title: sendNotificationDto.title,
        body: sendNotificationDto.notification,
      },
      data: { type: '0' },
    });
  }

  /**
   * Send push to user
   * @param title string
   * @param body string
   * @param notificationType number
   * @param user User
   * @param data object
   * @returns
   */
  async sendPushToUser(
    title: string,
    body: string,
    notificationType: NotificationTypes,
    user: User,
    data: { [key: string]: string } = {},
  ) {
    if (!user.isNotificationOn) return true;

    const tokens = await this.getTokensByUserId(user.id);

    await sendPush(tokens, {
      notification: { title, body },
      data: { type: String(notificationType), ...data },
    });

    return;
  }

  /**
   * Send push to users
   * @param title string
   * @param body string
   * @param notificationType number
   * @param userIds string
   * @param data any
   * @returns
   */
  async sendPushToUsers(
    title: string,
    body: string,
    notificationType: NotificationTypes,
    userIds: Array<number>,
    data: { [key: string]: string } = {},
  ) {
    const tokens = await this.getTokensByUserIds(userIds);

    if (!tokens.length) return true;

    await sendPush(tokens, {
      notification: { title: title, body: body },
      data: { type: String(notificationType), ...data },
    });

    return;
  }

  /**
   * Remove device token
   * @param deviceId
   * @param user
   * @returns
   */
  async remove(deviceId: string, user: User) {
    return this.deviceTokenRepository.delete({
      deviceId,
      user: { id: user.id },
    });
  }

  /**
   * Remove device token
   * @param token
   * @returns
   */
  async removeByToken(token: string) {
    return this.deviceTokenRepository.delete({
      token,
    });
  }

  /**
   * Select device token
   * @param userId
   * @returns
   */
  async getTokensByUserId(userId: number) {
    const deviceTokens = await this.deviceTokenRepository
      .createQueryBuilder('dt')
      .select('DISTINCT(token)')
      .where('userId = :userId', { userId: userId })
      .getRawMany();

    return deviceTokens.map((s) => s.token);
  }

  /**
   * Select device token
   * @param userIds
   * @returns
   */
  async getTokensByUserIds(userIds: number[]) {
    const deviceTokens = await this.deviceTokenRepository
      .createQueryBuilder('dt')
      .select('DISTINCT(token)')
      .where('userId IN (:...userIds)', { userId: userIds })
      .getRawMany();

    return deviceTokens.map((s) => s.token);
  }
}
