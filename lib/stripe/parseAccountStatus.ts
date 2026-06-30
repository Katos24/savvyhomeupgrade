// lib/stripe/parseAccountStatus.ts

export type BlockingReason = {
  capability: string;
  code: string;
  resolution: string;
};

export type ParsedAccountStatus = {
  onboarded: boolean;
  paymentStatus: 'active' | 'restricted' | 'pending';
  blockingReasons: BlockingReason[];
};

// Shared parser for Stripe v2 Account objects (configuration.merchant.capabilities shape).
// Used by both /api/stripe/connect-return (sync, on redirect) and the
// account.updated webhook (async, may arrive before or after the redirect).
// Keep these in sync — don't duplicate this logic inline in either caller.
export function parseAccountStatus(account: any): ParsedAccountStatus {
  const capabilities = account.configuration?.merchant?.capabilities;
  const cardPayments = capabilities?.card_payments;
  const payouts = capabilities?.stripe_balance?.payouts;

  const blockingReasons: BlockingReason[] = [];

  if (cardPayments?.status === 'restricted' || cardPayments?.status === 'pending') {
    for (const detail of cardPayments.status_details ?? []) {
      blockingReasons.push({ capability: 'card_payments', code: detail.code, resolution: detail.resolution });
    }
  }
  if (payouts?.status === 'restricted' || payouts?.status === 'pending') {
    for (const detail of payouts.status_details ?? []) {
      blockingReasons.push({ capability: 'payouts', code: detail.code, resolution: detail.resolution });
    }
  }

  const paymentStatus: ParsedAccountStatus['paymentStatus'] =
    cardPayments?.status === 'active' && payouts?.status === 'active'
      ? 'active'
      : blockingReasons.length > 0
        ? 'restricted'
        : 'pending';

  const capabilityStatus = cardPayments?.status;
  const onboarded =
    capabilityStatus === 'active' ||
    capabilityStatus === 'pending' ||
    capabilityStatus === 'restricted';

  return { onboarded, paymentStatus, blockingReasons };
}