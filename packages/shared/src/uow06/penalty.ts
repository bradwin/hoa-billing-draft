import { addMoney, assertNonNegativeMoney, minorUnitsToMoney, moneyToMinorUnits, subtractMoney } from './money';
import type { PenaltyBasisInput, PenaltyDuplicateKey, WaiverLimitInput } from './types';

export function penaltyDuplicateKey(input: PenaltyDuplicateKey): string {
  return [input.invoiceId, input.responsibleBillingAccountId, input.penaltyChargeTypeId, input.penaltyPeriodKey].join('|');
}

export function calculateEligiblePenaltyBasis(input: PenaltyBasisInput): string {
  assertNonNegativeMoney(input.eligiblePrincipalAmount, 'Eligible principal amount');
  const paymentEffects = addMoney(input.paymentEffectAmounts ?? []);
  const excludedPenaltyAmounts = addMoney(input.excludedPenaltyAmounts ?? []);
  const basisAfterPayments = subtractMoney(input.eligiblePrincipalAmount, paymentEffects);
  if (moneyToMinorUnits(basisAfterPayments) < 0n) {
    return '0.00';
  }
  if (moneyToMinorUnits(excludedPenaltyAmounts) > 0n) {
    return basisAfterPayments;
  }
  return basisAfterPayments;
}

export function calculatePercentagePenaltyAmount(basisAmount: string, rateBasisPoints: number): string {
  assertNonNegativeMoney(basisAmount, 'Penalty basis');
  if (!Number.isInteger(rateBasisPoints) || rateBasisPoints < 0) {
    throw new Error('Penalty rate basis points must be a nonnegative integer');
  }
  const amount = moneyToMinorUnits(basisAmount);
  return minorUnitsToMoney((amount * BigInt(rateBasisPoints) + 5000n) / 10000n);
}

export function availablePenaltyForWaiver(input: Omit<WaiverLimitInput, 'requestedWaiverAmount'>): string {
  const priorWaivers = addMoney(input.priorWaiverAmounts ?? []);
  const paymentEffects = addMoney(input.paymentEffectAmounts ?? []);
  const available = subtractMoney(subtractMoney(input.penaltyAmount, priorWaivers), paymentEffects);
  return moneyToMinorUnits(available) < 0n ? '0.00' : available;
}

export function assertWaiverWithinAvailableAmount(input: WaiverLimitInput): string {
  assertNonNegativeMoney(input.requestedWaiverAmount, 'Requested waiver amount');
  const available = availablePenaltyForWaiver(input);
  if (moneyToMinorUnits(input.requestedWaiverAmount) > moneyToMinorUnits(available)) {
    throw new Error('Waiver amount exceeds available unpaid penalty amount');
  }
  return available;
}
