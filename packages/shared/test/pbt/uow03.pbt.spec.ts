import fc from 'fast-check';
import { assertDecimalScale, coversDate, intervalsOverlap, toMinorUnitsHalfUp } from '../../src';

const dateArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map((date) => {
  return date.toISOString().slice(0, 10);
});

describe('UOW-03 shared property-based invariants', () => {
  it('keeps adjacent effective-dated versions non-overlapping', () => {
    fc.assert(
      fc.property(dateArb, fc.integer({ min: 1, max: 365 }), (from, days) => {
        const boundary = new Date(`${from}T00:00:00.000Z`);
        boundary.setUTCDate(boundary.getUTCDate() + days);
        const to = boundary.toISOString().slice(0, 10);

        expect(intervalsOverlap({ effectiveFrom: from, effectiveTo: to }, { effectiveFrom: to, effectiveTo: null })).toBe(false);
        expect(coversDate({ effectiveFrom: to, effectiveTo: null }, to)).toBe(true);
      })
    );
  });

  it('accepts generated 4-place decimal strings and rejects generated over-precision strings', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999999 }), fc.integer({ min: 0, max: 9999 }), (whole, fraction) => {
        const valid = `${whole}.${String(fraction).padStart(4, '0')}`;
        const invalid = `${valid}1`;
        expect(() => assertDecimalScale(valid, 4)).not.toThrow();
        expect(() => assertDecimalScale(invalid, 4)).toThrow();
      })
    );
  });

  it('half-up minor-unit conversion is monotonic for centavo values', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), fc.integer({ min: 0, max: 98 }), (whole, cents) => {
        const current = `${whole}.${String(cents).padStart(2, '0')}`;
        const next = `${whole}.${String(cents + 1).padStart(2, '0')}`;
        expect(toMinorUnitsHalfUp(next)).toBeGreaterThan(toMinorUnitsHalfUp(current));
      })
    );
  });
});
