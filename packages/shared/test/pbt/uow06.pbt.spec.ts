import fc from 'fast-check';
import { PenaltySourceStatuses, addCalendarDays, evaluateOverdue, isPenaltyDuplicateBlockingStatus, penaltyPeriodKey } from '../../src/uow06';

describe('uow06 property-based invariants', () => {
  it('classifies the first overdue date as aging day 1', () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 60 }), (graceDays) => {
      const first = addCalendarDays('2026-01-01', graceDays + 1);
      const result = evaluateOverdue({
        invoiceId: 'invoice-1',
        invoiceStatus: 'Issued',
        dueDate: '2026-01-01',
        resolvedGracePeriodDays: graceDays,
        evaluationDate: first,
        openAmount: '1.00'
      });
      expect(result.overdue).toBe(true);
      expect(result.agingDayCount).toBe(1);
    }));
  });

  it('never marks voided penalties as duplicate blocking', () => {
    fc.assert(fc.property(fc.constantFrom(...PenaltySourceStatuses), (status) => {
      expect(isPenaltyDuplicateBlockingStatus(status)).toBe(status !== 'Voided');
    }));
  });

  it('normalizes penalty period keys to yyyy-mm', () => {
    fc.assert(fc.property(fc.integer({ min: 1, max: 12 }), fc.integer({ min: 1, max: 28 }), (month, day) => {
      const date = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      expect(penaltyPeriodKey(date)).toBe(date.slice(0, 7));
    }));
  });
});
