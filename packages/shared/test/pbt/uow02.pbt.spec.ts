import fc from 'fast-check';
import {
  applyContactRequestDecision,
  buildPropertyIdentityKey,
  evaluateBillableValidationFacts,
  halfOpenIntervalsOverlap,
  intervalCoversDate
} from '../../src/uow02';

const dateArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map((date) => {
  return date.toISOString().slice(0, 10);
});

const tokenArb = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter((value) => /[A-Za-z0-9]/.test(value) && !value.includes('|'));

describe('UOW-02 property-based invariants', () => {
  it('keeps adjacent half-open intervals non-overlapping', () => {
    fc.assert(
      fc.property(dateArb, fc.integer({ min: 1, max: 365 }), (from, days) => {
        const boundary = new Date(`${from}T00:00:00.000Z`);
        boundary.setUTCDate(boundary.getUTCDate() + days);
        const to = boundary.toISOString().slice(0, 10);

        expect(halfOpenIntervalsOverlap({ effectiveFrom: from, effectiveTo: to }, { effectiveFrom: to })).toBe(
          false
        );
        expect(intervalCoversDate({ effectiveFrom: to }, to)).toBe(true);
      })
    );
  });

  it('normalizes equivalent property identity spacing and punctuation to the same key', () => {
    fc.assert(
      fc.property(tokenArb, tokenArb, tokenArb, tokenArb, (phase, block, lot, street) => {
        const compact = buildPropertyIdentityKey({
          phaseOrSection: phase,
          block,
          lot,
          street
        });
        const noisy = buildPropertyIdentityKey({
          phaseOrSection: ` ${phase} `,
          block: `${block}-`,
          lot: ` ${lot}. `,
          street: ` ${street}   `
        });

        expect(noisy).toBe(compact);
      })
    );
  });

  it('allows only pending contact requests to transition to terminal decisions', () => {
    fc.assert(
      fc.property(fc.constantFrom('Approved' as const, 'Rejected' as const), (decision) => {
        expect(applyContactRequestDecision('Pending', decision)).toBe(decision);
        expect(() => applyContactRequestDecision(decision, decision)).toThrow();
      })
    );
  });

  it('fails billable validation unless all required responsibility facts are singular and active', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        fc.constantFrom('Active' as const, 'Inactive' as const, 'Deceased' as const, 'Archived' as const),
        (primaryOwnerCount, billingAccountPeriodCount, responsibleHomeownerStatus) => {
          const result = evaluateBillableValidationFacts({
            propertyBillingStatus: 'Billable',
            propertyLifecycleStatus: 'Active',
            lotAreaSqm: '1',
            primaryOwnerCount,
            responsibleHomeownerStatus,
            billingAccountPeriodCount
          });

          expect(result.isValid).toBe(
            primaryOwnerCount === 1 && billingAccountPeriodCount === 1 && responsibleHomeownerStatus === 'Active'
          );
        }
      )
    );
  });
});
