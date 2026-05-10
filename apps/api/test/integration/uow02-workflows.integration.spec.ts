import {
  applyContactRequestDecision,
  evaluateBillableValidationFacts,
  halfOpenIntervalsOverlap,
  intervalCoversDate
} from '@hoa/shared';

describe('UOW-02 workflow integration rules', () => {
  it('keeps adjacent ownership transfer periods valid for the same transfer boundary', () => {
    const oldOwner = { effectiveFrom: '2025-01-01', effectiveTo: '2025-06-01' };
    const newOwner = { effectiveFrom: '2025-06-01', effectiveTo: null };

    expect(halfOpenIntervalsOverlap(oldOwner, newOwner)).toBe(false);
    expect(intervalCoversDate(newOwner, '2025-06-01')).toBe(true);
  });

  it('requires exactly one owner, exactly one billing-account period, and active homeowner eligibility', () => {
    expect(
      evaluateBillableValidationFacts({
        propertyBillingStatus: 'Billable',
        propertyLifecycleStatus: 'Active',
        lotAreaSqm: '10',
        primaryOwnerCount: 1,
        responsibleHomeownerStatus: 'Active',
        billingAccountPeriodCount: 1
      }).isValid
    ).toBe(true);
  });

  it('keeps contact request state model simple and terminal', () => {
    expect(applyContactRequestDecision('Pending', 'Approved')).toBe('Approved');
    expect(() => applyContactRequestDecision('Rejected', 'Approved')).toThrow();
  });
});
