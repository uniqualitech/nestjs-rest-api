import iap from 'in-app-purchase';
import { DeviceTypes } from '../constants/app.constant';
import { readFileSync } from 'fs';
import {
  SubscriptionPurchasePayload,
  SubscriptionReceipt,
  SubscriptionReceiptPayload,
} from 'src/interfaces/subscription.interface';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionReceiptVerificationService {
  /**
   * Verifies an in-app purchase receipt.
   * @param {Object} receipt - The receipt object containing purchase details.
   * @param {boolean} isTestEnvironment - Indicates whether the environment is for testing.
   * @returns {Promise<Object>} - Validated purchase data.
   */
  async verifyInAppReceipt(
    receipt: SubscriptionReceipt,
    isTestEnvironment: boolean,
  ): Promise<SubscriptionReceiptPayload> {
    return receipt.platform === DeviceTypes.IOS
      ? await this.processIosSubscription(receipt, isTestEnvironment)
      : await this.processAndroidSubscription(receipt, isTestEnvironment);
  }

  /**
   * Validates and processes an Android subscription receipt.
   * @param {Object} receipt - The Android subscription receipt details.
   * @param {boolean} isTestEnvironment - Indicates whether the environment is for testing.
   * @returns {Promise<Object>} - Parsed subscription details.
   */
  async processAndroidSubscription(
    receipt: SubscriptionReceipt,
    isTestEnvironment: boolean,
  ): Promise<SubscriptionReceiptPayload> {
    try {
      const googleCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!googleCredentialsPath) throw new Error('Missing Google Credentials');

      // Load Google service account credentials
      const googleServiceAccount = JSON.parse(
        readFileSync(googleCredentialsPath, 'utf-8'),
      );

      // Configure in-app purchase validation
      iap.config({
        googleServiceAccount: {
          clientEmail: googleServiceAccount.client_email,
          privateKey: googleServiceAccount.private_key,
        },
        test: isTestEnvironment,
      });

      await iap.setup();

      // Validate receipt data
      const validationResponse = await iap.validate({
        packageName: receipt.packageName,
        productId: receipt.productId,
        purchaseToken: receipt.purchaseToken,
        subscription: true,
      });

      // Extract purchase details
      const purchaseData: any = iap.getPurchaseData(validationResponse);
      const purchaseInfo: SubscriptionPurchasePayload = purchaseData[0] || {};

      return {
        ...purchaseInfo,
        productId: purchaseInfo.productId || null,
        transactionId: purchaseInfo.transactionId || null,
        startTimestamp: purchaseInfo.startTimeMillis || null,
        expiryTimestamp: purchaseInfo.expiryTimeMillis || null,
        isAutoRenewing: purchaseInfo.autoRenewing || false,
        orderId: purchaseInfo.orderId || null,
        originalTransactionId: purchaseInfo.originalTransactionId || null,
        isTrial: purchaseInfo.isTrial || false,
      };
    } catch (error) {
      throw new BadRequestException('Failed to validate Android subscription.');
    }
  }

  /**
   * Validates and processes an iOS subscription receipt.
   * @param {Object} receipt - The iOS subscription receipt details.
   * @param {boolean} isTestEnvironment - Indicates whether the environment is for testing.
   * @returns {Promise<Object>} - Parsed subscription details.
   */
  async processIosSubscription(
    receipt: SubscriptionReceipt,
    isTestEnvironment: boolean,
  ): Promise<SubscriptionReceiptPayload> {
    try {
      const appleSharedSecret = process.env.APPLE_IN_APP_PASSWORD;
      if (!appleSharedSecret) throw new Error('Missing Apple Credentials');

      // Configure in-app purchase validation
      iap.config({
        appleExcludeOldTransactions: true,
        applePassword: appleSharedSecret,
        test: isTestEnvironment,
      });
      await iap.setup();

      // Validate purchase token
      const validationResponse: any = await iap.validate(receipt.purchaseToken);

      // Extract purchase details
      const purchaseData: any = iap.getPurchaseData(validationResponse);
      const purchaseInfo: SubscriptionPurchasePayload = purchaseData[0] || {};

      return {
        ...purchaseInfo,
        productId: purchaseInfo.productId || null,
        transactionId: purchaseInfo.transactionId || null,
        startTimestamp: purchaseInfo.purchaseDateMs || null,
        expiryTimestamp: purchaseInfo.expiresDateMs || null,
        isAutoRenewing:
          validationResponse?.pending_renewal_info?.[0]?.auto_renew_status ===
          '1',
        orderId: purchaseInfo.orderId || null,
        originalTransactionId: purchaseInfo.originalTransactionId || null,
        isTrial: purchaseInfo.isTrial || false,
      };
    } catch (error) {
      throw new BadRequestException('Failed to validate iOS subscription.');
    }
  }
}
