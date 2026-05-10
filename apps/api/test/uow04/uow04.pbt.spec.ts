import fc from 'fast-check';
import { recurringDuplicateKey } from '@hoa/shared';

describe('UOW-04 API property tests', () => {
  it('duplicate key changes when billing period changes', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), fc.string({ minLength: 1, maxLength: 12 }), fc.string({ minLength: 1, maxLength: 12 }), fc.string({ minLength: 1, maxLength: 12 }), (propertyId, accountId, chargeTypeKey, a, b) => {
        fc.pre(a !== b);
        const first = recurringDuplicateKey({ propertyId, billingAccountId: accountId, chargeTypeKey, billingPeriodKey: a, billingPeriodStart: '2026-01-01', billingPeriodEnd: '2026-02-01' });
        const second = recurringDuplicateKey({ propertyId, billingAccountId: accountId, chargeTypeKey, billingPeriodKey: b, billingPeriodStart: '2026-01-01', billingPeriodEnd: '2026-02-01' });
        expect(first).not.toBe(second);
      })
    );
  });
});
