import {
  assertPaymentProofTransition,
  calculateAvailableCredit,
  calculateCreditRemainder,
  isActiveProofStatus,
  paymentDuplicateRiskKey,
  validateAllocationConservation
} from '../../src/uow05';

describe('UOW-05 shared domain helpers', () => {
  it('validates proof state transitions and active proof statuses', () => {
    expect(() => assertPaymentProofTransition('Submitted', 'UnderReview')).not.toThrow();
    expect(() => assertPaymentProofTransition('Rejected', 'Posted')).toThrow(/Invalid payment proof transition/);
    expect(isActiveProofStatus('Submitted')).toBe(true);
    expect(isActiveProofStatus('UnderReview')).toBe(true);
    expect(isActiveProofStatus('Posted')).toBe(false);
  });

  it('validates allocation conservation and credit remainder', () => {
    const allocations = [{ invoiceId: 'invoice-1', componentType: 'Dues' as const, openAmount: '100.00', amount: '80.00' }];
    expect(calculateCreditRemainder('100.00', allocations)).toBe('20.00');
    expect(validateAllocationConservation('100.00', allocations, '20.00')).toEqual({
      allocatedAmount: '80.00',
      creditRemainder: '20.00',
      paymentAmount: '100.00'
    });
  });

  it('derives available credit without mutating original amount', () => {
    expect(calculateAvailableCredit({ originalAmount: '100.00', appliedAmounts: ['30.00', '25.00'] })).toBe('45.00');
  });

  it('builds stable duplicate risk keys', () => {
    expect(paymentDuplicateRiskKey({
      billingAccountId: 'BA-1',
      paymentMethodKey: 'bank',
      externalReference: 'REF-1',
      amount: '100.00',
      paymentDate: '2026-05-10'
    })).toBe('BA-1|bank|REF-1|100.00|2026-05-10');
  });
});
