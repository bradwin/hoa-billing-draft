import { addMoney, moneyToMinorUnits, subtractMoney } from './money';
import type { CreditAvailabilityInput } from './types';

export function calculateAvailableCredit(input: CreditAvailabilityInput): string {
  const applied = addMoney(input.appliedAmounts);
  const reversed = addMoney(input.reversedAmounts ?? []);
  const consumed = subtractMoney(applied, reversed);
  const available = subtractMoney(input.originalAmount, consumed);
  if (moneyToMinorUnits(available) < 0n) {
    throw new Error('Credit applications exceed available credit');
  }
  return available;
}

export function assertCreditApplicationAvailable(input: CreditAvailabilityInput, applicationAmount: string): void {
  const available = calculateAvailableCredit(input);
  if (moneyToMinorUnits(applicationAmount) > moneyToMinorUnits(available)) {
    throw new Error(`Credit application ${applicationAmount} exceeds available credit ${available}`);
  }
}
