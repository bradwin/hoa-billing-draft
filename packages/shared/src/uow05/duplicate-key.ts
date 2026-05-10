import type { PaymentDuplicateRiskKey } from './types';

export function paymentDuplicateRiskKey(input: PaymentDuplicateRiskKey): string {
  return [
    input.billingAccountId,
    input.paymentMethodKey,
    input.externalReference ?? 'no-reference',
    input.amount,
    input.paymentDate
  ].join('|');
}

export function isActiveProofStatus(status: string): boolean {
  return status === 'Submitted' || status === 'UnderReview';
}
