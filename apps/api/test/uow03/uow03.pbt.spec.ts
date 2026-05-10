import fc from 'fast-check';
import { intervalsOverlap } from '@hoa/shared';

describe('UOW-03 API property-based rules', () => {
  it('keeps adjacent active configuration intervals non-overlapping', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 300 }), (days) => {
        const from = new Date('2025-01-01T00:00:00.000Z');
        const boundary = new Date(from);
        boundary.setUTCDate(boundary.getUTCDate() + days);
        const fromText = from.toISOString().slice(0, 10);
        const boundaryText = boundary.toISOString().slice(0, 10);

        expect(
          intervalsOverlap(
            { effectiveFrom: fromText, effectiveTo: boundaryText },
            { effectiveFrom: boundaryText, effectiveTo: null }
          )
        ).toBe(false);
      })
    );
  });
});
