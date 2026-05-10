import fc from 'fast-check';
import { evaluateBillableValidationFacts, halfOpenIntervalsOverlap } from '@hoa/shared';

describe('UOW-02 API property-based rules', () => {
  it('never treats multiple billing-account periods as billable-valid', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10 }), (billingAccountPeriodCount) => {
        const result = evaluateBillableValidationFacts({
          propertyBillingStatus: 'Billable',
          propertyLifecycleStatus: 'Active',
          lotAreaSqm: '1',
          primaryOwnerCount: 1,
          responsibleHomeownerStatus: 'Active',
          billingAccountPeriodCount
        });

        expect(result.isValid).toBe(false);
        expect(result.reasonCodes).toContain('BILLING_ACCOUNT_PERIOD_MULTIPLE');
      })
    );
  });

  it('keeps transfer-boundary intervals non-overlapping', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 300 }), (days) => {
        const from = new Date('2025-01-01T00:00:00.000Z');
        const boundary = new Date(from);
        boundary.setUTCDate(boundary.getUTCDate() + days);
        const fromText = from.toISOString().slice(0, 10);
        const boundaryText = boundary.toISOString().slice(0, 10);

        expect(
          halfOpenIntervalsOverlap(
            { effectiveFrom: fromText, effectiveTo: boundaryText },
            { effectiveFrom: boundaryText, effectiveTo: null }
          )
        ).toBe(false);
      })
    );
  });
});
