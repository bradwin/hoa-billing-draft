import {
  applyContactRequestDecision,
  assertContactChangePayloadAllowed,
  buildPropertyIdentityKey,
  evaluateBillableValidationFacts,
  halfOpenIntervalsOverlap,
  intervalCoversDate,
  validateHalfOpenInterval
} from '../../src/uow02';

describe('UOW-02 shared domain helpers', () => {
  it('uses half-open interval semantics for boundary dates', () => {
    const oldOwner = { effectiveFrom: '2025-01-01', effectiveTo: '2025-06-01' };
    const newOwner = { effectiveFrom: '2025-06-01', effectiveTo: null };

    expect(intervalCoversDate(oldOwner, '2025-05-31')).toBe(true);
    expect(intervalCoversDate(oldOwner, '2025-06-01')).toBe(false);
    expect(intervalCoversDate(newOwner, '2025-06-01')).toBe(true);
    expect(halfOpenIntervalsOverlap(oldOwner, newOwner)).toBe(false);
  });

  it('rejects empty and inverted half-open intervals', () => {
    expect(() => validateHalfOpenInterval({ effectiveFrom: '2025-06-01', effectiveTo: '2025-06-01' })).toThrow(
      /after effectiveFrom/
    );
    expect(() => validateHalfOpenInterval({ effectiveFrom: '2025-06-02', effectiveTo: '2025-06-01' })).toThrow(
      /after effectiveFrom/
    );
  });

  it('normalizes canonical property identity keys', () => {
    expect(
      buildPropertyIdentityKey({
        phaseOrSection: ' Phase 1 ',
        block: 'Block-A',
        lot: ' Lot 007 ',
        street: 'Mabini St.'
      })
    ).toBe('PHASE1|BLOCKA|LOT007|MABINIST');
  });

  it('requires an active homeowner and exactly one billing account period for billable validation', () => {
    expect(
      evaluateBillableValidationFacts({
        propertyBillingStatus: 'Billable',
        propertyLifecycleStatus: 'Active',
        lotAreaSqm: '100.0000',
        primaryOwnerCount: 1,
        responsibleHomeownerStatus: 'Inactive',
        billingAccountPeriodCount: 2
      })
    ).toEqual({
      isValid: false,
      reasonCodes: ['HOMEOWNER_NOT_ACTIVE', 'BILLING_ACCOUNT_PERIOD_MULTIPLE']
    });
  });

  it('keeps contact request decisions terminal and contact-only', () => {
    expect(applyContactRequestDecision('Pending', 'Approved')).toBe('Approved');
    expect(() => applyContactRequestDecision('Approved', 'Rejected')).toThrow(/Only Pending/);
    expect(() => assertContactChangePayloadAllowed({ legalName: 'Wrong field' })).toThrow(/disallowed/);
    expect(assertContactChangePayloadAllowed({ primaryEmail: 'new@example.com' })).toEqual({
      primaryEmail: 'new@example.com'
    });
  });
});
