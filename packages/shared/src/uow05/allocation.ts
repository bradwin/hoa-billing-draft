import { addMoney, assertNonNegativeMoney, moneyToMinorUnits, subtractMoney } from './money';
import type { AllocationTargetInput, AllocationValidationResult } from './types';

export function validateAllocationConservation(paymentAmount: string, allocations: readonly AllocationTargetInput[], creditRemainder = '0.00'): AllocationValidationResult {
  assertNonNegativeMoney(creditRemainder, 'Credit remainder');
  for (const allocation of allocations) {
    assertNonNegativeMoney(allocation.amount, 'Allocation amount');
    assertNonNegativeMoney(allocation.openAmount, 'Open amount');
    if (moneyToMinorUnits(allocation.amount) > moneyToMinorUnits(allocation.openAmount)) {
      throw new Error(`Allocation exceeds open amount for invoice ${allocation.invoiceId}`);
    }
  }
  const allocatedAmount = addMoney(allocations.map((allocation) => allocation.amount));
  const expectedPaymentAmount = addMoney([allocatedAmount, creditRemainder]);
  if (expectedPaymentAmount !== paymentAmount) {
    throw new Error(`Allocations ${allocatedAmount} plus credit ${creditRemainder} do not equal payment ${paymentAmount}`);
  }
  return { allocatedAmount, creditRemainder, paymentAmount };
}

export function calculateCreditRemainder(paymentAmount: string, allocations: readonly AllocationTargetInput[]): string {
  const allocatedAmount = addMoney(allocations.map((allocation) => allocation.amount));
  const remainder = subtractMoney(paymentAmount, allocatedAmount);
  assertNonNegativeMoney(remainder, 'Credit remainder');
  return remainder;
}
