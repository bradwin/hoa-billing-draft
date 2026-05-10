import fc from 'fast-check';
import { calculateCreditRemainder, validateAllocationConservation } from '../../src/uow05';

function money(cents: number): string {
  const whole = Math.floor(cents / 100);
  const fractional = String(cents % 100).padStart(2, '0');
  return `${whole}.${fractional}`;
}

describe('UOW-05 property-based invariants', () => {
  it('allocation totals plus credit remainder equal payment amount', () => {
    fc.assert(fc.property(fc.integer({ min: 1, max: 100_000 }), fc.integer({ min: 0, max: 100_000 }), (allocatedCents, extraCents) => {
      const paymentAmount = money(allocatedCents + extraCents);
      const allocationAmount = money(allocatedCents);
      const allocations = [{ invoiceId: '11111111-1111-4111-8111-111111111111', componentType: 'Dues' as const, openAmount: allocationAmount, amount: allocationAmount }];
      const creditRemainder = calculateCreditRemainder(paymentAmount, allocations);
      expect(validateAllocationConservation(paymentAmount, allocations, creditRemainder).paymentAmount).toBe(paymentAmount);
    }));
  });
});
