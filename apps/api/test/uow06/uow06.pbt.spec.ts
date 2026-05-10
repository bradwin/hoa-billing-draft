import fc from 'fast-check';
import { penaltyDuplicateKey, reminderDuplicateKey, waiverIdempotencyKey } from '@hoa/shared';

describe('UOW-06 API PBT support', () => {
  it('penalty duplicate keys are stable for identical values', () => {
    fc.assert(fc.property(fc.uuid(), fc.string({ minLength: 1, maxLength: 20 }), (invoiceId, chargeTypeId) => {
      const input = {
        invoiceId,
        responsibleBillingAccountId: 'BA-1',
        penaltyChargeTypeId: chargeTypeId,
        penaltyPeriodKey: '2026-05'
      };
      expect(penaltyDuplicateKey(input)).toBe(penaltyDuplicateKey({ ...input }));
    }));
  });

  it('waiver idempotency keys bind approval request to penalty source', () => {
    fc.assert(fc.property(fc.uuid(), fc.uuid(), (approvalRequestId, penaltySourceRecordId) => {
      expect(waiverIdempotencyKey(approvalRequestId, penaltySourceRecordId)).toContain(approvalRequestId);
      expect(waiverIdempotencyKey(approvalRequestId, penaltySourceRecordId)).toContain(penaltySourceRecordId);
    }));
  });

  it('reminder duplicate keys are scoped by period', () => {
    fc.assert(fc.property(fc.uuid(), fc.integer({ min: 1, max: 12 }), (scopeId, month) => {
      const period = `2026-${String(month).padStart(2, '0')}`;
      expect(reminderDuplicateKey({ reminderScopeType: 'Invoice', reminderScopeId: scopeId, reminderPeriodKey: period })).toBe(`Invoice|${scopeId}|${period}`);
    }));
  });
});
