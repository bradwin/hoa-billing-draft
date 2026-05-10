import {
  assertDecimalScale,
  assertHalfOpenInterval,
  assertNoOverlappingIntervals,
  chargeTypePayloadSchema,
  coversDate,
  intervalsOverlap,
  toMinorUnitsHalfUp
} from '../../src';

describe('UOW-03 shared domain helpers', () => {
  it('uses half-open intervals for effective configuration versions', () => {
    const oldVersion = { effectiveFrom: '2025-01-01', effectiveTo: '2025-06-01' };
    const newVersion = { effectiveFrom: '2025-06-01', effectiveTo: null };

    expect(coversDate(oldVersion, '2025-05-31')).toBe(true);
    expect(coversDate(oldVersion, '2025-06-01')).toBe(false);
    expect(coversDate(newVersion, '2025-06-01')).toBe(true);
    expect(intervalsOverlap(oldVersion, newVersion)).toBe(false);
  });

  it('rejects invalid and overlapping intervals', () => {
    expect(() => assertHalfOpenInterval({ effectiveFrom: '2025-06-01', effectiveTo: '2025-06-01' })).toThrow(
      /before effectiveTo/
    );
    expect(() =>
      assertNoOverlappingIntervals([
        { effectiveFrom: '2025-01-01', effectiveTo: '2025-06-02' },
        { effectiveFrom: '2025-06-01', effectiveTo: null }
      ])
    ).toThrow(/must not overlap/);
  });

  it('validates decimal precision without JavaScript floating point behavior', () => {
    expect(() => assertDecimalScale('100.1234', 4, 'ratePerSqm')).not.toThrow();
    expect(() => assertDecimalScale('100.12345', 4, 'ratePerSqm')).toThrow(/up to 4/);
    expect(toMinorUnitsHalfUp('10.235')).toBe(1024n);
  });

  it('prevents automatic manual tax-like charge configuration', () => {
    expect(() =>
      chargeTypePayloadSchema.parse({
        code: 'VAT-MANUAL',
        name: 'Manual tax-like charge',
        category: 'ManualTaxLike',
        isManualEntryEligible: true,
        isAutomaticGenerationEligible: false
      })
    ).not.toThrow();
    expect(() =>
      chargeTypePayloadSchema.parse({
        code: 'VAT-AUTO',
        name: 'Invalid auto tax',
        category: 'ManualTaxLike',
        isManualEntryEligible: true,
        isAutomaticGenerationEligible: true
      })
    ).toThrow(/Manual tax-like/);
  });
});
