import admin, { FirebaseError } from 'firebase-admin';
import {
  BatchResponse,
  SendResponse,
} from 'firebase-admin/lib/messaging/messaging-api';
import { DeviceToken } from 'src/api/device-token/entities/device-token.entity';
import dataSource from 'src/database/data-source';

/**
 * Send push
 * @param tokens object
 * @param payload object
 */
export const sendPush = async (
  tokens: string[],
  payload: {
    notification: { title: string; body: string };
    data: { [key: string]: string };
  },
) => {
  if (!tokens.length) return;

  await admin
    .messaging()
    .sendEachForMulticast({
      ...payload,
      tokens: tokens,
      apns: { payload: { aps: { sound: 'default' } } },
      android: { notification: { defaultSound: true } },
    })
    .then(async (result: BatchResponse) => {
      const failedTokens = [];

      result?.responses?.forEach(
        (deviceResult: SendResponse, index: number) => {
          if (deviceResult.error) {
            failedTokens.push(tokens[index]);
          }
        },
      );

      if (failedTokens.length) {
        // Delete invalid/expired tokens
        await dataSource
          .getRepository(DeviceToken)
          .createQueryBuilder()
          .delete()
          .where('token IN(:...token)', { token: failedTokens })
          .execute();
      }
    })
    .catch((error: FirebaseError) => {
      console.log(error);
    });
};
