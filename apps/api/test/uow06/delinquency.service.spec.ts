import { DelinquencyService } from '../../src/modules/uow06/delinquency.service';

const actor = { userId: 'user-1', role: 'BillingStaff', correlationId: 'corr-1' };

describe('DelinquencyService', () => {
  it('generates penalty candidates without creating source records', async () => {
    const repository = { findDuplicatePenalty: jest.fn() };
    const service = new DelinquencyService(
      repository as any,
      { require: jest.fn() } as any,
      { record: jest.fn() } as any,
      {} as any,
      {} as any
    );

    await expect(service.generatePenaltyCandidates(actor as any, {
      evaluationDate: '2026-05-10',
      invoiceIds: ['11111111-1111-4111-8111-111111111111'],
      penaltyChargeTypeId: 'penalty-monthly'
    })).resolves.toEqual([
      expect.objectContaining({
        invoiceId: '11111111-1111-4111-8111-111111111111',
        penaltyPeriodKey: '2026-05',
        status: 'Valid'
      })
    ]);
    expect(repository.findDuplicatePenalty).not.toHaveBeenCalled();
  });

  it('blocks duplicate penalty source records during apply', async () => {
    const service = new DelinquencyService(
      { findDuplicatePenalty: jest.fn().mockResolvedValue({ id: 'penalty-1' }) } as any,
      { require: jest.fn() } as any,
      { record: jest.fn() } as any,
      {} as any,
      {} as any
    );

    await expect(service.applyPenalties(actor as any, {
      evaluationDate: '2026-05-10',
      candidateIds: ['invoice-1|penalty-monthly|2026-05'],
      reason: 'Monthly penalty review'
    })).rejects.toThrow(/Duplicate penalty/);
  });

  it('creates reminder intents through support intent boundary only', async () => {
    const repository = { createReminderIntent: jest.fn().mockResolvedValue({ id: 'intent-1' }) };
    const supportIntents = { createIntent: jest.fn().mockResolvedValue({ id: 'support-1' }) };
    const service = new DelinquencyService(
      repository as any,
      { require: jest.fn() } as any,
      { record: jest.fn() } as any,
      {} as any,
      supportIntents as any
    );

    await expect(service.createReminderIntents(actor as any, {
      reminderEligibilityIds: ['11111111-1111-4111-8111-111111111111']
    })).resolves.toEqual([{ id: 'intent-1' }]);
    expect(supportIntents.createIntent).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'Notification', purpose: 'OverdueReminder' }));
  });
});
