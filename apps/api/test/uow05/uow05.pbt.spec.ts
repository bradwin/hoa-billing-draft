import fc from 'fast-check';
import { paymentDuplicateRiskKey } from '@hoa/shared';

describe('UOW-05 API PBT support', () => {
  it('duplicate payment keys are stable for same values', () => {
    fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 20 }), fc.integer({ min: 1, max: 100_000 }), (reference, cents) => {
      const amount = `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
      const input = { billingAccountId: 'BA-1', paymentMethodKey: 'bank', externalReference: reference, amount, paymentDate: '2026-05-10' };
      expect(paymentDuplicateRiskKey(input)).toBe(paymentDuplicateRiskKey({ ...input }));
    }));
  });
});
