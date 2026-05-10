import type { RecurringDuplicateKey } from './types';

export function recurringDuplicateKey(input: RecurringDuplicateKey): string {
  return [
    input.propertyId,
    input.billingAccountId,
    input.chargeTypeKey,
    input.billingPeriodKey
  ].join('|');
}

export function assertReplacementReason(reason: string): void {
  if (reason.trim().length < 3) {
    throw new Error('Replacement requires a reason');
  }
}
