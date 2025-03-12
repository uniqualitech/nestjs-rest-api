export interface SubscriptionReceipt {
  platform: string;
  packageName: string;
  productId: string;
  purchaseToken: string;
}

export interface SubscriptionPurchasePayload {
  productId: string;
  quantity: number;
  transactionId: string;
  purchaseDate: Date | string | undefined;
  expirationDate: number | string;

  // Android only
  service?: string;
  status?: number;
  packageName?: string;
  purchaseToken?: string;
  startTimeMillis?: number;
  expiryTimeMillis?: number;
  autoRenewing?: boolean;
  priceCurrencyCode?: string;
  priceAmountMicros?: number;
  countryCode?: string;
  developerPayload?: number | string;
  paymentState?: number;
  orderId?: string;
  purchaseType?: number;
  acknowledgementState?: number;
  kind?: string;

  // iOS Only
  originalTransactionId?: string;
  purchaseDateMs?: number;
  purchaseDatePst?: Date | string;
  originalPurchaseDate?: Date | string;
  originalPurchaseDateMs?: number;
  originalPurchaseDatePst?: Date | string;
  expiresDate?: Date | string;
  expiresDateMs?: number;
  expiresDatePst?: Date | string;
  webOrderLineItemId?: number;
  isTrialPeriod?: string | boolean;
  isInIntroOfferPeriod?: string | boolean;
  inAppOwnershipType?: string;
  isTrial?: boolean;
  bundleId?: string;
}

export interface SubscriptionReceiptPayload {
  productId: string;
  transactionId: string;
  startTimestamp: number;
  expiryTimestamp: number;
  isAutoRenewing: boolean;
  orderId: string;
  originalTransactionId: string;
  isTrial: boolean;

  // there are more fields depending on the used service
}

// // android sample response
// {
//   service: 'google',
//   status: 0,
//   packageName: '',
//   productId: '',
//   purchaseToken: '',
//   startTimeMillis: 1741247011709,
//   expiryTimeMillis: 1741247311709,
//   autoRenewing: true,
//   priceCurrencyCode: 'INR',
//   priceAmountMicros: 340000000,
//   countryCode: 'IN',
//   developerPayload: NaN,
//   paymentState: 1,
//   orderId: '',
//   purchaseType: 0,
//   acknowledgementState: 1,
//   kind: '',
//   transactionId: '',
//   purchaseDate: undefined,
//   quantity: 1,
//   expirationDate: '1741247311709'
// }
//   // ios sample response
// {
//   quantity: 1,
//   productId: '',
//   transactionId: '2000000868983151',
//   originalTransactionId: '2000000826348799',
//   purchaseDate: '2025-03-06 07:52:17 Etc/GMT',
//   purchaseDateMs: 1741247537000,
//   purchaseDatePst: '2025-03-05 23:52:17 America/Los_Angeles',
//   originalPurchaseDate: '2025-01-10 04:50:58 Etc/GMT',
//   originalPurchaseDateMs: 1736484658000,
//   originalPurchaseDatePst: '2025-01-09 20:50:58 America/Los_Angeles',
//   expiresDate: '2025-03-07 07:52:17 Etc/GMT',
//   expiresDateMs: 1741333937000,
//   expiresDatePst: '2025-03-06 23:52:17 America/Los_Angeles',
//   webOrderLineItemId: ,
//   isTrialPeriod: 'false',
//   isInIntroOfferPeriod: 'false',
//   inAppOwnershipType: 'PURCHASED',
//   isTrial: false,
//   bundleId: '',
//   expirationDate: 1741333937000
// }
