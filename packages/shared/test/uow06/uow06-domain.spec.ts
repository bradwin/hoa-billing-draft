import {
  assertWaiverWithinAvailableAmount,
  evaluateOverdue,
  isPenaltyDuplicateBlockingStatus,
  penaltyDuplicateKey,
  penaltyPeriodKey,
  reminderDuplicateKey,
  shouldSuppressReminder
} from '../../src/uow06';

describe('uow06 domain helpers', () => {
  it('derives overdue and aging from explicit evaluation date', () => {
    const result = evaluateOverdue({
      invoiceId: 'invoice-1',
      invoiceStatus: 'Issued',
      dueDate: '2026-01-10',
      resolvedGracePeriodDays: 5,
      evaluationDate: '2026-01-16',
      openAmount: '100.00'
    });
    expect(result).toMatchObject({ overdue: true, firstOverdueDate: '2026-01-16', agingDayCount: 1, agingBucket: '1-30' });
  });

  it('keeps non-overdue invoices in current bucket', () => {
    const result = evaluateOverdue({
      invoiceId: 'invoice-1',
      invoiceStatus: 'Issued',
      dueDate: '2026-01-10',
      resolvedGracePeriodDays: 5,
      evaluationDate: '2026-01-15',
      openAmount: '100.00'
    });
    expect(result.overdue).toBe(false);
    expect(result.agingBucket).toBe('Current');
  });

  it('uses normalized duplicate and period keys', () => {
    expect(penaltyPeriodKey('2026-03-31')).toBe('2026-03');
    expect(penaltyDuplicateKey({ invoiceId: 'i1', responsibleBillingAccountId: 'b1', penaltyChargeTypeId: 'p1', penaltyPeriodKey: '2026-03' })).toBe('i1|b1|p1|2026-03');
    expect(reminderDuplicateKey({ reminderScopeType: 'Invoice', reminderScopeId: 'i1', reminderPeriodKey: '2026-03' })).toBe('Invoice|i1|2026-03');
  });

  it('defines duplicate-blocking penalty statuses', () => {
    expect(isPenaltyDuplicateBlockingStatus('Draft')).toBe(true);
    expect(isPenaltyDuplicateBlockingStatus('Applied')).toBe(true);
    expect(isPenaltyDuplicateBlockingStatus('Reissued')).toBe(true);
    expect(isPenaltyDuplicateBlockingStatus('Voided')).toBe(false);
  });

  it('rejects waiver amounts above available unpaid penalty', () => {
    expect(() => assertWaiverWithinAvailableAmount({
      penaltyAmount: '100.00',
      priorWaiverAmounts: ['25.00'],
      paymentEffectAmounts: ['10.00'],
      requestedWaiverAmount: '70.00'
    })).toThrow('Waiver amount exceeds available unpaid penalty amount');
  });

  it('suppresses reminders for duplicates or missing contact path', () => {
    expect(shouldSuppressReminder({ duplicateExists: true, hasAuthorizedContactPath: true })).toBe(true);
    expect(shouldSuppressReminder({ duplicateExists: false, hasAuthorizedContactPath: false })).toBe(true);
    expect(shouldSuppressReminder({ duplicateExists: false, hasAuthorizedContactPath: true })).toBe(false);
  });
});
